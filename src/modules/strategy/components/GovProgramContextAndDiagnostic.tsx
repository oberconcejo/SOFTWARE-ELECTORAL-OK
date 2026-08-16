import React, { useState } from 'react';
import { 
  BookOpen, 
  MapPin, 
  Edit3, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Layers, 
  AlertCircle,
  FileCheck,
  Building2,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { GovProgramInfo } from '@/src/types/governmentProgram';
import { MicroLocalFiche, ThematicSector } from '@/src/types/territorialDiagnostic';

interface GovProgramContextAndDiagnosticProps {
  programInfo: GovProgramInfo;
  onEditHistoricalContext: () => void;
  onEditDiagnosticSummary: () => void;
  onOpenDiagnosticImportModal?: () => void;
  linkedFichesCount?: number;
}

export function GovProgramContextAndDiagnostic({
  programInfo,
  onEditHistoricalContext,
  onEditDiagnosticSummary,
  onOpenDiagnosticImportModal,
  linkedFichesCount = 0
}: GovProgramContextAndDiagnosticProps) {
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(true);
  const [isDiagnosticExpanded, setIsDiagnosticExpanded] = useState(true);

  const hasHistoricalContext = Boolean(programInfo.historicalContext && programInfo.historicalContext.trim().length > 0);
  const hasDiagnosticSummary = Boolean(programInfo.diagnosticSummary && programInfo.diagnosticSummary.trim().length > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Reseña Histórica de la Entidad Territorial */}
      <div className="rounded-[28px] bg-[#111114] border border-white/5 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Reseña Histórica de la Entidad Territorial
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Contexto histórico, vocación socioeconómica y caracterización del territorio
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={onEditHistoricalContext}
              className="gap-1.5 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-[11px] font-semibold py-1.5 px-3 rounded-lg"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-400" />
              Editar Contexto
            </Button>
            <button
              onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5"
            >
              {isHistoryExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {isHistoryExpanded && (
          <div>
            {hasHistoricalContext ? (
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                  {programInfo.historicalContext}
                </p>
              </div>
            ) : (
              <div className="p-6 text-center bg-white/[0.01] rounded-2xl border border-dashed border-white/5 space-y-2">
                <BookOpen className="w-8 h-8 text-slate-700 mx-auto" />
                <h4 className="text-xs font-bold text-slate-400">No hay reseña histórica registrada</h4>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                  Incorpore la caracterización histórica y geográfica del municipio o departamento para fundamentar el documento.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Resumen del Diagnóstico Territorial */}
      <div className="rounded-[28px] bg-[#111114] border border-white/5 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Resumen del Diagnóstico Territorial
                </h3>
                {linkedFichesCount > 0 && (
                  <Badge variant="success" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] py-0.5 px-2">
                    {linkedFichesCount} Insumos vinculados
                  </Badge>
                )}
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Insumo programático originado en el módulo de Diagnóstico Territorial
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={onEditDiagnosticSummary}
              className="gap-1.5 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-[11px] font-semibold py-1.5 px-3 rounded-lg"
            >
              <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
              Editar Diagnóstico
            </Button>
            <button
              onClick={() => setIsDiagnosticExpanded(!isDiagnosticExpanded)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5"
            >
              {isDiagnosticExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {isDiagnosticExpanded && (
          <div className="space-y-3">
            {hasDiagnosticSummary ? (
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                  {programInfo.diagnosticSummary}
                </p>
              </div>
            ) : (
              <div className="p-6 text-center bg-white/[0.01] rounded-2xl border border-dashed border-white/5 space-y-2">
                <MapPin className="w-8 h-8 text-slate-700 mx-auto" />
                <h4 className="text-xs font-bold text-slate-400">No hay diagnóstico territorial disponible</h4>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                  Sincronice o redacte las principales brechas, problemáticas y líneas base identificadas en el territorio.
                </p>
              </div>
            )}

            {onOpenDiagnosticImportModal && (
              <div className="flex items-center justify-between p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                <div className="flex items-center gap-2 text-xs text-emerald-300">
                  <Layers className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>Vincular problemáticas de fichas comunales/corregimentales a este programa</span>
                </div>
                <button
                  onClick={onOpenDiagnosticImportModal}
                  className="text-xs font-bold text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1 shrink-0 ml-2"
                >
                  Explorar Fichas <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
