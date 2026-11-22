import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import toast from 'react-hot-toast';
import { Globe, Mail, Lock, User, Phone, Building2, Tag, CheckCircle, ArrowRight } from 'lucide-react';

const INTERESTS = ['Technology','Healthcare','Fashion','Food & Beverage','Automotive','Finance','Education','Real Estate','Gaming','Sports','Art','Energy'];

const roles = [
  { value: 'attendee',  label: 'Attendee',  desc: 'Browse expos, book sessions, get AI recommendations',  color: 'border-accent-600/50 bg-accent-900/10' },
  { value: 'exhibitor', label: 'Exhibitor', desc: 'Showcase products, reserve booths, connect with visitors', color: 'border-primary-600/50 bg-primary-900/10' },
  { value: 'admin',     label: 'Organiser', desc: 'Create and manage full expo events end-to-end',          color: 'border-amber-600/50 bg-amber-900/10' },
];

export default function Register() {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [step, setStep]     = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm]     = useState({
    name: '', email: '', password: '', role: 'attendee',
    phone: '', company: '', interests: [],
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const toggleInterest = (tag) =>
    setForm({ ...form, interests: form.interests.includes(tag)
      ? form.interests.filter((i) => i !== tag)
      : [...form.interests, tag] });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register(form);
      toast.success(`Account created! Welcome, ${user.name}!`);
      const dashboards = { admin: '/admin', exhibitor: '/exhibitor', attendee: '/attendee' };
      navigate(dashboards[user.role]);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 pt-20 py-8">
        <div className="w-full max-w-lg animate-slide-up">
          <div className="card p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-900/50">
                <Globe className="w-7 h-7 text-white" />
              </div>
              <h1 className="font-display text-2xl font-bold text-white">Create Your Account</h1>
              <p className="text-slate-400 mt-1 text-sm">Join EventSphere in seconds</p>
            </div>

            {/* Step indicator */}
            <div className="flex items-center justify-center gap-2 mb-8">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                    ${step > s ? 'bg-accent-600 text-white' : step === s ? 'bg-primary-600 text-white' : 'bg-dark-700 text-slate-500'}`}>
                    {step > s ? <CheckCircle className="w-4 h-4" /> : s}
                  </div>
                  {s < 3 && <div className={`w-8 h-0.5 ${step > s ? 'bg-accent-600' : 'bg-dark-700'} transition-all`} />}
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit}>
              {/* ── Step 1: Role Selection ── */}
              {step === 1 && (
                <div className="space-y-4 animate-fade-in">
                  <p className="text-sm font-medium text-slate-300 mb-4">Choose your role</p>
                  {roles.map(({ value, label, desc, color }) => (
                    <button key={value} type="button"
                      onClick={() => setForm({ ...form, role: value })}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${form.role === value ? color : 'border-slate-700 hover:border-slate-600'}`}>
                      <div className="font-semibold text-white">{label}</div>
                      <div className="text-sm text-slate-400 mt-0.5">{desc}</div>
                    </button>
                  ))}
                  <button type="button" onClick={() => setStep(2)} className="btn-primary w-full justify-center mt-4">
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* ── Step 2: Basic Info ── */}
              {step === 2 && (
                <div className="space-y-4 animate-fade-in">
                  <div>
                    <label className="input-label">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input name="name" value={form.name} onChange={handleChange} required placeholder="Sheikh Maaz Abdullah" className="input pl-10" />
                    </div>
                  </div>
                  <div>
                    <label className="input-label">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="you@example.com" className="input pl-10" />
                    </div>
                  </div>
                  <div>
                    <label className="input-label">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input name="password" type="password" value={form.password} onChange={handleChange} required minLength={6} placeholder="Min. 6 characters" className="input pl-10" />
                    </div>
                  </div>
                  <div>
                    <label className="input-label">Phone (Optional)</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input name="phone" value={form.phone} onChange={handleChange} placeholder="+92 300 0000000" className="input pl-10" />
                    </div>
                  </div>
                  {(form.role === 'exhibitor' || form.role === 'admin') && (
                    <div>
                      <label className="input-label">Company / Organisation</label>
                      <div className="relative">
                        <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input name="company" value={form.company} onChange={handleChange} placeholder="Your company name" className="input pl-10" />
                      </div>
                    </div>
                  )}
                  <div className="flex gap-3 mt-4">
                    <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1 justify-center">Back</button>
                    <button type="button"
                      onClick={() => { if (!form.name || !form.email || !form.password) { toast.error('Please fill all required fields'); return; } setStep(3); }}
                      className="btn-primary flex-1 justify-center">
                      Continue <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ── Step 3: Interests + Submit ── */}
              {step === 3 && (
                <div className="space-y-4 animate-fade-in">
                  {form.role === 'attendee' && (
                    <div>
                      <label className="input-label flex items-center gap-1.5">
                        <Tag className="w-4 h-4" /> Your Interests (for AI recommendations)
                      </label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {INTERESTS.map((tag) => (
                          <button key={tag} type="button" onClick={() => toggleInterest(tag)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                              form.interests.includes(tag)
                                ? 'bg-primary-600/30 border-primary-500 text-primary-300'
                                : 'border-slate-700 text-slate-400 hover:border-slate-600'
                            }`}>
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="p-4 bg-dark-900/60 rounded-xl border border-slate-800 text-sm">
                    <p className="text-slate-400">Registering as: <span className="text-white font-semibold capitalize">{form.role}</span></p>
                    <p className="text-slate-400">Email: <span className="text-white">{form.email}</span></p>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button type="button" onClick={() => setStep(2)} className="btn-secondary flex-1 justify-center">Back</button>
                    <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
                      {loading
                        ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : 'Create Account'}
                    </button>
                  </div>
                </div>
              )}
            </form>

            <p className="text-center text-sm text-slate-500 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
