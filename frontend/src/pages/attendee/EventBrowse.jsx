import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import CountdownTimer from '../../components/common/CountdownTimer';
import { StarRating } from '../../components/common/ReviewModal';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  Calendar, MapPin, Tag, Users, CheckCircle,
  Search, ArrowRight, Filter, X, SlidersHorizontal
} from 'lucide-react';

const CATEGORIES = ['All','Technology','Healthcare','Energy','Fashion','Finance','Education','Automotive','Food & Beverage','General'];

export default function EventBrowse() {
  const [expos,       setExpos]       = useState([]);
  const [myRegs,      setMyRegs]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [registering, setRegistering] = useState(null);
  const [avgRatings,  setAvgRatings]  = useState({}); // { expoId: avg }

  // Filters
  const [search,    setSearch]    = useState('');
  const [category,  setCategory]  = useState('All');
  const [sortBy,    setSortBy]    = useState('date-asc'); // date-asc | date-desc | rating
  const [showFilter,setShowFilter]= useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/attendee/expos'),
      api.get('/attendee/my-registrations'),
    ]).then(([e, r]) => {
      setExpos(e.data.data);
      setMyRegs(r.data.data);
    }).finally(() => setLoading(false));
  }, []);

  // Load avg ratings for all expos
  useEffect(() => {
    expos.forEach(async expo => {
      try {
        const r = await api.get(`/reviews/${expo._id}`);
        const reviews = r.data.data;
        if (reviews.length) {
          const avg = reviews.reduce((s,r)=>s+r.rating,0)/reviews.length;
          setAvgRatings(prev => ({ ...prev, [expo._id]: avg }));
        }
      } catch {}
    });
  }, [expos]);

  const isRegistered = (expoId) =>
    myRegs.some(r => r.expo?._id === expoId || r.expo === expoId);

  const register = async (expoId) => {
    setRegistering(expoId);
    try {
      await api.post(`/attendee/register/${expoId}`, {});
      toast.success('Registered! Your QR badge is ready. 🎫');
      const r = await api.get('/attendee/my-registrations');
      setMyRegs(r.data.data);
    } catch (err) { toast.error(err.message); }
    finally { setRegistering(null); }
  };

  // Apply filters + sort
  const filtered = expos
    .filter(e => {
      const q = search.toLowerCase();
      const matchQ = !q ||
        e.title.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q) ||
        e.theme?.toLowerCase().includes(q) ||
        e.tags?.some(t => t.toLowerCase().includes(q));
      const matchCat = category === 'All' || e.category === category;
      return matchQ && matchCat;
    })
    .sort((a, b) => {
      if (sortBy === 'date-asc')  return new Date(a.startDate) - new Date(b.startDate);
      if (sortBy === 'date-desc') return new Date(b.startDate) - new Date(a.startDate);
      if (sortBy === 'rating')    return (avgRatings[b._id]||0) - (avgRatings[a._id]||0);
      return 0;
    });

  const clearFilters = () => { setSearch(''); setCategory('All'); setSortBy('date-asc'); };
  const hasFilters = search || category !== 'All' || sortBy !== 'date-asc';

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="section-title">Browse Expos</h1>
          <p className="section-subtitle">Discover and register for upcoming events</p>
        </div>

        {/* Search + Filter bar */}
        <div className="space-y-3 mb-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, location, theme, or tag…"
                className="input pl-10"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilter(!showFilter)}
              className={`flex items-center gap-2 px-4 rounded-xl border text-sm font-medium transition-all ${showFilter ? 'bg-primary-600/20 border-primary-600/50 text-primary-300' : 'bg-dark-800 border-slate-700 text-slate-400 hover:border-slate-600'}`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
              {hasFilters && <span className="w-2 h-2 rounded-full bg-primary-400" />}
            </button>
          </div>

          {/* Expanded filters */}
          {showFilter && (
            <div className="card p-4 flex flex-wrap items-center gap-4 animate-slide-up">
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-400 whitespace-nowrap">Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="input py-1.5 text-sm w-44">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-400 whitespace-nowrap">Sort by</label>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="input py-1.5 text-sm w-40">
                  <option value="date-asc">Date (Earliest)</option>
                  <option value="date-desc">Date (Latest)</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
              {hasFilters && (
                <button onClick={clearFilters} className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors ml-auto">
                  <X className="w-3.5 h-3.5" /> Clear all
                </button>
              )}
            </div>
          )}

          {/* Results count */}
          <p className="text-xs text-slate-500">
            {filtered.length} expo{filtered.length!==1?'s':''} found
            {hasFilters && <button onClick={clearFilters} className="ml-2 text-primary-400 hover:text-primary-300">Clear filters</button>}
          </p>
        </div>

        {/* Expo cards */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-2 border-slate-700 border-t-primary-500 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="card p-16 text-center text-slate-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No expos found.</p>
            {hasFilters && <button onClick={clearFilters} className="btn-secondary mt-4 mx-auto">Clear Filters</button>}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map(expo => (
              <div key={expo._id} className="card overflow-hidden group hover:border-primary-700/40 transition-all">
                <div className="h-2" style={{ background: expo.bannerColor||'#6366f1' }} />
                <div className="p-5">
                  {/* Title + status */}
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-white group-hover:text-primary-300 transition-colors leading-tight">
                      {expo.title}
                    </h3>
                    <span className={`badge ml-2 flex-shrink-0 ${expo.status==='published'?'badge-success':expo.status==='ongoing'?'badge-primary':'badge-secondary'}`}>
                      {expo.status}
                    </span>
                  </div>

                  {/* Avg rating */}
                  {avgRatings[expo._id] && (
                    <div className="flex items-center gap-1.5 mb-2">
                      <StarRating value={Math.round(avgRatings[expo._id])} readOnly size="sm" />
                      <span className="text-xs text-slate-400">{avgRatings[expo._id].toFixed(1)}</span>
                    </div>
                  )}

                  <p className="text-xs text-slate-500 mb-3 line-clamp-2">{expo.description}</p>

                  {/* Meta */}
                  <div className="space-y-1.5 mb-3 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(expo.startDate).toLocaleDateString()} – {new Date(expo.endDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" />{expo.location}</div>
                    {expo.theme && <div className="flex items-center gap-2"><Tag className="w-3.5 h-3.5" />{expo.theme}</div>}
                  </div>

                  {/* Countdown */}
                  <div className="mb-4">
                    <CountdownTimer targetDate={expo.startDate} compact />
                  </div>

                  {/* Tags */}
                  {expo.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {expo.tags.slice(0,3).map(t => <span key={t} className="badge badge-secondary text-xs">{t}</span>)}
                    </div>
                  )}

                  {/* Action */}
                  {isRegistered(expo._id) ? (
                    <div className="flex gap-2">
                      <div className="badge badge-success flex-1 justify-center py-2">
                        <CheckCircle className="w-3.5 h-3.5" /> Registered
                      </div>
                      <Link to={`/attendee/sessions/${expo._id}`} className="btn-primary text-xs px-3 py-2">
                        Sessions <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  ) : (
                    <button
                      onClick={() => register(expo._id)}
                      disabled={registering===expo._id}
                      className="btn-primary w-full justify-center text-sm"
                    >
                      {registering===expo._id
                        ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : '🎫 Register & Get Badge'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}