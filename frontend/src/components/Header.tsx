import React from "react";
import { useAuth } from "../contexts/AuthContext.tsx";
import { useLocation, useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle.tsx";

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Don't show header on login/register pages
  if (location.pathname === "/login" || location.pathname === "/register") {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-linear-to-r from-slate-800 to-slate-900 dark:from-slate-900 dark:to-slate-800 shadow-lg border-b border-slate-700 dark:border-slate-600">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl font-semibold text-white truncate">
              Task Management System
            </h1>
            {user && (
              <div className="ml-2 sm:ml-4 flex items-center min-w-0">
                <span className="text-xs sm:text-sm text-slate-300 dark:text-slate-200 truncate hidden sm:block">
                  Welcome, {user.first_name} {user.last_name}
                </span>
                <span className="text-xs sm:text-sm text-slate-300 dark:text-slate-200 truncate sm:hidden">
                  {user.first_name}
                </span>
                <span className="ml-1 sm:ml-2 px-2 py-1 text-xs font-medium rounded-full bg-emerald-500/20 text-emerald-300 dark:bg-emerald-500/30 dark:text-emerald-200 border border-emerald-500/30 dark:border-emerald-500/40 whitespace-nowrap">
                  {user.role}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center ml-2 sm:ml-4 space-x-2">
            <ThemeToggle />
            {user && (
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-xs sm:text-sm font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-800 dark:focus:ring-offset-slate-900"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
