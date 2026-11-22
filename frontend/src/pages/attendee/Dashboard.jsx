import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import CountdownTimer from '../../components/common/CountdownTimer';
import { ReviewModal, ReviewList, StarRating } from '../../components/common/ReviewModal';
import { useAuth }   from '../../context/AuthContext';
import { useSocket } from '../../hooks/useSocket';
import api from '../../services/api';
import {
  Calendar, QrCode, Sparkles, Map, BookOpen,
  ArrowRight, Clock, Star, ChevronDown, ChevronUp
} from 'lucide-react';

export default function AttendeeDashboard() {
  const { user }  = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [reviewExpo,    setReviewExpo]    = useState(null); // expo being reviewed
  const [expandedExpo,  setExpandedExpo]  = useState(null); // reviews panel open
  const [myReviews,     setMyReviews]     = useState({});   // { expoId: review }

  useSocket(user?._id);

  const load = () =>
    api.get('/attendee/my-registrations')
      .then(r => setRegistrations(r.data.data))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  // Load existing reviews for each registered expo
  useEffect(() => {
    registrations.forEach(async reg => {
      if (!reg.expo?._id) return;
      try {
        const r = await api.get(`/reviews/${reg.expo._id}/mine`);
        if (r.data.data) {
          setMyReviews(prev => ({ ...prev, [reg.expo._id]: r.data.data }));
        }
      } catch {}
    });
  }, [registrations]);

  // Can review if expo is ongoing or completed
  const canReview = (expo) =>
    expo && ['ongoing', 'completed'].includes(expo.status);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="section-title">Welcome, {user?.name}!</h1>
          <p className="section-subtitle">
            Attendee Portal · {registrations.length} expo{registrations.length !== 1 ? 's' : ''} registered
          </p>
        </div>

        {/* Quick Action Cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          {[
            { to:'/attendee/events', icon:Calendar, label:'Browse Events',   desc:'Find upcoming expos',      color:'from-primary-600 to-purple-700' },
            { to:'#qr',             icon:QrCode,   label:'My QR Badges',    desc:'Access your passes',       color:'from-accent-600 to-emerald-700' },
            { to:'#ai',             icon:Sparkles,  label:'AI Matches',      desc:'Personalised exhibitors',  color:'from-amber-600 to-orange-700'   },
            { to:'#tour',           icon:Map,       label:'Virtual Tour',    desc:'Explore expo floors',      color:'from-cyan-600 to-blue-700'      },
          ].map(({ to, icon:Icon, label, desc, color }) => (
            <div key={label} className="card-hover p-5">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="font-semibold text-white text-sm">{label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
            </div>
          ))}
        </div>

        {/* Registered Expos */}
        <div className="card">
          <div className="flex items-center justify-between p-6 border-b border-slate-800">
            <h2 className="font-semibold text-white">My Registered Expos</h2>
            <Link to="/attendee/events" className="text-primary-400 text-sm hover:text-primary-300 flex items-center gap-1">
              Browse More <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="p-8 flex justify-center">
              <div className="w-8 h-8 border-2 border-slate-700 border-t-primary-500 rounded-full animate-spin" />
            </div>
          ) : registrations.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No expos registered yet.</p>
              <Link to="/attendee/events" className="btn-primary mt-4 inline-flex">Browse Events</Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {registrations.map(reg => {
                const expo       = reg.expo;
                const isExpanded = expandedExpo === expo?._id;
                const myReview   = myReviews[expo?._id];
                const upcoming   = expo?.startDate && new Date(expo.startDate) > new Date();

                return (
                  <div key={reg._id}>
                    <div className="px-6 py-4 hover:bg-white/5 transition-colors">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        {/* Expo info */}
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                            style={{ background:(expo?.bannerColor||'#6366f1')+'20', border:`1px solid ${expo?.bannerColor||'#6366f1'}40` }}>
                            🎪
                          </div>
                          <div>
                            <p className="font-medium text-white">{expo?.title}</p>
                            <p className="text-xs text-slate-500">
                              {expo?.location} · {new Date(expo?.startDate).toLocaleDateString()} – {new Date(expo?.endDate).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Badge: <span className="text-primary-400 font-mono">{reg.badgeId}</span>
                            </p>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`badge ${
                            expo?.status==='ongoing'?'badge-primary':
                            expo?.status==='published'?'badge-success':
                            expo?.status==='completed'?'badge-secondary':'badge-warning'
                          }`}>
                            {expo?.status}
                          </span>
                          <Link to={`/attendee/badge/${expo?._id}`} className="btn-secondary text-xs px-3 py-1.5">
                            <QrCode className="w-3.5 h-3.5" /> Badge
                          </Link>
                          <Link to={`/attendee/sessions/${expo?._id}`} className="btn-secondary text-xs px-3 py-1.5">
                            <BookOpen className="w-3.5 h-3.5" /> Sessions
                          </Link>
                          <Link to={`/attendee/recommendations/${expo?._id}`} className="btn-primary text-xs px-3 py-1.5">
                            <Sparkles className="w-3.5 h-3.5" /> AI Match
                          </Link>
                          <Link to={`/attendee/tour/${expo?._id}`} className="btn-secondary text-xs px-3 py-1.5">
                            <Map className="w-3.5 h-3.5" /> Tour
                          </Link>
                          {/* Review button */}
                          {canReview(expo) && (
                            <button
                              onClick={() => setReviewExpo(expo)}
                              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border transition-all ${
                                myReview
                                  ? 'bg-amber-900/20 border-amber-700/40 text-amber-400'
                                  : 'bg-dark-700 border-slate-700 text-slate-400 hover:border-amber-600/50 hover:text-amber-400'
                              }`}
                            >
                              <Star className={`w-3.5 h-3.5 ${myReview ? 'fill-amber-400' : ''}`} />
                              {myReview ? `${myReview.rating}★ Rated` : 'Rate'}
                            </button>
                          )}
                          {/* Reviews toggle */}
                          <button
                            onClick={() => setExpandedExpo(isExpanded ? null : expo?._id)}
                            className="p-1.5 rounded-xl bg-dark-700 border border-slate-700 text-slate-400 hover:text-white transition-colors"
                            title="View reviews"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Countdown for upcoming expos */}
                      {upcoming && (
                        <div className="mt-4">
                          <CountdownTimer targetDate={expo.startDate} compact />
                        </div>
                      )}

                      {/* Booked sessions */}
                      {reg.sessions?.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {reg.sessions.map(s => (
                            <span key={s._id || s} className="badge badge-primary text-xs">
                              <Clock className="w-2.5 h-2.5" /> {s.title || 'Session'}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Reviews expandable panel */}
                    {isExpanded && (
                      <div className="px-6 pb-5 bg-dark-900/40 border-t border-slate-800 animate-slide-up">
                        <h3 className="font-semibold text-white text-sm mt-4 mb-3 flex items-center gap-2">
                          <Star className="w-4 h-4 text-amber-400" /> Expo Reviews
                        </h3>
                        <ReviewList expoId={expo._id} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Review Modal */}
      {reviewExpo && (
        <ReviewModal
          expoId={reviewExpo._id}
          expoTitle={reviewExpo.title}
          onClose={() => setReviewExpo(null)}
          onSubmitted={() => {
            // Refresh my reviews after submitting
            api.get(`/reviews/${reviewExpo._id}/mine`).then(r => {
              if (r.data.data) setMyReviews(prev => ({ ...prev, [reviewExpo._id]: r.data.data }));
            });
          }}
        />
      )}
    </div>
  );
}