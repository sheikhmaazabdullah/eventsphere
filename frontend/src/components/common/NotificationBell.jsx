import React, { useEffect, useState, useRef } from 'react';
import { Bell, CheckCheck, Calendar, Users, MessageSquare, Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../hooks/useSocket';
import api from '../../services/api';

const ICON_MAP = {
  registration: <Users className="w-4 h-4 text-primary-400" />,
  message:      <MessageSquare className="w-4 h-4 text-accent-400" />,
  session:      <Calendar className="w-4 h-4 text-amber-400" />,
  review:       <Star className="w-4 h-4 text-yellow-400" />,
};

const NotificationBell = () => {
  const { user }   = useAuth();
  const socket     = useSocket(user?._id);
  const dropRef    = useRef(null);

  const [notifs, setNotifs]   = useState([]);
  const [open,   setOpen]     = useState(false);

  // Load persisted notifications
  useEffect(() => {
    if (!user) return;
    api.get('/notifications')
      .then(r => setNotifs(r.data.data || []))
      .catch(() => {});
  }, [user]);

  // Real-time push
  useEffect(() => {
    if (!socket) return;
    const handle = (notif) => {
      setNotifs(prev => [notif, ...prev].slice(0, 20));
    };
    socket.on('notification', handle);
    return () => socket.off('notification', handle);
  }, [socket]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unread = notifs.filter(n => !n.read).length;

  const markAllRead = async () => {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
    await api.put('/notifications/read-all').catch(() => {});
  };

  const markOne = async (id) => {
    setNotifs(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    await api.put(`/notifications/${id}/read`).catch(() => {});
  };

  const timeAgo = (date) => {
    const diff = (new Date() - new Date(date)) / 1000;
    if (diff < 60)   return `${Math.floor(diff)}s ago`;
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
    if (diff < 86400)return `${Math.floor(diff/3600)}h ago`;
    return `${Math.floor(diff/86400)}d ago`;
  };

  return (
    <div className="relative" ref={dropRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl bg-dark-800 border border-slate-700 hover:border-primary-600/50 transition-all"
      >
        <Bell className={`w-5 h-5 ${unread > 0 ? 'text-primary-400' : 'text-slate-400'}`} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-bounce">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 card z-50 animate-fade-in overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
            <h3 className="font-semibold text-white text-sm">Notifications</h3>
            {unread > 0 && (
              <button onClick={markAllRead} className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 transition-colors">
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-800">
            {notifs.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              notifs.map(n => (
                <div
                  key={n._id}
                  onClick={() => markOne(n._id)}
                  className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors ${!n.read ? 'bg-primary-900/10' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${!n.read ? 'bg-primary-900/40' : 'bg-dark-700'}`}>
                    {ICON_MAP[n.type] || <Bell className="w-4 h-4 text-slate-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${!n.read ? 'text-white font-medium' : 'text-slate-300'}`}>{n.message}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.read && <div className="w-2 h-2 rounded-full bg-primary-400 mt-1.5 flex-shrink-0" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
