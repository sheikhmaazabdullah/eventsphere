import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/common/Sidebar';
import api from '../../services/api';
import { BarChart3, Users, Calendar, MapPin, TrendingUp } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area
} from 'recharts';

const COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6'];
const MONTHS  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function Analytics() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/analytics').then(r => setData(r.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex h-screen"><Sidebar />
      <div className="flex-1 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-slate-700 border-t-primary-500 rounded-full animate-spin" />
      </div>
    </div>
  );

  const boothData = data ? [
    { name: 'Available', value: data.boothStats?.available || 0 },
    { name: 'Reserved',  value: data.boothStats?.reserved  || 0 },
    { name: 'Occupied',  value: data.boothStats?.occupied  || 0 },
  ] : [];

  const monthlyData = data?.exposByMonth?.map(m => ({
    month: MONTHS[m._id.month - 1],
    expos: m.count,
  })) || [];

  const regRoleData = data?.regsByRole?.map(r => ({ name: r._id, count: r.count })) || [];

  const summaryCards = data ? [
    { label:'Total Expos',          value: data.totalExpos,          icon: Calendar,  color: 'from-primary-600 to-purple-700', bg: 'bg-primary-900/20' },
    { label:'Registered Users',     value: data.totalUsers,          icon: Users,     color: 'from-cyan-600 to-blue-700',      bg: 'bg-cyan-900/20' },
    { label:'Total Registrations',  value: data.totalRegistrations,  icon: TrendingUp,color: 'from-green-600 to-emerald-700',  bg: 'bg-green-900/20' },
    { label:'Booths Occupied',      value: data.boothStats?.occupied || 0, icon: MapPin, color: 'from-amber-600 to-orange-700', bg: 'bg-amber-900/20' },
  ] : [];

  const occupancyRate = data && (data.boothStats?.available + data.boothStats?.reserved + data.boothStats?.occupied) > 0
    ? Math.round((data.boothStats.occupied / (data.boothStats.available + data.boothStats.reserved + data.boothStats.occupied)) * 100)
    : 0;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="section-title">Analytics</h1>
          <p className="section-subtitle">Platform-wide statistics and insights</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {summaryCards.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className={`card p-5 ${bg} border-0`}>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-3xl font-bold font-display text-white">{value}</p>
              <p className="text-xs text-slate-400 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Occupancy Rate */}
        <div className="card p-6 mb-6 bg-gradient-to-r from-primary-900/20 to-purple-900/10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-white">Booth Occupancy Rate</h2>
            <span className="text-3xl font-bold gradient-text">{occupancyRate}%</span>
          </div>
          <div className="h-3 bg-dark-900/60 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary-600 to-accent-500 rounded-full transition-all duration-700"
              style={{ width: `${occupancyRate}%` }} />
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Expos by Month */}
          <div className="card p-6">
            <h2 className="font-semibold text-white mb-4">Expos Created by Month</h2>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="month" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#e2e8f0' }} />
                  <Area type="monotone" dataKey="expos" stroke="#6366f1" fill="url(#expGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : <div className="h-52 flex items-center justify-center text-slate-500 text-sm">No data available</div>}
          </div>

          {/* Booth Status Pie */}
          <div className="card p-6">
            <h2 className="font-semibold text-white mb-4">Booth Status Distribution</h2>
            {boothData.some(d => d.value > 0) ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={boothData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={4}>
                    {boothData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#e2e8f0' }} />
                  <Legend formatter={(v) => <span style={{ color: '#94a3b8', fontSize: '12px' }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            ) : <div className="h-52 flex items-center justify-center text-slate-500 text-sm">No booth data</div>}
          </div>
        </div>

        {/* Registrations by Role */}
        <div className="card p-6">
          <h2 className="font-semibold text-white mb-4">Registrations by Role</h2>
          {regRoleData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={regRoleData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis dataKey="name" type="category" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} width={80} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#e2e8f0' }} />
                {regRoleData.map((d, i) => (
                  <Bar key={d.name} dataKey="count" fill={COLORS[i]} radius={[0, 6, 6, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="h-40 flex items-center justify-center text-slate-500 text-sm">No registration data</div>}
        </div>
      </main>
    </div>
  );
}
