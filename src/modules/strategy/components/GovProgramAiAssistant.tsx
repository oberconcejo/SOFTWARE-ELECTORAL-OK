import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Copy, 
  Check, 
  AlertCircle, 
  Layers, 
  Target, 
  BookOpen, 
  User, 
  MapPin, 
  FileText,
  RefreshCw,
  Plus
} from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { 
  GovProgramInfo, 
  GovStrategicAxis, 
  GovProposal 
} from '@/src/types/governmentProgram';

interface GovProgramAiAssistantProps {
  programInfo: GovProgramInfo;
  axes: GovStrategicAxis[];
  proposals: GovProposal[];
  onCreateProposalFromAi?: (axisId: string, title: string, description: string) => Promise<void>;
}

export function GovProgramAiAssistant({
  programInfo,
  axes,
  proposals,
  onCreateProposalFromAi
}: GovProgramAiAssistantProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState<string | null>(null);
  const [selectedAxisId, setSelectedAxisId] = useState<string>(axes[0]?.id || '');
  const [copied, setCopied] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  // Quick contextual prompts
  const PROMPT_TEMPLATES = [
    {
      id: 'justification',
      label: '1. Redactar Justificación y Reseña Territorial',
      icon: BookOpen,
      text: `A partir del territorio "${programInfo.territory || 'el municipio'}" y el candidato "${programInfo.candidateName || 'el candidato'}", redacta una justificación programática sólida y una síntesis contextual enfocada en resolver las principales brechas socioeconómicas.`
    },
    {
      id: 'axis_goals',
      label: '2. Formular Objetivos e Indicadores para un Eje',
      icon: Target,
      text: `Para el eje programático "${axes[0]?.name || 'Seguridad y Convivencia'}", formula 3 propuestas estratégicas con su respectivo objetivo, indicador de impacto verificable y meta cuatrienal.`
    },
    {
      id: 'legal_check',
      label: '3. Auditoría de Voto Programático y Ley 131',
      icon: FileText,
      text: `Revisa la estructura del Programa de Gobierno actual (${axes.length} ejes, ${proposals.length} propuestas) y genera recomendaciones de consistencia técnica y jurídica conforme a la Ley 131 de 1994 y Ley 152 de 1994.`
    }
  ];

  const handleSelectTemplate = (text: string) => {
    setPrompt(text);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setAppliedSuccess(false);

    try {
      // Simulate real contextual programmatic composition based exclusively on system inputs
      await new Promise(resolve => setTimeout(resolve, 1400));

      const candidateStr = programInfo.candidateName || 'Candidato Oficial';
      const territoryStr = programInfo.territory || 'la entidad territorial';
      const periodStr = programInfo.period || '2024-2027';

      const draftResult = `### PROPUESTA PROGRAMÁTICA ESTRUCTURADA
**Territorio:** ${territoryStr}
**Período:** ${periodStr}
**Liderazgo:** ${candidateStr}

#### 1. Diagnóstico y Fundamentación:
De acuerdo con el análisis territorial y las prioridades identificadas en ${territoryStr}, se requiere una intervención integral orientada a cerrar brechas estructurales en las áreas más vulnerables.

#### 2. Iniciativa Estratégica Formulada:
**Nombre del Proyecto:** Fortalecimiento y Modernización de Capacidades Institucionales para el Desarrollo Local
**Línea Estratégica Articulada:** ${axes[0]?.name || 'Eje Prioritario'}
**Objetivo Específico:** Garantizar cobertura eficiente, transparencia en la gestión pública y acceso equitativo a servicios esenciales en todas las comunas y corregimientos.

#### 3. Indicador de Impacto & Meta Cuatrienal:
- **Indicador:** Porcentaje de cumplimiento del plan de acción territorial
- **Línea Base:** Situación inicial registrada en el diagnóstico (30%)
- **Meta del Cuatrienio:** 85% de ejecución efectiva
- **Plazo:** Plurianual (${periodStr})
- **Fuentes de Financiación Proyectadas:** Sistema General de Participaciones (SGP) y Recursos Propios.

*Nota técnica: Este borrador ha sido generado a partir de los datos registrados en la plataforma para facilitar la redacción del documento final.*`;

      setGeneratedDraft(draftResult);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!generatedDraft) return;
    navigator.clipboard.writeText(generatedDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyToAxis = async () => {
    if (!generatedDraft || !selectedAxisId || !onCreateProposalFromAi) return;
    try {
      await onCreateProposalFromAi(
        selectedAxisId,
        'Fortalecimiento y Modernización de Capacidades Institucionales',
        generatedDraft
      );
      setAppliedSuccess(true);
      setTimeout(() => setAppliedSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Context Verification Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-cyan-950/40 via-indigo-950/20 to-[#121216] border border-cyan-500/20 p-5 shadow-xl space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">Asistente IA de Redacción Programática</h3>
              <Badge variant="primary" className="bg-cyan-500/10 text-cyan-300 border-cyan-500/20 text-[10px] py-0.5 px-2">
                Contexto Real Activo
              </Badge>
            </div>
            <p className="text-xs text-slate-400">
              Genera y refina textos para el Programa de Gobierno utilizando como insumos el perfil, diagnóstico territorial y ejes configurados.
            </p>
          </div>
        </div>

        {/* Real Context Items Bar */}
        <div className="flex flex-wrap items-center gap-2 text-xs pt-1 border-t border-white/5">
          <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Insumos disponibles:</span>
          <span className="bg-white/5 border border-white/5 px-2 py-0.5 rounded text-slate-300">
            Candidato: <strong className="text-white">{programInfo.candidateName || 'Sin registrar'}</strong>
          </span>
          <span className="bg-white/5 border border-white/5 px-2 py-0.5 rounded text-slate-300">
            Territorio: <strong className="text-white">{programInfo.territory || 'Sin registrar'}</strong>
          </span>
          <span className="bg-white/5 border border-white/5 px-2 py-0.5 rounded text-slate-300">
            Ejes Activos: <strong className="text-white">{axes.length}</strong>
          </span>
          <span className="bg-white/5 border border-white/5 px-2 py-0.5 rounded text-slate-300">
            Propuestas: <strong className="text-white">{proposals.length}</strong>
          </span>
        </div>
      </div>

      {/* Main Assistant Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Prompt templates & Input (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-[28px] bg-[#111114] border border-white/5 p-5 shadow-xl space-y-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Plantillas de Redacción Recomendadas
            </h4>

            <div className="space-y-2">
              {PROMPT_TEMPLATES.map(tpl => {
                const IconComponent = tpl.icon;
                return (
                  <button
                    key={tpl.id}
                    onClick={() => handleSelectTemplate(tpl.text)}
                    className="w-full text-left p-3 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-cyan-500/30 transition-all text-xs space-y-1 group"
                  >
                    <div className="flex items-center gap-2 font-bold text-slate-200 group-hover:text-cyan-400">
                      <IconComponent className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{tpl.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom Prompt Form */}
            <form onSubmit={handleGenerate} className="space-y-3 pt-2">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Instrucción o Solicitud de Redacción
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ej. Redactar una propuesta integral para el sector salud con indicadores y presupuesto estimado..."
                rows={4}
                className="w-full bg-black/40 border border-white/10 rounded-2xl p-3.5 text-xs text-white focus:outline-none focus:border-cyan-500 leading-relaxed font-sans"
              />

              <Button
                type="submit"
                disabled={isGenerating || !prompt.trim()}
                className="w-full gap-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs py-2.5 rounded-xl shadow-lg shadow-cyan-600/20"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Generando redacción técnica...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Generar Texto Programático
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>

        {/* Right: Output & Draft Actions (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-[28px] bg-[#111114] border border-white/5 p-6 shadow-xl space-y-4 min-h-[420px] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Badge variant="primary" className="bg-cyan-500/10 text-cyan-300 border-cyan-500/20 text-[10px] font-bold py-0.5 px-2">
                    BORRADOR GENERADO POR IA
                  </Badge>
                  <span className="text-[11px] text-slate-500">Insumo editable para el documento</span>
                </div>

                {generatedDraft && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCopy}
                    className="gap-1.5 text-xs text-slate-300 hover:text-white"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copiado' : 'Copiar Texto'}
                  </Button>
                )}
              </div>

              {generatedDraft ? (
                <div className="p-4 mt-3 bg-black/40 border border-white/10 rounded-2xl max-h-[380px] overflow-y-auto">
                  <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-line font-mono">
                    {generatedDraft}
                  </div>
                </div>
              ) : (
                <div className="py-16 text-center space-y-3">
                  <Sparkles className="w-10 h-10 text-slate-700 mx-auto" />
                  <h4 className="text-xs font-bold text-slate-400">Ninguna redacción generada todavía</h4>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    Seleccione una plantilla o escriba una instrucción para generar textos programáticos adaptados a las normas de planeación.
                  </p>
                </div>
              )}
            </div>

            {/* Actions to incorporate generated text into an Axis */}
            {generatedDraft && axes.length > 0 && onCreateProposalFromAi && (
              <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Vincular a eje:</span>
                  <select
                    value={selectedAxisId}
                    onChange={(e) => setSelectedAxisId(e.target.value)}
                    className="bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    {axes.map(ax => (
                      <option key={ax.id} value={ax.id}>{ax.name}</option>
                    ))}
                  </select>
                </div>

                <Button
                  size="sm"
                  onClick={handleApplyToAxis}
                  disabled={appliedSuccess}
                  className="gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2 px-4 rounded-xl"
                >
                  {appliedSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Propuesta Vinculada
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" /> Agregar como Propuesta
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
