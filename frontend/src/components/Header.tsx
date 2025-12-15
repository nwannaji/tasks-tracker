import React from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

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
        </div>
      </div>
    </header>
  );
};

export default Header;
