import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, ArrowRight, ArrowLeft, Sparkles, CheckCircle } from 'lucide-react';

/* Role-specific tour steps */
const STEPS = {
  admin: [
    { title: 'Welcome to EventSphere! 🎉', body: "You're logged in as an Admin. Let's take a quick tour of your powerful organiser dashboard.", target: null },
    { title: '📊 Your Dashboard',           body: 'This is your command centre. See total expos, users, registrations, and live charts at a glance.', target: 'stat-cards' },
    { title: '🗓️ Expo Management',          body: 'Create, publish, and manage your expo events. Set dates, locations, and floor plans.', target: 'sidebar-expo' },
    { title: '🗺️ Floor Plan Editor',        body: 'Design your booth layout visually — paint booths, aisles, and entrances on an interactive grid.', target: 'sidebar-expo' },
    { title: '✅ Exhibitor Approvals',      body: 'Review exhibitor applications and approve or reject them. Assign booths to approved exhibitors.', target: 'sidebar-expo' },
    { title: '📈 Analytics',               body: 'Track booth occupancy, registrations by role, and expo trends with beautiful charts.', target: 'sidebar-analytics' },
    { title: "You're all set! 🚀",          body: 'Explore at your own pace. Click "New Expo" to create your first event!', target: null },
  ],
  exhibitor: [
    { title: 'Welcome to EventSphere! 🎪',  body: "You're an Exhibitor. Here's how to get the most from your exhibitor account.", target: null },
    { title: '📋 Your Dashboard',           body: 'See all your expo registrations and their approval status here.', target: 'stat-cards' },
    { title: '🗓️ Browse & Register',        body: 'Browse published expos and apply to exhibit. Once approved, you can reserve a booth.', target: 'sidebar-main' },
    { title: '🗺️ Reserve a Booth',          body: 'After approval, view the live floor plan and click any green booth to reserve your space.', target: 'sidebar-main' },
    { title: '🏪 Update Your Booth',        body: 'Add your products, services, and keyword tags. These help attendees find you via AI recommendations!', target: 'sidebar-main' },
    { title: '💬 Messages',                 body: 'Communicate with organisers and interested attendees directly through the platform.', target: 'sidebar-messages' },
    { title: "You're ready! 🎉",            body: 'Browse available expos and submit your first application to get started!', target: null },
  ],
  attendee: [
    { title: 'Welcome to EventSphere! 🌟',  body: "You're an Attendee. Let's show you how to discover expos, book sessions, and get personalised recommendations.", target: null },
    { title: '📅 Browse Events',            body: 'Discover and register for published expos. Registration generates your unique QR badge instantly!', target: 'stat-cards' },
    { title: '🎫 Your QR Badge',            body: 'Every expo registration gives you a unique, scannable badge. Download it for entry and session check-in.', target: 'stat-cards' },
    { title: '🤖 AI Recommendations',       body: 'Our AI matches your interests with exhibitor profiles using Jaccard similarity scoring.', target: 'stat-cards' },
    { title: '🗺️ Virtual Floor Tour',       body: 'Explore the expo floor before you arrive — see who\'s exhibiting and where they are located.', target: 'stat-cards' },
    { title: '📖 Book Sessions',            body: 'Browse scheduled talks and workshops. Reserve your seat in real-time — seats are limited!', target: 'stat-cards' },
    { title: "You're all set! 🎉",          body: 'Head to "Browse Events" to discover your first expo and get your QR badge!', target: null },
  ],
};

const OnboardingTour = () => {
  const { user } = useAuth();
  const [step,    setStep]    = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!user) return;
    const key = `es_onboarded_${user._id}`;
    if (!localStorage.getItem(key)) {
      setTimeout(() => setVisible(true), 800); // slight delay so dashboard loads first
    }
  }, [user]);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(`es_onboarded_${user._id}`, 'true');
  };

  if (!visible || !user) return null;

  const steps = STEPS[user.role] || STEPS.attendee;
  const current = steps[step];
  const isLast  = step === steps.length - 1;
  const isFirst = step === 0;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] pointer-events-none" />

      {/* Tour Card — centered */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-md animate-slide-up">
          <div className="card overflow-hidden border-primary-700/50">
            {/* Progress bar */}
            <div className="h-1 bg-dark-900">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-500"
                style={{ width: `${((step + 1) / steps.length) * 100}%` }}
              />
            </div>

            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    Step {step + 1} of {steps.length}
                  </span>
                </div>
                <button onClick={dismiss} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <h2 className="font-display font-bold text-xl text-white mb-3">{current.title}</h2>
              <p className="text-slate-300 leading-relaxed">{current.body}</p>

              {/* Step dots */}
              <div className="flex items-center justify-center gap-1.5 my-5">
                {steps.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setStep(i)}
                    className={`rounded-full transition-all ${i === step ? 'w-6 h-2 bg-primary-500' : i < step ? 'w-2 h-2 bg-accent-500' : 'w-2 h-2 bg-slate-700'}`}
                  />
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                {!isFirst && (
                  <button
                    onClick={() => setStep(s => s - 1)}
                    className="btn-secondary flex-1 justify-center py-2.5"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                )}
                {isLast ? (
                  <button onClick={dismiss} className="btn-success flex-1 justify-center py-2.5">
                    <CheckCircle className="w-4 h-4" /> Let's Go!
                  </button>
                ) : (
                  <button onClick={() => setStep(s => s + 1)} className="btn-primary flex-1 justify-center py-2.5">
                    Next <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Skip */}
              {!isLast && (
                <button onClick={dismiss} className="w-full text-center text-xs text-slate-600 hover:text-slate-400 mt-3 transition-colors">
                  Skip tour
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OnboardingTour;
