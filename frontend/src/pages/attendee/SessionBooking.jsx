import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import { useSocket } from '../../hooks/useSocket';
import { useAuth }   from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Clock, Users, BookOpen, CheckCircle, MapPin, Printer } from 'lucide-react';

/* ── Print PDF via browser print API ── */
const printSchedule = (expo, sessions, userName) => {
  const booked = sessions.filter(s => s.isRegistered);
  if (booked.length === 0) { toast.error('Book at least one session first!'); return; }

  // Group by date
  const groups = {};
  booked.forEach(s => {
    const d = new Date(s.startTime).toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
    if (!groups[d]) groups[d] = [];
    groups[d].push(s);
  });

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>My Schedule — ${expo?.title || 'EventSphere'}</title>
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; color:#1e293b; padding:32px; }
        .header { border-bottom:3px solid #6366f1; padding-bottom:16px; margin-bottom:24px; }
        .logo { display:flex; align-items:center; gap:10px; margin-bottom:8px; }
        .logo-box { width:32px; height:32px; background:linear-gradient(135deg,#6366f1,#8b5cf6); border-radius:8px; display:flex; align-items:center; justify-content:center; color:white; font-weight:bold; font-size:14px; }
        h1 { font-size:22px; color:#1e293b; }
        .meta { font-size:12px; color:#64748b; margin-top:4px; }
        .attendee { background:#f1f5f9; border-radius:8px; padding:12px 16px; margin-bottom:24px; font-size:13px; }
        .attendee strong { color:#6366f1; }
        .date-group { margin-bottom:24px; }
        .date-label { font-size:11px; font-weight:700; color:#6366f1; text-transform:uppercase; letter-spacing:1px; border-bottom:1px solid #e2e8f0; padding-bottom:6px; margin-bottom:12px; }
        .session { display:flex; gap:16px; padding:12px; border:1px solid #e2e8f0; border-radius:8px; margin-bottom:8px; border-left:4px solid #6366f1; }
        .time { min-width:80px; text-align:center; }
        .time-start { font-size:15px; font-weight:700; color:#6366f1; }
        .time-end   { font-size:11px; color:#94a3b8; }
        .info h3    { font-size:14px; font-weight:600; color:#1e293b; }
        .info .speaker { font-size:12px; color:#6366f1; margin-top:2px; }
        .info .venue { font-size:11px; color:#94a3b8; margin-top:4px; }
        .tags { display:flex; gap:4px; flex-wrap:wrap; margin-top:6px; }
        .tag { background:#e0e7ff; color:#4338ca; font-size:10px; padding:2px 8px; border-radius:999px; }
        .footer { margin-top:32px; border-top:1px solid #e2e8f0; padding-top:12px; font-size:11px; color:#94a3b8; text-align:center; }
        @media print { body { padding:16px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">
          <div class="logo-box">ES</div>
          <span style="font-weight:700;color:#6366f1;font-size:18px;">EventSphere</span>
        </div>
        <h1>${expo?.title || 'My Schedule'}</h1>
        <div class="meta">📍 ${expo?.location || ''} &nbsp;·&nbsp; 🗓️ ${new Date(expo?.startDate).toLocaleDateString()} – ${new Date(expo?.endDate).toLocaleDateString()}</div>
      </div>
      <div class="attendee">
        Personal Schedule for <strong>${userName}</strong> &nbsp;·&nbsp; ${booked.length} session${booked.length!==1?'s':''} booked &nbsp;·&nbsp; Generated: ${new Date().toLocaleString()}
      </div>
      ${Object.entries(groups).map(([date, daySessions]) => `
        <div class="date-group">
          <div class="date-label">${date}</div>
          ${daySessions.map(s => `
            <div class="session">
              <div class="time">
                <div class="time-start">${new Date(s.startTime).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</div>
                <div class="time-end">– ${new Date(s.endTime).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</div>
              </div>
              <div class="info">
                <h3>${s.title}</h3>
                <div class="speaker">🎤 ${s.speaker}</div>
                ${s.venue ? `<div class="venue">📍 ${s.venue}</div>` : ''}
                ${s.tags?.length ? `<div class="tags">${s.tags.map(t=>`<span class="tag">${t}</span>`).join('')}</div>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      `).join('')}
      <div class="footer">EventSphere Expo Management Platform — eventsphere.pk</div>
    </body>
    </html>
  `;

  const win = window.open('', '_blank', 'width=800,height=900');
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); }, 500);
};

export default function SessionBooking() {
  const { expoId } = useParams();
  const { user }   = useAuth();
  const socket     = useSocket(user?._id, expoId);

  const [sessions, setSessions] = useState([]);
  const [expo,     setExpo]     = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [booking,  setBooking]  = useState(null);

  const load = () => Promise.all([
    api.get(`/attendee/sessions/${expoId}`),
    api.get(`/expo/${expoId}`),
  ]).then(([s, e]) => { setSessions(s.data.data); setExpo(e.data.data.expo); })
    .finally(() => setLoading(false));

  useEffect(() => { load(); }, [expoId]);

  useEffect(() => {
    if (!socket) return;
    socket.on('session-updated', ({ sessionId, seats }) => {
      setSessions(prev => prev.map(s => s._id === sessionId ? { ...s, seatsLeft: seats } : s));
    });
    return () => socket.off('session-updated');
  }, [socket]);

  const toggleBook = async (sessionId) => {
    setBooking(sessionId);
    try {
      const { data } = await api.put(`/attendee/sessions/${sessionId}/book`);
      toast.success(data.data.booked ? 'Session booked! 🎉' : 'Booking cancelled');
      load();
    } catch (err) { toast.error(err.message); }
    finally { setBooking(null); }
  };

  const groupByDate = () => {
    const groups = {};
    sessions.forEach(s => {
      const date = new Date(s.startTime).toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long' });
      if (!groups[date]) groups[date] = [];
      groups[date].push(s);
    });
    return groups;
  };

  if (loading) return (
    <div className="flex h-screen"><Sidebar />
      <div className="flex-1 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-slate-700 border-t-primary-500 rounded-full animate-spin" />
      </div>
    </div>
  );

  const grouped    = groupByDate();
  const bookedCount = sessions.filter(s => s.isRegistered).length;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link to="/attendee" className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="section-title">Session Schedule</h1>
            <p className="section-subtitle">{expo?.title} · {bookedCount} session{bookedCount!==1?'s':''} booked</p>
          </div>
          {/* ── Print / PDF Schedule Button ── */}
          <button
            onClick={() => printSchedule(expo, sessions, user?.name)}
            className="btn-secondary flex items-center gap-2"
            title="Print or save your personal schedule as PDF"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Print Schedule</span>
          </button>
        </div>

        {bookedCount > 0 && (
          <div className="card p-3 mb-5 bg-accent-900/10 border-accent-800/30 flex items-center gap-3 text-sm">
            <CheckCircle className="w-4 h-4 text-accent-400 flex-shrink-0" />
            <p className="text-slate-300">
              You have <span className="text-accent-400 font-semibold">{bookedCount} session{bookedCount!==1?'s':''}</span> booked.
              Click <strong className="text-white">Print Schedule</strong> to save your personal agenda as PDF.
            </p>
          </div>
        )}

        {Object.keys(grouped).length === 0 ? (
          <div className="card p-16 text-center text-slate-500">
            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />No sessions scheduled yet.
          </div>
        ) : (
          Object.entries(grouped).map(([date, daySessions]) => (
            <div key={date} className="mb-8">
              <h2 className="text-sm font-semibold text-primary-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" /> {date}
              </h2>
              <div className="space-y-3">
                {daySessions.map(session => {
                  const full = session.seatsLeft !== undefined
                    ? session.seatsLeft <= 0
                    : session.capacity - (session.registeredAttendees?.length||0) <= 0;
                  return (
                    <div key={session._id}
                      className={`card p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:border-primary-700/30 transition-all
                        ${session.isRegistered ? 'border-accent-700/30 bg-accent-900/5' : ''}`}>
                      {/* Time */}
                      <div className="w-20 flex-shrink-0 text-center">
                        <p className="text-primary-400 font-bold text-sm">
                          {new Date(session.startTime).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}
                        </p>
                        <p className="text-slate-600 text-xs">
                          – {new Date(session.endTime).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}
                        </p>
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white">{session.title}</h3>
                        <p className="text-sm text-primary-400">{session.speaker}</p>
                        {session.description && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{session.description}</p>}
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-400">
                          {session.venue && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{session.venue}</span>}
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {session.seatsLeft ?? (session.capacity - (session.registeredAttendees?.length||0))} seats left
                          </span>
                        </div>
                        {session.tags?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {session.tags.map(t => <span key={t} className="badge badge-secondary text-xs px-2 py-0.5 rounded-full">{t}</span>)}
                          </div>
                        )}
                      </div>
                      {/* Book button */}
                      <button
                        onClick={() => toggleBook(session._id)}
                        disabled={booking===session._id || (full && !session.isRegistered)}
                        className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                          session.isRegistered
                            ? 'bg-accent-900/30 text-accent-400 border border-accent-700/40 hover:bg-red-900/20 hover:text-red-400 hover:border-red-700/40'
                            : full
                              ? 'bg-dark-700 text-slate-600 cursor-not-allowed'
                              : 'bg-primary-600/20 text-primary-400 border border-primary-700/40 hover:bg-primary-600/30'
                        }`}
                      >
                        {booking===session._id
                          ? <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                          : session.isRegistered
                            ? <><CheckCircle className="w-4 h-4" />Booked</>
                            : full ? 'Full' : <><BookOpen className="w-4 h-4" />Book</>}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}