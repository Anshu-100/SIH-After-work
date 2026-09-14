import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axiosInstance";

const ANALYZER_BASE_URL = "http://127.0.0.1:8000";

const CATEGORY_OPTIONS = [
  { value: "Urban Infrastructure", label: "Urban Infrastructure (Roads, Bridges, Potholes)" },
  { value: "Water Management", label: "Water Management & Drinking Supply" },
  { value: "Sanitation", label: "Sanitation & Waste Management" },
  { value: "Healthcare", label: "Healthcare & Hospitals" },
  { value: "Education", label: "Education & Schools" },
  { value: "Agriculture", label: "Agriculture & Irrigation" },
  { value: "Environment", label: "Environment & Pollution" },
  { value: "Transportation", label: "Transportation & Traffic" },
  { value: "Public Safety", label: "Public Safety & Law/Order" },
  { value: "Energy", label: "Energy & Electricity" },
  { value: "Governance", label: "Governance & Civic Services" },
  { value: "Other", label: "Other Civic Problem" },
];

function mapSeverityToImpact(sev) {
  if (!sev) return "Medium";
  const s = sev.toUpperCase();
  if (s === "CRITICAL") return "Critical";
  if (s === "HIGH") return "High";
  if (s === "MEDIUM") return "Medium";
  if (s === "LOW") return "Low";
  return "Medium";
}

export default function SubmitProblem() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    category: "Urban Infrastructure",
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
  const [autoUpdatedMsg, setAutoUpdatedMsg] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // If description changed, clear previous analysis notification
    if (name === "description" && aiAnalysis) {
      setAutoUpdatedMsg("");
    }
  };

  const handleAiCategorize = async () => {
    if (!formData.description.trim()) {
      setAnalyzeError("Please write a problem description before running AI categorization.");
      return;
    }

    setAnalyzing(true);
    setAnalyzeError("");
    setAutoUpdatedMsg("");

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

        // Auto-update form category and severity using ML predictions
        const mappedImpact = mapSeverityToImpact(data.severity);
        const predictedCategory = data.category || "Urban Infrastructure";

        setFormData((prev) => ({
          ...prev,
          category: predictedCategory,
          impactScore: mappedImpact,
        }));

        setAutoUpdatedMsg(
          `✨ ML Model predicted Category: "${predictedCategory}" (${Math.round((data.category_confidence || 0) * 100)}%) and Severity: "${data.severity}" (${Math.round((data.severity_confidence || 0) * 100)}%). Form fields updated automatically!`
        );
      }
    } catch (err) {
      console.error("AI categorization error:", err);
      setAnalyzeError(
        "Could not reach the AI analyzer service. Make sure it is running on " +
          ANALYZER_BASE_URL
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
      const payload = {
        ...formData,
        severity:
          aiAnalysis?.severity ||
          (formData.impactScore === "Critical" ? "CRITICAL" : formData.impactScore.toUpperCase()),
        impactScore: formData.impactScore,
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
            modelPipeline: aiAnalysis.model_pipeline,
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
            <span>✨ Civic Innovation Portal — Powered by Machine Learning</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Report a Problem Statement
          </h1>
          <p className="mt-2 text-slate-400 max-w-2xl">
            Highlight a real-world civic issue in any language. Our trained ML
            models will classify category, detect severity, and route it to
            relevant solvers.
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
                  placeholder="e.g. Broken water pipeline flooding streets in Ranchi"
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
                    {CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Estimated Impact / Severity <span className="text-green-400">*</span>
                  </label>
                  <select
                    name="impactScore"
                    value={formData.impactScore}
                    onChange={handleChange}
                    className="w-full rounded-xl bg-slate-900/80 border border-slate-700 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500/80 focus:border-transparent transition"
                  >
                    <option value="Low">Low (Local Community)</option>
                    <option value="Medium">Medium (District Scale)</option>
                    <option value="High">High (State-Wide / Urgent)</option>
                    <option value="Critical">Critical (Emergency / Life Threatening)</option>
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
                  placeholder="e.g. Dhanbad, Bokaro, East Singhbhum, Ranchi"
                  className="w-full rounded-xl bg-slate-900/80 border border-slate-700 px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500/80 focus:border-transparent transition"
                  required
                />
              </div>

              {/* Detailed Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Detailed Description (Any Indian Language Supported) <span className="text-green-400">*</span>
                </label>
                <textarea
                  name="description"
                  rows={5}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Explain the problem in English, Hindi, Bengali, Odia, or any regional language. Click 'AI Categorize & Predict' below to auto-classify it."
                  className="w-full rounded-xl bg-slate-900/80 border border-slate-700 px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500/80 focus:border-transparent transition resize-none"
                  required
                />
              </div>

              {/* ================= AI CATEGORIZE BUTTON ================= */}
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleAiCategorize}
                    disabled={analyzing}
                    className="inline-flex items-center gap-2 rounded-xl border border-blue-500/40 bg-blue-500/20 px-5 py-3 text-sm font-bold text-blue-300 transition hover:bg-blue-500/30 disabled:opacity-50 shadow-lg shadow-blue-500/10"
                  >
                    {analyzing ? "🧠 Running ML Models..." : "🤖 AI Categorize & Predict Severity"}
                  </button>

                  <span className="text-xs text-slate-400">
                    Trained TF-IDF + Logistic Regression ML Models
                  </span>
                </div>

                {analyzeError && (
                  <p className="mt-3 text-sm text-rose-400">{analyzeError}</p>
                )}

                {autoUpdatedMsg && (
                  <div className="mt-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-medium text-emerald-300">
                    {autoUpdatedMsg}
                  </div>
                )}

                {/* AI ANALYSIS PREVIEW */}
                {aiAnalysis && (
                  <div className="mt-4 rounded-xl border border-blue-500/30 bg-blue-500/10 p-5 backdrop-blur-md">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-bold uppercase tracking-wide text-blue-300">
                        🤖 Machine Learning Analysis Result
                      </p>
                      <span className="rounded-full bg-blue-400/20 px-2.5 py-0.5 text-xs font-semibold text-blue-300">
                        {aiAnalysis.model_pipeline || "ML Model Pipeline"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div className="rounded-lg bg-slate-900/60 p-3 border border-slate-700/50">
                        <span className="text-xs text-slate-400 block mb-1">Predicted Category</span>
                        <span className="font-bold text-white text-base">
                          {aiAnalysis.category}
                        </span>
                        {typeof aiAnalysis.category_confidence === "number" && (
                          <span className="ml-2 text-xs text-emerald-400 font-semibold">
                            ({Math.round(aiAnalysis.category_confidence * 100)}% conf)
                          </span>
                        )}
                      </div>

                      <div className="rounded-lg bg-slate-900/60 p-3 border border-slate-700/50">
                        <span className="text-xs text-slate-400 block mb-1">Predicted Severity</span>
                        <span
                          className={`font-bold text-base ${
                            aiAnalysis.severity === "CRITICAL"
                              ? "text-red-400"
                              : aiAnalysis.severity === "HIGH"
                              ? "text-orange-400"
                              : aiAnalysis.severity === "MEDIUM"
                              ? "text-amber-400"
                              : "text-emerald-400"
                          }`}
                        >
                          ⚡ {aiAnalysis.severity}
                        </span>
                        {typeof aiAnalysis.severity_confidence === "number" && (
                          <span className="ml-2 text-xs text-emerald-400 font-semibold">
                            ({Math.round(aiAnalysis.severity_confidence * 100)}% conf)
                          </span>
                        )}
                      </div>

                      <div className="rounded-lg bg-slate-900/60 p-3 border border-slate-700/50">
                        <span className="text-xs text-slate-400 block mb-1">Problem Subtype</span>
                        <span className="font-semibold text-white">
                          {aiAnalysis.problem_type}
                        </span>
                      </div>

                      <div className="rounded-lg bg-slate-900/60 p-3 border border-slate-700/50">
                        <span className="text-xs text-slate-400 block mb-1">Affected Demography</span>
                        <span className="font-semibold text-white">
                          {aiAnalysis.affected_group}
                        </span>
                      </div>
                    </div>

                    {aiAnalysis.summary && (
                      <p className="mt-3 text-xs text-slate-300 italic">
                        "{aiAnalysis.summary}"
                      </p>
                    )}

                    <p className="mt-3 text-xs text-slate-400">
                      💡 Category and Severity have been automatically synchronized with the form. You can review or adjust them before submitting.
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
                <span>🤖</span> AI ML Classifier
              </h3>
              <ul className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <li className="flex gap-2">
                  <span className="text-green-400">✓</span> <b>Multi-Class ML Model:</b> Trained on 1,550 real-world civic complaints across 10 departments.
                </li>
                <li className="flex gap-2">
                  <span className="text-green-400">✓</span> <b>Severity Prioritization:</b> Auto-predicts LOW, MEDIUM, HIGH, and CRITICAL emergency ratings.
                </li>
                <li className="flex gap-2">
                  <span className="text-green-400">✓</span> <b>Multilingual NLLB-200:</b> Write complaints in Hindi, Bengali, Odia, or English.
                </li>
              </ul>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-green-500/10 to-blue-500/10 border border-green-500/20 p-6">
              <div className="text-2xl mb-2">💡</div>
              <h4 className="text-sm font-bold text-white mb-1">
                What happens next?
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your complaint is registered with its AI classification in the{" "}
                <b>Community Challenges Directory</b>, allowing engineering teams,
                NGOs, and district administrators to prioritize and build prototypes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
