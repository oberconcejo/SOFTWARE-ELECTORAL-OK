import React, { useState } from 'react';
import { 
  BarChart3, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Layers, 
  Check 
} from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { SurveySyncState } from '@/src/types/territorialDiagnostic';

interface SurveySyncBannerProps {
  syncState: SurveySyncState;
  onSync: () => Promise<SurveySyncState>;
}

export function SurveySyncBanner({ syncState, onSync }: SurveySyncBannerProps) {
  const [syncing, setSyncing] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const handleSync = async () => {
    setSyncing(true);
    setFeedback(null);
    try {
      const result = await onSync();
      if (result.status === 'SYNCED') {
        setFeedback({
          text: `Sincronización exitosa: ${result.connectedSurveysCount} sondeo(s) de opinión vinculados al diagnóstico territorial.`,
          type: 'success'
        });
      } else if (result.status === 'NO_SURVEYS') {
        setFeedback({
          text: 'Sondeos de opinión no disponibles. No se detectaron encuestas activas registradas en el sistema.',
          type: 'info'
        });
      } else {
        setFeedback({
          text: result.message || 'No fue posible sincronizar los sondeos. Intenta nuevamente.',
          type: 'error'
        });
      }
    } catch (err: any) {
      setFeedback({
        text: 'No fue posible sincronizar los sondeos. Intenta nuevamente.',
        type: 'error'
      });
    } finally {
      setSyncing(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'No registrado';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('es-CO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-4">
      {/* Main Sectorial Title and Description */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 bg-gradient-to-r from-indigo-950/40 via-[#121324] to-[#111114] rounded-3xl border border-indigo-500/20 shadow-lg">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-widest">
            <Layers className="w-4 h-4" />
            <span>Bloque 1 • Insumo Programático</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Diagnóstico Territorial Sectorial (Insumo Programático)
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Evaluación multidimensional por sectores temáticos, alimentada de los sondeos de opinión del sistema para construir el Programa de Gobierno.
          </p>
        </div>

        {/* Sync Controls Box */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-black/40 p-4 rounded-2xl border border-white/10 shrink-0">
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Estado de Sondeos:</span>
              {syncState.connectedSurveysCount > 0 ? (
                <Badge variant="primary" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] py-0.5 px-2">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  {syncState.connectedSurveysCount} Sondeo(s) Activo(s)
                </Badge>
              ) : (
                <Badge variant="neutral" className="bg-white/5 text-slate-400 border-white/10 text-[10px] py-0.5 px-2">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Sondeos no disponibles
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
              <Clock className="w-3.5 h-3.5" />
              <span>Última sinc.: {formatDate(syncState.lastSyncDate)}</span>
            </div>
          </div>

          <Button
            size="sm"
            onClick={handleSync}
            disabled={syncing}
            className="gap-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md shadow-indigo-600/20 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Sincronizando...' : 'Sincronizar Sondeos de Opinión'}
          </Button>
        </div>
      </div>

      {/* Sync Feedback Toast if any */}
      {feedback && (
        <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs font-medium animate-in fade-in ${
          feedback.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' 
            : feedback.type === 'error'
            ? 'bg-rose-500/10 border-rose-500/20 text-rose-300'
            : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300'
        }`}>
          <div className="flex items-center gap-2.5">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button 
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-white text-xs px-2 py-0.5 rounded-lg bg-black/20"
          >
            Cerrar
          </button>
        </div>
      )}
    </div>
  );
}
