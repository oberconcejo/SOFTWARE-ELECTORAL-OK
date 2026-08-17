import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Clock, 
  User, 
  FileText, 
  ShieldAlert, 
  Compass, 
  Target, 
  Layers, 
  TrendingUp, 
  Database,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  History,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { useDiagnostic360 } from '@/src/hooks/useDiagnostic360';
import { useRBAC } from '@/src/hooks/useRBAC';
import { cn } from '@/src/lib/utils';
import { Diagnostic360Record } from '@/src/types/diagnostic360';

export function Diagnostic360Section() {
  const { 
    sourcesReport, 
    activeDiagnostic, 
    latestDiagnostic, 
    history, 
    loading, 
    isGenerating, 
    generationStep, 
    error, 
    successMessage, 
    generateDiagnostic, 
    selectVersion,
    clearMessages 
  } = useDiagnostic360();

  const { can, isAdmin } = useRBAC();
  const canGenerate = isAdmin || can.edit('STRATEGY') || can.manage('STRATEGY') || can.create('STRATEGY');

  const [showSourcesDetails, setShowSourcesDetails] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'swot' | 'risks' | 'recommendations' | 'history'>('overview');

  const result = activeDiagnostic?.result;
  const isHistorical = activeDiagnostic && latestDiagnostic && activeDiagnostic.version !== latestDiagnostic.version;

  return (
    <div className="space-y-6">
      {/* Header & Status */}
      <Card className="rounded-[32px] bg-[#111114] border-white/5 p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0 mt-1">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl font-bold text-white tracking-tight">Diagnóstico 360° AI</h2>
                <Badge variant="primary" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-xs font-semibold py-0.5 px-2.5">
                  Fase Estratégica Activa
                </Badge>
                {activeDiagnostic && (
                  <Badge variant={isHistorical ? "warning" : "success"} className="text-xs font-semibold py-0.5 px-2.5">
                    {isHistorical ? `Modo Histórico (v${activeDiagnostic.version})` : `Versión Activa v${activeDiagnostic.version}`}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-slate-400 mt-1">
                Evaluación integral del contexto político, electoral y competitivo basada en los datos consolidados de la campaña.
              </p>
            </div>
          </div>

          {/* Action Buttons & Version Selector */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Version History Selector */}
            {history.length > 1 && (
              <div className="flex items-center gap-2 bg-white/[0.03] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-300">
                <History className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-400">Versión:</span>
                <select
                  value={activeDiagnostic?.version || ''}
                  onChange={(e) => selectVersion(Number(e.target.value))}
                  className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
                >
                  {history.map((h) => (
                    <option key={h.id} value={h.version} className="bg-[#18181c] text-white">
                      v{h.version} ({new Date(h.created_at).toLocaleDateString()}) {h.version === latestDiagnostic?.version ? '• Actual' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Primary Action Button */}
            {canGenerate && (
              <Button
                onClick={generateDiagnostic}
                disabled={isGenerating || loading}
                className={cn(
                  "rounded-2xl font-semibold shadow-lg transition-all flex items-center gap-2 px-5 py-2.5",
                  activeDiagnostic 
                    ? "bg-white/10 hover:bg-white/15 text-white border border-white/10"
                    : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20"
                )}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-indigo-300" />
                    <span>Procesando...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-indigo-300" />
                    <span>{activeDiagnostic ? 'Actualizar Diagnóstico (Nueva Versión)' : 'Generar Diagnóstico 360°'}</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Notifications & Banners */}
        {error && (
          <div className="mt-4 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={clearMessages} className="text-xs text-rose-400 hover:text-rose-200 underline">Cerrar</button>
          </div>
        )}

        {successMessage && (
          <div className="mt-4 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{successMessage}</span>
            </div>
            <button onClick={clearMessages} className="text-xs text-emerald-400 hover:text-emerald-200 underline">Cerrar</button>
          </div>
        )}

        {/* Dynamic Generating Step Indicator */}
        {isGenerating && (
          <div className="mt-6 p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 flex flex-col sm:flex-row items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center shrink-0">
              <RefreshCw className="w-5 h-5 text-indigo-400 animate-spin" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h4 className="text-sm font-bold text-white">Generando Inteligencia Estratégica 360°</h4>
              <p className="text-xs text-indigo-300/80 mt-0.5">{generationStep || 'Analizando variables y datos disponibles...'}</p>
            </div>
          </div>
        )}

        {/* Sources Readiness Checklist Bar */}
        {sourcesReport && (
          <div className="mt-6 pt-5 border-t border-white/5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Fuentes de Campaña Analizadas ({sourcesReport.availableSourcesCount}/{sourcesReport.totalSources} Disponibles)
                </span>
              </div>
              <button 
                onClick={() => setShowSourcesDetails(!showSourcesDetails)}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium transition-colors"
              >
                <span>{showSourcesDetails ? 'Ocultar detalle de fuentes' : 'Ver detalle de fuentes'}</span>
                <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", showSourcesDetails && "rotate-180")} />
              </button>
            </div>

            {/* Quick mini tags */}
            <div className="flex items-center gap-2 flex-wrap">
              {sourcesReport.sources.map((s) => (
                <div 
                  key={s.id}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors",
                    s.isAvailable 
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                      : "bg-white/[0.02] border-white/5 text-slate-500"
                  )}
                  title={s.summary}
                >
                  {s.isAvailable ? (
                    <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" />
                  ) : (
                    <Clock className="w-3 h-3 text-slate-500 shrink-0" />
                  )}
                  <span>{s.name}</span>
                </div>
              ))}
            </div>

            {/* Expanded Sources Details */}
            <AnimatePresence>
              {showSourcesDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-3 border-t border-white/5"
                >
                  {sourcesReport.sources.map((source) => (
                    <div 
                      key={source.id} 
                      className={cn(
                        "p-3.5 rounded-2xl border text-xs space-y-1.5",
                        source.isAvailable 
                          ? "bg-emerald-950/10 border-emerald-500/20"
                          : "bg-white/[0.01] border-white/5 opacity-75"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-white">{source.name}</span>
                        <Badge 
                          variant={source.isAvailable ? "success" : "neutral"}
                          className="text-[10px] py-0 px-2"
                        >
                          {source.isAvailable ? 'Disponible ✓' : 'Pendiente'}
                        </Badge>
                      </div>
                      <p className="text-slate-400 text-[11px] leading-relaxed">{source.summary}</p>
                      {source.missingDetails && (
                        <p className="text-amber-400/80 text-[10px] italic">⚠️ {source.missingDetails}</p>
                      )}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </Card>

      {/* Main Content Area */}
      {loading ? (
        <Card className="rounded-[32px] bg-[#111114] border-white/5 p-12 text-center shadow-xl">
          <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-400">Cargando diagnóstico estratégico y fuentes...</p>
        </Card>
      ) : !activeDiagnostic || !result ? (
        /* Empty State: No Diagnostic generated yet */
        <Card className="rounded-[32px] bg-[#111114] border-white/5 p-10 md:p-14 text-center shadow-xl space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto">
            <Sparkles className="w-8 h-8" />
          </div>

          <div className="max-w-xl mx-auto space-y-2">
            <h3 className="text-xl font-bold text-white">Sin diagnóstico 360° generado todavía</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              El diagnóstico integral procesará automáticamente la información disponible de tu campaña (Perfil del candidato, Matriz DOFA, Estructura territorial y Programa de gobierno) para estructurar un análisis estratégico riguroso.
            </p>
          </div>

          {/* Value Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto text-left">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
                <Target className="w-4 h-4" />
                <span>Posicionamiento</span>
              </div>
              <p className="text-xs text-slate-500">Evaluación del perfil, trayectoria y diferenciadores competitivos.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <ShieldAlert className="w-4 h-4" />
                <span>Riesgos y DOFA</span>
              </div>
              <p className="text-xs text-slate-500">Matriz de amenazas, debilidades organizacionales y brechas.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                <TrendingUp className="w-4 h-4" />
                <span>Recomendaciones</span>
              </div>
              <p className="text-xs text-slate-500">Plan de acción estratégico clasificado a corto, mediano y largo plazo.</p>
            </div>
          </div>

          {/* Primary CTA */}
          <div className="pt-2">
            {canGenerate ? (
              <Button
                onClick={generateDiagnostic}
                disabled={isGenerating}
                className="rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-3.5 shadow-xl shadow-indigo-600/25 text-sm inline-flex items-center gap-2.5 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generar Primer Diagnóstico 360°</span>
              </Button>
            ) : (
              <p className="text-xs text-slate-500 italic">
                Contacte al Administrador o Director de Estrategia para generar el diagnóstico.
              </p>
            )}
          </div>
        </Card>
      ) : (
        /* Full Diagnostic Presentation View */
        <div className="space-y-6">
          {/* Metadata & Confidence Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Audit Card */}
            <Card className="rounded-2xl bg-[#111114] border-white/5 p-4 flex items-center gap-3.5 shadow-md">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs text-slate-400 font-medium">Generado por</p>
                <p className="text-sm font-bold text-white truncate">{activeDiagnostic.created_by?.name || 'Director Estratégico'}</p>
                <p className="text-[11px] text-slate-500">{activeDiagnostic.created_by?.role || 'ESTRATEGA'}</p>
              </div>
            </Card>

            {/* Date Card */}
            <Card className="rounded-2xl bg-[#111114] border-white/5 p-4 flex items-center gap-3.5 shadow-md">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Fecha y Versión</p>
                <p className="text-sm font-bold text-white">
                  {new Date(activeDiagnostic.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
                <p className="text-[11px] text-slate-500">
                  {new Date(activeDiagnostic.created_at).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })} • Versión {activeDiagnostic.version}
                </p>
              </div>
            </Card>

            {/* Confidence & AI Provider Card */}
            <Card className="rounded-2xl bg-[#111114] border-white/5 p-4 flex items-center gap-3.5 shadow-md">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-400 font-medium">Completitud de Fuentes</p>
                  <span className="text-xs font-bold text-emerald-400">{result.metadata.dataConfidenceScore}%</span>
                </div>
                <div className="w-full bg-white/10 h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all"
                    style={{ width: `${result.metadata.dataConfidenceScore}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1 truncate">Motor: {result.metadata.aiProvider}</p>
              </div>
            </Card>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex items-center gap-2 border-b border-white/5 pb-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap",
                activeTab === 'overview'
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "bg-white/[0.02] text-slate-400 hover:text-white hover:bg-white/[0.05]"
              )}
            >
              Resumen y Posicionamiento
            </button>
            <button
              onClick={() => setActiveTab('swot')}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap",
                activeTab === 'swot'
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "bg-white/[0.02] text-slate-400 hover:text-white hover:bg-white/[0.05]"
              )}
            >
              DOFA 360° Estratégico
            </button>
            <button
              onClick={() => setActiveTab('risks')}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap",
                activeTab === 'risks'
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "bg-white/[0.02] text-slate-400 hover:text-white hover:bg-white/[0.05]"
              )}
            >
              Riesgos y Brechas de Datos
            </button>
            <button
              onClick={() => setActiveTab('recommendations')}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap",
                activeTab === 'recommendations'
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "bg-white/[0.02] text-slate-400 hover:text-white hover:bg-white/[0.05]"
              )}
            >
              Recomendaciones Tácticas
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap",
                activeTab === 'history'
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "bg-white/[0.02] text-slate-400 hover:text-white hover:bg-white/[0.05]"
              )}
            >
              Historial de Versiones ({history.length})
            </button>
          </div>

          {/* TAB 1: OVERVIEW & POSITIONING */}
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Executive Summary Hero Card */}
              <Card className="rounded-[32px] bg-[#111114] border-indigo-500/20 p-8 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    <Compass className="w-4 h-4" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Resumen Ejecutivo de Campaña</h3>
                  <Badge variant="primary" className="text-[10px]">
                    Consolidado Estratégico
                  </Badge>
                </div>

                <p className="text-slate-300 text-base leading-relaxed font-normal">
                  {result.executiveSummary}
                </p>

                {/* Classification Legend */}
                <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-4 flex-wrap text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">Criterio de Rigor:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>DATO: Hecho sustentado en plataforma</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    <span>INFERENCIA: Análisis estratégico derivado</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>RECOMENDACIÓN: Propuesta de acción</span>
                  </div>
                </div>
              </Card>

              {/* Current Positioning Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="rounded-[28px] bg-[#111114] border-white/5 p-6 space-y-3">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                    <Target className="w-4 h-4" />
                    <span>Visión de Posicionamiento</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {result.currentPositioning.overview}
                  </p>
                </Card>

                <Card className="rounded-[28px] bg-[#111114] border-white/5 p-6 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Síntesis de Fortalezas Clave</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {result.currentPositioning.keyStrengthsSummary}
                  </p>
                </Card>

                <Card className="rounded-[28px] bg-[#111114] border-white/5 p-6 space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Retos Organizacionales Prioritarios</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {result.currentPositioning.keyChallengesSummary}
                  </p>
                </Card>

                <Card className="rounded-[28px] bg-[#111114] border-white/5 p-6 space-y-3">
                  <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                    <Layers className="w-4 h-4" />
                    <span>Despliegue Territorial y Alcance</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {result.currentPositioning.territorialFootprintSummary}
                  </p>
                </Card>
              </div>

              {/* Key Findings with Types */}
              {result.keyFindings && result.keyFindings.length > 0 && (
                <Card className="rounded-[28px] bg-[#111114] border-white/5 p-6 space-y-4">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    <span>Hallazgos Estratégicos Relevantes</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.keyFindings.map((finding, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <h5 className="text-xs font-bold text-white">{finding.title}</h5>
                          <Badge 
                            variant={finding.type === 'DATO' ? "success" : "primary"}
                            className="text-[10px] py-0 px-2 font-semibold"
                          >
                            {finding.type === 'DATO' ? 'Dato Verificado' : 'Inferencia Analítica'}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{finding.description}</p>
                        <p className="text-[10px] text-slate-500 italic pt-1 border-t border-white/5">
                          Fuente / Soporte: {finding.supportingData}
                        </p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </motion.div>
          )}

          {/* TAB 2: SWOT / DOFA 360 */}
          {activeTab === 'swot' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. FORTALEZAS */}
                <Card className="rounded-[28px] bg-[#111114] border-emerald-500/20 p-6 space-y-4 shadow-lg">
                  <div className="flex items-center justify-between pb-3 border-b border-emerald-500/10">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Fortalezas Estratégicas ({result.swotAnalysis.fortalezas.length})</span>
                    </div>
                    <Badge variant="success" className="text-[10px]">
                      Origen Interno
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    {result.swotAnalysis.fortalezas.map((item, idx) => (
                      <div key={idx} className="p-3.5 rounded-2xl bg-emerald-950/10 border border-emerald-500/15 space-y-1.5">
                        <p className="text-xs font-bold text-emerald-300">{item.title || `Fortaleza ${idx + 1}`}</p>
                        <p className="text-xs text-slate-200 leading-relaxed">{item.finding}</p>
                        <div className="pt-2 border-t border-emerald-500/10 text-[11px] space-y-0.5 text-slate-400">
                          <p><span className="text-emerald-400 font-semibold">Evidencia:</span> {item.evidence}</p>
                          <p><span className="text-slate-300 font-semibold">Relevancia:</span> {item.strategicRelevance}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* 2. OPORTUNIDADES */}
                <Card className="rounded-[28px] bg-[#111114] border-blue-500/20 p-6 space-y-4 shadow-lg">
                  <div className="flex items-center justify-between pb-3 border-b border-blue-500/10">
                    <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                      <TrendingUp className="w-4 h-4" />
                      <span>Oportunidades del Entorno ({result.swotAnalysis.oportunidades.length})</span>
                    </div>
                    <Badge variant="primary" className="text-[10px]">
                      Origen Externo
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    {result.swotAnalysis.oportunidades.map((item, idx) => (
                      <div key={idx} className="p-3.5 rounded-2xl bg-blue-950/10 border border-blue-500/15 space-y-1.5">
                        <p className="text-xs font-bold text-blue-300">{item.title || `Oportunidad ${idx + 1}`}</p>
                        <p className="text-xs text-slate-200 leading-relaxed">{item.finding}</p>
                        <div className="pt-2 border-t border-blue-500/10 text-[11px] space-y-0.5 text-slate-400">
                          <p><span className="text-blue-400 font-semibold">Evidencia:</span> {item.evidence}</p>
                          <p><span className="text-slate-300 font-semibold">Relevancia:</span> {item.strategicRelevance}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* 3. DEBILIDADES */}
                <Card className="rounded-[28px] bg-[#111114] border-amber-500/20 p-6 space-y-4 shadow-lg">
                  <div className="flex items-center justify-between pb-3 border-b border-amber-500/10">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Debilidades / Restricciones ({result.swotAnalysis.debilidades.length})</span>
                    </div>
                    <Badge variant="warning" className="text-[10px]">
                      Origen Interno
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    {result.swotAnalysis.debilidades.map((item, idx) => (
                      <div key={idx} className="p-3.5 rounded-2xl bg-amber-950/10 border border-amber-500/15 space-y-1.5">
                        <p className="text-xs font-bold text-amber-300">{item.title || `Debilidad ${idx + 1}`}</p>
                        <p className="text-xs text-slate-200 leading-relaxed">{item.finding}</p>
                        <div className="pt-2 border-t border-amber-500/10 text-[11px] space-y-0.5 text-slate-400">
                          <p><span className="text-amber-400 font-semibold">Evidencia:</span> {item.evidence}</p>
                          <p><span className="text-slate-300 font-semibold">Relevancia:</span> {item.strategicRelevance}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* 4. AMENAZAS */}
                <Card className="rounded-[28px] bg-[#111114] border-rose-500/20 p-6 space-y-4 shadow-lg">
                  <div className="flex items-center justify-between pb-3 border-b border-rose-500/10">
                    <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                      <ShieldAlert className="w-4 h-4" />
                      <span>Amenazas y Factores Externos ({result.swotAnalysis.amenazas.length})</span>
                    </div>
                    <Badge variant="error" className="text-[10px]">
                      Origen Externo
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    {result.swotAnalysis.amenazas.map((item, idx) => (
                      <div key={idx} className="p-3.5 rounded-2xl bg-rose-950/10 border border-rose-500/15 space-y-1.5">
                        <p className="text-xs font-bold text-rose-300">{item.title || `Amenaza ${idx + 1}`}</p>
                        <p className="text-xs text-slate-200 leading-relaxed">{item.finding}</p>
                        <div className="pt-2 border-t border-rose-500/10 text-[11px] space-y-0.5 text-slate-400">
                          <p><span className="text-rose-400 font-semibold">Evidencia:</span> {item.evidence}</p>
                          <p><span className="text-slate-300 font-semibold">Relevancia:</span> {item.strategicRelevance}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </motion.div>
          )}

          {/* TAB 3: RISKS & GAPS */}
          {activeTab === 'risks' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Priority Risks */}
              <Card className="rounded-[32px] bg-[#111114] border-white/5 p-6 md:p-8 space-y-5 shadow-xl">
                <div className="flex items-center gap-3 pb-3 border-b border-white/5">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Matriz de Riesgos Prioritarios</h3>
                    <p className="text-xs text-slate-400">Riesgos estratégicos identificados clasificados por severidad y probabilidad.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.priorityRisks.map((risk) => (
                    <div 
                      key={risk.id} 
                      className={cn(
                        "p-5 rounded-2xl border space-y-3 transition-all",
                        risk.priorityLevel === 'CRITICA' && "bg-rose-950/15 border-rose-500/30",
                        risk.priorityLevel === 'ALTA' && "bg-amber-950/15 border-amber-500/30",
                        (risk.priorityLevel === 'MEDIA' || risk.priorityLevel === 'MODERADA') && "bg-blue-950/15 border-blue-500/30"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-bold text-white">{risk.risk}</p>
                        <Badge 
                          variant={risk.priorityLevel === 'CRITICA' ? "error" : risk.priorityLevel === 'ALTA' ? "warning" : "primary"}
                          className="text-[10px] font-bold py-0.5 px-2.5"
                        >
                          Prioridad {risk.priorityLevel}
                        </Badge>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        <span className="font-semibold text-slate-200">Motivo:</span> {risk.reason}
                      </p>

                      <div className="pt-2 border-t border-white/5 text-[11px] text-slate-400">
                        <span className="font-semibold text-slate-300">Evidencia que lo sustenta:</span> {risk.supportingEvidence}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Information Gaps (Brechas de Datos) */}
              <Card className="rounded-[32px] bg-[#111114] border-white/5 p-6 md:p-8 space-y-5 shadow-xl">
                <div className="flex items-center gap-3 pb-3 border-b border-white/5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Brechas de Información Identificadas</h3>
                    <p className="text-xs text-slate-400">Datos no disponibles en la plataforma que se recomienda completar para mayor precisión.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.informationGaps.map((gap) => (
                    <div key={gap.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-bold text-amber-300">{gap.gap}</h4>
                        <Badge variant="neutral" className="text-[10px]">
                          {gap.missingSource}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-300">
                        <span className="font-semibold text-slate-400">Impacto:</span> {gap.impactOnCampaign}
                      </p>
                      <p className="text-xs text-indigo-300/90 pt-1 border-t border-white/5">
                        <span className="font-semibold text-indigo-400">Acción sugerida:</span> {gap.recommendedAction}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* TAB 4: RECOMMENDATIONS */}
          {activeTab === 'recommendations' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card className="rounded-[32px] bg-[#111114] border-white/5 p-6 md:p-8 space-y-6 shadow-xl">
                <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Recomendaciones Estratégicas y Hoja de Ruta</h3>
                    <p className="text-xs text-slate-400">Propuestas de acción clasificadas por horizonte temporal de ejecución.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {result.strategicRecommendations.map((rec, idx) => (
                    <div 
                      key={rec.id || idx} 
                      className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 text-xs flex items-center justify-center font-bold">
                            {idx + 1}
                          </span>
                          {rec.title}
                        </h4>
                        <Badge 
                          variant={rec.horizon === 'CORTO_PLAZO' ? "success" : rec.horizon === 'MEDIANO_PLAZO' ? "primary" : "neutral"}
                          className="text-[10px] font-semibold py-0.5 px-2.5 w-fit"
                        >
                          {rec.horizon === 'CORTO_PLAZO' ? 'Corto Plazo (Inmediato)' : rec.horizon === 'MEDIANO_PLAZO' ? 'Mediano Plazo (Campaña)' : 'Largo Plazo (Día D / Gobierno)'}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-xs">
                        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                          <span className="font-bold text-indigo-300">Acción Táctica:</span>
                          <p className="text-slate-300 leading-relaxed">{rec.action}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                          <span className="font-bold text-slate-300">Justificación Estratégica:</span>
                          <p className="text-slate-400 leading-relaxed">{rec.rationale}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                          <span className="font-bold text-emerald-300">Resultado Esperado:</span>
                          <p className="text-slate-300 leading-relaxed">{rec.expectedOutcome}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* TAB 5: VERSION HISTORY */}
          {activeTab === 'history' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card className="rounded-[32px] bg-[#111114] border-white/5 p-6 md:p-8 space-y-5 shadow-xl">
                <div className="flex items-center gap-3 pb-3 border-b border-white/5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    <History className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Historial de Diagnósticos Generados</h3>
                    <p className="text-xs text-slate-400">Trazabilidad y versiones acumuladas de la estrategia de campaña.</p>
                  </div>
                </div>

                {history.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">No hay versiones previas en el historial.</p>
                ) : (
                  <div className="space-y-3">
                    {history.map((item) => (
                      <div 
                        key={item.id}
                        className={cn(
                          "p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all",
                          item.version === activeDiagnostic.version 
                            ? "bg-indigo-500/10 border-indigo-500/30"
                            : "bg-white/[0.02] border-white/5 hover:border-white/10"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white font-bold text-sm">
                            v{item.version}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-white">Diagnóstico 360° (Versión {item.version})</span>
                              {item.version === latestDiagnostic?.version && (
                                <Badge variant="success" className="text-[10px]">
                                  Última Generada
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">
                              Generado el {new Date(item.created_at).toLocaleString('es-CO')} por <span className="text-slate-300 font-medium">{item.created_by?.name || 'Estratega'}</span> ({item.created_by?.role || 'ESTRATEGA'})
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Badge variant="neutral" className="text-xs">
                            Completitud: {item.result?.metadata?.dataConfidenceScore || 80}%
                          </Badge>
                          <Button
                            onClick={() => selectVersion(item.version)}
                            disabled={item.version === activeDiagnostic.version}
                            variant={item.version === activeDiagnostic.version ? 'secondary' : 'outline'}
                            className="text-xs rounded-xl py-1.5 px-3"
                          >
                            {item.version === activeDiagnostic.version ? 'Visualizando' : 'Cargar Versión'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
