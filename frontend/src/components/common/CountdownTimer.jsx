import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

/**
 * CountdownTimer
 * Props:
 *   targetDate — ISO date string of expo start
 *   label      — short label e.g. "TechFest Karachi 2026"
 *   compact    — if true renders a small inline version
 */
const CountdownTimer = ({ targetDate, label = '', compact = false }) => {
  const calc = () => {
    const diff = new Date(targetDate) - new Date();
    if (diff <= 0) return null;
    return {
      days:    Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours:   Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  };

  const [time, setTime] = useState(calc());

  useEffect(() => {
    const t = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(t);
  }, [targetDate]);

  // Expo already started or ended
  if (!time) {
    return (
      <div className={`flex items-center gap-2 ${compact ? 'text-xs' : 'text-sm'} text-accent-400 font-semibold`}>
        <div className="w-2 h-2 rounded-full bg-accent-400 animate-pulse" />
        Happening Now
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-slate-400">
        <Clock className="w-3 h-3 text-primary-400" />
        <span className="text-primary-400 font-mono font-bold">
          {time.days}d {String(time.hours).padStart(2,'0')}h {String(time.minutes).padStart(2,'0')}m
        </span>
      </div>
    );
  }

  const units = [
    { label: 'Days',    value: time.days },
    { label: 'Hours',   value: String(time.hours).padStart(2,'0') },
    { label: 'Minutes', value: String(time.minutes).padStart(2,'0') },
    { label: 'Seconds', value: String(time.seconds).padStart(2,'0') },
  ];

  return (
    <div className="card p-5 bg-gradient-to-r from-primary-900/30 to-purple-900/20 border-primary-800/40">
      {label && (
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-primary-400" />
          <p className="text-sm font-semibold text-white">{label}</p>
          <span className="badge badge-primary ml-auto text-xs">Starts In</span>
        </div>
      )}
      <div className="grid grid-cols-4 gap-3">
        {units.map(({ label: ul, value }) => (
          <div key={ul} className="text-center">
            <div className="bg-dark-900/60 rounded-xl p-3 border border-primary-800/30">
              <p className="font-display text-3xl font-extrabold text-white tabular-nums leading-none">
                {value}
              </p>
            </div>
            <p className="text-xs text-slate-500 mt-1.5 uppercase tracking-wider">{ul}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CountdownTimer;
