import React from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="flex items-center justify-between bg-slate-900 px-8 py-4 text-white border-b border-slate-800">
      <Link to="/" className="text-xl font-bold text-emerald-400">
        Jharkhand Innovation Portal
      </Link>

      <div className="flex items-center space-x-6 text-sm font-semibold">
        {/* Always Visible Links */}
        <Link to="/" className="hover:text-emerald-400">
          Home
        </Link>

        {token ? (
          /* AUTHENTICATED LINKS (Only 1 Logout Button Here) */
          <>
            <Link to="/collaborate" className="hover:text-emerald-400">
              Collaborate
            </Link>
            <Link to="/submit-problem" className="hover:text-emerald-400">
              Submit Problem
            </Link>
            <Link to="/submit-solution" className="hover:text-emerald-400">
              Submit Solution
            </Link>
            <Link to="/solutions" className="hover:text-emerald-400">
              Others Solution
            </Link>
            <button
              onClick={handleLogout}
              className="rounded-lg bg-rose-600 px-4 py-2 text-white hover:bg-rose-500 transition"
            >
              Logout
            </button>
          </>
        ) : (
          /* UNAUTHENTICATED LINKS */
          <>
            <Link to="/login" className="hover:text-emerald-400">
              Login
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-emerald-500 px-4 py-2 text-white hover:bg-emerald-400 transition"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
