import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axiosInstance"; // Adjust import path to match your project setup

export default function SubmitSolution() {
  const { taskId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    taskId: taskId || "",
    title: "",
    description: "",
    githubUrl: "",
    demoUrl: "",
    techStack: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await API.post("/solutions", formData);
      navigate("/solutions");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit solution.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-10 w-[500px] h-[300px] bg-blue-500/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400 mb-3">
            <span>⚙️ Innovation Hub</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Submit Your Prototype / Solution
          </h1>
          <p className="mt-2 text-slate-400 max-w-2xl">
            Share your technical solution, code repository, or prototype link to
            address an active community problem statement.
          </p>
        </div>

        {/* Main Form Box */}
        <div className="rounded-2xl bg-slate-800/60 border border-slate-700/60 p-6 sm:p-10 backdrop-blur-xl shadow-2xl">
          {error && (
            <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-sm text-red-400">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Task ID / Reference */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Problem / Task ID <span className="text-green-400">*</span>
              </label>
              <input
                type="text"
                name="taskId"
                value={formData.taskId}
                onChange={handleChange}
                placeholder="e.g. 64f81a10c9e12..."
                className="w-full rounded-xl bg-slate-900/80 border border-slate-700 px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500/80 focus:border-transparent transition font-mono text-sm"
                required
              />
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Solution Title <span className="text-green-400">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. IoT Sensor Network for Real-time Water Quality Monitoring"
                className="w-full rounded-xl bg-slate-900/80 border border-slate-700 px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500/80 focus:border-transparent transition"
                required
              />
            </div>

            {/* Tech Stack Tags */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Technologies Used
              </label>
              <input
                type="text"
                name="techStack"
                value={formData.techStack}
                onChange={handleChange}
                placeholder="e.g. React, Node.js, Python, TensorFlow, Hardware Kits"
                className="w-full rounded-xl bg-slate-900/80 border border-slate-700 px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500/80 focus:border-transparent transition"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Solution Architecture & Overview{" "}
                <span className="text-green-400">*</span>
              </label>
              <textarea
                name="description"
                rows={5}
                value={formData.description}
                onChange={handleChange}
                placeholder="Explain how your solution operates, hardware/software requirements, and key features..."
                className="w-full rounded-xl bg-slate-900/80 border border-slate-700 px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500/80 focus:border-transparent transition resize-none"
                required
              />
            </div>

            {/* URLs Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
                  <span>💻</span> GitHub Repository
                </label>
                <input
                  type="url"
                  name="githubUrl"
                  value={formData.githubUrl}
                  onChange={handleChange}
                  placeholder="https://github.com/user/project"
                  className="w-full rounded-xl bg-slate-900/80 border border-slate-700 px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500/80 focus:border-transparent transition text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
                  <span>🚀</span> Live Demo / Video Link
                </label>
                <input
                  type="url"
                  name="demoUrl"
                  value={formData.demoUrl}
                  onChange={handleChange}
                  placeholder="https://my-demo-app.vercel.app"
                  className="w-full rounded-xl bg-slate-900/80 border border-slate-700 px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500/80 focus:border-transparent transition text-sm"
                />
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-6 border-t border-slate-700/60 flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-5 py-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition font-medium text-sm"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 rounded-xl bg-green-500 text-slate-950 font-bold hover:bg-green-400 focus:outline-none focus:ring-2 focus:ring-green-400 disabled:opacity-50 transition shadow-lg shadow-green-500/20 text-sm"
              >
                {isSubmitting ? "Publishing..." : "Submit Solution →"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
