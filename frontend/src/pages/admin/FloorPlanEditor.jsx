import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import api from '../../services/api';
import { useSocket } from '../../hooks/useSocket';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, RefreshCw, Info, X } from 'lucide-react';

const CELL_TYPES = ['empty','booth','aisle','entrance'];
const CELL_COLORS = { empty: 'bg-dark-900 border-slate-800', booth: 'bg-primary-900/60 border-primary-700', aisle: 'bg-slate-700/40 border-slate-600', entrance: 'bg-amber-900/60 border-amber-700' };
const BOOTH_STATUS_COLORS = { available: 'bg-accent-900/60 border-accent-700 text-accent-300', reserved: 'bg-amber-900/60 border-amber-700 text-amber-300', occupied: 'bg-rose-900/60 border-rose-700 text-rose-300' };

export default function FloorPlanEditor() {
  const { expoId } = useParams();
  const { user } = useAuth();
  const socket = useSocket(user?._id, expoId);

  const [expo, setExpo]     = useState(null);
  const [booths, setBooths] = useState([]);
  const [grid, setGrid]     = useState([]);
  const [rows, setRows]     = useState(6);
  const [cols, setCols]     = useState(8);
  const [activeTool, setActiveTool] = useState('booth');
  const [saving, setSaving]         = useState(false);
  const [loading, setLoading]       = useState(true);
  const [selectedBooth, setSelectedBooth] = useState(null);

  // Load expo + booth data
  useEffect(() => {
    Promise.all([
      api.get(`/expo/${expoId}`),
      api.get(`/admin/booths/${expoId}`),
    ]).then(([expoRes, boothsRes]) => {
      const expoData = expoRes.data.data.expo;
      setExpo(expoData);
      setBooths(boothsRes.data.data);
      const r = expoData.floorPlan?.rows || 6;
      const c = expoData.floorPlan?.cols || 8;
      setRows(r); setCols(c);
      // Build grid from saved cells
      const savedCells = expoData.floorPlan?.cells || [];
      const newGrid = Array.from({ length: r }, (_, ri) =>
        Array.from({ length: c }, (_, ci) => {
          const saved = savedCells.find(cell => cell.row === ri && cell.col === ci);
          return saved || { row: ri, col: ci, type: 'empty', label: '' };
        })
      );
      setGrid(newGrid);
    }).finally(() => setLoading(false));
  }, [expoId]);

  // Real-time booth status updates
  useEffect(() => {
    if (!socket) return;
    socket.on('booth-status-changed', (updatedBooth) => {
      setBooths(prev => prev.map(b => b._id === updatedBooth._id ? updatedBooth : b));
      toast.success(`Booth ${updatedBooth.boothNumber} status changed to ${updatedBooth.status}`);
    });
    return () => socket.off('booth-status-changed');
  }, [socket]);

  const handleCellClick = useCallback((ri, ci) => {
    setGrid(prev => {
      const newGrid = prev.map(row => [...row]);
      const current = newGrid[ri][ci];
      const nextType = activeTool === 'erase' ? 'empty' : activeTool;
      // Toggle: clicking same type clears it
      newGrid[ri][ci] = {
        ...current,
        type: current.type === nextType ? 'empty' : nextType,
        label: nextType === 'booth'
          ? `${String.fromCharCode(65 + ri)}${ci + 1}`
          : nextType === 'entrance' ? 'ENTRANCE' : '',
      };
      return newGrid;
    });
  }, [activeTool]);

  const saveFloorPlan = async () => {
    setSaving(true);
    try {
      const cells = grid.flat().filter(c => c.type !== 'empty');
      await api.put(`/admin/expos/${expoId}`, { floorPlan: { rows, cols, cells } });

      // Create booths for new booth cells
      const boothCells = cells.filter(c => c.type === 'booth');
      const existingLabels = booths.map(b => b.boothNumber);
      const newBoothCells = boothCells.filter(c => !existingLabels.includes(c.label));

      if (newBoothCells.length > 0) {
        await api.post(`/admin/booths/${expoId}`, {
          booths: newBoothCells.map(c => ({
            boothNumber: c.label,
            position: { row: c.row, col: c.col },
            size: 'medium',
          })),
        });
      }

      toast.success('Floor plan saved successfully!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const boothAtCell = (ri, ci) => booths.find(b => b.position?.row === ri && b.position?.col === ci);

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
        <div className="flex items-center gap-4 mb-6">
          <Link to="/admin/expos" className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="section-title">Floor Plan Editor</h1>
            <p className="section-subtitle">{expo?.title}</p>
          </div>
          <button onClick={saveFloorPlan} disabled={saving} className="btn-primary">
            {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save className="w-4 h-4" /> Save Plan</>}
          </button>
        </div>

        <div className="flex flex-col xl:flex-row gap-6">
          {/* ── Toolbar ── */}
          <div className="xl:w-56 space-y-4">
            <div className="card p-4">
              <h3 className="text-sm font-semibold text-white mb-3">Drawing Tools</h3>
              <div className="space-y-2">
                {[
                  { tool: 'booth',    label: '🟦 Booth',    desc: 'Exhibitor space' },
                  { tool: 'aisle',    label: '⬜ Aisle',    desc: 'Walkway' },
                  { tool: 'entrance', label: '🟨 Entrance', desc: 'Entry point' },
                  { tool: 'erase',    label: '🗑️ Erase',    desc: 'Clear cell' },
                ].map(({ tool, label, desc }) => (
                  <button key={tool} onClick={() => setActiveTool(tool)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all ${activeTool === tool ? 'bg-primary-600/20 border border-primary-600/40 text-primary-300' : 'text-slate-400 hover:bg-white/5 border border-transparent'}`}>
                    <div className="font-medium">{label}</div>
                    <div className="text-xs opacity-60">{desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Grid size controls */}
            <div className="card p-4">
              <h3 className="text-sm font-semibold text-white mb-3">Grid Size</h3>
              <div className="space-y-3">
                <div>
                  <label className="input-label text-xs">Rows: {rows}</label>
                  <input type="range" min={3} max={12} value={rows} onChange={e => { setRows(+e.target.value); setGrid([]); }}
                    className="w-full accent-primary-500" />
                </div>
                <div>
                  <label className="input-label text-xs">Columns: {cols}</label>
                  <input type="range" min={4} max={16} value={cols} onChange={e => { setCols(+e.target.value); setGrid([]); }}
                    className="w-full accent-primary-500" />
                </div>
                <button onClick={() => setGrid(Array.from({ length: rows }, (_, ri) =>
                  Array.from({ length: cols }, (_, ci) => ({ row: ri, col: ci, type: 'empty', label: '' }))
                ))} className="btn-secondary w-full justify-center text-xs py-2">
                  <RefreshCw className="w-3.5 h-3.5" /> Reset Grid
                </button>
              </div>
            </div>

            {/* Legend */}
            <div className="card p-4">
              <h3 className="text-sm font-semibold text-white mb-3">Booth Status</h3>
              {[['available','Available','bg-accent-500'],['reserved','Reserved','bg-amber-500'],['occupied','Occupied','bg-rose-500']].map(([s,l,c]) => (
                <div key={s} className="flex items-center gap-2 mb-2">
                  <div className={`w-3 h-3 rounded ${c}`} />
                  <span className="text-xs text-slate-400">{l}</span>
                </div>
              ))}
            </div>

            {/* Booth count */}
            <div className="card p-4 text-center">
              <p className="text-2xl font-bold text-white">{grid.flat().filter(c => c.type === 'booth').length}</p>
              <p className="text-xs text-slate-400">Booths Placed</p>
              <p className="text-sm font-semibold text-accent-400 mt-1">{booths.filter(b => b.status === 'occupied').length} Occupied</p>
            </div>
          </div>

          {/* ── Grid Canvas ── */}
          <div className="flex-1">
            <div className="card p-4 overflow-x-auto">
              <div className="inline-grid gap-1.5" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
                {grid.map((row, ri) =>
                  row.map((cell, ci) => {
                    const booth = boothAtCell(ri, ci);
                    const isBoothCell = cell.type === 'booth';
                    const statusColor = booth ? BOOTH_STATUS_COLORS[booth.status] : '';
                    return (
                      <div
                        key={`${ri}-${ci}`}
                        onClick={() => { handleCellClick(ri, ci); if (booth) setSelectedBooth(booth); }}
                        title={booth ? `${booth.boothNumber} — ${booth.status}${booth.exhibitor ? ` (${booth.exhibitor.name})` : ''}` : cell.type}
                        className={`booth-cell w-12 h-12 rounded-lg border-2 flex items-center justify-center text-xs font-bold cursor-pointer select-none
                          ${isBoothCell && booth ? statusColor : CELL_COLORS[cell.type]}`}
                      >
                        {cell.type === 'entrance' && <span className="text-base">🚪</span>}
                        {cell.type === 'aisle'    && <span className="text-slate-500">—</span>}
                        {isBoothCell && (
                          <span className={booth ? (booth.status === 'available' ? 'text-accent-300' : booth.status === 'reserved' ? 'text-amber-300' : 'text-rose-300') : 'text-primary-300'}>
                            {cell.label || `${ri}${ci}`}
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
              <p className="text-xs text-slate-600 mt-4 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" /> Click cells to paint. Click an assigned booth to see details.
              </p>
            </div>

            {/* Selected booth details */}
            {selectedBooth && (
              <div className="card p-4 mt-4 animate-slide-up">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-white">Booth {selectedBooth.boothNumber}</h3>
                  <button onClick={() => setSelectedBooth(null)} className="text-slate-500 hover:text-white"><X className="w-4 h-4" /></button>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-slate-500">Status:</span> <span className="text-white capitalize">{selectedBooth.status}</span></div>
                  <div><span className="text-slate-500">Size:</span> <span className="text-white capitalize">{selectedBooth.size}</span></div>
                  {selectedBooth.exhibitor && <div className="col-span-2"><span className="text-slate-500">Exhibitor:</span> <span className="text-white">{selectedBooth.exhibitor.name} ({selectedBooth.exhibitor.company})</span></div>}
                  {selectedBooth.products?.length > 0 && <div className="col-span-2"><span className="text-slate-500">Products:</span> <span className="text-white">{selectedBooth.products.join(', ')}</span></div>}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
