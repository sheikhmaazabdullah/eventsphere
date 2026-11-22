import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth }  from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import NotificationBell from './NotificationBell';
import {
  Globe, Menu, X, LogOut, LayoutDashboard,
  ChevronDown, Sun, Moon
} from 'lucide-react';

const Navbar = () => {
  const { user, logout }   = useAuth();
  const { isDark, toggle } = useTheme();
  const navigate           = useNavigate();
  const location           = useLocation();
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const dashboardPath = user
    ? { admin:'/admin', exhibitor:'/exhibitor', attendee:'/attendee' }[user.role]
    : '/';

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-primary-900/50 group-hover:scale-110 transition-transform">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-lg gradient-text">EventSphere</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2">
            <Link to="/" className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname==='/' ? 'text-primary-400 bg-primary-900/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
              Home
            </Link>

            {/* Theme Toggle */}
            <button onClick={toggle}
              className="p-2 rounded-xl bg-dark-800 border border-slate-700 hover:border-primary-600/50 transition-all"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
              {isDark
                ? <Sun  className="w-4 h-4 text-amber-400" />
                : <Moon className="w-4 h-4 text-primary-400" />}
            </button>

            {!user && (
              <>
                <Link to="/login"    className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors">Login</Link>
                <Link to="/register" className="btn-primary text-sm ml-1">Get Started</Link>
              </>
            )}

            {user && (
              <>
                <NotificationBell />
                <div className="relative ml-1">
                  <button onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-dark-800 border border-slate-700 hover:border-primary-600/50 transition-all text-sm">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-xs font-bold">
                      {user.name?.[0]?.toUpperCase()}
                    </div>
                    <span className="font-medium text-slate-200 hidden sm:block">{user.name}</span>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>
                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-52 card py-1 animate-fade-in z-50">
                      <div className="px-4 py-2 border-b border-slate-800">
                        <p className="text-sm font-semibold text-white">{user.name}</p>
                        <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                      </div>
                      <Link to={dashboardPath} onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 transition-colors">
                        <LayoutDashboard className="w-4 h-4" /> Dashboard
                      </Link>
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-900/20 transition-colors">
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
            onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden card mx-4 mb-4 p-4 animate-slide-up">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-slate-400">Theme</p>
            <button onClick={toggle} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-700 text-sm text-slate-300">
              {isDark ? <><Sun className="w-4 h-4 text-amber-400" /> Light</> : <><Moon className="w-4 h-4 text-primary-400" /> Dark</>}
            </button>
          </div>
          {user ? (
            <>
              <div className="flex items-center gap-3 p-3 bg-dark-900/60 rounded-xl mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center font-bold">
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">{user.name}</p>
                  <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                </div>
              </div>
              <Link to={dashboardPath} className="btn-secondary w-full justify-center mb-2" onClick={() => setMobileOpen(false)}>Dashboard</Link>
              <button onClick={handleLogout} className="btn-danger w-full justify-center">Sign Out</button>
            </>
          ) : (
            <div className="flex flex-col gap-2">
              <Link to="/login"    className="btn-secondary w-full justify-center" onClick={() => setMobileOpen(false)}>Login</Link>
              <Link to="/register" className="btn-primary w-full justify-center"   onClick={() => setMobileOpen(false)}>Register</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;