import React from 'react';
import { 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  MapPin, 
  Flag, 
  Clock,
  Sparkles
} from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { GovProgramInfo } from '@/src/types/governmentProgram';

interface GovProgramSyncBannerProps {
  programInfo: GovProgramInfo;
  isSyncing: boolean;
  syncStatus: 'IDLE' | 'SYNCED' | 'ERROR';
  syncMessage: string | null;
  onSync: () => Promise<void>;
}

export function GovProgramSyncBanner({
  programInfo,
  isSyncing,
  syncStatus,
  syncMessage,
  onSync
}: GovProgramSyncBannerProps) {
  const isSynchronized = Boolean(programInfo.lastSyncDate);

  const formattedDate = programInfo.lastSyncDate 
    ? new Date(programInfo.lastSyncDate).toLocaleDateString('es-CO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : null;

  return (
    <div className="rounded-3xl bg-gradient-to-r from-[#141419] via-[#121216] to-[#141419] border border-white/10 p-5 shadow-2xl relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-80 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
        {/* Left Side: Status & Sync details */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            {isSynchronized ? (
              <Badge variant="success" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs font-semibold py-1 px-3">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                Sincronizado con Gestión Estratégica & Perfil del Candidato
              </Badge>
            ) : (
              <Badge variant="neutral" className="bg-amber-500/10 text-amber-300 border-amber-500/20 text-xs font-semibold py-1 px-3">
                <AlertCircle className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                Sincronización pendiente
              </Badge>
            )}

            {formattedDate && (
              <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                <Clock className="w-3 h-3 text-slate-500" />
                Última sincronización: {formattedDate}
              </span>
            )}
          </div>

          <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
            Estructuración formal del Programa de Gobierno articulada con el diagnóstico territorial sectorial, problemáticas micro-locales y el perfil electoral.
          </p>

          {/* Contextual Pills */}
          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
            <div className="flex items-center gap-1.5 text-slate-300 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-slate-400">Candidato:</span>
              <span className="font-semibold text-white">
                {programInfo.candidateName || 'Sin candidato registrado'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-300 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-400">Territorio:</span>
              <span className="font-semibold text-white">
                {programInfo.territory || 'Sin territorio definido'}
              </span>
            </div>

            {programInfo.partyCoalition && (
              <div className="flex items-center gap-1.5 text-slate-300 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                <Flag className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-slate-400">Aval / Partido:</span>
                <span className="font-semibold text-white">
                  {programInfo.partyCoalition}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Re-sync Action Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <Button
            onClick={onSync}
            disabled={isSyncing}
            size="sm"
            className="gap-2 bg-indigo-600/90 hover:bg-indigo-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-lg shadow-indigo-500/20 transition-all border border-indigo-400/20"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Sincronizando...' : 'Re-sincronizar Datos'}
          </Button>
        </div>
      </div>

      {/* Sync Message Alert if available */}
      {syncMessage && (
        <div className={`mt-3 p-3 rounded-xl border text-xs font-medium flex items-center gap-2 ${
          syncStatus === 'ERROR' 
            ? 'bg-rose-500/10 border-rose-500/20 text-rose-300' 
            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
        }`}>
          {syncStatus === 'ERROR' ? (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          )}
          <span>{syncMessage}</span>
        </div>
      )}
    </div>
  );
}
