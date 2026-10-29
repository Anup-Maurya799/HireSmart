import { Link, useNavigate } from "react-router-dom";
import { Briefcase, LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 font-bold text-lg text-primary-dark"
        >
          <Briefcase size={22} />
          HireSmart
        </Link>

        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            to="/"
            className="hidden sm:block text-sm font-medium text-ink hover:text-primary-dark"
          >
            Job Board
          </Link>

          {user?.role === "recruiter" && (
            <Link
              to="/recruiter/dashboard"
              className="flex items-center gap-1 text-sm font-medium text-ink hover:text-primary-dark"
            >
              <LayoutDashboard size={16} />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
          )}

          {!user && (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-ink hover:text-primary-dark"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-primary hover:bg-primary-dark text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                Sign Up
              </Link>
            </>
          )}

          {user && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-sm font-medium text-red-500 hover:text-red-600"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
