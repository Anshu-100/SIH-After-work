import React, { useEffect, useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import API from "../api/axiosInstance";

// ─── Severity config ──────────────────────────────────────────────────────────
const SEV_CONFIG = {
  CRITICAL: { color: "#ef4444", bg: "bg-red-500",    label: "🔴 Critical",  ring: "ring-red-500/30"   },
  HIGH:     { color: "#f97316", bg: "bg-orange-500", label: "🟠 High",      ring: "ring-orange-500/30" },
  MEDIUM:   { color: "#eab308", bg: "bg-yellow-500", label: "🟡 Medium",    ring: "ring-yellow-500/30" },
  LOW:      { color: "#22c55e", bg: "bg-green-500",  label: "🟢 Low",       ring: "ring-green-500/30"  },
};

const ALL_CATEGORIES = [
  "All",
  "Urban Infrastructure",
  "Water Management",
  "Sanitation",
  "Healthcare",
  "Education",
  "Agriculture",
  "Environment",
  "Transportation",
  "Public Safety",
  "Energy",
];

const ALL_SEVERITIES = ["All", "CRITICAL", "HIGH", "MEDIUM", "LOW"];

// ─── Instant Offline Coordinate Lookup (0 ms latency, no API key needed) ─────
const KNOWN_COORDS = {
  // Jharkhand Districts & Cities
  "ranchi": { lat: 23.3441, lng: 85.3096 },
  "dhanbad": { lat: 23.7957, lng: 86.4304 },
  "jamshedpur": { lat: 22.8046, lng: 86.2029 },
  "bokaro": { lat: 23.6693, lng: 86.1511 },
  "hazaribagh": { lat: 23.9925, lng: 85.3637 },
  "deoghar": { lat: 24.4826, lng: 86.7000 },
  "dumka": { lat: 24.2676, lng: 87.2498 },
  "giridih": { lat: 24.1856, lng: 86.3056 },
  "palamu": { lat: 24.0378, lng: 84.0682 },
  "daltonganj": { lat: 24.0378, lng: 84.0682 },
  "chaibasa": { lat: 22.5539, lng: 85.8083 },
  "garhwa": { lat: 24.1610, lng: 83.8090 },
  "khunti": { lat: 23.0747, lng: 85.2774 },
  "latehar": { lat: 23.7438, lng: 84.5024 },
  "seraikela": { lat: 22.7003, lng: 85.9268 },
  "simdega": { lat: 22.6146, lng: 84.5085 },
  "pakur": { lat: 24.6346, lng: 87.8483 },
  "sahebganj": { lat: 25.2425, lng: 87.6433 },
  "godda": { lat: 24.8267, lng: 87.2132 },
  "koderma": { lat: 24.4674, lng: 85.5939 },
  "east singhbhum": { lat: 22.7000, lng: 86.4000 },
  "west singhbhum": { lat: 22.4000, lng: 85.6000 },
  "gumla": { lat: 23.0436, lng: 84.5417 },
  "ramgarh": { lat: 23.6322, lng: 85.5139 },
  "chatra": { lat: 24.2090, lng: 84.8718 },
  "jamtara": { lat: 23.9629, lng: 86.8014 },
  "lohardaga": { lat: 23.4357, lng: 84.6811 },
  "jharkhand": { lat: 23.6102, lng: 85.2799 },

  // Rest of India
  "patna": { lat: 25.5941, lng: 85.1376 },
  "kolkata": { lat: 22.5726, lng: 88.3639 },
  "new delhi": { lat: 28.6139, lng: 77.2090 },
  "delhi": { lat: 28.6139, lng: 77.2090 },
  "varanasi": { lat: 25.3176, lng: 82.9739 },
  "gaya": { lat: 24.7914, lng: 85.0002 },
  "bhubaneswar": { lat: 20.2961, lng: 85.8245 },
  "asansol": { lat: 23.6739, lng: 86.9524 },
  "lucknow": { lat: 26.8467, lng: 80.9462 },
  "raipur": { lat: 21.2514, lng: 81.6296 },
  "bengaluru": { lat: 12.9716, lng: 77.5946 },
  "mumbai": { lat: 19.0760, lng: 72.8777 },
  "jaipur": { lat: 26.9124, lng: 75.7873 },
  "hyderabad": { lat: 17.3850, lng: 78.4867 },
  "chennai": { lat: 13.0827, lng: 80.2707 },
  "india": { lat: 22.5000, lng: 82.0000 },
};

function resolveTaskCoords(task, index) {
  let lat = task.lat;
  let lng = task.lng;

  if (typeof lat !== "number" || typeof lng !== "number" || isNaN(lat) || isNaN(lng)) {
    const locKey = (task.location || "").toLowerCase().trim();
    let found = false;
    for (const [key, coords] of Object.entries(KNOWN_COORDS)) {
      if (locKey.includes(key)) {
        const angle = (index * 137.5) * (Math.PI / 180);
        const radius = 0.015 + ((index % 5) * 0.008);
        lat = Number((coords.lat + Math.sin(angle) * radius).toFixed(6));
        lng = Number((coords.lng + Math.cos(angle) * radius).toFixed(6));
        found = true;
        break;
      }
    }
    if (!found) {
      lat = Number((23.6102 + (Math.sin(index) * 0.3)).toFixed(6));
      lng = Number((85.2799 + (Math.cos(index) * 0.3)).toFixed(6));
    }
  }

  const rawSev = task.severity || task.aiAnalysis?.severity || "MEDIUM";
  const sevKey = rawSev.toUpperCase();
  const severity = SEV_CONFIG[sevKey] ? sevKey : "MEDIUM";

  return {
    ...task,
    lat,
    lng,
    severity,
  };
}

// ─── Heatmap layer component ──────────────────────────────────────────────────
function HeatmapLayer({ points }) {
  const map = useMap();
  const heatRef = useRef(null);

  useEffect(() => {
    if (!points.length) return;
    if (typeof window.L === "undefined" || !window.L.heatLayer) return;

    if (heatRef.current) {
      map.removeLayer(heatRef.current);
    }

    const heatPoints = points.map((p) => {
      const w =
        p.severity === "CRITICAL"
          ? 1.0
          : p.severity === "HIGH"
          ? 0.75
          : p.severity === "MEDIUM"
          ? 0.5
          : 0.25;
      return [p.lat, p.lng, w];
    });

    heatRef.current = window.L.heatLayer(heatPoints, {
      radius: 40,
      blur: 25,
      maxZoom: 12,
      gradient: { 0.2: "#22c55e", 0.4: "#eab308", 0.7: "#f97316", 1.0: "#ef4444" },
    }).addTo(map);

    return () => {
      if (heatRef.current) map.removeLayer(heatRef.current);
    };
  }, [points, map]);

  return null;
}

// ─── Map View Controller for Pan/Zoom presets ─────────────────────────────────
function MapViewController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && zoom) {
      map.flyTo(center, zoom, { duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
}

// ─── Stat card component ──────────────────────────────────────────────────────
function StatCard({ label, value, color, icon }) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border ${color} bg-slate-900/90 px-4 py-3 shadow-md backdrop-blur`}
    >
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </p>
        <p className="text-2xl font-black text-white">{value}</p>
      </div>
    </div>
  );
}

// ─── Tile Providers (100% Free, NO API Keys Required) ────────────────────────
const TILE_PROVIDERS = {
  osm: {
    name: "🗺️ OpenStreetMap",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  satellite: {
    name: "🛰️ Satellite (Esri)",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution:
      "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
  },
};

// ─── Main HotspotMap page ─────────────────────────────────────────────────────
export default function HotspotMap() {
  const [geoTasks, setGeoTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [filterSeverity, setFilterSeverity] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterRegion, setFilterRegion] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  // Layers & styling
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showPins, setShowPins] = useState(true);
  const [heatLoaded, setHeatLoaded] = useState(false);
  const [tileStyle, setTileStyle] = useState("osm");

  // Map view target
  const [mapTarget, setMapTarget] = useState({
    center: [23.6102, 85.2799],
    zoom: 7,
  });

  // Dynamically load leaflet.heat script for the heatmap layer
  useEffect(() => {
    if (window.L && window.L.heatLayer) {
      setHeatLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.id = "leaflet-heat-script";
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet.heat/0.2.0/leaflet-heat.js";
    script.onload = () => setHeatLoaded(true);
    document.head.appendChild(script);
  }, []);

  // Fetch tasks and INSTANTLY map coordinates
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");
        const res = await API.get("/tasks");
        const rawTasks = Array.isArray(res.data) ? res.data : res.data?.data || [];

        // Instant synchronous coordinate mapping
        const resolved = rawTasks.map((t, idx) => resolveTaskCoords(t, idx));
        setGeoTasks(resolved);
      } catch (err) {
        console.error("Failed to load tasks:", err);
        setError("Failed to load civic issues from backend.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Filter tasks
  const filtered = geoTasks.filter((t) => {
    if (filterSeverity !== "All" && t.severity !== filterSeverity) return false;
    if (filterCategory !== "All" && t.category !== filterCategory) return false;
    if (filterStatus !== "All" && t.status !== filterStatus) return false;
    if (filterRegion === "Jharkhand") {
      const isJharkhand =
        !t.location?.includes("Bihar") &&
        !t.location?.includes("Bengal") &&
        !t.location?.includes("Delhi") &&
        !t.location?.includes("UP") &&
        !t.location?.includes("Odisha") &&
        !t.location?.includes("Chhattisgarh") &&
        !t.location?.includes("Karnataka") &&
        !t.location?.includes("Maharashtra") &&
        !t.location?.includes("Rajasthan");
      if (!isJharkhand) return false;
    } else if (filterRegion === "Other India") {
      const isOther =
        t.location?.includes("Bihar") ||
        t.location?.includes("Bengal") ||
        t.location?.includes("Delhi") ||
        t.location?.includes("UP") ||
        t.location?.includes("Odisha") ||
        t.location?.includes("Chhattisgarh") ||
        t.location?.includes("Karnataka") ||
        t.location?.includes("Maharashtra") ||
        t.location?.includes("Rajasthan");
      if (!isOther) return false;
    }
    return true;
  });

  // Calculate live stats
  const stats = {
    total: filtered.length,
    critical: filtered.filter((t) => t.severity === "CRITICAL").length,
    high: filtered.filter((t) => t.severity === "HIGH").length,
    medium: filtered.filter((t) => t.severity === "MEDIUM").length,
    resolved: filtered.filter((t) => t.status === "completed").length,
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16 w-full max-w-full overflow-x-hidden">
      {/* ── Top Dashboard Header ─────────────────────────────────────────── */}
      <div className="border-b border-slate-800 bg-slate-900/95 px-6 py-6 backdrop-blur">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-400 mb-2">
                🗺️ Live Civic GIS Intelligence
              </div>
              <h1 className="text-3xl font-extrabold text-white">
                Geo-Spatial Crisis & Hotspot Map
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                Visualizing civic complaints across Jharkhand districts and major Indian metropolitan hubs with AI severity analysis.
              </p>
            </div>

            {/* Severity Legend Badges */}
            <div className="flex flex-wrap items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-950/80 p-2.5 text-xs">
              {Object.entries(SEV_CONFIG).map(([sev, cfg]) => (
                <span
                  key={sev}
                  className="flex items-center gap-1.5 font-semibold text-slate-200 px-2 py-1 rounded-md bg-slate-900"
                >
                  <span
                    className="inline-block h-3 w-3 rounded-full shadow-sm"
                    style={{ backgroundColor: cfg.color }}
                  />
                  {cfg.label}
                </span>
              ))}
            </div>
          </div>

          {/* KPI Stat Cards */}
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
            <StatCard
              label="Total Incidents"
              value={stats.total}
              icon="📊"
              color="border-slate-700"
            />
            <StatCard
              label="Critical"
              value={stats.critical}
              icon="🔴"
              color="border-red-500/40"
            />
            <StatCard
              label="High Priority"
              value={stats.high}
              icon="🟠"
              color="border-orange-500/40"
            />
            <StatCard
              label="Medium"
              value={stats.medium}
              icon="🟡"
              color="border-yellow-500/40"
            />
            <StatCard
              label="Resolved"
              value={stats.resolved}
              icon="✅"
              color="border-green-500/40"
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* ── Filters & Controls Toolbar ───────────────────────────────────── */}
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-lg">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Filters:
          </span>

          {/* Severity Dropdown */}
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {ALL_SEVERITIES.map((s) => (
              <option key={s} value={s}>
                {s === "All" ? "⚡ All Severities" : `⚡ ${s}`}
              </option>
            ))}
          </select>

          {/* Department / Category Dropdown */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {ALL_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c === "All" ? "🏛️ All Categories" : c}
              </option>
            ))}
          </select>

          {/* Region Dropdown */}
          <select
            value={filterRegion}
            onChange={(e) => setFilterRegion(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="All">🌏 All Regions</option>
            <option value="Jharkhand">🌲 Jharkhand Only</option>
            <option value="Other India">🇮🇳 Rest of India</option>
          </select>

          {/* Status Dropdown */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="All">📋 All Statuses</option>
            <option value="pending">⏳ Pending</option>
            <option value="in-progress">🔧 In Progress</option>
            <option value="completed">✅ Resolved</option>
          </select>

          {/* Zoom Quick-Presets */}
          <div className="flex items-center gap-1.5 border-l border-slate-700 pl-3">
            <button
              onClick={() =>
                setMapTarget({ center: [23.6102, 85.2799], zoom: 7.5 })
              }
              className="rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2.5 py-1.5 text-xs font-semibold text-emerald-400 transition"
              title="Zoom to Jharkhand"
            >
              📍 Jharkhand
            </button>
            <button
              onClick={() =>
                setMapTarget({ center: [22.5, 82.0], zoom: 5 })
              }
              className="rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2.5 py-1.5 text-xs font-semibold text-blue-400 transition"
              title="Zoom to Pan-India"
            >
              🇮🇳 Pan-India
            </button>
          </div>

          {/* Tile Layer Style Toggle */}
          <div className="flex items-center gap-1 border-l border-slate-700 pl-3">
            {Object.entries(TILE_PROVIDERS).map(([key, provider]) => (
              <button
                key={key}
                onClick={() => setTileStyle(key)}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                  tileStyle === key
                    ? "bg-emerald-500 text-slate-950 font-bold"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {provider.name}
              </button>
            ))}
          </div>

          {/* Layer toggles: Pins & Heatmap */}
          <div className="ml-auto flex items-center gap-4">
            <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-300">
              <div
                onClick={() => setShowPins((v) => !v)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${
                  showPins ? "bg-emerald-500" : "bg-slate-700"
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition ${
                    showPins ? "translate-x-4" : "translate-x-1"
                  }`}
                />
              </div>
              📍 Pins
            </label>

            {heatLoaded && (
              <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-300">
                <div
                  onClick={() => setShowHeatmap((v) => !v)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${
                    showHeatmap ? "bg-orange-500" : "bg-slate-700"
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition ${
                      showHeatmap ? "translate-x-4" : "translate-x-1"
                    }`}
                  />
                </div>
                🔥 Heatmap
              </label>
            )}
          </div>
        </div>

        {/* ── Loading / Error states ─────────────────────────────────────── */}
        {loading && (
          <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
              <p className="mt-3 text-sm font-semibold text-slate-400">
                Loading live civic coordinates…
              </p>
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-400">
            ⚠️ {error}
          </div>
        )}

        {/* ── Interactive Map Container ───────────────────────────────────── */}
        {!loading && !error && (
          <div
            className="relative overflow-hidden rounded-2xl border border-slate-700 shadow-2xl shadow-slate-950"
            style={{ height: "620px" }}
          >
            <MapContainer
              center={mapTarget.center}
              zoom={mapTarget.zoom}
              style={{ height: "100%", width: "100%", background: "#0f172a" }}
              zoomControl={true}
            >
              {/* Fly to controller */}
              <MapViewController
                center={mapTarget.center}
                zoom={mapTarget.zoom}
              />

              {/* Tile Layer (Standard OSM or Esri Satellite - 100% Free, NO API Key watermark) */}
              <TileLayer
                url={TILE_PROVIDERS[tileStyle].url}
                attribution={TILE_PROVIDERS[tileStyle].attribution}
              />

              {/* Heatmap Layer */}
              {showHeatmap && heatLoaded && <HeatmapLayer points={filtered} />}

              {/* Severity Pins */}
              {showPins &&
                filtered.map((task, i) => {
                  const cfg = SEV_CONFIG[task.severity] || SEV_CONFIG.MEDIUM;
                  const radius =
                    task.severity === "CRITICAL"
                      ? 11
                      : task.severity === "HIGH"
                      ? 9
                      : task.severity === "MEDIUM"
                      ? 7
                      : 6;

                  return (
                    <CircleMarker
                      key={task._id || i}
                      center={[task.lat, task.lng]}
                      radius={radius}
                      pathOptions={{
                        color: cfg.color,
                        fillColor: cfg.color,
                        fillOpacity: 0.88,
                        weight: task.severity === "CRITICAL" ? 3 : 2,
                      }}
                    >
                      <Popup className="leaflet-popup-dark">
                        <div
                          style={{
                            background: "#0f172a",
                            color: "#f1f5f9",
                            borderRadius: "12px",
                            padding: "14px 16px",
                            minWidth: "260px",
                            maxWidth: "320px",
                            fontSize: "13px",
                            fontFamily: "sans-serif",
                            boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                          }}
                        >
                          <div
                            style={{
                              display: "inline-block",
                              background: cfg.color + "22",
                              border: `1px solid ${cfg.color}55`,
                              borderRadius: "20px",
                              padding: "2px 10px",
                              fontSize: "11px",
                              fontWeight: "800",
                              color: cfg.color,
                              marginBottom: "8px",
                            }}
                          >
                            ⚡ {task.severity} SEVERITY
                          </div>

                          <h3
                            style={{
                              fontWeight: "800",
                              fontSize: "14px",
                              lineHeight: "1.3",
                              marginBottom: "6px",
                              color: "#ffffff",
                            }}
                          >
                            {task.title}
                          </h3>

                          <p
                            style={{
                              color: "#94a3b8",
                              fontSize: "11px",
                              marginBottom: "8px",
                            }}
                          >
                            🏛️ <strong>{task.category}</strong> &nbsp;•&nbsp; 📍{" "}
                            {task.location}
                          </p>

                          {task.description && (
                            <p
                              style={{
                                color: "#cbd5e1",
                                fontSize: "12px",
                                lineHeight: "1.4",
                                marginBottom: "10px",
                                borderLeft: "2px solid #334155",
                                paddingLeft: "8px",
                              }}
                            >
                              {task.description.length > 140
                                ? task.description.slice(0, 140) + "…"
                                : task.description}
                            </p>
                          )}

                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              fontSize: "11px",
                              color: "#64748b",
                              borderTop: "1px solid #1e293b",
                              paddingTop: "8px",
                            }}
                          >
                            <span>
                              Status:{" "}
                              <strong
                                style={{
                                  color:
                                    task.status === "completed"
                                      ? "#22c55e"
                                      : task.status === "in-progress"
                                      ? "#f59e0b"
                                      : "#94a3b8",
                                }}
                              >
                                {task.status || "pending"}
                              </strong>
                            </span>
                            <span>
                              {task.createdAt
                                ? new Date(task.createdAt).toLocaleDateString("en-IN")
                                : "Recent"}
                            </span>
                          </div>

                          {task.aiAnalysis?.modelPipeline && (
                            <div
                              style={{
                                marginTop: "6px",
                                fontSize: "10px",
                                color: "#10b981",
                                fontStyle: "italic",
                              }}
                            >
                              🤖 AI Confidence:{" "}
                              {Math.round(
                                (task.aiAnalysis.overallConfidence || 0.92) * 100
                              )}
                              %
                            </div>
                          )}
                        </div>
                      </Popup>
                    </CircleMarker>
                  );
                })}
            </MapContainer>

            {/* Map Legend Overlay in bottom left */}
            <div
              style={{
                position: "absolute",
                bottom: "18px",
                left: "18px",
                zIndex: 1000,
                background: "rgba(15, 23, 42, 0.92)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: "14px",
                padding: "12px 16px",
                fontSize: "11px",
                color: "#94a3b8",
                fontWeight: "600",
                boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
              }}
            >
              <p
                style={{
                  color: "#f8fafc",
                  fontWeight: "800",
                  marginBottom: "8px",
                  fontSize: "12px",
                }}
              >
                📍 Severity Hotspots
              </p>
              {Object.entries(SEV_CONFIG).map(([sev, cfg]) => (
                <div
                  key={sev}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "4px",
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      width: "11px",
                      height: "11px",
                      borderRadius: "50%",
                      background: cfg.color,
                      boxShadow: `0 0 6px ${cfg.color}`,
                    }}
                  />
                  <span style={{ color: "#e2e8f0" }}>{cfg.label}</span>
                </div>
              ))}
              <div
                style={{
                  marginTop: "8px",
                  paddingTop: "6px",
                  borderTop: "1px solid rgba(255,255,255,0.1)",
                  color: "#64748b",
                  fontSize: "10px",
                }}
              >
                Displaying {filtered.length} live incidents
              </div>
            </div>

            {/* Empty state overlay if all filtered out */}
            {filtered.length === 0 && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  zIndex: 900,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(15,23,42,0.75)",
                  backdropFilter: "blur(4px)",
                }}
              >
                <div style={{ textAlign: "center", color: "#94a3b8" }}>
                  <p style={{ fontSize: "40px", marginBottom: "8px" }}>🔍</p>
                  <p
                    style={{
                      fontWeight: "700",
                      fontSize: "16px",
                      color: "#e2e8f0",
                    }}
                  >
                    No incidents match the active filters
                  </p>
                  <p style={{ fontSize: "13px", marginTop: "4px" }}>
                    Select "All" to view all active crisis points
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Table of Incident Details ────────────────────────────────────── */}
        {!loading && filtered.length > 0 && (
          <div className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-white">
                  📋 Incident Registry ({filtered.length} problems shown)
                </h2>
                <p className="text-xs text-slate-400">
                  Full list of citizen complaints synchronized with AI severity analysis and coordinates
                </p>
              </div>
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-400">
                ✅ Live Database Sync
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <th className="px-4 py-3.5 text-left">Problem Title</th>
                    <th className="px-4 py-3.5 text-left">Category</th>
                    <th className="px-4 py-3.5 text-left">Severity</th>
                    <th className="px-4 py-3.5 text-left">Region</th>
                    <th className="px-4 py-3.5 text-left">Status</th>
                    <th className="px-4 py-3.5 text-left">Coordinates</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filtered.map((task, i) => {
                    const cfg = SEV_CONFIG[task.severity] || SEV_CONFIG.MEDIUM;
                    return (
                      <tr
                        key={task._id || i}
                        className="transition hover:bg-slate-800/50"
                      >
                        <td className="px-4 py-3 font-semibold text-white max-w-xs truncate">
                          {task.title}
                        </td>
                        <td className="px-4 py-3 text-slate-300">
                          {task.category}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold"
                            style={{
                              background: cfg.color + "22",
                              color: cfg.color,
                              border: `1px solid ${cfg.color}44`,
                            }}
                          >
                            ⚡ {task.severity}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-300">
                          📍 {task.location}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                              task.status === "completed"
                                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                : task.status === "in-progress"
                                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                : "bg-slate-800 text-slate-400 border border-slate-700"
                            }`}
                          >
                            {task.status || "pending"}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-500">
                          {task.lat?.toFixed(4)}, {task.lng?.toFixed(4)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
