import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, QrCode, Camera, CameraOff, UserCheck, Download, Trash2, Wifi } from 'lucide-react';

export default function LeadScanner() {
  const { expoId } = useParams();
  const { user }   = useAuth();

  const videoRef   = useRef(null);
  const canvasRef  = useRef(null);
  const scanRef    = useRef(null);
  const streamRef  = useRef(null);

  const [scanning,  setScanning]  = useState(false);
  const [lastScan,  setLastScan]  = useState(null);
  const [leads,     setLeads]     = useState(() => {
    try { return JSON.parse(localStorage.getItem(`leads_${expoId}`) || '[]'); }
    catch { return []; }
  });
  const [error,     setError]     = useState('');
  const [expo,      setExpo]      = useState(null);
  const [cooldown,  setCooldown]  = useState(false); // prevent double-scan

  useEffect(() => {
    api.get(`/expo/${expoId}`).then(r => setExpo(r.data.data.expo)).catch(() => {});
  }, [expoId]);

  /* ── Camera helpers ── */
  const startCamera = async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setScanning(true);
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        setError('Camera permission denied. Please allow camera access in your browser settings and try again.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera detected. Please connect a camera and try again.');
      } else {
        setError(`Camera error: ${err.message}`);
      }
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    clearInterval(scanRef.current);
    setScanning(false);
  };

  /* ── QR scanning loop using canvas + jsQR ── */
  useEffect(() => {
    if (!scanning) return;

    const tick = () => {
      const video  = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState !== 4) return;

      const ctx = canvas.getContext('2d');
      canvas.width  = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Use jsQR (loaded via script tag in index.html)
      if (window.jsQR) {
        const code = window.jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'dontInvert' });
        if (code && !cooldown) {
          handleScan(code.data);
        }
      }
    };

    scanRef.current = setInterval(tick, 400);
    return () => clearInterval(scanRef.current);
  }, [scanning, cooldown]);

  const handleScan = (rawData) => {
    try {
      const data = JSON.parse(rawData);
      if (!data.badgeId || !data.attendee) return; // not a valid EventSphere badge

      setCooldown(true);
      setTimeout(() => setCooldown(false), 3000); // 3s cooldown per scan

      // Duplicate check
      const isDuplicate = leads.some(l => l.badgeId === data.badgeId);

      setLastScan({ ...data, scannedAt: new Date().toISOString(), isDuplicate });

      if (!isDuplicate) {
        const newLead = { ...data, scannedAt: new Date().toISOString() };
        const updated = [newLead, ...leads];
        setLeads(updated);
        localStorage.setItem(`leads_${expoId}`, JSON.stringify(updated));
        toast.success(`✅ Lead captured: ${data.attendee}`);
      } else {
        toast(`Already scanned: ${data.attendee}`, { icon: '⚠️' });
      }
    } catch { /* not JSON — ignore */ }
  };

  const deleteLead = (badgeId) => {
    const updated = leads.filter(l => l.badgeId !== badgeId);
    setLeads(updated);
    localStorage.setItem(`leads_${expoId}`, JSON.stringify(updated));
  };

  const exportCSV = () => {
    const rows = [
      ['Name','Badge ID','Expo','Scanned At'],
      ...leads.map(l => [l.attendee, l.badgeId, l.expo || expo?.title || '', new Date(l.scannedAt).toLocaleString()]),
    ];
    const csv  = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `leads_${expoId}_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Leads exported as CSV!');
  };

  useEffect(() => () => stopCamera(), []);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link to="/exhibitor" className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="section-title flex items-center gap-2">
              <QrCode className="w-6 h-6 text-accent-400" /> Lead Scanner
            </h1>
            <p className="section-subtitle">{expo?.title} — Scan attendee badges to capture leads</p>
          </div>
          {leads.length > 0 && (
            <button onClick={exportCSV} className="btn-success">
              <Download className="w-4 h-4" /> Export CSV ({leads.length})
            </button>
          )}
        </div>

        <div className="flex flex-col xl:flex-row gap-6">
          {/* ── Camera Panel ── */}
          <div className="flex-1 space-y-4">
            {/* Camera feed */}
            <div className="card overflow-hidden">
              <div className="relative bg-dark-900 aspect-video flex items-center justify-center">
                <video ref={videoRef} className={`w-full h-full object-cover ${scanning ? '' : 'hidden'}`} muted playsInline />
                <canvas ref={canvasRef} className="hidden" />

                {scanning && (
                  <>
                    {/* Scanning overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-48 h-48 relative">
                        {/* Corner markers */}
                        {[['top-0 left-0','border-t-4 border-l-4'],['top-0 right-0','border-t-4 border-r-4'],['bottom-0 left-0','border-b-4 border-l-4'],['bottom-0 right-0','border-b-4 border-r-4']].map(([pos, brd]) => (
                          <div key={pos} className={`absolute w-8 h-8 ${pos} ${brd} border-primary-400`} />
                        ))}
                        {/* Scanning line */}
                        <div className="absolute left-0 right-0 h-0.5 bg-primary-400/80 animate-bounce" style={{ top: '50%' }} />
                      </div>
                    </div>
                    {/* Cooldown indicator */}
                    {cooldown && (
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-dark-800/90 px-3 py-1.5 rounded-full text-xs text-accent-400 font-medium">
                        ✅ Scanned — point at next badge
                      </div>
                    )}
                  </>
                )}

                {!scanning && (
                  <div className="text-center p-8">
                    <Camera className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                    <p className="text-slate-400 mb-1">Camera is off</p>
                    <p className="text-xs text-slate-600">Click Start Camera to begin scanning</p>
                  </div>
                )}
              </div>

              <div className="p-4 flex items-center gap-3">
                {!scanning ? (
                  <button onClick={startCamera} className="btn-primary flex-1 justify-center">
                    <Camera className="w-4 h-4" /> Start Camera & Scan
                  </button>
                ) : (
                  <button onClick={stopCamera} className="btn-danger flex-1 justify-center">
                    <CameraOff className="w-4 h-4" /> Stop Camera
                  </button>
                )}
              </div>
            </div>

            {error && (
              <div className="card p-4 border-red-700/40 bg-red-900/10 text-sm text-red-400">
                ⚠️ {error}
              </div>
            )}

            {/* Mobile hint */}
            <div className="card p-4 bg-cyan-900/10 border-cyan-800/30 flex items-start gap-3">
              <Wifi className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-slate-300">
                <p className="font-medium text-white mb-0.5">Better on your phone?</p>
                <p className="text-slate-400 text-xs">Find your laptop's WiFi IP: run <code className="bg-dark-900 px-1 rounded text-cyan-400">ipconfig</code> in CMD → look for "IPv4 Address" under WiFi. Then open <code className="bg-dark-900 px-1 rounded text-cyan-400">http://[that-ip]:5173</code> on your phone browser and use this scanner with your phone camera.</p>
              </div>
            </div>

            {/* Last scan result */}
            {lastScan && (
              <div className={`card p-4 animate-slide-up border ${lastScan.isDuplicate ? 'border-amber-700/40 bg-amber-900/10' : 'border-accent-700/40 bg-accent-900/10'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${lastScan.isDuplicate ? 'bg-amber-900/40' : 'bg-accent-900/40'}`}>
                    <UserCheck className={`w-5 h-5 ${lastScan.isDuplicate ? 'text-amber-400' : 'text-accent-400'}`} />
                  </div>
                  <div>
                    <p className="font-bold text-white">{lastScan.attendee}</p>
                    <p className="text-xs text-slate-400 font-mono">{lastScan.badgeId}</p>
                    {lastScan.isDuplicate && <p className="text-xs text-amber-400 mt-0.5">Already in your leads list</p>}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Leads List ── */}
          <div className="xl:w-80">
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                <h2 className="font-semibold text-white text-sm">Captured Leads</h2>
                <span className="badge badge-success">{leads.length} total</span>
              </div>
              {leads.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <QrCode className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No leads yet.<br />Start scanning badges!</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-800 max-h-[520px] overflow-y-auto">
                  {leads.map((lead, i) => (
                    <div key={lead.badgeId} className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-600 to-purple-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {lead.attendee?.[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white text-sm truncate">{lead.attendee}</p>
                        <p className="text-xs text-slate-500 font-mono">{lead.badgeId}</p>
                        <p className="text-xs text-slate-600">{new Date(lead.scannedAt).toLocaleTimeString()}</p>
                      </div>
                      <button onClick={() => deleteLead(lead.badgeId)} className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-900/20 transition-colors flex-shrink-0">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
