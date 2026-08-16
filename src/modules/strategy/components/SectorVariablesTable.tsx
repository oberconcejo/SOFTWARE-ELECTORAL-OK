import React, { useState } from 'react';
import { 
  Target, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  BarChart3, 
  TrendingUp,
  FileText,
  MessageSquareQuote
} from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { 
  ThematicSector, 
  SectorVariable, 
  VariableStatus 
} from '@/src/types/territorialDiagnostic';
import { VariableModal, DeleteConfirmModal } from './DiagnosticModals';

interface SectorVariablesTableProps {
  sector: ThematicSector | null;
  variables: SectorVariable[];
  onCreateVariable: (data: any) => Promise<any>;
  onUpdateVariable: (id: string, data: any) => Promise<void>;
  onDeleteVariable: (id: string) => Promise<void>;
}

export function SectorVariablesTable({
  sector,
  variables,
  onCreateVariable,
  onUpdateVariable,
  onDeleteVariable
}: SectorVariablesTableProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingVariable, setEditingVariable] = useState<SectorVariable | null>(null);
  const [deletingVariable, setDeletingVariable] = useState<SectorVariable | null>(null);

  if (!sector) {
    return (
      <div className="p-8 text-center bg-[#111114] rounded-2xl border border-white/5 space-y-2">
        <Target className="w-8 h-8 text-slate-600 mx-auto" />
        <h4 className="text-sm font-bold text-slate-300">Ningún sector seleccionado</h4>
        <p className="text-xs text-slate-500">
          Selecciona o crea un sector temático para consultar y gestionar sus variables e indicadores.
        </p>
      </div>
    );
  }

  const getStatusBadge = (status: VariableStatus) => {
    switch (status) {
      case 'EN_META':
        return <Badge variant="primary" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">En Meta</Badge>;
      case 'LINEA_BASE_DEFINIDA':
        return <Badge variant="primary" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-[10px]">Línea Base Definida</Badge>;
      case 'CRITICO':
        return <Badge variant="error" className="bg-rose-500/10 text-rose-400 border-rose-500/20 text-[10px]">Estado Crítico</Badge>;
      case 'SIN_INFORMACION':
        return <Badge variant="neutral" className="bg-white/5 text-slate-400 border-white/10 text-[10px]">Sin Información</Badge>;
      case 'EN_DIAGNOSTICO':
      default:
        return <Badge variant="warning" className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px]">En Diagnóstico</Badge>;
    }
  };

  return (
    <div className="space-y-4 pt-2">
      {/* Subheader with Sector Name and Add Variable Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div 
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border"
            style={{
              backgroundColor: `${sector.color || '#6366f1'}20`,
              borderColor: `${sector.color || '#6366f1'}40`,
              color: sector.color || '#6366f1'
            }}
          >
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Variables e Indicadores:</span>
              <span className="text-indigo-400">{sector.name}</span>
            </h4>
            <p className="text-xs text-slate-500">
              {variables.length} {variables.length === 1 ? 'variable registrada' : 'variables registradas'}
            </p>
          </div>
        </div>

        <Button
          size="sm"
          onClick={() => setIsAddOpen(true)}
          className="gap-2 bg-cyan-600 hover:bg-cyan-500 text-xs font-bold text-white shadow-md shadow-cyan-600/20 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Agregar Variable
        </Button>
      </div>

      {/* Variables List / Cards */}
      {variables.length > 0 ? (
        <div className="grid grid-cols-1 gap-3.5">
          {variables.map((variable) => {
            const hasBaseline = variable.baselineValue !== undefined && variable.baselineValue !== null && variable.baselineValue !== '';
            const hasTarget = variable.targetValue !== undefined && variable.targetValue !== null && variable.targetValue !== '';

            return (
              <div
                key={variable.id}
                className="group p-5 rounded-2xl bg-[#111114] border border-white/5 hover:border-white/15 transition-all space-y-4"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Left: Variable Info */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h5 className="font-bold text-white text-base tracking-tight">
                        {variable.name}
                      </h5>
                      {getStatusBadge(variable.status)}
                    </div>

                    {variable.indicatorName && (
                      <p className="text-xs text-cyan-400 font-semibold flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>Indicador: {variable.indicatorName}</span>
                        {variable.unit && (
                          <span className="text-slate-500 font-normal">({variable.unit})</span>
                        )}
                      </p>
                    )}

                    {variable.description && (
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {variable.description}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end lg:self-start">
                    <button
                      type="button"
                      onClick={() => setEditingVariable(variable)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                      title="Editar Variable"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingVariable(variable)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Eliminar Variable"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Metrics Row: Línea Base, Meta, Fuente */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-white/5">
                  {/* Línea Base */}
                  <div className="p-3 bg-black/30 rounded-xl border border-white/5">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-amber-400/90 mb-1">
                      Línea Base
                    </span>
                    {hasBaseline ? (
                      <span className="text-sm font-bold text-white">
                        {variable.baselineValue} {variable.unit || ''}
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-slate-500 italic">
                        Sin información disponible
                      </span>
                    )}
                  </div>

                  {/* Meta */}
                  <div className="p-3 bg-black/30 rounded-xl border border-white/5">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-emerald-400/90 mb-1">
                      Meta Programática
                    </span>
                    {hasTarget ? (
                      <span className="text-sm font-bold text-white">
                        {variable.targetValue} {variable.unit || ''}
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-slate-500 italic">
                        Sin información disponible
                      </span>
                    )}
                  </div>

                  {/* Fuente */}
                  <div className="p-3 bg-black/30 rounded-xl border border-white/5">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Fuente Oficial
                    </span>
                    {variable.source ? (
                      <span className="text-xs font-semibold text-slate-300 line-clamp-1">
                        {variable.source}
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-slate-500 italic">
                        Sin información disponible
                      </span>
                    )}
                  </div>
                </div>

                {/* Insumo de Sondeo de Opinión */}
                <div className="p-3 bg-indigo-950/20 rounded-xl border border-indigo-500/10 text-xs">
                  <div className="flex items-center gap-1.5 text-indigo-400 font-bold mb-1">
                    <MessageSquareQuote className="w-3.5 h-3.5" />
                    <span>Insumo de Sondeo de Opinión</span>
                  </div>
                  {variable.surveyFinding ? (
                    <p className="text-slate-300 leading-relaxed italic">
                      "{variable.surveyFinding}"
                    </p>
                  ) : (
                    <p className="text-slate-500 italic">
                      Sin resultados de sondeos disponibles para esta variable.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-8 text-center bg-white/[0.01] rounded-2xl border border-dashed border-white/10 space-y-2.5">
          <Target className="w-8 h-8 text-slate-600 mx-auto" />
          <h4 className="text-sm font-bold text-slate-300">No hay variables disponibles para este sector</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Registra indicadores y variables clave para estructurar las metas y diagnósticos del sector.
          </p>
          <Button
            size="sm"
            onClick={() => setIsAddOpen(true)}
            className="gap-2 bg-cyan-600 hover:bg-cyan-500 text-xs font-bold text-white shadow-md shadow-cyan-600/20"
          >
            <Plus className="w-4 h-4" /> Agregar Primera Variable
          </Button>
        </div>
      )}

      {/* Modal: Agregar Variable */}
      <VariableModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSave={onCreateVariable}
        sector={sector}
      />

      {/* Modal: Editar Variable */}
      <VariableModal
        isOpen={!!editingVariable}
        onClose={() => setEditingVariable(null)}
        onSave={async (data) => {
          if (editingVariable) {
            await onUpdateVariable(editingVariable.id, data);
          }
        }}
        sector={sector}
        initialData={editingVariable}
      />

      {/* Modal: Confirmar Eliminación */}
      <DeleteConfirmModal
        isOpen={!!deletingVariable}
        onClose={() => setDeletingVariable(null)}
        onConfirm={async () => {
          if (deletingVariable) {
            await onDeleteVariable(deletingVariable.id);
          }
        }}
        title="¿Eliminar Variable?"
        message={`Estás a punto de eliminar la variable "${deletingVariable?.name}". Esta acción no se puede deshacer.`}
      />
    </div>
  );
}
