import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axiosInstance";

export default function GovLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await API.post("/auth/gov-login", form);
      localStorage.setItem("govToken", res.data.token);
      localStorage.setItem("govRole", "government");
      navigate("/gov-dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020b2d] flex items-center justify-center px-6">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-indigo-600/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Header badge */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-3 rounded-2xl border border-blue-400/30 bg-blue-500/10 px-6 py-3 backdrop-blur">
            <span className="text-3xl">🏛️</span>
            <div className="text-left">
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-300">
                Government of Jharkhand
              </p>
              <p className="text-sm font-bold text-white">
                Administrative Portal
              </p>
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-slate-700 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-md">
          <h1 className="mb-2 text-center text-2xl font-black text-white">
            Official Government Login
          </h1>
          <p className="mb-8 text-center text-sm text-slate-400">
            Restricted access — authorised personnel only
          </p>

          {error && (
            <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-center text-sm text-rose-400">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-300">
                Official Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="gov@jharkhand.gov.in"
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-400 transition"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-300">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••••"
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-400 transition"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 py-3.5 font-bold text-white shadow-lg transition hover:bg-blue-500 disabled:opacity-50"
            >
              {loading ? "Verifying..." : "🔐 Access Dashboard →"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-600">
            This portal is monitored and restricted to authorised government officials.
          </p>
        </div>
      </div>
    </div>
  );
}

