import React, { useState } from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  Copy, 
  Check, 
  Layers, 
  Target, 
  ShieldCheck, 
  Calendar, 
  MapPin, 
  User, 
  DollarSign, 
  TrendingUp,
  Award,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { 
  GovProgramInfo, 
  GovStrategicAxis, 
  GovProposal, 
  GovProgramStats 
} from '@/src/types/governmentProgram';

interface GovProgramDocumentPreviewProps {
  programInfo: GovProgramInfo;
  axes: GovStrategicAxis[];
  proposals: GovProposal[];
  stats: GovProgramStats;
}

export function GovProgramDocumentPreview({
  programInfo,
  axes,
  proposals,
  stats
}: GovProgramDocumentPreviewProps) {
  const [copied, setCopied] = useState(false);

  const formatCurrency = (amount: number | null | undefined, currency = 'COP') => {
    if (amount == null || isNaN(amount)) return 'Por definir';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency || 'COP',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Generate full plain text / markdown for copying/downloading
  const generateMarkdownDocument = () => {
    let md = `# ${programInfo.title || 'PROGRAMA DE GOBIERNO'}\n`;
    md += `**CANDIDATO(A):** ${programInfo.candidateName || 'N/A'}\n`;
    md += `**ENTIDAD TERRITORIAL:** ${programInfo.territory || 'N/A'}\n`;
    md += `**PERÍODO:** ${programInfo.period || '2024-2027'}\n`;
    md += `**PARTIDO / COALICIÓN:** ${programInfo.partyCoalition || 'N/A'}\n`;
    if (programInfo.slogan) md += `**LEMA:** "${programInfo.slogan}"\n`;
    md += `\n---\n\n`;

    md += `## 1. MARCO JURÍDICO Y VOTO PROGRAMÁTICO\n`;
    md += `El presente Programa de Gobierno se fundamenta en el artículo 259 de la Constitución Política de Colombia, la Ley 131 de 1994 y la Ley 152 de 1994 (Ley Orgánica del Plan de Desarrollo), constituyendo un compromiso formal y vinculante ante los ciudadanos y las autoridades electorales.\n\n`;

    md += `## 2. RESEÑA HISTÓRICA Y CARACTERIZACIÓN TERRITORIAL\n`;
    md += `${programInfo.historicalContext || 'Sin reseña histórica registrada.'}\n\n`;

    md += `## 3. RESUMEN DEL DIAGNÓSTICO TERRITORIAL\n`;
    md += `${programInfo.diagnosticSummary || 'Sin resumen de diagnóstico territorial registrado.'}\n\n`;

    md += `## 4. ESTRUCTURA PROGRAMÁTICA POR LÍNEAS ESTRATÉGICAS\n\n`;
    axes.forEach((axis, aIdx) => {
      const axisProposals = proposals.filter(p => p.axisId === axis.id);
      md += `### EJE ${aIdx + 1}: ${axis.name}\n`;
      if (axis.description) md += `*${axis.description}*\n\n`;
      if (axis.generalObjective) md += `**Objetivo General:** ${axis.generalObjective}\n\n`;
      if (axis.diagnosedProblem) md += `**Problema Diagnosticado:** ${axis.diagnosedProblem}\n\n`;

      if (axisProposals.length > 0) {
        md += `#### Propuestas y Proyectos del Eje:\n`;
        axisProposals.forEach((prop, pIdx) => {
          md += `\n**${prop.code || `PROP-${pIdx + 1}`} - ${prop.title}** (Prioridad: ${prop.priority})\n`;
          if (prop.description) md += `${prop.description}\n`;
          if (prop.indicatorName) {
            md += `- **Indicador:** ${prop.indicatorName} (${prop.indicatorUnit || ''})\n`;
            md += `- **Línea Base -> Meta:** ${prop.baselineValue ?? 'S/D'} -> ${prop.targetValue ?? 'S/D'}\n`;
          }
          if (prop.estimatedBudget != null) {
            md += `- **Presupuesto Estimado:** ${formatCurrency(prop.estimatedBudget, prop.currency)}\n`;
          }
          if (prop.timeframe) md += `- **Plazo:** ${prop.timeframe}\n`;
          if (prop.territoryScope) md += `- **Alcance:** ${prop.territoryScope}\n`;
        });
      } else {
        md += `*(No hay propuestas registradas en este eje)*\n`;
      }
      md += `\n---\n\n`;
    });

    md += `## 5. CLÁUSULA DE RENDICIÓN DE CUENTAS Y TRANSPARENCIA\n`;
    md += `La administración se compromete a presentar informes periódicos y anuales de rendición de cuentas sobre el avance de cada una de las metas e indicadores consignados en este documento.\n`;

    return md;
  };

  const handleCopyMarkdown = () => {
    const md = generateMarkdownDocument();
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const md = generateMarkdownDocument();
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Programa_de_Gobierno_${(programInfo.territory || 'territorio').replace(/\s+/g, '_')}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Control Actions Bar */}
      <div className="rounded-2xl bg-[#141418] border border-white/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Vista Previa del Documento Oficial</h3>
            <p className="text-[11px] text-slate-400">Estructura formal con validez de voto programático</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            onClick={handleCopyMarkdown}
            className="gap-1.5 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs py-2 px-3 rounded-xl"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copiado' : 'Copiar Texto'}
          </Button>

          <Button
            size="sm"
            onClick={handleDownloadMarkdown}
            className="gap-1.5 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs py-2 px-3 rounded-xl"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            Descargar (.md)
          </Button>

          <Button
            size="sm"
            onClick={handlePrint}
            className="gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-lg shadow-indigo-600/20"
          >
            <Printer className="w-3.5 h-3.5" />
            Imprimir / Guardar PDF
          </Button>
        </div>
      </div>

      {/* Formal Document Sheet */}
      <div className="rounded-[32px] bg-[#101014] border border-white/10 p-8 sm:p-12 shadow-2xl space-y-10 max-w-4xl mx-auto font-sans">
        {/* Document Header & Portada */}
        <div className="text-center space-y-4 pb-8 border-b border-white/10">
          <div className="inline-block px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-bold uppercase tracking-widest">
            REPÚBLICA DE COLOMBIA • VOTO PROGRAMÁTICO (LEY 131 DE 1994)
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
            {programInfo.title || 'PROGRAMA DE GOBIERNO'}
          </h1>

          {programInfo.slogan && (
            <p className="text-sm italic text-indigo-300">
              "{programInfo.slogan}"
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-left">
            <div className="p-3.5 bg-white/[0.02] border border-white/5 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Candidato(a)
              </span>
              <p className="text-xs font-bold text-white">
                {programInfo.candidateName || 'Sin registrar'}
              </p>
            </div>

            <div className="p-3.5 bg-white/[0.02] border border-white/5 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Entidad Territorial & Período
              </span>
              <p className="text-xs font-bold text-white">
                {programInfo.territory || 'Territorio'} ({programInfo.period || '2024-2027'})
              </p>
            </div>

            <div className="p-3.5 bg-white/[0.02] border border-white/5 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Partido / Aval
              </span>
              <p className="text-xs font-bold text-white">
                {programInfo.partyCoalition || 'Sin aval registrado'}
              </p>
            </div>
          </div>
        </div>

        {/* Section 1: Marco Jurídico */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-xs font-mono">1</span>
            Marco Jurídico y Naturaleza del Voto Programático
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed text-justify">
            En cumplimiento del artículo 259 de la Constitución Política de Colombia, la Ley 131 de 1994 y la Ley 152 de 1994 (Ley Orgánica del Plan de Desarrollo), el presente Programa de Gobierno se somete a consideración de la ciudadanía como propuesta programática y compromiso legal obligatorio de gestión gubernamental para el período constitucional.
          </p>
        </div>

        {/* Section 2: Reseña Histórica */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center text-xs font-mono">2</span>
            Reseña Histórica y Contexto Territorial
          </h2>
          {programInfo.historicalContext ? (
            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line text-justify">
              {programInfo.historicalContext}
            </p>
          ) : (
            <p className="text-xs text-slate-500 italic">No hay reseña histórica registrada.</p>
          )}
        </div>

        {/* Section 3: Diagnóstico */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs font-mono">3</span>
            Diagnóstico Territorial y Necesidades Prioritarias
          </h2>
          {programInfo.diagnosticSummary ? (
            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line text-justify">
              {programInfo.diagnosticSummary}
            </p>
          ) : (
            <p className="text-xs text-slate-500 italic">No hay resumen de diagnóstico territorial registrado.</p>
          )}
        </div>

        {/* Section 4: Líneas Estratégicas y Propuestas */}
        <div className="space-y-6">
          <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-xs font-mono">4</span>
            Estructura Programática por Ejes Estratégicos
          </h2>

          {axes.length > 0 ? (
            <div className="space-y-6">
              {axes.map((axis, aIndex) => {
                const axisProposals = proposals.filter(p => p.axisId === axis.id);
                return (
                  <div key={axis.id} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/5">
                      <div>
                        <span className="text-[10px] font-bold text-indigo-400 font-mono uppercase tracking-wider">
                          EJE ESTRATÉGICO {aIndex + 1}
                        </span>
                        <h3 className="text-sm font-bold text-white">{axis.name}</h3>
                      </div>
                      <span className="text-xs text-slate-400 font-mono">
                        {axisProposals.length} propuesta(s)
                      </span>
                    </div>

                    {axis.description && (
                      <p className="text-xs text-slate-300 italic">{axis.description}</p>
                    )}

                    {axis.generalObjective && (
                      <div className="text-xs text-slate-300">
                        <strong className="text-emerald-400">Objetivo del Eje: </strong>
                        {axis.generalObjective}
                      </div>
                    )}

                    {/* Proposals */}
                    {axisProposals.length > 0 && (
                      <div className="space-y-3 pt-2">
                        {axisProposals.map((proposal, pIndex) => (
                          <div key={proposal.id} className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-bold text-white">
                                {proposal.code || `PROP-${pIndex + 1}`}: {proposal.title}
                              </span>
                              <Badge variant="neutral" className="text-[10px] py-0.5 px-2">
                                {proposal.priority}
                              </Badge>
                            </div>

                            {proposal.description && (
                              <p className="text-xs text-slate-300">{proposal.description}</p>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px] text-slate-400 font-mono">
                              <div>
                                <span className="text-slate-500 block">Indicador:</span>
                                <span className="text-slate-300 font-semibold">{proposal.indicatorName || 'S/D'}</span>
                              </div>
                              <div>
                                <span className="text-slate-500 block">Línea Base → Meta:</span>
                                <span className="text-emerald-400 font-semibold">
                                  {proposal.baselineValue ?? 'S/D'} → {proposal.targetValue ?? 'S/D'} {proposal.indicatorUnit || ''}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-500 block">Presupuesto Estimado:</span>
                                <span className="text-amber-300 font-semibold">
                                  {formatCurrency(proposal.estimatedBudget, proposal.currency)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">No hay ejes estratégicos registrados.</p>
          )}
        </div>

        {/* Section 5: Rendición de Cuentas */}
        <div className="space-y-3 pt-4 border-t border-white/10">
          <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-xs font-mono">5</span>
            Compromiso de Rendición de Cuentas y Control Social
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed text-justify">
            El candidato y su equipo de gobierno asumen el compromiso de someter la ejecución de este programa al control social y veedurías ciudadanas, garantizando audiencias públicas periódicas de rendición de cuentas e informes anuales de avance de metas conforme a la legislación nacional.
          </p>
        </div>
      </div>
    </div>
  );
}
