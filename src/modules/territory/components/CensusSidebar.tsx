import React from 'react';
import { 
  Users, 
  UserCheck, 
  Search, 
  Filter, 
  PieChart, 
  MapPin,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { Card } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Badge';
import { ProgressBar } from '@/src/components/ui/ProgressBar';
import { useVoters } from '@/src/hooks/useVoters';
import { useTerritory } from '@/src/hooks/useTerritory';

export const CensusSidebar: React.FC = () => {
  const { voters, loading: loadingVoters } = useVoters();
  const { zones, loading: loadingZones } = useTerritory();

  const verifiedVoters = voters.filter(v => v.intencion === 'Voto Seguro').length;
  const coveragePercent = voters.length > 0 ? (verifiedVoters / voters.length) * 100 : 0;

  if (loadingVoters || loadingZones) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-500">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
        <p className="text-[10px] font-bold uppercase tracking-widest">Sincronizando Censo...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-6 overflow-y-auto no-scrollbar pr-2 pb-10">
      {/* Search & Filter Header */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Buscar en el censo..." 
            className="w-full bg-[#111114] border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all"
          />
        </div>
        <div className="flex gap-2">
          <Badge variant="primary" className="cursor-pointer hover:bg-indigo-500 transition-colors">
            Todos ({voters.length})
          </Badge>
          <Badge variant="neutral" className="cursor-pointer hover:bg-white/10 transition-colors bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
            Seguros ({verifiedVoters})
          </Badge>
        </div>
      </div>

      {/* Territorial Coverage */}
      <Card title="Cobertura de Censo" className="bg-indigo-600/5 border-indigo-500/10 p-5">
        <div className="space-y-4 pt-2">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-2xl font-bold text-white">{voters.length.toLocaleString()}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Votantes Identificados</p>
            </div>
            <Badge variant="success">Real</Badge>
          </div>
          <ProgressBar value={coveragePercent} color="indigo" size="sm" label="Efectividad de Verificación" showValue />
        </div>
      </Card>

      {/* Mini Voter Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Registros Recientes</h4>
          <button className="text-[10px] text-indigo-400 font-bold hover:underline">Ver Todos</button>
        </div>
        <div className="space-y-2">
          {voters.slice(0, 5).map((voter, i) => (
            <div key={voter.id} className="flex items-center justify-between p-3 rounded-2xl bg-[#111114] border border-white/5 hover:border-white/10 transition-colors group cursor-pointer shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center font-bold text-xs uppercase">
                  {voter.nombre.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-white leading-tight">{voter.nombre}</p>
                  <p className="text-[10px] text-slate-500 flex items-center gap-1">
                    <MapPin className="w-2.5 h-2.5" /> {voter.comuna || 'Sin Comuna'}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition-colors" />
            </div>
          ))}
          {voters.length === 0 && (
            <div className="p-8 text-center bg-white/[0.01] rounded-2xl border border-dashed border-white/5">
              <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Sin registros</p>
            </div>
          )}
        </div>
      </div>

      {/* Zone Coverage mini list */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Zonas Críticas</h4>
        <div className="space-y-3">
          {zones.slice(0, 3).map(zone => (
            <div key={zone.id} className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-slate-400 uppercase">{zone.nombre}</span>
                <span className="text-white">{zone.cobertura}%</span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500" 
                  style={{ width: `${zone.cobertura}%` }} 
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
