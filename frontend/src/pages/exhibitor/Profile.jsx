// src/pages/exhibitor/Profile.jsx
import React, { useState } from 'react';
import Sidebar from '../../components/common/Sidebar';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { User, Building2, Phone, FileText, Save, Tag } from 'lucide-react';

const INTERESTS = ['Technology','Healthcare','Fashion','Food & Beverage','Automotive','Finance','Education','Real Estate','Gaming','Sports','Art','Energy'];

export function ExhibitorProfile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '', phone: user?.phone || '', company: user?.company || '', bio: user?.bio || '', interests: user?.interests || [],
  });
  const [saving, setSaving] = useState(false);

  const toggle = (tag) => setForm(f => ({ ...f, interests: f.interests.includes(tag) ? f.interests.filter(i=>i!==tag) : [...f.interests, tag] }));

  const save = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const { data } = await api.put('/auth/profile', form);
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="mb-8"><h1 className="section-title">My Profile</h1><p className="section-subtitle">Manage your exhibitor profile and company details</p></div>
        <div className="max-w-2xl">
          <form onSubmit={save} className="card p-6 space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div><label className="input-label flex items-center gap-1.5"><User className="w-3.5 h-3.5"/>Full Name</label><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="input" /></div>
              <div><label className="input-label flex items-center gap-1.5"><Phone className="w-3.5 h-3.5"/>Phone</label><input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} className="input" /></div>
              <div className="sm:col-span-2"><label className="input-label flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5"/>Company</label><input value={form.company} onChange={e=>setForm({...form,company:e.target.value})} className="input" /></div>
              <div className="sm:col-span-2"><label className="input-label flex items-center gap-1.5"><FileText className="w-3.5 h-3.5"/>Bio</label><textarea value={form.bio} onChange={e=>setForm({...form,bio:e.target.value})} rows={4} className="input resize-none" /></div>
            </div>
            <div>
              <label className="input-label flex items-center gap-1.5"><Tag className="w-3.5 h-3.5"/>Industry Tags (for AI matching)</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {INTERESTS.map(tag => (
                  <button key={tag} type="button" onClick={()=>toggle(tag)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${form.interests.includes(tag) ? 'bg-primary-600/30 border-primary-500 text-primary-300' : 'border-slate-700 text-slate-400 hover:border-slate-600'}`}>
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            <button type="submit" disabled={saving} className="btn-primary"><Save className="w-4 h-4"/>{saving ? 'Saving…' : 'Save Profile'}</button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default ExhibitorProfile;
