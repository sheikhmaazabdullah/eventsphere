import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, CheckCircle, XCircle, Clock, Users, Search } from 'lucide-react';

export default function ExhibitorManager() {
  const { expoId } = useParams();
  const [registrations, setRegistrations] = useState([]);
  const [booths,        setBooths]        = useState([]);
  const [expo,          setExpo]          = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState('');
  const [filterStatus,  setFilterStatus]  = useState('all');

  const loadData = () => {
    Promise.all([
      api.get(`/admin/registrations/${expoId}`),
      api.get(`/admin/booths/${expoId}`),
      api.get(`/expo/${expoId}`),
    ]).then(([regRes, boothRes, expoRes]) => {
      setRegistrations(regRes.data.data.filter(r => r.role === 'exhibitor'));
      setBooths(boothRes.data.data.filter(b => b.status === 'available'));
      setExpo(expoRes.data.data.expo);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, [expoId]);

  const updateStatus = async (regId, status) => {
    try {
      await api.put(`/admin/registrations/${regId}/status`, { status });
      toast.success(`Registration ${status}`);
      loadData();
    } catch (err) { toast.error(err.message); }
  };

  const assignBooth = async (regId, boothId) => {
    try {
      await api.put(`/admin/booths/assign/${boothId}`, { exhibitorId: null, status: 'reserved' });
      toast.success('Booth assigned');
      loadData();
    } catch (err) { toast.error(err.message); }
  };

  const filtered = registrations.filter(r => {
    const name   = r.user?.name?.toLowerCase() || '';
    const email  = r.user?.email?.toLowerCase() || '';
    const q      = search.toLowerCase();
    const match  = name.includes(q) || email.includes(q);
    const status = filterStatus === 'all' || r.status === filterStatus;
    return match && status;
  });

  if (loading) return (
    <div className="flex h-screen"><Sidebar />
      <div className="flex-1 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-slate-700 border-t-primary-500 rounded-full animate-spin" />
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/admin/expos" className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5"><ArrowLeft className="w-5 h-5" /></Link>
          <div>
            <h1 className="section-title">Exhibitor Manager</h1>
            <p className="section-subtitle">{expo?.title} · {registrations.length} applications</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            ['Pending',  registrations.filter(r => r.status === 'pending').length,  'badge-warning'],
            ['Approved', registrations.filter(r => r.status === 'approved').length, 'badge-success'],
            ['Rejected', registrations.filter(r => r.status === 'rejected').length, 'badge-danger'],
          ].map(([label, count, badge]) => (
            <div key={label} className="card p-4 text-center">
              <p className="text-2xl font-bold text-white">{count}</p>
              <span className={`badge mt-1 ${badge}`}>{label}</span>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search exhibitors…" className="input pl-10" />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input w-40">
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Table */}
        <div className="table-container">
          <table className="w-full">
            <thead>
              <tr>
                {['Exhibitor','Company','Applied','Status','Booth','Actions'].map(h => (
                  <th key={h} className="table-header text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="table-cell text-center py-10 text-slate-500">
                  <Users className="w-10 h-10 mx-auto mb-2 opacity-30" /> No applications found
                </td></tr>
              )}
              {filtered.map(reg => (
                <tr key={reg._id} className="hover:bg-white/5 transition-colors">
                  <td className="table-cell">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-600 to-purple-700 flex items-center justify-center text-xs font-bold">
                        {reg.user?.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-white text-sm">{reg.user?.name}</p>
                        <p className="text-xs text-slate-500">{reg.user?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">{reg.company || reg.user?.company || '—'}</td>
                  <td className="table-cell text-xs">{new Date(reg.createdAt).toLocaleDateString()}</td>
                  <td className="table-cell">
                    <span className={`badge ${reg.status === 'approved' ? 'badge-success' : reg.status === 'rejected' ? 'badge-danger' : 'badge-warning'}`}>
                      {reg.status}
                    </span>
                  </td>
                  <td className="table-cell">{reg.booth?.boothNumber || <span className="text-slate-600">Unassigned</span>}</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1.5">
                      {reg.status === 'pending' && (
                        <>
                          <button onClick={() => updateStatus(reg._id, 'approved')}
                            className="p-1.5 rounded-lg bg-accent-900/30 text-accent-400 hover:bg-accent-900/60 transition-colors" title="Approve">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button onClick={() => updateStatus(reg._id, 'rejected')}
                            className="p-1.5 rounded-lg bg-red-900/30 text-red-400 hover:bg-red-900/60 transition-colors" title="Reject">
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {reg.status === 'approved' && !reg.booth && booths.length > 0 && (
                        <select defaultValue="" onChange={e => e.target.value && assignBooth(reg._id, e.target.value)}
                          className="input py-1.5 text-xs w-32">
                          <option value="">Assign Booth</option>
                          {booths.map(b => <option key={b._id} value={b._id}>{b.boothNumber} ({b.size})</option>)}
                        </select>
                      )}
                      {reg.status === 'rejected' && (
                        <button onClick={() => updateStatus(reg._id, 'pending')}
                          className="p-1.5 rounded-lg bg-slate-700/50 text-slate-400 hover:bg-slate-700 transition-colors" title="Reset to Pending">
                          <Clock className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
