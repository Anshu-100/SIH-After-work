import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axiosInstance"; // Adjust import path to match your project setup

const ANALYZER_BASE_URL = "http://127.0.0.1:8000";

export default function SubmitProblem() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    category: "Infrastructure",
    location: "",
    description: "",
    impactScore: "Medium",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // ================= AI ANALYZER STATE =================
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // If the description changes after an analysis was already run,
    // clear the stale result so the user knows to re-run it.
    if (name === "description" && aiAnalysis) {
      setAiAnalysis(null);
    }
  };

  const handleAiCategorize = async () => {
    if (!formData.description.trim()) {
      setAnalyzeError("Please write a description before running AI categorization.");
      return;
    }

    setAnalyzing(true);
    setAnalyzeError("");
    setAiAnalysis(null);

    try {
      const res = await fetch(`${ANALYZER_BASE_URL}/analyze-problem`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: formData.description }),
      });

      if (!res.ok) {
        throw new Error(`Analyzer request failed with status ${res.status}`);
      }

      const data = await res.json();

      if (data.error) {
        setAnalyzeError(data.error);
      } else {
        setAiAnalysis(data);
      }
    } catch (err) {
      console.error("AI categorization error:", err);
      setAnalyzeError(
        "Could not reach the AI analyzer service. Make sure it is running on " +
          ANALYZER_BASE_URL,
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // Build the payload the Node backend expects, plus the AI analysis
      // (if the user ran "AI Categorize" before submitting).
      const payload = {
        ...formData,
        ...(aiAnalysis && {
          aiAnalysis: {
            language: aiAnalysis.language,
            languageCode: aiAnalysis.language_code,
            detectedCategory: aiAnalysis.category,
            categoryConfidence: aiAnalysis.category_confidence,
            matchedCategoryKeywords: aiAnalysis.matched_category_keywords,
            problemType: aiAnalysis.problem_type,
            problemTypeConfidence: aiAnalysis.problem_type_confidence,
            severity: aiAnalysis.severity,
            severityConfidence: aiAnalysis.severity_confidence,
            affectedGroup: aiAnalysis.affected_group,
            affectedGroupConfidence: aiAnalysis.affected_group_confidence,
            impactLevel: aiAnalysis.impact_level,
            requiredSkills: aiAnalysis.required_skills,
            summary: aiAnalysis.summary,
            overallConfidence: aiAnalysis.overall_confidence,
            translatedText: aiAnalysis.translated_text,
          },
        }),
      };

      await API.post("/tasks", payload);
      navigate("/challenges");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to post challenge.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Subtle Lighting Effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-green-500/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-xs font-semibold text-green-400 mb-3">
            <span>✨ Civic Innovation Portal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Report a Problem Statement
          </h1>
          <p className="mt-2 text-slate-400 max-w-2xl">
            Highlight a real-world issue in Jharkhand. Submit detailed
            information so student researchers, universities, and industries can
            collaborate on solutions.
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Form (Left 2 cols) */}
          <div className="lg:col-span-2 rounded-2xl bg-slate-800/60 border border-slate-700/60 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
            {error && (
              <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-sm text-red-400">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Problem Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Problem Title <span className="text-green-400">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Unregulated Agricultural Waste Management in Ranchi"
                  className="w-full rounded-xl bg-slate-900/80 border border-slate-700 px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500/80 focus:border-transparent transition"
                  required
                />
              </div>

              {/* Category & Impact Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Category <span className="text-green-400">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full rounded-xl bg-slate-900/80 border border-slate-700 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500/80 focus:border-transparent transition"
                  >
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Agriculture">Agriculture</option>
                    <option value="Healthcare">Healthcare & Sanitation</option>
                    <option value="Education">Education & Skill</option>
                    <option value="Environment">Environment & Water</option>
                    <option value="Governance">
                      Governance & Public Services
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Estimated Impact <span className="text-green-400">*</span>
                  </label>
                  <select
                    name="impactScore"
                    value={formData.impactScore}
                    onChange={handleChange}
                    className="w-full rounded-xl bg-slate-900/80 border border-slate-700 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500/80 focus:border-transparent transition"
                  >
                    <option value="Low">Low (Local Community)</option>
                    <option value="Medium">Medium (District Scale)</option>
                    <option value="High">High (State-Wide Impact)</option>
                  </select>
                </div>
              </div>

              {/* District / Location */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  District / Location <span className="text-green-400">*</span>
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Dhanbad, Bokaro, East Singhbhum"
                  className="w-full rounded-xl bg-slate-900/80 border border-slate-700 px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500/80 focus:border-transparent transition"
                  required
                />
              </div>

              {/* Detailed Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Detailed Description <span className="text-green-400">*</span>
                </label>
                <textarea
                  name="description"
                  rows={5}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Provide context: What is happening? Who does it affect? What solutions have failed so far?"
                  className="w-full rounded-xl bg-slate-900/80 border border-slate-700 px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500/80 focus:border-transparent transition resize-none"
                  required
                />
              </div>

              {/* ================= AI CATEGORIZE BUTTON ================= */}
              <div>
                <button
                  type="button"
                  onClick={handleAiCategorize}
                  disabled={analyzing}
                  className="inline-flex items-center gap-2 rounded-xl border border-blue-500/40 bg-blue-500/10 px-5 py-3 text-sm font-bold text-blue-300 transition hover:bg-blue-500/20 disabled:opacity-50"
                >
                  {analyzing ? "Analyzing..." : "🤖 AI Categorize"}
                </button>

                {analyzeError && (
                  <p className="mt-3 text-sm text-rose-400">{analyzeError}</p>
                )}

                {/* AI ANALYSIS PREVIEW */}
                {aiAnalysis && (
                  <div className="mt-4 rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">
                    <p className="text-xs font-bold uppercase tracking-wide text-blue-300 mb-3">
                      AI Analysis Preview
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <p>
                        <span className="text-slate-400">Category: </span>
                        <span className="font-semibold text-white">
                          {aiAnalysis.category}
                        </span>
                      </p>
                      <p>
                        <span className="text-slate-400">Problem Type: </span>
                        <span className="font-semibold text-white">
                          {aiAnalysis.problem_type}
                        </span>
                      </p>
                      <p>
                        <span className="text-slate-400">Severity: </span>
                        <span className="font-semibold text-white">
                          {aiAnalysis.severity}
                        </span>
                      </p>
                      <p>
                        <span className="text-slate-400">Affected Group: </span>
                        <span className="font-semibold text-white">
                          {aiAnalysis.affected_group}
                        </span>
                      </p>
                    </div>

                    {aiAnalysis.summary && (
                      <p className="mt-3 text-sm text-slate-300">
                        {aiAnalysis.summary}
                      </p>
                    )}

                    <p className="mt-3 text-xs text-slate-500">
                      This analysis will be saved along with your problem
                      submission.
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-5 py-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 rounded-xl bg-green-500 text-slate-950 font-bold hover:bg-green-400 focus:outline-none focus:ring-2 focus:ring-green-400 disabled:opacity-50 transition shadow-lg shadow-green-500/20 text-sm"
                >
                  {isSubmitting ? "Submitting..." : "Post Problem Statement →"}
                </button>
              </div>
            </form>
          </div>

          {/* Sidebar / Guidelines (Right 1 col) */}
          <div className="space-y-6">
            <div className="rounded-2xl bg-slate-800/40 border border-slate-700/60 p-6 backdrop-blur-xl">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <span>📋</span> Guidelines for Submission
              </h3>
              <ul className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <li className="flex gap-2">
                  <span className="text-green-400">✓</span> Be specific about
                  the geographical area and population affected.
                </li>
                <li className="flex gap-2">
                  <span className="text-green-400">✓</span> Avoid vague titles
                  like "Bad Roads". Use concise summaries.
                </li>
                <li className="flex gap-2">
                  <span className="text-green-400">✓</span> Include measurable
                  context or numbers if available.
                </li>
              </ul>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-green-500/10 to-blue-500/10 border border-green-500/20 p-6">
              <div className="text-2xl mb-2">💡</div>
              <h4 className="text-sm font-bold text-white mb-1">
                What happens next?
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Once reviewed, your problem will be published to the{" "}
                <b>Challenges Directory</b> where innovators and university
                teams can pick it up to prototype solutions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
