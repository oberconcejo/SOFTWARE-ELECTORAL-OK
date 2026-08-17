import React, { useState } from 'react';
import { 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
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

  return (
    <div className="space-y-3">
      {/* Top Action Bar with Sync Button */}
      <div className="flex items-center justify-end">
        <Button
          size="sm"
          onClick={handleSync}
          disabled={syncing}
          className="h-9 px-4 gap-2 bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white rounded-xl shadow-md shadow-purple-600/20 transition-all shrink-0 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Sincronizando...' : 'Sincronizar Sondeos de Opinión'}
        </Button>
      </div>

      {/* Sync Feedback Toast if any */}
      {feedback && (
        <div className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs font-medium animate-in fade-in ${
          feedback.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' 
            : feedback.type === 'error'
            ? 'bg-rose-500/10 border-rose-500/20 text-rose-300'
            : 'bg-purple-500/10 border-purple-500/20 text-purple-300'
        }`}>
          <div className="flex items-center gap-2">
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
