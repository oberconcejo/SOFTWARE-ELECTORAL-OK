import React from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Scale, 
  HelpCircle, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { Badge } from '@/src/components/ui/Badge';
import { GovLegalRequirement } from '@/src/types/governmentProgram';

interface GovProgramLegalMatrixProps {
  requirements: GovLegalRequirement[];
  legalCompliancePercentage: number;
}

export function GovProgramLegalMatrix({
  requirements,
  legalCompliancePercentage
}: GovProgramLegalMatrixProps) {
  const completedCount = requirements.filter(r => r.status === 'CUMPLIDO').length;
  const isFullyCompliant = legalCompliancePercentage === 100;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-[28px] bg-gradient-to-r from-[#141419] via-[#121216] to-[#141419] border border-white/10 p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                <Scale className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    Matriz de Voto Programático & Conformidad Legal CNE
                  </h3>
                  {isFullyCompliant ? (
                    <Badge variant="success" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs py-1 px-3">
                      100% Conforme
                    </Badge>
                  ) : (
                    <Badge variant="warning" className="bg-amber-500/10 text-amber-300 border-amber-500/20 text-xs py-1 px-3">
                      En adecuación ({completedCount}/{requirements.length})
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  Verificación de requisitos normativos exigidos por la Ley 131 de 1994, Ley 152 de 1994 y directrices del Consejo Nacional Electoral (CNE).
                </p>
              </div>
            </div>
          </div>

          {/* Compliance Score Gauge */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 shrink-0">
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Índice de Conformidad
              </span>
              <span className="text-3xl font-black text-white font-mono">
                {legalCompliancePercentage}%
              </span>
            </div>
            <div className="w-14 h-14 rounded-full border-4 border-indigo-500/20 flex items-center justify-center relative">
              <div
                className="absolute inset-0 rounded-full border-4 border-indigo-500 transition-all"
                style={{
                  clipPath: `polygon(0 0, 100% 0, 100% ${legalCompliancePercentage}%, 0 ${legalCompliancePercentage}%)`
                }}
              />
              <ShieldCheck className="w-6 h-6 text-indigo-400 z-10" />
            </div>
          </div>
        </div>
      </div>

      {/* Requirements List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {requirements.map(req => {
          const isFulfilled = req.status === 'CUMPLIDO';
          return (
            <div
              key={req.id}
              className={`rounded-2xl p-5 border transition-all space-y-3 ${
                isFulfilled
                  ? 'bg-[#111114] border-emerald-500/20 hover:border-emerald-500/30'
                  : 'bg-[#111114] border-amber-500/20 hover:border-amber-500/30'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  {isFulfilled ? (
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-bold text-white leading-snug">
                      {req.requirement}
                    </h4>
                    {req.legalBasis && (
                      <span className="text-[10px] text-slate-500 font-mono">
                        Soporte: {req.legalBasis}
                      </span>
                    )}
                  </div>
                </div>

                <Badge
                  variant={isFulfilled ? 'success' : 'warning'}
                  className={`text-[10px] font-bold py-0.5 px-2 ${
                    isFulfilled
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                  }`}
                >
                  {isFulfilled ? 'Cumplido' : 'Pendiente'}
                </Badge>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {req.description}
              </p>

              {req.missingItems && (
                <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  isFulfilled
                    ? 'bg-emerald-500/5 border border-emerald-500/10 text-emerald-300'
                    : 'bg-amber-500/5 border border-amber-500/10 text-amber-300'
                }`}>
                  <FileText className="w-3.5 h-3.5 shrink-0" />
                  <span>{req.missingItems}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Normative Footer Note */}
      <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>
            El Programa de Gobierno inscrito ante la Registraduría Nacional del Estado Civil constituye la base para la elaboración del Plan de Desarrollo Municipal o Departamental.
          </span>
        </div>
      </div>
    </div>
  );
}
