import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, ZoomIn, ZoomOut, MapPin, Loader2, X } from 'lucide-react';
import { Card } from '@/src/components/ui/Card';
import { useVoters } from '@/src/hooks/useVoters';

export function Heatmap() {
  const { voters, loading } = useVoters();
  const [zoom, setZoom] = useState(1);

  const densityData = useMemo(() => {
    const counts: Record<string, number> = {};
    voters.forEach(v => {
      const comuna = v.comuna || 'Otras';
      counts[comuna] = (counts[comuna] || 0) + 1;
    });

    // Mock coordinates for demo mapping since we don't have real GIS data yet
    const baseCoords: Record<string, { top: string, left: string }> = {
      'Comuna 1': { top: '30%', left: '40%' },
      'Comuna 2': { top: '35%', left: '55%' },
      'Comuna 11 - Laureles': { top: '50%', left: '35%' },
      'Comuna 13': { top: '45%', left: '25%' },
      'Comuna 14 - El Poblado': { top: '65%', left: '50%' },
      'Otras': { top: '70%', left: '70%' }
    };

    return Object.entries(counts).map(([label, val], i) => ({
      id: i.toString(),
      label,
      val: val.toLocaleString(),
      rawVal: val,
      top: baseCoords[label]?.top || `${Math.random() * 60 + 20}%`,
      left: baseCoords[label]?.left || `${Math.random() * 60 + 20}%`,
      size: val > 50 ? 'lg' : val > 20 ? 'md' : 'sm'
    }));
  }, [voters]);

  const [selected, setSelected] = useState<any>(null);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-[10px] font-bold uppercase tracking-widest">Generando Mapa de Calor...</p>
      </div>
    );
  }

  return (
    <Card className="bg-[#0a0a0c] border-white/5 overflow-hidden min-h-[500px] flex flex-col p-0 shadow-2xl">
      <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02] backdrop-blur-md z-10">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Globe className="w-4 h-4 text-indigo-500" />
          Densidad Electoral por Comuna
        </h3>
        <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/5">
          <button onClick={() => setZoom(z => Math.min(z + 0.1, 1.5))} className="p-2 hover:bg-white/10 rounded-lg transition-all text-slate-400 hover:text-white">
            <ZoomIn className="w-4 h-4" />
          </button>
          <button onClick={() => setZoom(z => Math.max(z - 0.1, 0.8))} className="p-2 hover:bg-white/10 rounded-lg transition-all text-slate-400 hover:text-white">
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 relative bg-[#0a0a0c] overflow-hidden cursor-grab active:cursor-grabbing">
        <motion.div 
          animate={{ scale: zoom }}
          className="absolute inset-0 flex items-center justify-center p-12 origin-center"
        >
          {/* Abstract Map Background */}
          <div className="relative w-full h-full max-w-[700px] aspect-[16/9] bg-indigo-500/[0.02] rounded-[100px] border border-white/5 overflow-hidden shadow-[inset_0_0_100px_rgba(99,102,241,0.05)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_75%)] from-indigo-500/10" />
            
            {/* Grid Pattern */}
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

            {/* Location Points */}
            {densityData.map((loc) => (
              <motion.button
                key={loc.id}
                style={{ top: loc.top, left: loc.left }}
                onClick={() => setSelected(loc)}
                whileHover={{ scale: 1.1 }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full font-black flex items-center justify-center transition-all shadow-[0_0_20px_rgba(99,102,241,0.2)]
                  ${selected?.id === loc.id ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/30' : 'bg-[#111114] text-indigo-400 border border-indigo-500/20 hover:border-indigo-500/50'}
                  ${loc.size === 'lg' ? 'w-16 h-16 text-xs' : loc.size === 'md' ? 'w-12 h-12 text-[10px]' : 'w-10 h-10 text-[8px]'}
                `}
              >
                {loc.val}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Legend */}
        <div className="absolute top-6 right-6 p-4 bg-black/40 backdrop-blur-md rounded-2xl border border-white/5 space-y-2">
          <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">Intensidad</p>
          <div className="h-1 w-24 bg-gradient-to-r from-indigo-900 via-indigo-600 to-indigo-400 rounded-full" />
          <div className="flex justify-between text-[8px] font-bold text-slate-600">
            <span>BAJA</span>
            <span>ALTA</span>
          </div>
        </div>

        {/* Selected Indicator */}
        <AnimatePresence>
          {selected && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="absolute bottom-6 left-6 right-6 bg-[#111114]/90 backdrop-blur-xl text-white p-5 rounded-[28px] shadow-2xl border border-white/10 flex items-center justify-between z-10"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl flex items-center justify-center text-indigo-400">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-base tracking-tight">{selected.label}</h4>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Densidad Electoral Identificada</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-indigo-400">{selected.val}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Ciudadanos</p>
              </div>
              <button 
                onClick={() => setSelected(null)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-white/10 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-all border border-white/10"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
}
