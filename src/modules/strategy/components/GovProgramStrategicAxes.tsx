import React, { useState } from 'react';
import { 
  Layers, 
  Plus, 
  Edit2, 
  Trash2, 
  Target, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  DollarSign, 
  MapPin, 
  Shield, 
  HeartPulse, 
  GraduationCap, 
  Building2, 
  Briefcase, 
  Leaf, 
  Trophy, 
  BarChart3,
  Sparkles,
  ChevronRight,
  FolderOpen,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { 
  GovStrategicAxis, 
  GovProposal, 
  GovProposalPriority 
} from '@/src/types/governmentProgram';

// Icon Map for Strategic Axes
const AXIS_ICONS: Record<string, any> = {
  Target: Target,
  Layers: Layers,
  Shield: Shield,
  HeartPulse: HeartPulse,
  GraduationCap: GraduationCap,
  Building2: Building2,
  Briefcase: Briefcase,
  Leaf: Leaf,
  Trophy: Trophy,
  BarChart3: BarChart3
};

interface GovProgramStrategicAxesProps {
  axes: GovStrategicAxis[];
  selectedAxis: GovStrategicAxis | null;
  proposals: GovProposal[];
  onSelectAxis: (id: string) => void;
  onOpenCreateAxisModal: () => void;
  onOpenEditAxisModal: (axis: GovStrategicAxis) => void;
  onOpenDeleteAxisModal: (axis: GovStrategicAxis) => void;
  onOpenCreateProposalModal: (axisId: string) => void;
  onOpenEditProposalModal: (proposal: GovProposal) => void;
  onOpenDeleteProposalModal: (proposal: GovProposal) => void;
  onOpenImportDiagnosticModal?: () => void;
}

export function GovProgramStrategicAxes({
  axes,
  selectedAxis,
  proposals,
  onSelectAxis,
  onOpenCreateAxisModal,
  onOpenEditAxisModal,
  onOpenDeleteAxisModal,
  onOpenCreateProposalModal,
  onOpenEditProposalModal,
  onOpenDeleteProposalModal,
  onOpenImportDiagnosticModal
}: GovProgramStrategicAxesProps) {

  // Format currency helper
  const formatCurrency = (amount: number | null | undefined, currency = 'COP') => {
    if (amount == null || isNaN(amount)) return 'Presupuesto no registrado';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency || 'COP',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Helper for priority badge
  const renderPriorityBadge = (priority: GovProposalPriority) => {
    switch (priority) {
      case 'CRITICA':
        return (
          <Badge variant="error" className="bg-rose-500/15 text-rose-400 border-rose-500/30 text-[10px] uppercase font-bold py-0.5 px-2.5">
            Prioridad Crítica
          </Badge>
        );
      case 'ALTA':
        return (
          <Badge variant="warning" className="bg-amber-500/15 text-amber-300 border-amber-500/30 text-[10px] uppercase font-bold py-0.5 px-2.5">
            Prioridad Alta
          </Badge>
        );
      case 'MEDIA':
        return (
          <Badge variant="primary" className="bg-indigo-500/15 text-indigo-300 border-indigo-500/30 text-[10px] uppercase font-bold py-0.5 px-2.5">
            Prioridad Media
          </Badge>
        );
      case 'BAJA':
      default:
        return (
          <Badge variant="neutral" className="bg-slate-500/15 text-slate-300 border-slate-500/30 text-[10px] uppercase font-bold py-0.5 px-2.5">
            Prioridad Baja
          </Badge>
        );
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* LEFT COLUMN: List of Strategic Axes (5 cols on lg) */}
      <div className="lg:col-span-4 space-y-4">
        <div className="rounded-[28px] bg-[#111114] border border-white/5 p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Líneas Estratégicas
                </h3>
                <span className="text-[11px] text-slate-500 font-mono">
                  {axes.length} Eje(s) Registrado(s)
                </span>
              </div>
            </div>

            <Button
              size="sm"
              onClick={onOpenCreateAxisModal}
              className="gap-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-1.5 px-3 rounded-xl shadow-lg shadow-indigo-600/20"
            >
              <Plus className="w-3.5 h-3.5" />
              Nuevo Eje
            </Button>
          </div>

          {/* Axes List */}
          {axes.length > 0 ? (
            <div className="space-y-2.5 max-h-[700px] overflow-y-auto pr-1">
              {axes.map((axis, index) => {
                const isSelected = selectedAxis?.id === axis.id;
                const axisProposals = proposals.filter(p => p.axisId === axis.id);
                const IconComponent = AXIS_ICONS[axis.iconName || 'Target'] || Target;

                return (
                  <div
                    key={axis.id}
                    onClick={() => onSelectAxis(axis.id)}
                    className={`group cursor-pointer rounded-2xl p-4 transition-all border text-left relative ${
                      isSelected
                        ? 'bg-gradient-to-r from-indigo-950/40 via-indigo-900/20 to-[#14141c] border-indigo-500/40 shadow-lg shadow-indigo-500/10'
                        : 'bg-white/[0.02] hover:bg-white/[0.04] border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                          style={{
                            backgroundColor: `${axis.color || '#6366f1'}20`,
                            color: axis.color || '#6366f1',
                            borderColor: `${axis.color || '#6366f1'}40`,
                            borderWidth: 1
                          }}
                        >
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                              Eje {index + 1}
                            </span>
                            {axis.category && (
                              <span className="text-[10px] text-slate-500 bg-white/5 px-1.5 py-0.5 rounded">
                                {axis.category}
                              </span>
                            )}
                          </div>
                          <h4 className={`text-sm font-bold leading-snug transition-colors ${
                            isSelected ? 'text-white' : 'text-slate-200 group-hover:text-white'
                          }`}>
                            {axis.name}
                          </h4>
                          {axis.description && (
                            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                              {axis.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right indicator & actions */}
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
                          {axisProposals.length} prop.
                        </span>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenEditAxisModal(axis);
                            }}
                            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                            title="Editar Eje"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenDeleteAxisModal(axis);
                            }}
                            className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Eliminar Eje"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center bg-white/[0.01] rounded-2xl border border-dashed border-white/5 space-y-3">
              <Layers className="w-10 h-10 text-slate-700 mx-auto" />
              <h4 className="text-xs font-bold text-slate-400">No hay líneas estratégicas registradas todavía</h4>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                Cree su primer eje programático para comenzar a estructurar propuestas de gobierno.
              </p>
              <Button
                size="sm"
                onClick={onOpenCreateAxisModal}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Registrar Eje
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Selected Axis Detail & Proposals (7 cols on lg) */}
      <div className="lg:col-span-8 space-y-6">
        {selectedAxis ? (
          <div className="space-y-6">
            {/* Axis Header & Context Information */}
            <div className="rounded-[28px] bg-[#111114] border border-white/5 p-6 shadow-xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="primary" className="bg-indigo-500/10 text-indigo-300 border-indigo-500/20 text-[10px] font-bold py-0.5 px-2">
                      LÍNEA PROGRAMÁTICA
                    </Badge>
                    <span className="text-xs font-mono text-slate-500">
                      Eje {axes.findIndex(a => a.id === selectedAxis.id) + 1} de {axes.length}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    {selectedAxis.name}
                  </h3>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    onClick={() => onOpenEditAxisModal(selectedAxis)}
                    className="gap-1.5 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-semibold px-3 py-1.5 rounded-xl"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-indigo-400" />
                    Editar Eje
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => onOpenDeleteAxisModal(selectedAxis)}
                    className="gap-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-semibold px-3 py-1.5 rounded-xl"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Eliminar
                  </Button>
                </div>
              </div>

              {/* Problem and Objective Blocks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. PROBLEMA DIAGNOSTICADO */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                  <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    PROBLEMA DIAGNOSTICADO
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedAxis.diagnosedProblem || (
                      <span className="text-slate-500 italic">
                        No se ha registrado un diagnóstico específico para este eje. Puede editar el eje para detallar la problemática.
                      </span>
                    )}
                  </p>
                </div>

                {/* 2. OBJETIVO GENERAL DEL EJE */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                    <Target className="w-3.5 h-3.5" />
                    OBJETIVO GENERAL DEL EJE
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedAxis.generalObjective || (
                      <span className="text-slate-500 italic">
                        No se ha registrado un objetivo general para este eje.
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Proposals Section Header */}
            <div className="rounded-[28px] bg-[#111114] border border-white/5 p-6 shadow-xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-white/5">
                <div>
                  <h4 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Target className="w-4 h-4 text-cyan-400" />
                    PROYECTOS Y PROPUESTAS CONCRETAS
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    Iniciativas estructuradas con indicadores, metas y presupuesto asignado a este eje.
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  {onOpenImportDiagnosticModal && (
                    <Button
                      size="sm"
                      onClick={onOpenImportDiagnosticModal}
                      className="gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 text-xs font-semibold py-2 px-3 rounded-xl"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      Insumos Diagnóstico
                    </Button>
                  )}

                  <Button
                    size="sm"
                    onClick={() => onOpenCreateProposalModal(selectedAxis.id)}
                    className="gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-lg shadow-cyan-600/20"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Agregar Propuesta
                  </Button>
                </div>
              </div>

              {/* Proposals Cards List */}
              {proposals.filter(p => p.axisId === selectedAxis.id).length > 0 ? (
                <div className="space-y-4">
                  {proposals
                    .filter(p => p.axisId === selectedAxis.id)
                    .map((proposal, pIndex) => (
                      <div
                        key={proposal.id}
                        className="rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-white/10 p-5 transition-all space-y-4"
                      >
                        {/* Top: Project Code, Priority, Actions */}
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <span className="text-xs font-mono font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2.5 py-0.5 rounded-lg">
                              {proposal.code || `PROP-${pIndex + 1}`}
                            </span>
                            {renderPriorityBadge(proposal.priority)}
                            {proposal.territoryScope && (
                              <span className="text-[11px] text-slate-400 bg-white/5 border border-white/5 px-2 py-0.5 rounded-md flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-emerald-400" />
                                {proposal.territoryScope}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => onOpenEditProposalModal(proposal)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                              title="Editar Propuesta"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onOpenDeleteProposalModal(proposal)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                              title="Eliminar Propuesta"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Title & Description */}
                        <div className="space-y-1.5">
                          <h5 className="text-base font-bold text-white leading-snug">
                            {proposal.title}
                          </h5>
                          {proposal.description && (
                            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                              {proposal.description}
                            </p>
                          )}
                        </div>

                        {/* Related Problem if exists */}
                        {proposal.relatedProblem && (
                          <div className="p-2.5 bg-rose-500/5 border border-rose-500/10 rounded-xl text-xs text-rose-300">
                            <span className="font-bold text-rose-400 block mb-0.5">Problema que atiende:</span>
                            {proposal.relatedProblem}
                          </div>
                        )}

                        {/* Quantitative Metrics Grid: Indicador, Línea Base -> Meta, Presupuesto */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-white/5">
                          {/* 1. INDICADOR DE IMPACTO */}
                          <div className="bg-black/20 rounded-xl p-3 border border-white/5 space-y-1">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                              <BarChart3 className="w-3 h-3 text-cyan-400" />
                              Indicador de Impacto
                            </span>
                            <p className="text-xs font-semibold text-white truncate">
                              {proposal.indicatorName || 'Sin indicador asociado'}
                            </p>
                            {proposal.indicatorUnit && (
                              <span className="text-[10px] text-slate-400">
                                Unidad: {proposal.indicatorUnit}
                              </span>
                            )}
                          </div>

                          {/* 2. LÍNEA BASE → META */}
                          <div className="bg-black/20 rounded-xl p-3 border border-white/5 space-y-1">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                              <TrendingUp className="w-3 h-3 text-emerald-400" />
                              Línea Base → Meta
                            </span>
                            <div className="flex items-center gap-2 text-xs font-semibold">
                              {proposal.baselineValue != null || proposal.targetValue != null ? (
                                <>
                                  <span className="text-slate-400">
                                    {proposal.baselineValue ?? 'S/D'} {proposal.indicatorUnit || ''}
                                  </span>
                                  <ArrowRight className="w-3 h-3 text-emerald-400" />
                                  <span className="text-emerald-400 font-bold font-mono">
                                    {proposal.targetValue ?? 'S/D'} {proposal.indicatorUnit || ''}
                                  </span>
                                </>
                              ) : (
                                <span className="text-slate-500 italic">Sin información disponible</span>
                              )}
                            </div>
                            {proposal.timeframe && (
                              <span className="text-[10px] text-slate-400 block">
                                Plazo: {proposal.timeframe}
                              </span>
                            )}
                          </div>

                          {/* 3. PRESUPUESTO ESTIMADO */}
                          <div className="bg-black/20 rounded-xl p-3 border border-white/5 space-y-1">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                              <DollarSign className="w-3 h-3 text-amber-400" />
                              Presupuesto Estimado
                            </span>
                            <p className="text-xs font-bold text-white font-mono">
                              {formatCurrency(proposal.estimatedBudget, proposal.currency)}
                            </p>
                            {proposal.fundingSource && (
                              <span className="text-[10px] text-slate-400 truncate block">
                                Fuente: {proposal.fundingSource}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="p-10 text-center bg-white/[0.01] rounded-2xl border border-dashed border-white/5 space-y-3">
                  <Target className="w-10 h-10 text-slate-700 mx-auto" />
                  <h4 className="text-xs font-bold text-slate-400">No hay propuestas registradas para este eje</h4>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    Formule iniciativas programáticas concretas, establezca sus metas e indicadores para este eje estratégico.
                  </p>
                  <Button
                    size="sm"
                    onClick={() => onOpenCreateProposalModal(selectedAxis.id)}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Registrar Primera Propuesta
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-12 text-center bg-white/[0.01] rounded-[28px] border border-dashed border-white/5 space-y-3">
            <Layers className="w-12 h-12 text-slate-700 mx-auto" />
            <h4 className="text-base font-bold text-slate-400">Seleccione o cree una línea estratégica</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Seleccione uno de los ejes del panel lateral izquierdo para ver su detalle o use el botón "Nuevo Eje" para comenzar.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
