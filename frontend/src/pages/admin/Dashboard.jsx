import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../hooks/useSocket';
import {
  Calendar, Users, MapPin, BarChart3, Plus,
  TrendingUp, Globe, Zap, ArrowRight
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats]   = useState(null);
  const [expos, setExpos]   = useState([]);
  const [loading, setLoading] = useState(true);

  useSocket(user?._id);

  useEffect(() => {
    Promise.all([
      api.get('/admin/analytics'),
      api.get('/admin/expos'),
    ]).then(([analyticsRes, exposRes]) => {
      setStats(analyticsRes.data.data);
      setExpos(exposRes.data.data.slice(0, 5));
    }).finally(() => setLoading(false));
  }, []);

  const statCards = stats ? [
    { label: 'Total Expos',         value: stats.totalExpos,         icon: Calendar,  color: 'from-primary-600 to-purple-700' },
    { label: 'Registered Users',    value: stats.totalUsers,         icon: Users,     color: 'from-cyan-600 to-blue-700' },
    { label: 'Total Registrations', value: stats.totalRegistrations, icon: Globe,     color: 'from-green-600 to-emerald-700' },
    { label: 'Booths Occupied',     value: stats.boothStats?.occupied || 0, icon: MapPin, color: 'from-amber-600 to-orange-700' },
  ] : [];

  const boothPieData = stats ? [
    { name: 'Available', value: stats.boothStats?.available || 0 },
    { name: 'Reserved',  value: stats.boothStats?.reserved  || 0 },
    { name: 'Occupied',  value: stats.boothStats?.occupied  || 0 },
  ] : [];

  const regRoleData = stats?.regsByRole?.map((r) => ({ name: r._id, count: r.count })) || [];

  if (loading) return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-slate-700 border-t-primary-500 rounded-full animate-spin" />
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="section-title">Dashboard</h1>
            <p className="section-subtitle">Welcome back, {user?.name}!</p>
          </div>
          <Link to="/admin/expos" className="btn-primary">
            <Plus className="w-4 h-4" /> New Expo
          </Link>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="stat-card">
              <div className={`stat-icon bg-gradient-to-br ${color}`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold font-display text-white">{value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Registrations by Role */}
          <div className="card p-6 lg:col-span-2">
            <h2 className="text-base font-semibold text-white mb-4">Registrations by Role</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={regRoleData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#e2e8f0' }} />
                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Booth Occupancy */}
          <div className="card p-6">
            <h2 className="text-base font-semibold text-white mb-4">Booth Status</h2>
            {boothPieData.some(d => d.value > 0) ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={boothPieData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                    {boothPieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#e2e8f0' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-slate-500 text-sm">No booth data yet</div>
            )}
          </div>
        </div>

        {/* Recent Expos */}
        <div className="card">
          <div className="flex items-center justify-between p-6 border-b border-slate-800">
            <h2 className="text-base font-semibold text-white">Recent Expos</h2>
            <Link to="/admin/expos" className="text-primary-400 text-sm hover:text-primary-300 flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-slate-800">
            {expos.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                <Calendar className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p>No expos yet. <Link to="/admin/expos" className="text-primary-400">Create your first one!</Link></p>
              </div>
            )}
            {expos.map((expo) => (
              <div key={expo._id} className="flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: expo.bannerColor + '30', border: `1px solid ${expo.bannerColor}50` }}>
                    🎪
                  </div>
                  <div>
                    <p className="font-medium text-white text-sm">{expo.title}</p>
                    <p className="text-xs text-slate-500">{expo.location} · {new Date(expo.startDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`badge ${
                    expo.status === 'published' ? 'badge-success' :
                    expo.status === 'ongoing'   ? 'badge-primary' :
                    expo.status === 'draft'     ? 'badge-secondary' : 'badge-warning'
                  }`}>{expo.status}</span>
                  <Link to={`/admin/expos`} className="text-slate-400 hover:text-white">
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
