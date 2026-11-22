import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../hooks/useSocket';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, CheckCircle, MapPin, Tag, Save } from 'lucide-react';

export default function BoothManagement() {
  const { expoId } = useParams();
  const { user }   = useAuth();
  const socket     = useSocket(user?._id, expoId);

  const [booths,    setBooths]    = useState([]);
  const [expo,      setExpo]      = useState(null);
  const [myBooth,   setMyBooth]   = useState(null);
  const [selected,  setSelected]  = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [editForm,  setEditForm]  = useState({ products: '', services: '', description: '', tags: '', category: '' });

  const load = () => Promise.all([
    api.get(`/exhibitor/booths/${expoId}`),
    api.get(`/expo/${expoId}`),
    api.get('/exhibitor/my-registrations'),
  ]).then(([b, e, r]) => {
    setBooths(b.data.data);
    setExpo(e.data.data.expo);
    const reg = r.data.data.find(reg => reg.expo._id === expoId || reg.expo === expoId);
    if (reg?.booth) {
      const mine = b.data.data.find(bo => bo._id === reg.booth._id || bo._id === reg.booth);
      setMyBooth(mine);
      if (mine) setEditForm({ products: mine.products?.join(', ') || '', services: mine.services?.join(', ') || '', description: mine.description || '', tags: mine.tags?.join(', ') || '', category: mine.category || '' });
    }
  }).finally(() => setLoading(false));

  useEffect(() => { load(); }, [expoId]);

  // Real-time booth updates
  useEffect(() => {
    if (!socket) return;
    socket.on('booth-status-changed', ({ boothId, status, exhibitor }) => {
      setBooths(prev => prev.map(b => b._id === boothId ? { ...b, status } : b));
      if (status !== 'available') toast(`Booth reserved by ${exhibitor}`);
    });
    return () => socket.off('booth-status-changed');
  }, [socket]);

  const reserveBooth = async (boothId) => {
    setSaving(true);
    try {
      await api.put(`/exhibitor/booths/reserve/${boothId}`);
      toast.success('Booth reserved successfully!');
      load();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const updateBooth = async () => {
    if (!myBooth) return;
    setSaving(true);
    try {
      const payload = {
        products:    editForm.products.split(',').map(t=>t.trim()).filter(Boolean),
        services:    editForm.services.split(',').map(t=>t.trim()).filter(Boolean),
        description: editForm.description,
        tags:        editForm.tags.split(',').map(t=>t.trim()).filter(Boolean),
        category:    editForm.category,
      };
      await api.put(`/exhibitor/booths/update/${myBooth._id}`, payload);
      toast.success('Booth details updated!');
      load();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const STATUS_COLORS = {
    available: 'bg-accent-900/60 border-accent-600 text-accent-300 hover:bg-accent-800/60 cursor-pointer',
    reserved:  'bg-amber-900/60 border-amber-600 text-amber-300 cursor-not-allowed opacity-70',
    occupied:  'bg-rose-900/60 border-rose-600 text-rose-300 cursor-not-allowed opacity-60',
  };

  if (loading) return (
    <div className="flex h-screen"><Sidebar />
      <div className="flex-1 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-slate-700 border-t-primary-500 rounded-full animate-spin" />
      </div>
    </div>
  );

  const rows = expo?.floorPlan?.rows || 6;
  const cols = expo?.floorPlan?.cols || 8;
  const cells = expo?.floorPlan?.cells || [];

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/exhibitor" className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5"><ArrowLeft className="w-5 h-5" /></Link>
          <div>
            <h1 className="section-title">Booth Selection</h1>
            <p className="section-subtitle">{expo?.title} — Click an available booth to reserve it</p>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-6">
          {/* Floor Plan */}
          <div className="flex-1">
            <div className="card p-4 overflow-x-auto mb-4">
              <div className="flex items-center gap-4 mb-4 flex-wrap">
                {[['available','Available (click to reserve)','bg-accent-500'],['reserved','Reserved','bg-amber-500'],['occupied','Occupied','bg-rose-500'],['aisle','Aisle','bg-slate-600']].map(([s,l,c]) => (
                  <div key={s} className="flex items-center gap-1.5 text-xs text-slate-400"><div className={`w-3 h-3 rounded ${c}`} />{l}</div>
                ))}
              </div>
              <div className="inline-grid gap-1.5" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
                {Array.from({ length: rows }, (_, ri) =>
                  Array.from({ length: cols }, (_, ci) => {
                    const cell  = cells.find(c => c.row === ri && c.col === ci) || { type: 'empty' };
                    const booth = booths.find(b => b.position?.row === ri && b.position?.col === ci);
                    const isMyBooth = myBooth && booth?._id === myBooth._id;

                    if (cell.type === 'empty') return <div key={`${ri}-${ci}`} className="w-12 h-12" />;

                    return (
                      <div key={`${ri}-${ci}`}
                        onClick={() => booth?.status === 'available' ? setSelected(booth) : null}
                        className={`booth-cell w-12 h-12 rounded-lg border-2 flex items-center justify-center text-xs font-bold select-none transition-all
                          ${cell.type === 'aisle' ? 'bg-slate-700/30 border-slate-700 cursor-default' : ''}
                          ${cell.type === 'entrance' ? 'bg-amber-900/40 border-amber-700 cursor-default' : ''}
                          ${booth ? STATUS_COLORS[booth.status] : ''}
                          ${isMyBooth ? 'ring-2 ring-primary-400 ring-offset-1 ring-offset-dark-900' : ''}
                        `}
                      >
                        {cell.type === 'entrance' && '🚪'}
                        {cell.type === 'aisle'    && <span className="text-slate-600">—</span>}
                        {booth && <span title={`${booth.boothNumber} — ${booth.status}`}>{booth.boothNumber}</span>}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Selected booth preview */}
            {selected && (
              <div className="card p-5 animate-slide-up border border-accent-700/40">
                <h3 className="font-semibold text-white mb-2">Booth {selected.boothNumber}</h3>
                <div className="flex items-center gap-4 text-sm mb-4">
                  <div className="flex items-center gap-1.5 text-slate-400"><MapPin className="w-4 h-4" /> Row {selected.position?.row + 1}, Col {selected.position?.col + 1}</div>
                  <span className="badge badge-secondary capitalize">{selected.size}</span>
                  <span className="badge badge-success">Available</span>
                </div>
                <button onClick={() => reserveBooth(selected._id)} disabled={saving} className="btn-success">
                  {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><CheckCircle className="w-4 h-4" /> Reserve This Booth</>}
                </button>
              </div>
            )}
          </div>

          {/* My Booth Editor */}
          {myBooth && (
            <div className="xl:w-80 space-y-4">
              <div className="card p-5">
                <h2 className="font-semibold text-white mb-4 flex items-center gap-2"><Tag className="w-4 h-4 text-primary-400" /> My Booth — {myBooth.boothNumber}</h2>
                <div className="space-y-3">
                  <div><label className="input-label">Products (comma-separated)</label><input value={editForm.products} onChange={e=>setEditForm({...editForm,products:e.target.value})} className="input text-sm" placeholder="Product A, Product B" /></div>
                  <div><label className="input-label">Services</label><input value={editForm.services} onChange={e=>setEditForm({...editForm,services:e.target.value})} className="input text-sm" placeholder="Service A, Service B" /></div>
                  <div><label className="input-label">Category</label><input value={editForm.category} onChange={e=>setEditForm({...editForm,category:e.target.value})} className="input text-sm" placeholder="Technology" /></div>
                  <div><label className="input-label">Tags (for AI matching)</label><input value={editForm.tags} onChange={e=>setEditForm({...editForm,tags:e.target.value})} className="input text-sm" placeholder="AI, software, cloud" /></div>
                  <div><label className="input-label">Description</label><textarea value={editForm.description} onChange={e=>setEditForm({...editForm,description:e.target.value})} rows={3} className="input text-sm resize-none" /></div>
                  <button onClick={updateBooth} disabled={saving} className="btn-primary w-full justify-center">
                    {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save className="w-4 h-4" /> Save Details</>}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
