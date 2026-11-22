import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Globe, LayoutDashboard, Calendar, Users, BarChart3,
  MapPin, MessageSquare, User, LogOut, Ticket, Sparkles,
  QrCode, ChevronLeft, ChevronRight, BookOpen, Map
} from 'lucide-react';

const navItems = {
  admin: [
    { to: '/admin',             icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/expos',       icon: Calendar,        label: 'Expo Management' },
    { to: '/admin/analytics',   icon: BarChart3,       label: 'Analytics' },
  ],
  exhibitor: [
    { to: '/exhibitor',          icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/exhibitor/profile',  icon: User,            label: 'My Profile' },
    { to: '/exhibitor/messages', icon: MessageSquare,   label: 'Messages' },
  ],
  attendee: [
    { to: '/attendee',        icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/attendee/events', icon: Calendar,        label: 'Browse Events' },
  ],
};

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const items = navItems[user?.role] || [];

  return (
    <aside className={`${collapsed ? 'w-16' : 'w-64'} flex-shrink-0 h-screen sticky top-0 flex flex-col bg-dark-900/95 border-r border-slate-800 transition-all duration-300`}>
      {/* Logo */}
      <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-4 h-16 border-b border-slate-800`}>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold gradient-text">EventSphere</span>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-colors">
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* User Badge */}
      {!collapsed && (
        <div className="mx-3 mt-4 mb-2 p-3 bg-gradient-to-r from-primary-900/40 to-purple-900/20 rounded-xl border border-primary-800/30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <p className="text-xs text-primary-400 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      )}

      {/* Nav Items */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to.split('/').length === 2}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
               ${isActive
                 ? 'bg-primary-600/20 text-primary-400 border border-primary-700/40'
                 : 'text-slate-400 hover:text-white hover:bg-white/5'
               } ${collapsed ? 'justify-center' : ''}`
            }
            title={collapsed ? label : undefined}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-2 border-t border-slate-800">
        <button onClick={() => { logout(); navigate('/'); }}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-900/20 transition-colors ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Sign Out' : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
