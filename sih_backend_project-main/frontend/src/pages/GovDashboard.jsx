import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axiosInstance";

/* ── helpers ─────────────────────────────────────────── */
const STATUS_STYLES = {
  pending:       "bg-slate-700 text-slate-200",
  "under-review":"bg-yellow-500/20 text-yellow-300 border border-yellow-500/40",
  "in-progress": "bg-blue-500/20 text-blue-300 border border-blue-500/40",
  resolved:      "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40",
};
const STATUS_ICONS = {
  pending: "🕐", "under-review": "🔍", "in-progress": "⚙️", resolved: "✅",
};
const SEV_STYLES = {
  CRITICAL: "bg-red-500/20 text-red-300",   Critical: "bg-red-500/20 text-red-300",
  HIGH:     "bg-orange-500/20 text-orange-300", High: "bg-orange-500/20 text-orange-300",
  MEDIUM:   "bg-yellow-500/20 text-yellow-300", Medium: "bg-yellow-500/20 text-yellow-300",
  LOW:      "bg-green-500/20 text-green-300",   Low: "bg-green-500/20 text-green-300",
};

function govHeaders() {
  const token = localStorage.getItem("govToken");
  return { Authorization: `Bearer ${token}` };
}

/* ── Main Component ──────────────────────────────────── */
export default function GovDashboard() {
  const navigate = useNavigate();

  // Redirect to gov-login if no token
  useEffect(() => {
    if (!localStorage.getItem("govToken")) navigate("/gov-login");
  }, [navigate]);

  const [problems, setProblems]     = useState([]);
  const [stats, setStats]           = useState(null);
  const [loading, setLoading]       = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("");
  const [responseModal, setResponseModal] = useState(null); // {id, title}
  const [responseForm, setResponseForm]   = useState({
    responseText: "", department: "", resolvedBy: "", resolutionId: "",
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast]   = useState("");

  /* ── Fetch data ─────────────────────────────────────── */
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus)   params.append("status",   filterStatus);
      if (filterSeverity) params.append("severity", filterSeverity);

      const [probRes, statsRes] = await Promise.all([
        API.get(`/gov/problems?${params}`, { headers: govHeaders() }),
        API.get("/gov/stats",              { headers: govHeaders() }),
      ]);
      setProblems(probRes.data);
      setStats(statsRes.data);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("govToken");
        navigate("/gov-login");
      }
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterSeverity, navigate]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /* ── Actions ────────────────────────────────────────── */
  const updateStatus = async (id, status) => {
    try {
      await API.put(`/gov/problems/${id}/status`, { status }, { headers: govHeaders() });
      showToast(`Status updated to "${status}"`);
      fetchAll();
    } catch (err) {
      showToast("Failed to update status", true);
    }
  };

  const submitResponse = async () => {
    if (!responseForm.responseText.trim()) {
      showToast("Response text is required", true); return;
    }
    setSaving(true);
    try {
      await API.put(
        `/gov/problems/${responseModal.id}/response`,
        responseForm,
        { headers: govHeaders() }
      );
      showToast("✅ Official response saved & problem marked resolved!");
      setResponseModal(null);
      setResponseForm({ responseText: "", department: "", resolvedBy: "", resolutionId: "" });
      fetchAll();
    } catch (err) {
      showToast("Failed to save response", true);
    } finally {
      setSaving(false);
    }
  };

  const showToast = (msg, isError = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(""), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem("govToken");
    localStorage.removeItem("govRole");
    navigate("/gov-login");
  };

  /* ── Render ─────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-[#030d24] text-white">

      {/* ── Top Bar ─────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-slate-700 bg-[#030d24]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏛️</span>
            <div>
              <h1 className="text-lg font-black text-white">Government Admin Dashboard</h1>
              <p className="text-xs text-slate-400">Jharkhand Civic Problem Management System</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-xl border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:border-red-500 hover:text-red-400 transition"
          >
            🚪 Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">

        {/* ── Stats Cards ─────────────────────── */}
        {stats && (
          <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Total Problems" value={stats.total}                     color="blue"    icon="📋" />
            <StatCard label="Pending"        value={stats.byStatus.pending}          color="slate"   icon="🕐" />
            <StatCard label="In Progress"    value={stats.byStatus["in-progress"]}   color="yellow"  icon="⚙️" />
            <StatCard label="Resolved"       value={stats.byStatus.resolved}         color="emerald" icon="✅" />
          </div>
        )}

        {/* Severity mini-stats */}
        {stats && (
          <div className="mb-8 grid grid-cols-4 gap-3">
            <SevCard label="Critical" value={stats.bySeverity.critical} color="red" />
            <SevCard label="High"     value={stats.bySeverity.high}     color="orange" />
            <SevCard label="Medium"   value={stats.bySeverity.medium}   color="yellow" />
            <SevCard label="Low"      value={stats.bySeverity.low}      color="green" />
          </div>
        )}

        {/* ── Filters ─────────────────────────── */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-xl border border-slate-600 bg-slate-800 px-4 py-2 text-sm text-white outline-none focus:border-blue-400"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="under-review">Under Review</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>

          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="rounded-xl border border-slate-600 bg-slate-800 px-4 py-2 text-sm text-white outline-none focus:border-blue-400"
          >
            <option value="">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <button
            onClick={() => { setFilterStatus(""); setFilterSeverity(""); }}
            className="rounded-xl border border-slate-600 px-4 py-2 text-sm text-slate-400 hover:text-white transition"
          >
            ✕ Clear
          </button>

          <span className="ml-auto text-sm text-slate-400">
            {problems.length} problem{problems.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* ── Problems Table ───────────────────── */}
        {loading ? (
          <div className="flex h-60 items-center justify-center text-slate-400">
            Loading problems...
          </div>
        ) : problems.length === 0 ? (
          <div className="flex h-60 items-center justify-center text-slate-500">
            No problems found for selected filters.
          </div>
        ) : (
          <div className="space-y-4">
            {problems.map((p) => (
              <ProblemRow
                key={p._id}
                problem={p}
                onStatusChange={updateStatus}
                onAddResponse={() => {
                  setResponseModal({ id: p._id, title: p.title });
                  setResponseForm(
                    p.govResponse
                      ? { ...p.govResponse }
                      : { responseText: "", department: "", resolvedBy: "", resolutionId: "" }
                  );
                }}
              />
            ))}
          </div>
        )}
      </main>

      {/* ── Response Modal ───────────────────── */}
      {responseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-900 p-8 shadow-2xl">
            <h2 className="mb-1 text-xl font-black text-white">🏛️ Official Government Response</h2>
            <p className="mb-6 text-sm text-slate-400 line-clamp-2">{responseModal.title}</p>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-300">
                  Action Taken <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={4}
                  value={responseForm.responseText}
                  onChange={(e) => setResponseForm({ ...responseForm, responseText: e.target.value })}
                  placeholder="Describe the official action taken to resolve this problem..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-400 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-300">Department</label>
                  <input
                    type="text"
                    value={responseForm.department}
                    onChange={(e) => setResponseForm({ ...responseForm, department: e.target.value })}
                    placeholder="e.g. Public Works Dept."
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-300">Officer Name</label>
                  <input
                    type="text"
                    value={responseForm.resolvedBy}
                    onChange={(e) => setResponseForm({ ...responseForm, resolvedBy: e.target.value })}
                    placeholder="e.g. A.K. Sharma, IAS"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-300">Resolution ID</label>
                <input
                  type="text"
                  value={responseForm.resolutionId}
                  onChange={(e) => setResponseForm({ ...responseForm, resolutionId: e.target.value })}
                  placeholder="e.g. JH-PWD-2026-4521"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-400"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={submitResponse}
                disabled={saving}
                className="flex-1 rounded-xl bg-emerald-600 py-3 font-bold text-white transition hover:bg-emerald-500 disabled:opacity-50"
              >
                {saving ? "Saving..." : "✅ Save & Mark Resolved"}
              </button>
              <button
                onClick={() => setResponseModal(null)}
                className="rounded-xl border border-slate-600 px-6 py-3 text-slate-300 transition hover:border-slate-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ───────────────────────────── */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 rounded-2xl px-6 py-4 font-semibold shadow-2xl transition ${
          toast.isError ? "bg-red-600 text-white" : "bg-emerald-600 text-white"
        }`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

/* ── Sub-components ──────────────────────────────────── */

function StatCard({ label, value, color, icon }) {
  const colors = {
    blue: "border-blue-500/30 bg-blue-500/10",
    slate: "border-slate-600 bg-slate-800",
    yellow: "border-yellow-500/30 bg-yellow-500/10",
    emerald: "border-emerald-500/30 bg-emerald-500/10",
  };
  return (
    <div className={`rounded-2xl border p-5 ${colors[color]}`}>
      <p className="text-3xl">{icon}</p>
      <p className="mt-2 text-3xl font-black text-white">{value ?? 0}</p>
      <p className="mt-1 text-sm text-slate-400">{label}</p>
    </div>
  );
}

function SevCard({ label, value, color }) {
  const colors = {
    red: "text-red-400", orange: "text-orange-400",
    yellow: "text-yellow-400", green: "text-green-400",
  };
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-center">
      <p className={`text-xl font-black ${colors[color]}`}>{value ?? 0}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}

function ProblemRow({ problem: p, onStatusChange, onAddResponse }) {
  const isResolved = p.status === "resolved";
  return (
    <div className={`rounded-2xl border p-5 transition ${
      isResolved
        ? "border-emerald-700/40 bg-emerald-950/30"
        : "border-slate-700 bg-slate-800/40 hover:border-slate-600"
    }`}>
      <div className="flex flex-wrap items-start gap-4">
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${SEV_STYLES[p.severity] || "bg-slate-700 text-slate-300"}`}>
              {p.severity}
            </span>
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_STYLES[p.status]}`}>
              {STATUS_ICONS[p.status]} {p.status}
            </span>
            <span className="rounded-full bg-slate-700 px-3 py-1 text-xs text-slate-300">
              {p.category}
            </span>
          </div>

          <h3 className="font-bold text-white text-base leading-snug">{p.title}</h3>
          <p className="mt-1 text-sm text-slate-400 line-clamp-2">{p.description}</p>

          <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
            <span>📍 {p.location}</span>
            <span>👤 {p.user?.email || "Unknown"}</span>
            <span>📅 {new Date(p.createdAt).toLocaleDateString("en-IN")}</span>
          </div>

          {/* Existing gov response preview */}
          {p.govResponse?.responseText && (
            <div className="mt-3 rounded-xl border border-emerald-700/40 bg-emerald-950/40 p-3">
              <p className="text-xs font-bold text-emerald-400 mb-1">🏛️ Official Response on file</p>
              <p className="text-xs text-emerald-200 line-clamp-2">{p.govResponse.responseText}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 min-w-[160px]">
          <select
            value={p.status}
            onChange={(e) => onStatusChange(p._id, e.target.value)}
            className="rounded-xl border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white outline-none focus:border-blue-400"
          >
            <option value="pending">🕐 Pending</option>
            <option value="under-review">🔍 Under Review</option>
            <option value="in-progress">⚙️ In Progress</option>
            <option value="resolved">✅ Resolved</option>
          </select>

          <button
            onClick={onAddResponse}
            className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            🏛️ {p.govResponse?.responseText ? "Edit Response" : "Add Response"}
          </button>
        </div>
      </div>
    </div>
  );
}

