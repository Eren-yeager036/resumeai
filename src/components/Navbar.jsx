import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserPlus, LogIn, Menu, X, LogOut, User } from 'lucide-react';
import { getActiveUser, clearActiveUser, isUserLoggedIn } from '../utils/auth';

export default function Navbar() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(() => getActiveUser());

  useEffect(() => {
    const handleStorageChange = () => {
      setUser(getActiveUser());
    };
    window.addEventListener('storage', handleStorageChange);
    setUser(getActiveUser());
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [location.pathname]);

  const handleLogout = () => {
    clearActiveUser();
    setUser(null);
  };

  const loggedIn = isUserLoggedIn() && user;

  return (
    <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 lg:px-12 flex items-center justify-between sticky top-0 z-50 text-slate-100">
      <div className="flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-emerald-400 flex items-center justify-center font-black text-white shadow-lg text-sm">
            R
          </div>
          <span className="text-xl font-extrabold text-white tracking-tight">ResumeAI</span>
        </Link>
      </div>

      {/* Desktop Navigation Links */}
      <div className="hidden md:flex items-center gap-3">
        {loggedIn ? (
          <>
            <Link
              to="/dashboard"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-sm flex items-center gap-1.5"
            >
              <span>Dashboard</span>
            </Link>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-semibold">{user.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 border border-slate-800 transition-all flex items-center gap-1"
            >
              <LogOut size={13} />
              <span>Logout</span>
            </button>
          </>
        ) : (
          <>
            <Link
              to="/register"
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 ${
                location.pathname === '/register'
                  ? 'bg-emerald-500 text-white shadow-emerald-500/20 ring-2 ring-emerald-400'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              <UserPlus size={14} />
              <span>Create Account</span>
            </Link>

            <Link
              to="/login"
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 ${
                location.pathname === '/login'
                  ? 'bg-indigo-500 text-white shadow-indigo-500/20 ring-2 ring-indigo-400'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              <LogIn size={14} />
              <span>Sign In / Login</span>
            </Link>
          </>
        )}
      </div>

      {/* Mobile Toggle Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden p-2 text-slate-300 hover:text-white rounded-xl bg-slate-800 border border-slate-700"
        aria-label="Toggle Navigation Menu"
      >
        {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="absolute top-16 left-0 w-full bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 p-4 flex flex-col gap-3 md:hidden shadow-2xl z-50">
          {loggedIn ? (
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-1.5 p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold"
              >
                <span>Dashboard</span>
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-1.5 p-3 bg-slate-800 hover:bg-rose-500/20 text-slate-300 rounded-xl text-xs font-bold"
              >
                <LogOut size={15} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-1.5 p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold"
              >
                <LogIn size={15} />
                <span>Sign In</span>
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-1.5 p-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold"
              >
                <UserPlus size={15} />
                <span>Create Account</span>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
