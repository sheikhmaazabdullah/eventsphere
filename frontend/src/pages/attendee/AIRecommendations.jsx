import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Sparkles, Tag, Building2, MapPin, BarChart2, RefreshCw, Info } from 'lucide-react';

const INTERESTS = ['Technology','Healthcare','Fashion','Food & Beverage','Automotive','Finance','Education','Real Estate','Gaming','Sports','Art','Energy','AI','Cybersecurity','Blockchain','Robotics'];

export default function AIRecommendations() {
  const { expoId } = useParams();
  const { user }   = useAuth();

  const [recs,       setRecs]       = useState([]);
  const [interests,  setInterests]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected,   setSelected]   = useState(null);
  const [newInterests, setNewInterests] = useState([]);
  const [showEdit,   setShowEdit]   = useState(false);

  const load = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      const { data } = await api.get(`/attendee/recommendations/${expoId}`);
      setRecs(data.data);
      setInterests(data.interests);
      setNewInterests(data.interests);
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { load(); }, [expoId]);

  const updateInterests = async () => {
    try {
      await api.put('/auth/profile', { interests: newInterests });
      toast.success('Interests updated! Refreshing recommendations…');
      setShowEdit(false);
      load(true);
    } catch (err) { toast.error(err.message); }
  };

  const toggle = (tag) =>
    setNewInterests(prev => prev.includes(tag) ? prev.filter(i => i !== tag) : [...prev, tag]);

  // Score bar colour
  const scoreColor = (pct) => {
    if (pct >= 60) return 'from-accent-500 to-emerald-600';
    if (pct >= 30) return 'from-amber-500 to-orange-600';
    return 'from-primary-500 to-purple-600';
  };

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
            <h1 className="section-title flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-amber-400" /> AI Exhibitor Recommendations
            </h1>
            <p className="section-subtitle">Personalised matches based on your interests</p>
          </div>
          <button onClick={() => load(true)} disabled={refreshing} className="btn-secondary">
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>

        {/* How it works */}
        <div className="card p-4 mb-6 bg-amber-900/10 border-amber-800/30 flex items-start gap-3">
          <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-slate-300">
            Our AI uses <span className="text-amber-400 font-medium">Jaccard similarity</span> to compare your interests with each exhibitor's products, services, and tags — giving you a personalised match percentage. Update your interests below to improve results.
          </p>
        </div>

        {/* Your Interests */}
        <div className="card p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-white flex items-center gap-2"><Tag className="w-4 h-4 text-primary-400" /> Your Interests</h2>
            <button onClick={() => setShowEdit(!showEdit)} className="text-primary-400 hover:text-primary-300 text-sm">
              {showEdit ? 'Cancel' : 'Edit'}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(showEdit ? newInterests : interests).length === 0 && !showEdit && (
              <p className="text-sm text-slate-500">No interests set. <button onClick={() => setShowEdit(true)} className="text-primary-400">Add some!</button></p>
            )}
            {showEdit ? (
              <>
                {INTERESTS.map(tag => (
                  <button key={tag} onClick={() => toggle(tag)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      newInterests.includes(tag)
                        ? 'bg-primary-600/30 border-primary-500 text-primary-300'
                        : 'border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}>{tag}</button>
                ))}
                <button onClick={updateInterests} className="btn-primary text-xs px-4 py-1.5 ml-2">Save & Refresh</button>
              </>
            ) : interests.map(tag => (
              <span key={tag} className="badge badge-primary">{tag}</span>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-2 border-slate-700 border-t-amber-400 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-400 text-sm">Analysing exhibitor profiles…</p>
            </div>
          </div>
        ) : recs.length === 0 ? (
          <div className="card p-16 text-center text-slate-500">
            <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="mb-2">No matches found yet.</p>
            <p className="text-sm">This could mean no exhibitors have set up their booth profiles yet, or your interests don't overlap. Try updating your interests above.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-400 mb-4">{recs.length} exhibitors matched</p>
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {recs.map(({ exhibitor, matchPercent }, idx) => (
                <div
                  key={exhibitor._id}
                  onClick={() => setSelected(selected?._id === exhibitor._id ? null : { ...exhibitor, matchPercent })}
                  className={`card-hover p-5 cursor-pointer transition-all ${selected?._id === exhibitor._id ? 'border-primary-600/60 bg-primary-900/10' : ''}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    {/* Rank badge */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                      ${idx === 0 ? 'bg-amber-500/20 text-amber-400 border border-amber-600/40' :
                        idx === 1 ? 'bg-slate-500/20 text-slate-300 border border-slate-600/40' :
                        idx === 2 ? 'bg-orange-800/20 text-orange-400 border border-orange-700/40' :
                                    'bg-dark-700 text-slate-500'}`}>
                      {idx + 1}
                    </div>
                    {/* Match badge */}
                    <div className={`badge ${matchPercent >= 60 ? 'badge-success' : matchPercent >= 30 ? 'badge-warning' : 'badge-primary'}`}>
                      {matchPercent}% match
                    </div>
                  </div>

                  <h3 className="font-bold text-white mb-0.5">{exhibitor.name}</h3>
                  <p className="text-sm text-primary-400 mb-3">{exhibitor.company}</p>

                  {/* Match Score Bar */}
                  <div className="mb-3">
                    <div className="h-1.5 bg-dark-900/60 rounded-full overflow-hidden">
                      <div className={`h-full bg-gradient-to-r ${scoreColor(matchPercent)} rounded-full transition-all duration-700`}
                        style={{ width: `${matchPercent}%` }} />
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-400">
                    {exhibitor.boothNumber && (
                      <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-slate-500" /> Booth {exhibitor.boothNumber}</div>
                    )}
                    {exhibitor.category && (
                      <div className="flex items-center gap-1.5"><Building2 className="w-3 h-3 text-slate-500" />{exhibitor.category}</div>
                    )}
                  </div>

                  {exhibitor.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {exhibitor.tags.slice(0, 4).map(t => (
                        <span key={t} className={`badge text-xs px-2 py-0.5 rounded-full ${interests.some(i => i.toLowerCase().includes(t.toLowerCase()) || t.toLowerCase().includes(i.toLowerCase())) ? 'badge-success' : 'badge-secondary'}`}>
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Detail panel */}
            {selected && (
              <div className="card p-6 mt-6 border-primary-700/40 animate-slide-up">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="font-bold text-white text-lg">{selected.name}</h2>
                    <p className="text-primary-400">{selected.company} · Booth {selected.boothNumber}</p>
                  </div>
                  <div className={`badge text-sm px-3 py-1.5 ${selected.matchPercent >= 60 ? 'badge-success' : selected.matchPercent >= 30 ? 'badge-warning' : 'badge-primary'}`}>
                    {selected.matchPercent}% AI Match
                  </div>
                </div>
                {selected.description && <p className="text-slate-300 text-sm mb-4">{selected.description}</p>}
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  {selected.products?.length > 0 && (
                    <div>
                      <p className="text-slate-500 text-xs mb-2 uppercase tracking-wider">Products</p>
                      <div className="flex flex-wrap gap-1">{selected.products.map(p => <span key={p} className="badge badge-primary">{p}</span>)}</div>
                    </div>
                  )}
                  {selected.services?.length > 0 && (
                    <div>
                      <p className="text-slate-500 text-xs mb-2 uppercase tracking-wider">Services</p>
                      <div className="flex flex-wrap gap-1">{selected.services.map(s => <span key={s} className="badge badge-secondary">{s}</span>)}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
