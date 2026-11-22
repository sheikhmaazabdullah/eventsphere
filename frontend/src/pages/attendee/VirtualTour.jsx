import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../hooks/useSocket';
import api from '../../services/api';
import { ArrowLeft, Play, Pause, SkipForward, SkipBack, Map, Info, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

export default function VirtualTour() {
  const { expoId } = useParams();
  const { user }   = useAuth();
  const socket     = useSocket(user?._id, expoId);

  const [expo,      setExpo]      = useState(null);
  const [booths,    setBooths]    = useState([]);
  const [cells,     setCells]     = useState([]);
  const [rows,      setRows]      = useState(6);
  const [cols,      setCols]      = useState(8);
  const [loading,   setLoading]   = useState(true);

  // Tour state
  const [tourActive,  setTourActive]  = useState(false);
  const [tourIndex,   setTourIndex]   = useState(0);
  const [hoveredCell, setHoveredCell] = useState(null);
  const [selectedBooth, setSelectedBooth] = useState(null);
  const [zoom,        setZoom]        = useState(1);
  const tourInterval = useRef(null);

  useEffect(() => {
    Promise.all([
      api.get(`/attendee/floor/${expoId}`),
      api.get(`/expo/${expoId}`),
    ]).then(([floorRes, expoRes]) => {
      const { floorPlan, booths: b } = floorRes.data.data;
      setExpo(expoRes.data.data.expo);
      setBooths(b);
      setCells(floorPlan?.cells || []);
      setRows(floorPlan?.rows || 6);
      setCols(floorPlan?.cols || 8);
    }).finally(() => setLoading(false));
  }, [expoId]);

  // Real-time booth status updates
  useEffect(() => {
    if (!socket) return;
    socket.on('booth-status-changed', ({ boothId, status }) => {
      setBooths(prev => prev.map(b => b._id === boothId ? { ...b, status } : b));
    });
    return () => socket.off('booth-status-changed');
  }, [socket]);

  // Occupied booths for tour
  const tourBooths = booths.filter(b => b.status !== 'available');

  // Auto-tour timer
  useEffect(() => {
    if (tourActive && tourBooths.length > 0) {
      tourInterval.current = setInterval(() => {
        setTourIndex(prev => {
          const next = (prev + 1) % tourBooths.length;
          setSelectedBooth(tourBooths[next]);
          return next;
        });
      }, 3000);
    } else {
      clearInterval(tourInterval.current);
    }
    return () => clearInterval(tourInterval.current);
  }, [tourActive, tourBooths.length]);

  const startTour = () => {
    if (tourBooths.length === 0) return;
    setTourIndex(0);
    setSelectedBooth(tourBooths[0]);
    setTourActive(true);
  };

  const stopTour = () => { setTourActive(false); setSelectedBooth(null); };

  const navTour = (dir) => {
    const newIdx = (tourIndex + dir + tourBooths.length) % tourBooths.length;
    setTourIndex(newIdx);
    setSelectedBooth(tourBooths[newIdx]);
  };

  const boothAtCell = (ri, ci) => booths.find(b => b.position?.row === ri && b.position?.col === ci);

  const CELL_STYLES = {
    empty:    'bg-transparent border-transparent cursor-default',
    aisle:    'bg-slate-800/40 border-slate-700/50 cursor-default',
    entrance: 'bg-amber-900/40 border-amber-700/50 cursor-default',
  };

  const BOOTH_STATUS = {
    available: { bg: 'bg-slate-700/50 border-slate-600', text: 'text-slate-400', label: 'Available' },
    reserved:  { bg: 'bg-amber-900/60 border-amber-700', text: 'text-amber-300', label: 'Reserved' },
    occupied:  { bg: 'bg-primary-900/70 border-primary-700', text: 'text-primary-300', label: 'Occupied' },
  };

  const isTourActive = (booth) =>
    tourActive && selectedBooth && booth._id === selectedBooth._id;

  if (loading) return (
    <div className="flex h-screen"><Sidebar /><div className="flex-1 flex items-center justify-center"><div className="w-10 h-10 border-2 border-slate-700 border-t-primary-500 rounded-full animate-spin" /></div></div>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link to="/attendee" className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="section-title flex items-center gap-2">
              <Map className="w-6 h-6 text-cyan-400" /> Virtual Floor Tour
            </h1>
            <p className="section-subtitle">{expo?.title} · {booths.length} booths</p>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-6">
          {/* ── Floor Plan ── */}
          <div className="flex-1">
            {/* Zoom controls */}
            <div className="flex items-center gap-2 mb-3">
              <button onClick={() => setZoom(z => Math.min(z + 0.2, 2))} className="btn-secondary p-2"><ZoomIn className="w-4 h-4" /></button>
              <button onClick={() => setZoom(z => Math.max(z - 0.2, 0.6))} className="btn-secondary p-2"><ZoomOut className="w-4 h-4" /></button>
              <button onClick={() => setZoom(1)} className="btn-secondary p-2"><RotateCcw className="w-4 h-4" /></button>
              <span className="text-slate-500 text-sm">{Math.round(zoom * 100)}%</span>

              <div className="ml-auto flex items-center gap-2">
                {/* Legend */}
                {[['bg-slate-700','Available'],['bg-amber-700','Reserved'],['bg-primary-700','Occupied'],['bg-amber-900','Entrance'],['bg-slate-800','Aisle']].map(([c,l]) => (
                  <div key={l} className="flex items-center gap-1.5 text-xs text-slate-400">
                    <div className={`w-3 h-3 rounded ${c}`} />{l}
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-4 overflow-auto">
              <div className="transition-all duration-300 origin-top-left inline-block" style={{ transform: `scale(${zoom})` }}>
                <div className="inline-grid gap-1.5" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
                  {Array.from({ length: rows }, (_, ri) =>
                    Array.from({ length: cols }, (_, ci) => {
                      const cell  = cells.find(c => c.row === ri && c.col === ci) || { type: 'empty' };
                      const booth = boothAtCell(ri, ci);
                      const status = booth ? BOOTH_STATUS[booth.status] : null;
                      const isActive = booth && isTourActive(booth);
                      const isHovered = hoveredCell?.ri === ri && hoveredCell?.ci === ci;
                      const isSelected = selectedBooth && booth?._id === selectedBooth._id;

                      return (
                        <div
                          key={`${ri}-${ci}`}
                          onMouseEnter={() => booth && setHoveredCell({ ri, ci, booth })}
                          onMouseLeave={() => setHoveredCell(null)}
                          onClick={() => booth ? setSelectedBooth(booth) : null}
                          title={booth ? `${booth.boothNumber} — ${booth.status}${booth.exhibitor ? ` (${booth.exhibitor.name})` : ''}` : cell.type}
                          className={`
                            w-14 h-14 rounded-xl border-2 flex flex-col items-center justify-center
                            text-xs font-bold select-none transition-all duration-200
                            ${cell.type !== 'empty' && !booth ? CELL_STYLES[cell.type] : ''}
                            ${booth ? `${status.bg} ${status.text} cursor-pointer` : ''}
                            ${isActive ? 'tour-active ring-2 ring-primary-400 ring-offset-2 ring-offset-dark-800 scale-110 z-10' : ''}
                            ${isSelected && !isActive ? 'ring-2 ring-amber-400 ring-offset-1 ring-offset-dark-800' : ''}
                            ${cell.type === 'empty' ? 'border-transparent' : ''}
                          `}
                        >
                          {cell.type === 'entrance' && <span className="text-base">🚪</span>}
                          {cell.type === 'aisle'    && <span className="text-slate-600 text-base">─</span>}
                          {booth && (
                            <>
                              <span className="text-[10px] leading-none">{booth.boothNumber}</span>
                              {booth.exhibitor && <span className="text-[8px] leading-none mt-0.5 opacity-70 truncate w-10 text-center">{booth.exhibitor.name?.split(' ')[0]}</span>}
                            </>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Tour Controls */}
            <div className="card p-4 mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {tourActive ? (
                    <>
                      <button onClick={stopTour} className="btn-danger px-4 py-2 text-sm"><Pause className="w-4 h-4" /> Stop Tour</button>
                      <button onClick={() => navTour(-1)} className="btn-secondary p-2"><SkipBack className="w-4 h-4" /></button>
                      <button onClick={() => navTour(1)} className="btn-secondary p-2"><SkipForward className="w-4 h-4" /></button>
                      <span className="text-sm text-slate-400">{tourIndex + 1} / {tourBooths.length}</span>
                    </>
                  ) : (
                    <button onClick={startTour} disabled={tourBooths.length === 0} className="btn-primary px-4 py-2 text-sm">
                      <Play className="w-4 h-4" /> Start Virtual Tour ({tourBooths.length} booths)
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-500">Click any booth for details</p>
              </div>
            </div>
          </div>

          {/* ── Info Panel ── */}
          <div className="xl:w-80 space-y-4">
            {/* Hover preview */}
            {hoveredCell?.booth && !selectedBooth && (
              <div className="card p-4 animate-fade-in border-slate-600/50">
                <p className="text-xs text-slate-500 mb-1">Hovering</p>
                <h3 className="font-bold text-white">Booth {hoveredCell.booth.boothNumber}</h3>
                {hoveredCell.booth.exhibitor && <p className="text-sm text-primary-400">{hoveredCell.booth.exhibitor.name}</p>}
                <span className={`badge mt-2 ${hoveredCell.booth.status === 'occupied' ? 'badge-primary' : 'badge-warning'}`}>{hoveredCell.booth.status}</span>
              </div>
            )}

            {/* Selected booth detail */}
            {selectedBooth && (
              <div className={`card p-5 border-primary-700/40 animate-slide-up ${tourActive ? 'bg-primary-900/10' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">{tourActive ? '🎯 Now Touring' : 'Selected Booth'}</p>
                    <h2 className="font-bold text-white text-lg">Booth {selectedBooth.boothNumber}</h2>
                  </div>
                  <span className={`badge ${selectedBooth.status === 'occupied' ? 'badge-primary' : 'badge-warning'}`}>{selectedBooth.status}</span>
                </div>

                {selectedBooth.exhibitor && (
                  <div className="flex items-center gap-2.5 mb-4 p-3 bg-dark-900/60 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-600 to-purple-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {selectedBooth.exhibitor.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">{selectedBooth.exhibitor.name}</p>
                      <p className="text-xs text-slate-400">{selectedBooth.exhibitor.company}</p>
                    </div>
                  </div>
                )}

                {selectedBooth.description && (
                  <p className="text-sm text-slate-400 mb-3">{selectedBooth.description}</p>
                )}

                <div className="space-y-3">
                  {selectedBooth.products?.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1.5">Products</p>
                      <div className="flex flex-wrap gap-1">{selectedBooth.products.map(p => <span key={p} className="badge badge-primary text-xs">{p}</span>)}</div>
                    </div>
                  )}
                  {selectedBooth.services?.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1.5">Services</p>
                      <div className="flex flex-wrap gap-1">{selectedBooth.services.map(s => <span key={s} className="badge badge-secondary text-xs">{s}</span>)}</div>
                    </div>
                  )}
                  {selectedBooth.tags?.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1.5">Tags</p>
                      <div className="flex flex-wrap gap-1">{selectedBooth.tags.map(t => <span key={t} className="badge badge-secondary text-xs">{t}</span>)}</div>
                    </div>
                  )}
                </div>

                <button onClick={() => setSelectedBooth(null)} className="btn-secondary w-full justify-center text-xs mt-4">Clear Selection</button>
              </div>
            )}

            {!selectedBooth && !hoveredCell?.booth && (
              <div className="card p-6 text-center text-slate-500">
                <Map className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Click on a booth or start the Virtual Tour to explore exhibitors</p>
              </div>
            )}

            {/* Stats */}
            <div className="card p-4">
              <h3 className="font-semibold text-white text-sm mb-3">Floor Stats</h3>
              <div className="space-y-2">
                {[
                  ['Total Booths',  booths.length,                                    'text-white'],
                  ['Occupied',      booths.filter(b=>b.status==='occupied').length,    'text-primary-400'],
                  ['Reserved',      booths.filter(b=>b.status==='reserved').length,    'text-amber-400'],
                  ['Available',     booths.filter(b=>b.status==='available').length,   'text-accent-400'],
                ].map(([label, val, cls]) => (
                  <div key={label} className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">{label}</span>
                    <span className={`font-semibold ${cls}`}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
