import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import toast from 'react-hot-toast';
import { Globe, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();
  const from       = location.state?.from?.pathname;

  const [form, setForm]         = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);

  const dashboards = { admin: '/admin', exhibitor: '/exhibitor', attendee: '/attendee' };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(from || dashboards[user.role] || '/');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Quick demo login helper
  const demoLogin = (role) => {
    const demos = {
      admin:     { email: 'admin@eventsphere.com',    password: 'admin123' },
      exhibitor: { email: 'kamran@techcorp.pk', password: 'exhibitor123' },
      attendee:  { email: 'ali@gmail.com',  password: 'attendee123' },
    };
    setForm(demos[role]);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 pt-20">
        <div className="w-full max-w-md animate-slide-up">
          {/* Card */}
          <div className="card p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-900/50">
                <Globe className="w-7 h-7 text-white" />
              </div>
              <h1 className="font-display text-2xl font-bold text-white">Welcome back</h1>
              <p className="text-slate-400 mt-1 text-sm">Sign in to your EventSphere account</p>
            </div>

            {/* Demo buttons */}
            <div className="mb-6">
              <p className="text-xs text-slate-500 text-center mb-3">Quick Demo Login</p>
              <div className="grid grid-cols-3 gap-2">
                {['admin','exhibitor','attendee'].map((r) => (
                  <button key={r} onClick={() => demoLogin(r)}
                    className="py-1.5 px-2 text-xs rounded-lg border border-slate-700 text-slate-400 hover:border-primary-600/50 hover:text-primary-400 transition-all capitalize">
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="input-label">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input name="email" type="email" value={form.email} onChange={handleChange} required
                    placeholder="you@example.com"
                    className="input pl-10" />
                </div>
              </div>

              <div>
                <label className="input-label">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input name="password" type={showPass ? 'text' : 'password'} value={form.password} onChange={handleChange} required
                    placeholder="••••••••"
                    className="input pl-10 pr-10" />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base mt-2">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">Sign In <ArrowRight className="w-4 h-4" /></span>
                )}
              </button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium">Create one</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
