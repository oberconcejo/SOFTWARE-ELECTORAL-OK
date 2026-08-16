import React from 'react';
import { 
  FileText, 
  Edit3, 
  Eye, 
  Calendar, 
  MapPin, 
  User, 
  Layers, 
  Target, 
  ShieldCheck, 
  TrendingUp,
  Award,
  Clock,
  Sparkles
} from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { GovProgramInfo, GovProgramStats } from '@/src/types/governmentProgram';

interface GovProgramGeneralInfoProps {
  programInfo: GovProgramInfo;
  stats: GovProgramStats;
  onEditGeneralInfo: () => void;
  onOpenPreview: () => void;
}

export function GovProgramGeneralInfo({
  programInfo,
  stats,
  onEditGeneralInfo,
  onOpenPreview
}: GovProgramGeneralInfoProps) {
  // Helper for document status badge
  const renderStatusBadge = () => {
    switch (programInfo.status) {
      case 'FINALIZADO':
        return (
          <Badge variant="success" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs font-bold py-1 px-3">
            Finalizado
          </Badge>
        );
      case 'REVISADO':
        return (
          <Badge variant="primary" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-xs font-bold py-1 px-3">
            Revisado
          </Badge>
        );
      case 'EN_ELABORACION':
        return (
          <Badge variant="warning" className="bg-amber-500/10 text-amber-300 border-amber-500/20 text-xs font-bold py-1 px-3">
            En elaboración
          </Badge>
        );
      case 'BORRADOR':
      default:
        return (
          <Badge variant="neutral" className="bg-slate-500/15 text-slate-300 border-slate-500/30 text-xs font-bold py-1 px-3">
            Borrador
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Header & Information Card */}
      <div className="rounded-[32px] bg-[#111114] border border-white/5 p-7 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-6 border-b border-white/5">
          {/* Title and identification */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-2xl font-bold text-white tracking-tight">
                    {programInfo.title || 'Programa de Gobierno'}
                  </h2>
                  {renderStatusBadge()}
                </div>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Instrumento programático vinculante para el período constitucional y voto programático.
                </p>
              </div>
            </div>

            {/* Slogan if present */}
            {programInfo.slogan && (
              <div className="inline-block text-xs italic text-indigo-300 bg-indigo-500/5 px-3 py-1 rounded-lg border border-indigo-500/10">
                "{programInfo.slogan}"
              </div>
            )}

            {/* Key Meta attributes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <User className="w-3 h-3 text-indigo-400" /> Candidato
                </span>
                <p className="text-xs font-semibold text-white truncate">
                  {programInfo.candidateName || 'No registrado'}
                </p>
              </div>

              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-400" /> Entidad Territorial
                </span>
                <p className="text-xs font-semibold text-white truncate">
                  {programInfo.territory || 'No registrada'}
                </p>
              </div>

              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-cyan-400" /> Período
                </span>
                <p className="text-xs font-semibold text-white">
                  {programInfo.period || 'No definido'}
                </p>
              </div>

              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400" /> Fecha Límite CNE
                </span>
                <p className="text-xs font-semibold text-white truncate">
                  {programInfo.legalDeadline || 'No fijada'}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
            <Button
              size="sm"
              onClick={onEditGeneralInfo}
              className="gap-2 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-semibold px-4 py-2.5 rounded-xl"
            >
              <Edit3 className="w-4 h-4 text-indigo-400" />
              Editar Datos Generales
            </Button>

            <Button
              size="sm"
              onClick={onOpenPreview}
              className="gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20"
            >
              <Eye className="w-4 h-4" />
              Vista Previa & Exportar
            </Button>
          </div>
        </div>

        {/* 4 Summary Key Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
          {/* 1. Líneas Estratégicas */}
          <div className="bg-white/[0.02] hover:bg-white/[0.04] transition-colors border border-white/5 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Líneas Estratégicas
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white font-mono">
                  {stats.strategicAxesCount}
                </span>
                <span className="text-xs text-slate-500">eje(s)</span>
              </div>
            </div>
          </div>

          {/* 2. Proyectos y Propuestas */}
          <div className="bg-white/[0.02] hover:bg-white/[0.04] transition-colors border border-white/5 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Proyectos / Propuestas
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white font-mono">
                  {stats.proposalsCount}
                </span>
                <span className="text-xs text-slate-500">propuesta(s)</span>
              </div>
            </div>
          </div>

          {/* 3. Requisitos Legales CNE */}
          <div className="bg-white/[0.02] hover:bg-white/[0.04] transition-colors border border-white/5 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Requisitos Legales CNE
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white font-mono">
                  {stats.legalCompliancePercentage}%
                </span>
                <span className="text-xs text-emerald-400">conformidad</span>
              </div>
            </div>
          </div>

          {/* 4. Avance de Redacción */}
          <div className="bg-white/[0.02] hover:bg-white/[0.04] transition-colors border border-white/5 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Avance de Redacción
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white font-mono">
                  {stats.draftingProgressPercentage}%
                </span>
                <span className="text-xs text-slate-500">completado</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
