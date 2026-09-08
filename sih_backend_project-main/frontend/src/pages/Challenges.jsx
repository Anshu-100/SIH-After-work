import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../api/axiosInstance";

export default function Challenges() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch tasks when the component mounts
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await API.get("/tasks");

      // Access the array from res.data (adjust if your backend sends res.data directly)
      setTasks(res.data.data || res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch challenges.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-lg font-semibold text-slate-600">
          Loading challenges...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto mt-10 max-w-xl rounded-xl bg-red-50 p-4 text-center text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">
              Community Challenges
            </h1>
            <p className="mt-1 text-slate-600">
              Explore reported problems across Jharkhand and submit solutions.
            </p>
          </div>
          <Link
            to="/submit-problem"
            className="rounded-xl bg-green-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-green-500/20 hover:bg-green-400"
          >
            + Post Problem
          </Link>
        </div>

        {/* Empty State */}
        {tasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="text-slate-500">No problems submitted yet.</p>
          </div>
        ) : (
          /* Grid of Task Cards */
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tasks.map((task) => (
              <div
                key={task._id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                      {task.category}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                        task.status === "completed"
                          ? "bg-blue-100 text-blue-700"
                          : task.status === "in-progress"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {task.status}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="mt-4 text-xl font-bold text-slate-900">
                    {task.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 line-clamp-3">
                    {task.description}
                  </p>
                </div>

                {/* Footer Metadata */}
                <div className="mt-6 border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>📍 {task.location}</span>
                    <span>
                      {new Date(task.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  {/* Submitter Info */}
                  {task.user && (
                    <p className="mt-2 text-xs font-medium text-slate-400">
                      Posted by:{" "}
                      <span className="text-slate-700">
                        {task.user.name || task.user.email}
                      </span>
                    </p>
                  )}

                  <Link
                    to={`/challenge-details/${task._id}`}
                    className="mt-4 block w-full rounded-lg bg-slate-900 py-2 text-center text-xs font-bold text-white hover:bg-slate-800"
                  >
                    View Details & Submit Solution →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
