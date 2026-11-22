import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth }  from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import CountdownTimer from '../components/common/CountdownTimer';
import api from '../services/api';
import {
  Globe, Zap, Users, BarChart3, QrCode, Sparkles,
  Map, ArrowRight, Search, Calendar, MapPin, Filter
} from 'lucide-react';

const features = [
  { icon:Globe,    color:'from-primary-500 to-purple-600', title:'Expo Management',       desc:'Create and manage trade shows with an intuitive admin dashboard.' },
  { icon:Map,      color:'from-cyan-500 to-blue-600',      title:'Interactive Floor Plan', desc:'Design booth layouts visually and let exhibitors reserve spaces in real-time.' },
  { icon:QrCode,   color:'from-green-500 to-emerald-600',  title:'QR Badge Generator',    desc:'Every attendee gets a unique, scannable QR badge for instant check-in.' },
  { icon:Sparkles, color:'from-amber-500 to-orange-600',   title:'AI Recommendations',    desc:'Smart engine matches attendees with the most relevant exhibitors.' },
  { icon:Users,    color:'from-pink-500 to-rose-600',      title:'Role-Based Portals',    desc:'Separate dashboards for Admins, Exhibitors, and Attendees.' },
  { icon:BarChart3,color:'from-violet-500 to-purple-600',  title:'Real-Time Analytics',   desc:'Track booth traffic, session attendance, and engagement live.' },
];

const CATEGORIES = ['All','Technology','Healthcare','Energy','Fashion','Finance','Education','Automotive','Food & Beverage'];

export default function Home() {
  const { user } = useAuth();
  const [expos,    setExpos]    = useState([]);
  const [search,   setSearch]   = useState('');
  const [category, setCategory] = useState('All');
  const [loading,  setLoading]  = useState(true);
  const [nextExpo, setNextExpo] = useState(null);

  const dashboardPath = user
    ? { admin:'/admin', exhibitor:'/exhibitor', attendee:'/attendee' }[user.role]
    : null;

  useEffect(() => {
    api.get('/expo').then(r => {
      const data = r.data.data || [];
      setExpos(data);
      // Pick next upcoming expo for countdown
      const upcoming = data
        .filter(e => new Date(e.startDate) > new Date())
        .sort((a,b) => new Date(a.startDate) - new Date(b.startDate));
      setNextExpo(upcoming[0] || data[0] || null);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = expos.filter(e => {
    const q = search.toLowerCase();
    const matchSearch = !q || e.title.toLowerCase().includes(q) || e.location.toLowerCase().includes(q) || e.theme?.toLowerCase().includes(q);
    const matchCat    = category === 'All' || e.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-72 h-72 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 badge-primary mb-6 text-sm px-4 py-2">
            <Zap className="w-4 h-4" /> Next-Generation Expo Management Platform
          </div>
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight mb-6">
            Manage Expos at<span className="block gradient-text">Scale & Speed</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            EventSphere brings together organisers, exhibitors, and attendees on one powerful platform with real-time updates, AI-powered matching, and beautiful QR badges.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
            {user ? (
              <Link to={dashboardPath} className="btn-primary text-base px-8 py-3.5">
                Go to Dashboard <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary text-base px-8 py-3.5">Start for Free <ArrowRight className="w-5 h-5" /></Link>
                <Link to="/login"    className="btn-secondary text-base px-8 py-3.5">Sign In</Link>
              </>
            )}
          </div>

          {/* ── Countdown for next upcoming expo ── */}
          {nextExpo && (
            <div className="max-w-lg mx-auto mb-8">
              <CountdownTimer targetDate={nextExpo.startDate} label={nextExpo.title} />
            </div>
          )}
        </div>
      </section>

      {/* ── Search & Filter ── */}
      <section className="py-12 px-4 border-t border-slate-800/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-2xl font-bold text-white text-center mb-6">
            🗓️ Upcoming Expos
          </h2>

          {/* Search bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, location, or theme…"
                className="input pl-10"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <select value={category} onChange={e => setCategory(e.target.value)} className="input pl-9 w-44">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Expo cards */}
          {loading ? (
            <div className="flex justify-center py-10"><div className="w-8 h-8 border-2 border-slate-700 border-t-primary-500 rounded-full animate-spin" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No expos match your search.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map(expo => (
                <div key={expo._id} className="card-hover p-5 overflow-hidden">
                  <div className="h-1 rounded-full mb-4 -mx-5 -mt-5" style={{ background: expo.bannerColor }} />
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-white leading-tight">{expo.title}</h3>
                    <span className={`badge ml-2 flex-shrink-0 ${expo.status==='published'?'badge-success':expo.status==='ongoing'?'badge-primary':'badge-secondary'}`}>{expo.status}</span>
                  </div>
                  <div className="space-y-1 text-xs text-slate-400 mb-3">
                    <div className="flex items-center gap-1.5"><Calendar className="w-3 h-3" />{new Date(expo.startDate).toLocaleDateString()} – {new Date(expo.endDate).toLocaleDateString()}</div>
                    <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3" />{expo.location}</div>
                  </div>
                  <CountdownTimer targetDate={expo.startDate} compact />
                  <Link to={user ? (dashboardPath + '/events') : '/register'} className="btn-primary w-full justify-center text-sm mt-4">
                    {user ? 'View & Register' : 'Sign Up to Register'} <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 px-4 border-t border-slate-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold text-white mb-4">Everything You Need</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">A complete ecosystem for managing world-class expo events.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon:Icon, color, title, desc }) => (
              <div key={title} className="card-hover p-6 group">
                <div className={`stat-icon bg-gradient-to-br ${color} mb-4 group-hover:scale-110 transition-transform`}><Icon className="w-6 h-6 text-white" /></div>
                <h3 className="font-semibold text-white text-lg mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      {!user && (
        <section className="py-24 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="card p-12 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-900/20 to-purple-900/20" />
              <div className="relative">
                <h2 className="font-display text-4xl font-bold text-white mb-4">Ready to Elevate Your Expo?</h2>
                <p className="text-slate-400 mb-8">Join thousands of organisers who trust EventSphere.</p>
                <Link to="/register" className="btn-primary text-base px-8 py-3.5 inline-flex">
                  Create Free Account <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      <footer className="border-t border-slate-800 py-8 px-4 text-center text-slate-600 text-sm">
        <p>© 2026 EventSphere Management Platform. Built with the MERN Stack.</p>
      </footer>
    </div>
  );
}