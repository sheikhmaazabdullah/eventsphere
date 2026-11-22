import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Plus, Edit3, Trash2, Clock, Users, X } from 'lucide-react';

const EMPTY = { title:'', speaker:'', speakerBio:'', description:'', startTime:'', endTime:'', venue:'', capacity:100, tags:'' };

export default function SessionManager() {
  const { expoId } = useParams();
  const [sessions, setSessions] = useState([]);
  const [expo,     setExpo]     = useState(null);
  const [modal,    setModal]    = useState(false);
  const [editing,  setEditing]  = useState(null);
  const [form,     setForm]     = useState(EMPTY);
  const [saving,   setSaving]   = useState(false);

  const load = () => Promise.all([
    api.get(`/admin/sessions/${expoId}`),
    api.get(`/expo/${expoId}`),
  ]).then(([s, e]) => { setSessions(s.data.data); setExpo(e.data.data.expo); });

  useEffect(() => { load(); }, [expoId]);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit   = (s) => {
    setEditing(s._id);
    setForm({ ...s, startTime: s.startTime?.slice(0,16)||'', endTime: s.endTime?.slice(0,16)||'', tags: s.tags?.join(', ')||'' });
    setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    const payload = { ...form, tags: form.tags.split(',').map(t=>t.trim()).filter(Boolean) };
    try {
      if (editing) { await api.put(`/admin/sessions/${editing}`, payload); toast.success('Session updated'); }
      else          { await api.post(`/admin/sessions/${expoId}`, payload);  toast.success('Session created'); }
      setModal(false); load();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this session?')) return;
    await api.delete(`/admin/sessions/${id}`);
    toast.success('Deleted'); load();
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/admin/expos" className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5"><ArrowLeft className="w-5 h-5" /></Link>
          <div className="flex-1">
            <h1 className="section-title">Session Manager</h1>
            <p className="section-subtitle">{expo?.title}</p>
          </div>
          <button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4" /> Add Session</button>
        </div>

        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {sessions.length === 0 && (
            <div className="col-span-3 card p-16 text-center text-slate-500">
              <Clock className="w-10 h-10 mx-auto mb-3 opacity-30" />
              No sessions yet. Add your first one!
            </div>
          )}
          {sessions.map(s => (
            <div key={s._id} className="card p-5 hover:border-primary-700/40 transition-all">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-white leading-tight">{s.title}</h3>
                <div className="flex gap-1 ml-2">
                  <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg text-slate-400 hover:text-primary-400 hover:bg-primary-900/20 transition-colors"><Edit3 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(s._id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-900/20 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <p className="text-sm text-primary-400 font-medium mb-2">{s.speaker}</p>
              <p className="text-xs text-slate-500 mb-3 line-clamp-2">{s.description}</p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-slate-400"><Clock className="w-3.5 h-3.5" />{new Date(s.startTime).toLocaleString()}</div>
                <div className="flex items-center gap-2 text-xs text-slate-400"><Users className="w-3.5 h-3.5" />{s.registeredAttendees?.length || 0} / {s.capacity} registered</div>
                {s.venue && <div className="text-xs text-slate-400">📍 {s.venue}</div>}
              </div>
              {s.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {s.tags.map(t => <span key={t} className="badge-secondary text-xs px-2 py-0.5 rounded-full">{t}</span>)}
                </div>
              )}
            </div>
          ))}
        </div>

        {modal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="card w-full max-w-xl max-h-[90vh] overflow-y-auto animate-slide-up">
              <div className="flex items-center justify-between p-6 border-b border-slate-800">
                <h2 className="font-bold text-white text-lg">{editing ? 'Edit Session' : 'New Session'}</h2>
                <button onClick={() => setModal(false)} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div><label className="input-label">Title *</label><input name="title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required className="input" /></div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div><label className="input-label">Speaker *</label><input name="speaker" value={form.speaker} onChange={e=>setForm({...form,speaker:e.target.value})} required className="input" /></div>
                  <div><label className="input-label">Venue</label><input name="venue" value={form.venue} onChange={e=>setForm({...form,venue:e.target.value})} className="input" /></div>
                  <div><label className="input-label">Start Time *</label><input type="datetime-local" value={form.startTime} onChange={e=>setForm({...form,startTime:e.target.value})} required className="input" /></div>
                  <div><label className="input-label">End Time *</label><input type="datetime-local" value={form.endTime} onChange={e=>setForm({...form,endTime:e.target.value})} required className="input" /></div>
                  <div><label className="input-label">Capacity</label><input type="number" value={form.capacity} onChange={e=>setForm({...form,capacity:+e.target.value})} min={1} className="input" /></div>
                  <div><label className="input-label">Tags</label><input value={form.tags} onChange={e=>setForm({...form,tags:e.target.value})} className="input" placeholder="AI, healthcare" /></div>
                </div>
                <div><label className="input-label">Description</label><textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} rows={3} className="input resize-none" /></div>
                <div><label className="input-label">Speaker Bio</label><textarea value={form.speakerBio} onChange={e=>setForm({...form,speakerBio:e.target.value})} rows={2} className="input resize-none" /></div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
                  <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
                    {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (editing ? 'Update' : 'Create')}
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
