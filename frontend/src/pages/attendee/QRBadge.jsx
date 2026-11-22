import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import Sidebar from '../../components/common/Sidebar';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Download, Printer, QrCode, Calendar, MapPin, User, Hash } from 'lucide-react';

export default function QRBadge() {
  const { expoId } = useParams();
  const { user }   = useAuth();
  const badgeRef   = useRef(null);

  const [badge,   setBadge]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/attendee/badge/${expoId}`)
      .then(r => setBadge(r.data.data))
      .catch(err => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [expoId]);

  const handlePrint = () => window.print();

  const handleDownload = () => {
    const badgeEl = badgeRef.current;
    if (!badgeEl) return;

    // Use html2canvas approach via canvas
    const svg = badgeEl.querySelector('svg');
    if (!svg) return;

    // Build a simple canvas representation
    const canvas = document.createElement('canvas');
    canvas.width  = 500;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 0, 720);
    grad.addColorStop(0, '#1e1b4b');
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.roundRect(0, 0, 500, 720, 20);
    ctx.fill();

    // Convert SVG QR to image
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 150, 280, 200, 200);

      // Text
      ctx.fillStyle = '#ffffff';
      ctx.font      = 'bold 28px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(badge?.user?.name || user?.name, 250, 80);

      ctx.font      = '16px Inter, sans-serif';
      ctx.fillStyle = '#a78bfa';
      ctx.fillText(badge?.badge?.expo?.title || '', 250, 115);

      ctx.font      = '13px Inter, sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(badge?.badge?.badgeId || '', 250, 145);

      const link    = document.createElement('a');
      link.download = `EventSphere-Badge-${badge?.badge?.badgeId}.png`;
      link.href     = canvas.toDataURL('image/png');
      link.click();
      toast.success('Badge downloaded!');
    };
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  };

  if (loading) return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-slate-700 border-t-primary-500 rounded-full animate-spin" />
      </div>
    </div>
  );

  if (!badge) return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-slate-500">
          <QrCode className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No badge found. Please register for this expo first.</p>
          <Link to="/attendee/events" className="btn-primary mt-4 inline-flex">Browse Events</Link>
        </div>
      </div>
    </div>
  );

  const { badge: reg, user: badgeUser } = badge;
  const qrValue = JSON.stringify({
    badgeId: reg.badgeId,
    attendee: badgeUser?.name || user?.name,
    expo: reg.expo?.title,
    expoId: reg.expo?._id,
    userId: badgeUser?._id || user?._id,
  });

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/attendee" className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="section-title">QR Event Badge</h1>
            <p className="section-subtitle">Your digital pass for {reg.expo?.title}</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* ── The Badge Card ── */}
          <div ref={badgeRef} className="w-80 mx-auto lg:mx-0 flex-shrink-0 print:shadow-none" id="badge-card">
            {/* Badge outer glow */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-600/30 to-purple-600/30 rounded-3xl blur-xl" />

              <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
                style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)' }}>

                {/* Top accent bar */}
                <div className="h-2 bg-gradient-to-r from-primary-500 via-purple-500 to-accent-400" />

                {/* Header section */}
                <div className="px-6 pt-6 pb-4 text-center border-b border-white/10">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="w-6 h-6 bg-gradient-to-br from-primary-500 to-purple-600 rounded-md flex items-center justify-center">
                      <span className="text-white text-xs font-bold">ES</span>
                    </div>
                    <span className="text-white font-bold text-sm">EventSphere</span>
                  </div>
                  <div className="badge badge-primary text-xs mb-2">ATTENDEE PASS</div>
                  <h2 className="font-display font-bold text-xl text-white leading-tight">
                    {reg.expo?.title}
                  </h2>
                </div>

                {/* Avatar + Name */}
                <div className="px-6 py-5 text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white mx-auto mb-3 ring-4 ring-primary-900/40">
                    {(badgeUser?.name || user?.name)?.[0]?.toUpperCase()}
                  </div>
                  <h3 className="font-bold text-white text-lg">{badgeUser?.name || user?.name}</h3>
                  <p className="text-primary-300 text-sm mt-0.5">{badgeUser?.email || user?.email}</p>
                </div>

                {/* QR Code */}
                <div className="flex justify-center px-6 pb-4">
                  <div className="p-3 bg-white rounded-2xl shadow-lg">
                    <QRCodeSVG
                      value={qrValue}
                      size={180}
                      bgColor="#ffffff"
                      fgColor="#0f172a"
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                </div>

                {/* Badge Details */}
                <div className="mx-6 mb-4 p-3 bg-white/5 rounded-2xl border border-white/10">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Hash className="w-3 h-3 text-primary-400" />
                      <span className="font-mono text-white">{reg.badgeId}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <User className="w-3 h-3 text-primary-400" />
                      <span className="capitalize text-white">{reg.role}</span>
                    </div>
                    {reg.expo?.startDate && (
                      <div className="flex items-center gap-1.5 text-slate-400 col-span-2">
                        <Calendar className="w-3 h-3 text-primary-400" />
                        <span className="text-white">
                          {new Date(reg.expo.startDate).toLocaleDateString()} – {new Date(reg.expo.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {reg.expo?.location && (
                      <div className="flex items-center gap-1.5 text-slate-400 col-span-2">
                        <MapPin className="w-3 h-3 text-primary-400" />
                        <span className="text-white">{reg.expo.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom stripe */}
                <div className="h-1.5 bg-gradient-to-r from-accent-500 via-primary-500 to-purple-500" />
              </div>
            </div>
          </div>

          {/* ── Controls & Info ── */}
          <div className="flex-1 space-y-4">
            <div className="card p-6">
              <h2 className="font-semibold text-white mb-4">Badge Actions</h2>
              <div className="space-y-3">
                <button onClick={handleDownload} className="btn-primary w-full justify-center">
                  <Download className="w-4 h-4" /> Download as PNG
                </button>
                <button onClick={handlePrint} className="btn-secondary w-full justify-center">
                  <Printer className="w-4 h-4" /> Print Badge
                </button>
              </div>
            </div>

            <div className="card p-6">
              <h2 className="font-semibold text-white mb-4">Badge Details</h2>
              <div className="space-y-3 text-sm">
                {[
                  ['Badge ID',    reg.badgeId,           'font-mono text-primary-400'],
                  ['Expo',        reg.expo?.title,        'text-white'],
                  ['Role',        reg.role,               'capitalize text-white'],
                  ['Status',      reg.status,             'capitalize text-accent-400'],
                  ['Registered',  new Date(reg.createdAt).toLocaleDateString(), 'text-white'],
                  ['Sessions',    reg.sessions?.length || 0, 'text-white'],
                ].map(([label, value, cls]) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-slate-400">{label}</span>
                    <span className={cls}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-6 bg-primary-900/10 border-primary-800/30">
              <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                <QrCode className="w-4 h-4 text-primary-400" /> How to use your badge
              </h3>
              <ul className="text-sm text-slate-400 space-y-1.5">
                <li>• Show this QR code at the expo entrance for check-in</li>
                <li>• Use it to access booked sessions</li>
                <li>• Exhibitors can scan it to save your contact details</li>
                <li>• Download and save it to your phone's wallet</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
