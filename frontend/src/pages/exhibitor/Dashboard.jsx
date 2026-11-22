import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import { useAuth }   from '../../context/AuthContext';
import { useSocket } from '../../hooks/useSocket';
import api from '../../services/api';
import { Calendar, Map, MessageSquare, CheckCircle, Clock, ArrowRight, Building2, QrCode } from 'lucide-react';

export default function ExhibitorDashboard() {
  const { user }  = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useSocket(user?._id);

  useEffect(() => {
    api.get('/exhibitor/my-registrations')
      .then(r => setRegistrations(r.data.data))
      .finally(() => setLoading(false));
  }, []);

  const approved = registrations.filter(r => r.status === 'approved');
  const pending  = registrations.filter(r => r.status === 'pending');

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="section-title">Welcome, {user?.name}!</h1>
          <p className="section-subtitle">{user?.company || 'Exhibitor Portal'}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label:'Total Registrations', value:registrations.length,         icon:Calendar,   color:'from-primary-600 to-purple-700' },
            { label:'Approved',            value:approved.length,              icon:CheckCircle,color:'from-accent-600 to-emerald-700' },
            { label:'Pending',             value:pending.length,               icon:Clock,      color:'from-amber-600 to-orange-700'   },
            { label:'Active Booths',       value:approved.filter(r=>r.booth).length, icon:Map,  color:'from-cyan-600 to-blue-700'      },
          ].map(({ label, value, icon:Icon, color }) => (
            <div key={label} className="stat-card">
              <div className={`stat-icon bg-gradient-to-br ${color}`}><Icon className="w-6 h-6 text-white" /></div>
              <div><p className="text-2xl font-bold text-white">{value}</p><p className="text-xs text-slate-400">{label}</p></div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <Link to="/attendee/events" className="card-hover p-5 flex items-center gap-4">
            <div className="stat-icon bg-gradient-to-br from-primary-600 to-purple-700"><Calendar className="w-6 h-6 text-white" /></div>
            <div><p className="font-semibold text-white">Browse & Register</p><p className="text-xs text-slate-400 mt-0.5">Find upcoming trade shows</p></div>
            <ArrowRight className="w-4 h-4 text-slate-500 ml-auto" />
          </Link>
          <Link to="/exhibitor/profile" className="card-hover p-5 flex items-center gap-4">
            <div className="stat-icon bg-gradient-to-br from-accent-600 to-emerald-700"><Building2 className="w-6 h-6 text-white" /></div>
            <div><p className="font-semibold text-white">Update Profile</p><p className="text-xs text-slate-400 mt-0.5">Keep your listing current</p></div>
            <ArrowRight className="w-4 h-4 text-slate-500 ml-auto" />
          </Link>
          <Link to="/exhibitor/messages" className="card-hover p-5 flex items-center gap-4">
            <div className="stat-icon bg-gradient-to-br from-cyan-600 to-blue-700"><MessageSquare className="w-6 h-6 text-white" /></div>
            <div><p className="font-semibold text-white">Messages</p><p className="text-xs text-slate-400 mt-0.5">Connect with organisers</p></div>
            <ArrowRight className="w-4 h-4 text-slate-500 ml-auto" />
          </Link>
        </div>

        {/* My Expo Registrations */}
        <div className="card">
          <div className="p-6 border-b border-slate-800"><h2 className="font-semibold text-white">My Expo Registrations</h2></div>
          {loading ? (
            <div className="p-8 flex justify-center"><div className="w-8 h-8 border-2 border-slate-700 border-t-primary-500 rounded-full animate-spin" /></div>
          ) : registrations.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No expo registrations yet.</p>
              <Link to="/attendee/events" className="btn-primary mt-4 inline-flex">Browse Expos</Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {registrations.map(reg => (
                <div key={reg._id} className="flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-900/40 border border-primary-700/30 flex items-center justify-center text-lg">🎪</div>
                    <div>
                      <p className="font-medium text-white text-sm">{reg.expo?.title}</p>
                      <p className="text-xs text-slate-500">{reg.expo?.location} · {new Date(reg.expo?.startDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {reg.booth
                      ? <span className="badge badge-success">Booth {reg.booth.boothNumber}</span>
                      : <span className="badge badge-secondary">No Booth</span>}
                    <span className={`badge ${reg.status==='approved'?'badge-success':reg.status==='rejected'?'badge-danger':'badge-warning'}`}>
                      {reg.status}
                    </span>
                    {reg.status === 'approved' && !reg.booth && (
                      <Link to={`/exhibitor/booth/${reg.expo._id}`} className="btn-primary text-xs py-1.5 px-3">
                        Reserve Booth
                      </Link>
                    )}
                    {reg.status === 'approved' && reg.booth && (
                      <>
                        <Link to={`/exhibitor/booth/${reg.expo._id}`} className="btn-secondary text-xs py-1.5 px-3">
                          <Map className="w-3.5 h-3.5" /> Booth
                        </Link>
                        {/* ── Lead Scanner Button ── */}
                        <Link to={`/exhibitor/scanner/${reg.expo._id}`} className="btn-success text-xs py-1.5 px-3">
                          <QrCode className="w-3.5 h-3.5" /> Scan Leads
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}