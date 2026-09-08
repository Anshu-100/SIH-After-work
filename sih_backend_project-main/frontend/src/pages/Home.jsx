import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../api/axiosInstance"; // Ensure this matches your axiosInstance location

function HomeLanding() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch real submitted tasks from backend
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await API.get("/api/tasks");
      // Read array whether backend wraps it in { data: [...] } or sends array directly
      setTasks(res.data.data || res.data || []);
    } catch (err) {
      console.error("Error fetching live data for home page:", err);
    } finally {
      setLoading(false);
    }
  };

  // Real backend dynamic calculations
  const totalProblems = tasks.length;
  const completedSolutions = tasks.filter(
    (t) => t.status === "completed",
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main id="home">
        <section className="relative min-h-[900px] overflow-visible bg-[#03183b] md:min-h-[780px]">
          <div className="absolute left-[-180px] top-[220px] h-[500px] w-[500px] rounded-full bg-blue-500/20 blur-3xl"></div>
          <div className="absolute right-[-150px] top-[150px] h-[500px] w-[500px] rounded-full bg-green-500/10 blur-3xl"></div>

          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
              backgroundSize: "70px 70px",
            }}
          ></div>

          <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-5 pb-24 pt-28 sm:px-6 sm:pt-32 md:grid-cols-2 md:gap-12 md:px-10 md:pb-36 md:pt-48 lg:pt-52">
            <div className="relative z-10">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-green-400/40 bg-green-400/10 px-5 py-2.5 text-sm font-semibold text-green-300">
                🚀 <span>Empowering Innovation Across Jharkhand</span>
              </div>

              <h2 className="max-w-3xl text-5xl font-black leading-[1.05] tracking-tight text-white md:text-6xl lg:text-7xl">
                Solve Problems.
                <br />
                Build a Better
                <br />
                <span className="text-green-400">Jharkhand.</span>
              </h2>

              <p className="mt-7 max-w-2xl text-base leading-7 text-blue-100/80 md:text-lg">
                A collaborative platform connecting citizens, universities,
                students, startups and industries to transform real-world
                societal challenges into impactful solutions.
              </p>

              <div className="mt-9 flex flex-wrap gap-4">
                <Link
                  to="/submit-problem"
                  className="group rounded-xl bg-green-500 px-6 py-4 font-bold text-white shadow-xl shadow-green-500/20 transition duration-300 hover:-translate-y-1 hover:bg-green-400"
                >
                  📝 Submit a Problem
                  <span className="ml-3 transition group-hover:ml-5">→</span>
                </Link>

                <Link
                  to="/challenges"
                  className="rounded-xl border border-green-400/60 bg-transparent px-6 py-4 font-bold text-white transition duration-300 hover:-translate-y-1 hover:bg-white/10"
                >
                  Explore Challenges →
                </Link>
              </div>

              <div className="mt-9 flex items-center gap-4">
                <div className="flex -space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#03183b] bg-orange-200">
                    👩
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#03183b] bg-blue-200">
                    👨
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#03183b] bg-green-200">
                    👩
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#03183b] bg-yellow-200">
                    👨
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#03183b] bg-purple-200">
                    +
                  </div>
                </div>

                <div>
                  <p className="font-bold text-white">
                    1,000+ citizens & innovators
                  </p>
                  <p className="text-sm text-blue-200/70">
                    already making an impact
                  </p>
                </div>
              </div>
            </div>

            <div className="relative hidden min-h-[500px] md:block">
              <div className="absolute left-1/2 top-1/2 flex h-[430px] w-[430px] -translate-x-1/2 -translate-y-1/2 items-center justify-center">
                <div className="absolute h-[390px] w-[390px] rounded-full border border-green-400/10 shadow-[0_0_100px_rgba(34,197,94,0.12)]"></div>
                <div className="absolute h-[430px] w-[430px] animate-[spin_30s_linear_infinite] rounded-full border border-dashed border-green-300/20"></div>

                <div className="relative flex h-[300px] w-[270px] rotate-[-5deg] items-center justify-center">
                  <div className="absolute inset-0 rounded-[45%_55%_48%_52%] border-4 border-green-300 bg-gradient-to-br from-green-500/40 via-blue-500/20 to-green-700/30 shadow-[0_0_60px_rgba(74,222,128,0.25)] [clip-path:polygon(25%_5%,65%_0%,93%_22%,87%_52%,100%_75%,70%_95%,40%_87%,8%_100%,0%_65%,12%_40%,5%_18%)]"></div>

                  <div className="relative z-10 flex h-24 w-24 flex-col items-center justify-center rounded-full border border-white/30 bg-[#092855]/80 shadow-2xl backdrop-blur">
                    <span className="text-4xl">🌱</span>
                    <span className="mt-1 text-xs font-bold tracking-wider text-green-300">
                      JHARKHAND
                    </span>
                  </div>
                </div>

                <div className="absolute left-[45px] top-[100px] h-3 w-3 animate-pulse rounded-full bg-green-300 shadow-[0_0_20px_rgba(134,239,172,1)]"></div>
                <div className="absolute right-[55px] top-[155px] h-3 w-3 animate-pulse rounded-full bg-blue-300 shadow-[0_0_20px_rgba(147,197,253,1)]"></div>
                <div className="absolute bottom-[90px] left-[100px] h-3 w-3 animate-pulse rounded-full bg-purple-300 shadow-[0_0_20px_rgba(216,180,254,1)]"></div>
                <div className="absolute bottom-[60px] right-[105px] h-3 w-3 animate-pulse rounded-full bg-yellow-300 shadow-[0_0_20px_rgba(253,224,71,1)]"></div>
              </div>

              <div className="absolute left-0 top-3 w-48 rounded-2xl border border-green-200/30 bg-green-100/95 p-4 shadow-2xl backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-2xl">
                    👥
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Citizens</p>
                    <p className="text-xs text-slate-600">
                      Report local challenges
                    </p>
                  </div>
                </div>
              </div>

              <div className="absolute left-[-70px] top-[250px] w-52 rounded-2xl border border-purple-200/30 bg-purple-100/95 p-4 shadow-2xl backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-2xl">
                    🎓
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Universities</p>
                    <p className="text-xs text-slate-600">Research & develop</p>
                  </div>
                </div>
              </div>

              <div className="absolute right-[-20px] top-[230px] w-48 rounded-2xl border border-orange-200/30 bg-orange-100/95 p-4 shadow-2xl backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-2xl">
                    🏭
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Industry</p>
                    <p className="text-xs text-slate-600">Implement & scale</p>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-0 left-1/2 w-52 -translate-x-1/2 rounded-2xl border border-blue-200/30 bg-blue-100/95 p-4 shadow-2xl backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-2xl">
                    🌱
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Real Impact</p>
                    <p className="text-xs text-slate-600">
                      Stronger communities
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* DYNAMIC STATS BAR (Real numbers from backend) */}
          <div className="relative z-20 mx-auto mt-10 w-[92%] max-w-7xl md:absolute md:bottom-[-55px] md:left-1/2 md:mt-0 md:-translate-x-1/2">
            <div className="grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl grid-cols-1 sm:grid-cols-2 md:grid-cols-5">
              <Stat
                number={totalProblems.toString()}
                title="Problems Reported"
                description="Live from backend database"
                icon="📄"
              />
              <Stat
                number={completedSolutions.toString()}
                title="Solutions Implemented"
                description="Completed challenges"
                icon="✓"
              />
              <Stat
                number="42"
                title="Universities Connected"
                description="Across the state"
                icon="🎓"
              />
              <Stat
                number="67"
                title="Industry Partners"
                description="Supporting innovation"
                icon="♧"
              />
              <Stat
                number="125K+"
                title="Citizens Impacted"
                description="And growing every day"
                icon="👥"
              />
            </div>
          </div>
        </section>

        {/* RECENT CHALLENGES SECTION (Render real database records) */}
        <section className="px-6 pb-24 pt-44">
          <div className="mx-auto max-w-7xl text-center">
            <p className="font-bold tracking-[0.25em] text-green-600">
              // &nbsp; DISCOVER &nbsp; //
            </p>
            <h2 className="mt-4 text-4xl font-black text-[#061a3a] md:text-5xl">
              Explore Community Challenges
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-500">
              Real problems. Real people. Real impact.
            </p>
            <div className="mx-auto mt-5 h-1 w-12 rounded-full bg-green-500"></div>
          </div>

          <div className="mx-auto mt-12 max-w-7xl">
            {loading ? (
              <p className="text-center text-slate-500">
                Loading live challenges...
              </p>
            ) : tasks.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
                No problems submitted yet. Be the first to post one!
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {tasks.slice(0, 6).map((task) => (
                  <div
                    key={task._id}
                    className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                          {task.category}
                        </span>
                        <span className="text-xs font-semibold text-slate-400">
                          📍 {task.location}
                        </span>
                      </div>

                      <h3 className="mt-4 text-xl font-bold text-slate-900">
                        {task.title}
                      </h3>
                      <p className="mt-2 text-sm text-slate-600 line-clamp-3">
                        {task.description}
                      </p>
                    </div>

                    <div className="mt-6 border-t border-slate-100 pt-4">
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                        <span>
                          Status:{" "}
                          <strong className="capitalize text-slate-700">
                            {task.status}
                          </strong>
                        </span>
                        <span>
                          {new Date(task.createdAt).toLocaleDateString("en-IN")}
                        </span>
                      </div>

                      <Link
                        to="/challenges"
                        className="block w-full rounded-xl bg-slate-900 py-2.5 text-center text-xs font-bold text-white transition hover:bg-slate-800"
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function Stat({ number, title, description, icon }) {
  return (
    <div className="border-b border-slate-200 px-5 py-6 last:border-b-0 sm:px-6 md:border-b-0 md:border-r md:px-5 md:py-7 md:last:border-r-0">
      <div className="flex items-center gap-4 md:items-start">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-xl text-green-600">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-black text-[#06275a] md:text-3xl">
            {number}
          </p>
          <p className="mt-1 text-sm font-bold text-slate-800">{title}</p>
          <p className="mt-1 text-xs text-slate-500">{description}</p>
        </div>
      </div>
    </div>
  );
}
