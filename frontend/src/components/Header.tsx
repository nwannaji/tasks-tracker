import React from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Don't show header on login/register pages
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-linear-to-r from-slate-800 to-slate-900 shadow-lg border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl font-semibold text-white truncate">
              Task Management System
            </h1>
            {user && (
              <div className="ml-2 sm:ml-4 flex items-center min-w-0">
                <span className="text-xs sm:text-sm text-slate-300 truncate hidden sm:block">
                  Welcome, {user.first_name} {user.last_name}
                </span>
                <span className="text-xs sm:text-sm text-slate-300 truncate sm:hidden">
                  {user.first_name}
                </span>
                <span className="ml-1 sm:ml-2 px-2 py-1 text-xs font-medium rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 whitespace-nowrap">
                  {user.role}
                </span>
              </div>
            )}
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center px-2 sm:px-3 py-2 border border-red-500/30 shadow-sm text-xs sm:text-sm leading-4 font-medium rounded-md text-red-400 bg-red-500/10 hover:bg-red-500/20 hover:text-red-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-red-500 transition-all duration-200"
          >
            <ArrowRightOnRectangleIcon className="h-4 w-4 sm:mr-2 text-red-400" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
