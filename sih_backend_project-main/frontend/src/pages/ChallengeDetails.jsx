import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axiosInstance";

const AI_BACKEND_URL = "http://127.0.0.1:8000";

function ChallengeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Task data from Node backend
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  // Live AI analysis (only called when task has no stored aiAnalysis)
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState("");

  // ── Step 1: Fetch task from Node backend ──────────────────────────────────
  useEffect(() => {
    if (!id) return;

    const fetchTask = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/tasks/${id}`);
        const task = res.data;
        setProblem(task);

        // ── Step 2: If the task already has aiAnalysis saved, use it directly ─
        if (task.aiAnalysis && task.aiAnalysis.detectedCategory) {
          setAnalysis(mapStoredAnalysis(task.aiAnalysis));
        } else {
          // Otherwise, call the live Python AI service
          runLiveAnalysis(task.description || task.title || "");
        }
      } catch (err) {
        setFetchError(
          err.response?.data?.message || "Failed to load challenge details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ── Map stored aiAnalysis (camelCase from Node) → display shape ──────────
  function mapStoredAnalysis(stored) {
    return {
      category: stored.detectedCategory,
      category_confidence: stored.categoryConfidence,
      matched_category_keywords: stored.matchedCategoryKeywords,
      problem_type: stored.problemType,
      problem_type_confidence: stored.problemTypeConfidence,
      severity: stored.severity,
      severity_confidence: stored.severityConfidence,
      affected_group: stored.affectedGroup,
      affected_group_confidence: stored.affectedGroupConfidence,
      impact_level: stored.impactLevel,
      required_skills: stored.requiredSkills,
      summary: stored.summary,
      overall_confidence: stored.overallConfidence,
      language: stored.language,
      _source: "stored",
    };
  }

  // ── Fallback: live call to Python AI backend ─────────────────────────────
  const runLiveAnalysis = async (text) => {
    if (!text) return;
    setAnalyzing(true);
    setAnalyzeError("");

    try {
      const res = await fetch(`${AI_BACKEND_URL}/analyze-problem`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        throw new Error(`AI service responded with status ${res.status}`);
      }

      const data = await res.json();

      if (data.error) {
        setAnalyzeError(data.error);
      } else {
        setAnalysis({ ...data, _source: "live" });
      }
    } catch (err) {
      console.error("Problem analysis error:", err);
      setAnalyzeError(
        "Could not reach the AI analyzer service. Make sure it is running on " +
          AI_BACKEND_URL
      );
    } finally {
      setAnalyzing(false);
    }
  };

  // ── Loading state ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#020b2d] text-white flex items-center justify-center">
        <p className="text-white/50 text-lg">Loading challenge…</p>
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────────────────
  if (fetchError || !problem) {
    return (
      <div className="min-h-screen bg-[#020b2d] text-white">
        <section className="flex min-h-[70vh] items-center justify-center px-6">
          <div className="text-center">
            <div className="mb-4 text-5xl">⚠️</div>
            <h1 className="text-3xl font-bold">Challenge Not Found</h1>
            <p className="mt-3 text-white/50">
              {fetchError || "Please go back and select a challenge."}
            </p>
            <button
              onClick={() => navigate("/challenges")}
              className="mt-6 rounded-xl bg-emerald-500 px-6 py-3 font-bold transition hover:bg-emerald-400"
            >
              ← Back to Challenges
            </button>
          </div>
        </section>
      </div>
    );
  }

  // ── Main detail page ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#020b2d] text-white">
      <section className="mx-auto max-w-5xl px-6 py-16">
        {/* BACK */}
        <button
          onClick={() => navigate("/challenges")}
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300"
        >
          ← Back to Challenges
        </button>

        {/* MAIN CARD */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl md:p-10">
          {/* CATEGORY & STATUS BADGES */}
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-emerald-400">
              {problem.category}
            </span>
            <span
              className={`rounded-full border border-white/10 px-4 py-2 text-sm capitalize ${
                problem.status === "completed"
                  ? "text-blue-300"
                  : problem.status === "in-progress"
                    ? "text-amber-300"
                    : "text-white/50"
              }`}
            >
              {problem.status}
            </span>
          </div>

          {/* TITLE */}
          <h1 className="text-4xl font-bold leading-tight md:text-5xl">
            {problem.title}
          </h1>

          {/* LOCATION */}
          <div className="mt-5 flex items-center gap-2 text-white/60">
            <span>📍</span>
            <span>{problem.location}</span>
          </div>

          {/* DIVIDER */}
          <div className="my-8 h-px bg-white/10" />

          {/* DESCRIPTION */}
          <div>
            <h2 className="text-2xl font-bold">Problem Description</h2>
            <p className="mt-4 whitespace-pre-line leading-8 text-white/65">
              {problem.description}
            </p>
          </div>

          {/* ── AI ANALYSIS SECTION ─────────────────────────────────────── */}
          <div className="mt-10 rounded-2xl border border-blue-400/20 bg-blue-500/5 p-6">
            <h2 className="flex items-center gap-2 text-xl font-bold">
              🤖 AI Problem Analysis
              {analysis?._source === "stored" && (
                <span className="ml-2 rounded-full bg-emerald-500/15 px-3 py-0.5 text-xs font-semibold text-emerald-400">
                  Saved
                </span>
              )}
              {analysis?._source === "live" && (
                <span className="ml-2 rounded-full bg-blue-500/15 px-3 py-0.5 text-xs font-semibold text-blue-400">
                  Live
                </span>
              )}
            </h2>

            {analyzing && (
              <p className="mt-3 text-sm text-white/50">
                Analyzing problem statement…
              </p>
            )}

            {!analyzing && analyzeError && (
              <p className="mt-3 text-sm text-rose-400">{analyzeError}</p>
            )}

            {!analyzing && analysis && (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <AnalysisField
                  label="Detected Category"
                  value={analysis.category}
                  confidence={analysis.category_confidence}
                />
                <AnalysisField
                  label="Problem Type"
                  value={analysis.problem_type}
                  confidence={analysis.problem_type_confidence}
                />
                <AnalysisField
                  label="Severity"
                  value={analysis.severity}
                  confidence={analysis.severity_confidence}
                />
                <AnalysisField
                  label="Affected Group"
                  value={analysis.affected_group}
                  confidence={analysis.affected_group_confidence}
                />
                <AnalysisField label="Impact Level" value={analysis.impact_level} />
                <AnalysisField
                  label="Detected Language"
                  value={analysis.language}
                />

                {analysis.required_skills?.length > 0 && (
                  <div className="sm:col-span-2">
                    <p className="text-xs font-bold uppercase tracking-wide text-white/40">
                      Required Skills
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {analysis.required_skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-blue-200"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {analysis.summary && (
                  <div className="sm:col-span-2">
                    <p className="text-xs font-bold uppercase tracking-wide text-white/40">
                      Summary
                    </p>
                    <p className="mt-2 leading-7 text-white/70">
                      {analysis.summary}
                    </p>
                  </div>
                )}

                {typeof analysis.overall_confidence === "number" && (
                  <div className="sm:col-span-2">
                    <p className="text-xs font-bold uppercase tracking-wide text-white/40">
                      Overall Confidence
                    </p>
                    <p className="mt-1 text-sm text-white/60">
                      {Math.round(analysis.overall_confidence * 100)}%
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── PROPOSE A SOLUTION ─────────────────────────────────────────── */}
          <div className="mt-10 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6">
            <h2 className="text-xl font-bold">Have an idea?</h2>
            <p className="mt-2 text-white/50">
              Help solve this community challenge by proposing an innovative
              solution.
            </p>
            <button
              onClick={() => navigate(`/submit-solution/${problem._id}`)}
              className="mt-5 rounded-xl bg-emerald-500 px-8 py-4 font-bold text-white shadow-lg transition hover:bg-emerald-400"
            >
              💡 Propose a Solution →
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ── Analysis Field Component ─────────────────────────────────────────────── */
function AnalysisField({ label, value, confidence }) {
  return (
    <div className="rounded-xl bg-white/5 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-white/40">
        {label}
      </p>
      <p className="mt-1 font-semibold text-white">{value || "—"}</p>
      {typeof confidence === "number" && (
        <p className="mt-1 text-xs text-white/40">
          Confidence: {Math.round(confidence * 100)}%
        </p>
      )}
    </div>
  );
}

export default ChallengeDetails;
