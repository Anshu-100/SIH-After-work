import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axiosInstance";

function Signup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Credentials Form, 2: OTP Entry Form
  const [form, setForm] = useState({ email: "", password: "", otp: "" });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Step 1: Submit Credentials & Request OTP
  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!form.email || !form.password) {
      setErrorMsg("Email and password are required.");
      return;
    }

    setLoading(true);

    try {
      const res = await API.post("/auth/register", {
        email: form.email,
        password: form.password,
      });

      setSuccessMsg(res.data.message || "OTP sent to your email!");
      setStep(2); // Move to OTP entry step
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || "Registration failed. Try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Submit OTP & Complete Verification
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!form.otp) {
      setErrorMsg("Please enter the 6-digit OTP.");
      return;
    }

    setLoading(true);

    try {
      const res = await API.post("/auth/verify-otp", {
        email: form.email,
        otp: form.otp,
      });

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
      }

      // Redirect directly to Problem Submission page
      navigate("/submit-task");
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Invalid or expired OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020b2d] text-white">
      <div className="flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-md rounded-3xl border border-slate-700 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-md md:p-10">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-black">
              {step === 1 ? "Create Account" : "Verify Email"}
            </h1>
            <p className="mt-2 text-sm text-blue-200/70">
              {step === 1
                ? "Join the Jharkhand Innovation Platform"
                : `Enter the 6-digit code sent to ${form.email}`}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-center text-sm text-rose-400">
              ⚠️ {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center text-sm text-emerald-300">
              ✅ {successMsg}
            </div>
          )}

          {step === 1 ? (
            /* STEP 1: Registration Form */
            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-300">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@domain.com"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-emerald-400"
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
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-emerald-400"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-emerald-500 py-3.5 font-bold text-white shadow-lg transition hover:bg-emerald-400 disabled:opacity-50"
              >
                {loading ? "Registering & Sending OTP..." : "Get OTP Code →"}
              </button>
            </form>
          ) : (
            /* STEP 2: OTP Verification Form */
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-300">
                  6-Digit OTP Code
                </label>
                <input
                  type="text"
                  name="otp"
                  maxLength="6"
                  value={form.otp}
                  onChange={handleChange}
                  placeholder="123456"
                  className="w-full text-center text-2xl tracking-widest rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-emerald-400"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-emerald-500 py-3.5 font-bold text-white shadow-lg transition hover:bg-emerald-400 disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify OTP & Continue →"}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-xs text-slate-400 hover:underline pt-2 text-center"
              >
                ← Edit email or retry
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link to="/login" className="text-emerald-400 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
