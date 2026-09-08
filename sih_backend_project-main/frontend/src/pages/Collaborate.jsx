import React, { useState, useEffect } from "react";
import API from "../api/axiosInstance";

function Collaborate() {
  const [problems, setProblems] = useState([]);
  const [fetchingTasks, setFetchingTasks] = useState(true);
  const [form, setForm] = useState({
    instituteName: "",
    problemId: "",
    expectedCost: "",
    durationToSolve: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch available problems for the dropdown
  useEffect(() => {
    const fetchProblems = async () => {
      setFetchingTasks(true);
      try {
        const res = await API.get("/tasks");
        setProblems(res.data || []);
      } catch (err) {
        console.error("Failed to fetch problems list:", err);
      } finally {
        setFetchingTasks(false);
      }
    };
    fetchProblems();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(false);
    setErrorMessage("");

    if (
      !form.instituteName ||
      !form.problemId ||
      !form.expectedCost ||
      !form.durationToSolve
    ) {
      alert("Please fill all required fields.");
      return;
    }

    setLoading(true);

    try {
      await API.post("/collaborations", {
        instituteName: form.instituteName,
        problemId: form.problemId,
        expectedCost: Number(form.expectedCost),
        durationToSolve: form.durationToSolve,
      });

      setSubmitted(true);

      // Clear form
      setForm({
        instituteName: "",
        problemId: "",
        expectedCost: "",
        durationToSolve: "",
      });
    } catch (error) {
      console.error("Error submitting collaboration:", error);
      console.log("Server response details:", error.response?.data);

      setErrorMessage(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to submit request. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020b2d] text-white">
      {/* HERO */}
      <section className="relative overflow-hidden px-6 py-20">
        <div className="absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex rounded-full border border-emerald-400/40 bg-emerald-400/10 px-5 py-2 text-sm font-semibold text-emerald-300">
            🤝 Collaboration Hub
          </div>

          <h1 className="text-5xl font-black leading-tight md:text-6xl">
            Collaborate.
            <br />
            <span className="text-emerald-400">Create Impact.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-blue-100/70">
            Connect with institutes, researchers, and government organizations
            to solve key operational challenges for Jharkhand.
          </p>
        </div>
      </section>

      {/* FORM */}
      <section className="bg-white px-6 py-20 text-slate-900">
        <div className="mx-auto max-w-3xl">
          <div className="mb-10 text-center">
            <p className="font-semibold uppercase tracking-widest text-emerald-600">
              Join the Network
            </p>

            <h2 className="mt-3 text-4xl font-bold">
              Institute Collaboration Details
            </h2>

            <p className="mt-4 text-slate-500">
              Provide details on your institution and budget requirements to
              solve a problem statement.
            </p>
          </div>

          {/* SUCCESS MESSAGE */}
          {submitted && (
            <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-5 text-center">
              <div className="text-3xl">✅</div>
              <h3 className="mt-2 font-bold text-emerald-700">
                Collaboration request submitted!
              </h3>
              <p className="mt-1 text-sm text-emerald-600">
                Thank you for joining the innovation network.
              </p>
            </div>
          )}

          {/* ERROR MESSAGE */}
          {errorMessage && (
            <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-6 py-5 text-center">
              <div className="text-3xl">⚠️</div>
              <h3 className="mt-2 font-bold text-rose-700">Submission Error</h3>
              <p className="mt-1 text-sm text-rose-600">{errorMessage}</p>
            </div>
          )}

          {/* FORM CARD */}
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl md:p-10"
          >
            {/* INSTITUTE NAME */}
            <div className="mb-6">
              <label className="mb-2 block font-semibold">Institute Name</label>
              <input
                type="text"
                name="instituteName"
                value={form.instituteName}
                onChange={handleChange}
                placeholder="Enter institute or college name"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                required
              />
            </div>

            {/* PROBLEM SELECTION DROPDOWN */}
            <div className="mb-6">
              <label className="mb-2 block font-semibold">
                Select Problem Statement
              </label>

              <select
                name="problemId"
                value={form.problemId}
                onChange={handleChange}
                disabled={fetchingTasks}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 disabled:opacity-50"
                required
              >
                <option value="">
                  {fetchingTasks
                    ? "-- Loading tasks... --"
                    : problems.length === 0
                      ? "-- No active problems found --"
                      : "-- Choose a Problem --"}
                </option>
                {problems.map((prob) => (
                  <option key={prob._id} value={prob._id}>
                    {prob.title || `Problem #${prob._id}`}
                  </option>
                ))}
              </select>
            </div>

            {/* EXPECTED COST */}
            <div className="mb-6">
              <label className="mb-2 block font-semibold">
                Expected Cost (₹)
              </label>
              <input
                type="number"
                name="expectedCost"
                value={form.expectedCost}
                onChange={handleChange}
                placeholder="e.g. 150000"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                required
              />
            </div>

            {/* DURATION TO SOLVE */}
            <div className="mb-8">
              <label className="mb-2 block font-semibold">
                Duration to Solve Problem
              </label>
              <input
                type="text"
                name="durationToSolve"
                value={form.durationToSolve}
                onChange={handleChange}
                placeholder="e.g. 3 Months / 6 Months"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                required
              />
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading || fetchingTasks}
              className="w-full rounded-xl bg-emerald-500 px-6 py-4 font-bold text-white shadow-lg transition hover:-translate-y-1 hover:bg-emerald-400 disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Collaboration Request →"}
            </button>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#020b2d] px-6 py-10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 md:flex-row">
          <div>
            <h3 className="font-bold">🌱 JHARKHAND INNOVATION PLATFORM</h3>
            <p className="mt-2 text-sm text-blue-200">
              Building a better Jharkhand through innovation.
            </p>
          </div>

          <p className="text-sm text-blue-300">
            © 2026 Jharkhand Innovation Platform
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Collaborate;
