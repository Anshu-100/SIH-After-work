import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axiosInstance";

export default function Login() {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Send credentials to backend login endpoint
      const response = await API.post("/auth/login", credentials);

      // 2. Extract token (adjust token key name if your backend uses 'accessToken' or 'jwt')
      const token = response.data.token || response.data.accessToken;

      if (token) {
        // 3. Save JWT token in localStorage
        localStorage.setItem("token", token);

        // Optional: Save user data if returned
        if (response.data.user) {
          localStorage.setItem("user", JSON.stringify(response.data.user));
        }

        // 4. Redirect to collaboration page
        navigate("/collaborate");
      } else {
        setError("Login failed: Token not received from server.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.message ||
          "Invalid email or password. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#020b2d] px-4 text-white">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-slate-900 shadow-2xl">
        <h2 className="text-3xl font-bold text-center mb-6 text-[#020b2d]">
          Sign In
        </h2>

        {error && (
          <div className="mb-4 rounded-lg bg-rose-100 p-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              className="w-full rounded-lg border border-slate-300 p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              className="w-full rounded-lg border border-slate-300 p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-emerald-500 py-3 font-bold text-white transition hover:bg-emerald-600 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
