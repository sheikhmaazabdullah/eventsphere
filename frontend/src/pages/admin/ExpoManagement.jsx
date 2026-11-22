import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  Plus, Edit3, Trash2, Map, Users, Calendar,
  Search, X, Globe, ChevronRight
} from 'lucide-react';

const STATUS_OPTIONS = ['draft','published','ongoing','completed','cancelled'];
const EMPTY = { title:'', description:'', startDate:'', endDate:'', location:'', theme:'', category:'General', bannerColor:'#6366f1', maxBooths:24, tags:'' };

export default function ExpoManagement() {
  const [expos, setExpos]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState(EMPTY);
  const [saving, setSaving]     = useState(false);
  const [search, setSearch]     = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const loadExpos = () => {
    api.get('/admin/expos').then(r => setExpos(r.data.data)).finally(() => setLoading(false));
  };

  useEffect(() => { loadExpos(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setShowModal(true); };
  const openEdit   = (expo) => {
    setEditing(expo._id);
    setForm({
      ...expo,
      startDate: expo.startDate?.split('T')[0] || '',
      endDate:   expo.endDate?.split('T')[0]   || '',
      tags: expo.tags?.join(', ') || '',
    });
    setShowModal(true);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [] };
    try {
      if (editing) {
        await api.put(`/admin/expos/${editing}`, payload);
        toast.success('Expo updated!');
      } else {
        await api.post('/admin/expos', payload);
        toast.success('Expo created!');
      }
      setShowModal(false);
      loadExpos();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this expo and all its data?')) return;
    try {
      await api.delete(`/admin/expos/${id}`);
      toast.success('Expo deleted');
      loadExpos();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/admin/expos/${id}`, { status });
      toast.success(`Status updated to ${status}`);
      loadExpos();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const filtered = expos.filter(e => {
    const matchSearch = e.title.toLowerCase().includes(search.toLowerCase()) || e.location.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || e.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="section-title">Expo Management</h1>
            <p className="section-subtitle">{expos.length} expos total</p>
          </div>
          <button onClick={openCreate} className="btn-primary">
            <Plus className="w-4 h-4" /> Create Expo
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search expos…"
              className="input pl-10" />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input w-40">
            <option value="all">All Status</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
          </select>
        </div>

        {/* Expo Cards Grid */}
        {loading ? (
          <div className="flex justify-center py-20"><div className="w-10 h-10 border-2 border-slate-700 border-t-primary-500 rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="card p-16 text-center">
            <Globe className="w-12 h-12 mx-auto mb-4 text-slate-600" />
            <p className="text-slate-400">No expos found.</p>
            <button onClick={openCreate} className="btn-primary mt-4 mx-auto">Create Your First Expo</button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((expo) => (
              <div key={expo._id} className="card overflow-hidden group hover:border-primary-700/40 transition-all">
                {/* Color banner */}
                <div className="h-2" style={{ background: expo.bannerColor }} />
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-white leading-tight group-hover:text-primary-300 transition-colors">{expo.title}</h3>
                    <span className={`badge ml-2 flex-shrink-0 ${
                      expo.status === 'published' ? 'badge-success' :
                      expo.status === 'ongoing'   ? 'badge-primary' :
                      expo.status === 'completed' ? 'badge-secondary' :
                      expo.status === 'draft'     ? 'badge-warning' : 'badge-danger'
                    }`}>{expo.status}</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-3 line-clamp-2">{expo.description || 'No description'}</p>
                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(expo.startDate).toLocaleDateString()} – {new Date(expo.endDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Map className="w-3.5 h-3.5" /> {expo.location}
                    </div>
                  </div>

                  {/* Status change */}
                  <select value={expo.status} onChange={e => handleStatusChange(expo._id, e.target.value)}
                    className="input text-xs py-1.5 mb-4">
                    {STATUS_OPTIONS.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                  </select>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link to={`/admin/expos/${expo._id}/floor`} className="btn-secondary text-xs px-3 py-1.5 flex-1 justify-center">
                      <Map className="w-3.5 h-3.5" /> Floor Plan
                    </Link>
                    <Link to={`/admin/expos/${expo._id}/exhibitors`} className="btn-secondary text-xs px-3 py-1.5 flex-1 justify-center">
                      <Users className="w-3.5 h-3.5" /> Exhibitors
                    </Link>
                    <button onClick={() => openEdit(expo)} className="p-2 rounded-xl bg-dark-700 hover:bg-primary-900/30 text-slate-400 hover:text-primary-400 transition-colors">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(expo._id)} className="p-2 rounded-xl bg-dark-700 hover:bg-red-900/30 text-slate-400 hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Create/Edit Modal ── */}
        {showModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="card w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
              <div className="flex items-center justify-between p-6 border-b border-slate-800">
                <h2 className="text-lg font-bold text-white">{editing ? 'Edit Expo' : 'Create New Expo'}</h2>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="input-label">Expo Title *</label>
                    <input name="title" value={form.title} onChange={handleChange} required className="input" placeholder="e.g. TechFest Karachi 2026" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="input-label">Description</label>
                    <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="input resize-none" placeholder="What is this expo about?" />
                  </div>
                  <div>
                    <label className="input-label">Start Date *</label>
                    <input name="startDate" type="date" value={form.startDate} onChange={handleChange} required className="input" />
                  </div>
                  <div>
                    <label className="input-label">End Date *</label>
                    <input name="endDate" type="date" value={form.endDate} onChange={handleChange} required className="input" />
                  </div>
                  <div>
                    <label className="input-label">Location *</label>
                    <input name="location" value={form.location} onChange={handleChange} required className="input" placeholder="Expo Centre, Karachi" />
                  </div>
                  <div>
                    <label className="input-label">Theme</label>
                    <input name="theme" value={form.theme} onChange={handleChange} className="input" placeholder="Technology & Innovation" />
                  </div>
                  <div>
                    <label className="input-label">Category</label>
                    <input name="category" value={form.category} onChange={handleChange} className="input" placeholder="General" />
                  </div>
                  <div>
                    <label className="input-label">Max Booths</label>
                    <input name="maxBooths" type="number" value={form.maxBooths} onChange={handleChange} className="input" min={1} />
                  </div>
                  <div>
                    <label className="input-label">Banner Colour</label>
                    <div className="flex items-center gap-3">
                      <input name="bannerColor" type="color" value={form.bannerColor} onChange={handleChange} className="w-12 h-10 rounded-lg border border-slate-700 bg-transparent cursor-pointer" />
                      <span className="text-sm text-slate-400">{form.bannerColor}</span>
                    </div>
                  </div>
                  <div>
                    <label className="input-label">Tags (comma-separated)</label>
                    <input name="tags" value={form.tags} onChange={handleChange} className="input" placeholder="tech, startup, AI" />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
                  <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
                    {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (editing ? 'Update Expo' : 'Create Expo')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
