import React, { useState } from 'react';
import { Calendar, AlertCircle, RefreshCw } from 'lucide-react';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';

export interface AgendaCalendarSectionProps {
  initialLoading?: boolean;
}

export const AgendaCalendarSection: React.FC<AgendaCalendarSectionProps> = ({
  initialLoading = false,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(initialLoading);
  const [error, setError] = useState<string | null>(null);

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    // Controlled check without fabricating backend calls
    setTimeout(() => {
      setIsLoading(false);
      // Stays in clean empty state as no real events are scheduled yet
    }, 400);
  };

  return (
    <Card 
      id="agenda-calendar-main-card"
      className="rounded-[32px] bg-[#0e0f18]/95 border-white/5 p-6 md:p-8 lg:p-10 shadow-2xl backdrop-blur-md"
    >
      {/* Header Container */}
      <div 
        id="agenda-calendar-header"
        className="flex items-center gap-3.5 mb-8"
      >
        <div 
          id="agenda-calendar-icon-box"
          className="w-11 h-11 rounded-2xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0 shadow-inner"
        >
          <Calendar className="w-5 h-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Agenda & Calendario
          </h2>
          <p className="text-xs md:text-sm text-slate-400 font-normal mt-0.5">
            Hitos de campaña, debates, giras y fechas electorales estratégicas
          </p>
        </div>
      </div>

      {/* Main Body Area: Loading, Error, or Empty State */}
      {isLoading ? (
        <div 
          id="agenda-calendar-loading-state"
          className="rounded-[28px] bg-[#090a10]/60 border border-white/[0.04] p-12 md:p-20 flex flex-col items-center justify-center text-center min-h-[380px] animate-pulse space-y-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400">
            <RefreshCw className="w-6 h-6 animate-spin text-purple-400/80" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-48 bg-white/10 rounded-md mx-auto" />
            <div className="h-3 w-72 bg-white/5 rounded-md mx-auto" />
          </div>
        </div>
      ) : error ? (
        <div 
          id="agenda-calendar-error-state"
          className="rounded-[28px] bg-rose-950/20 border border-rose-500/20 p-12 md:p-16 flex flex-col items-center justify-center text-center min-h-[380px] space-y-4"
        >
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-white">
              No fue posible cargar la agenda.
            </h3>
            <p className="text-xs text-slate-400">
              Verifica tu conexión e inténtalo nuevamente.
            </p>
          </div>
          <Button
            id="agenda-calendar-retry-btn"
            onClick={handleRetry}
            size="sm"
            className="mt-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-xl px-5 py-2.5 shadow-lg shadow-purple-600/20"
          >
            Reintentar
          </Button>
        </div>
      ) : (
        /* Real Controlled Empty State replicating the visual reference */
        <div 
          id="agenda-calendar-empty-state"
          className="rounded-[28px] bg-[#090a10]/60 border border-white/[0.04] p-12 md:p-20 flex flex-col items-center justify-center text-center min-h-[380px] space-y-3"
        >
          <div 
            id="agenda-calendar-empty-icon"
            className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center text-slate-600 mb-2"
          >
            <Calendar className="w-12 h-12 md:w-14 md:h-14 stroke-[1.25]" aria-hidden="true" />
          </div>
          <h3 className="text-lg md:text-xl font-bold text-slate-300 tracking-tight">
            No hay información disponible todavía
          </h3>
          <p className="text-xs md:text-sm text-slate-500 max-w-md md:max-w-lg mx-auto leading-relaxed">
            Aún no se han programado eventos o hitos en el calendario estratégico de campaña.
          </p>
        </div>
      )}
    </Card>
  );
};
