import React, { useState } from 'react';
import { 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Download, 
  Share2, 
  Users, 
  FileSpreadsheet, 
  FileText, 
  CheckCircle, 
  Sparkles,
  ArrowUpRight,
  Printer,
  Calendar
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { 
  CommsKPIs, 
  MediaPiece, 
  SocialChannel, 
  ContentItem, 
  Spokesperson, 
  PublicIntervention,
  TrendDataPoint,
  TopicSentiment
} from '@/src/types/communications';

interface AnalyticsSectionProps {
  kpis: CommsKPIs;
  mediaPieces: MediaPiece[];
  socialChannels: SocialChannel[];
  contentItems: ContentItem[];
  spokespersons: Spokesperson[];
  interventions: PublicIntervention[];
  weeklyTrend: TrendDataPoint[];
  topicSentiments: TopicSentiment[];
}

export const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({
  kpis,
  mediaPieces,
  socialChannels,
  contentItems,
  spokespersons,
  interventions,
  weeklyTrend,
  topicSentiments
}) => {
  const [isExporting, setIsExporting] = useState(false);

  // Formatter
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toLocaleString('es-CO');
  };

  // Export full multi-sheet Excel
  const handleExportExcel = () => {
    setIsExporting(true);
    try {
      const wb = XLSX.utils.book_new();

      // Sheet 1: KPIs
      const kpiData = [
        { Metrica: 'Alcance Total Consolidado', Valor: kpis.totalReach },
        { Metrica: 'Menciones e Impactos en Medios', Valor: kpis.mediaMentions },
        { Metrica: 'Sentimiento Favorable (%)', Valor: `${kpis.positiveSentimentPct}%` },
        { Metrica: 'Sentimiento Neutro (%)', Valor: `${kpis.neutralSentimentPct}%` },
        { Metrica: 'Sentimiento Crítico (%)', Valor: `${kpis.negativeSentimentPct}%` },
        { Metrica: 'Publicaciones Programadas', Valor: kpis.scheduledPosts },
        { Metrica: 'Publicaciones Realizadas', Valor: kpis.publishedPosts },
        { Metrica: 'Engagement Total Estimado', Valor: kpis.totalEngagement }
      ];
      const wsKPIs = XLSX.utils.json_to_sheet(kpiData);
      XLSX.utils.book_append_sheet(wb, wsKPIs, 'KPIs_Generales');

      // Sheet 2: Media Plan
      const mediaData = mediaPieces.map(p => ({
        Titular: p.title,
        Medio: p.targetOutlet,
        Tipo: p.mediaType,
        Formato: p.pieceType,
        Fecha: p.date,
        Responsable: p.responsible,
        Estado: p.status,
        Alcance: p.estimatedReach,
        Sentimiento: p.sentiment,
        MensajeClave: p.keyMessage,
        URL: p.url || 'N/A'
      }));
      const wsMedia = XLSX.utils.json_to_sheet(mediaData);
      XLSX.utils.book_append_sheet(wb, wsMedia, 'Plan_de_Medios');

      // Sheet 3: Social Content
      const contentData = contentItems.map(c => ({
        Titulo: c.title,
        Copy: c.copy,
        Canales: c.channels.join(', '),
        Etapa: c.stage,
        FechaProgramada: c.scheduledDate,
        Hora: c.scheduledTime,
        TipoMedia: c.mediaType,
        Aprobador: c.approver,
        Hashtags: c.hashtags?.join(' ') || ''
      }));
      const wsContent = XLSX.utils.json_to_sheet(contentData);
      XLSX.utils.book_append_sheet(wb, wsContent, 'Redes_Contenidos');

      // Sheet 4: Spokespersons & Interventions
      const spkData = interventions.map(i => ({
        Fecha: i.date,
        Vocero: i.spokespersonName,
        Medio: i.outletName,
        TipoMedio: i.mediaType,
        Tema: i.topic,
        Sentimiento: i.sentiment,
        Alcance: i.impactReach,
        Resumen: i.summary
      }));
      const wsSpk = XLSX.utils.json_to_sheet(spkData);
      XLSX.utils.book_append_sheet(wb, wsSpk, 'Intervenciones_Voceros');

      // Write file
      XLSX.writeFile(wb, `Informe_Comunicaciones_Campana_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (e) {
      console.error('Error exporting Excel:', e);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Export Bar */}
      <div className="bg-[#12121e] border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-violet-400" />
            Centro de Analítica & Auditoría de Impacto Electoral
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Métricas de rendimiento, análisis de favorabilidad por temas y exportación ejecutiva
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-[#18182a] hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold rounded-xl border border-white/5 transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            Imprimir / PDF
          </button>
          <button
            onClick={handleExportExcel}
            disabled={isExporting}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <FileSpreadsheet className="w-4 h-4" />
            {isExporting ? 'Generando Excel...' : 'Descargar Reporte Excel (.xlsx)'}
          </button>
        </div>
      </div>

      {/* Grid: Channels Comparative & Sentiments */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Channels Performance (7 cols) */}
        <div className="lg:col-span-7 bg-[#12121e] border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Share2 className="w-4 h-4 text-violet-400" />
                Desempeño Comparativo de Redes Sociales
              </h4>
              <p className="text-xs text-slate-400">
                Métricas de masa crítica de seguidores y tasa de interacción
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-400">
              Total: {formatNumber(socialChannels.reduce((a,b)=>a+b.followers, 0))} seguidores
            </span>
          </div>

          <div className="space-y-3">
            {socialChannels.map((ch) => {
              const maxFollowers = 150000;
              const barPct = Math.min(100, Math.round((ch.followers / maxFollowers) * 100));

              return (
                <div key={ch.id} className="p-3.5 rounded-xl bg-[#18182a] border border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base">
                        {ch.platform === 'x' && '𝕏'}
                        {ch.platform === 'instagram' && '📸'}
                        {ch.platform === 'facebook' && '👥'}
                        {ch.platform === 'tiktok' && '🎵'}
                        {ch.platform === 'youtube' && '▶️'}
                        {ch.platform === 'whatsapp' && '💬'}
                      </span>
                      <span className="text-xs font-bold text-white">{ch.name}</span>
                    </div>
                    <div className="text-xs text-right">
                      <strong className="text-white">{formatNumber(ch.followers)}</strong>
                      <span className="text-[10px] text-emerald-400 font-bold ml-1.5">+{ch.followerGrowth}%</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-violet-600 to-fuchsia-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${barPct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span>Engagement Rate: <strong className="text-violet-300">{ch.engagementRate}%</strong></span>
                    <span>Alcance: <strong className="text-slate-300">{formatNumber(ch.totalReach || 0)}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Topic Sentiment Breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-[#12121e] border border-white/10 rounded-2xl p-5 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
              <PieChart className="w-4 h-4 text-emerald-400" />
              Favorabilidad por Ejes de Campaña
            </h4>
            <p className="text-xs text-slate-400 mb-4">
              Porcentaje de comentarios y menciones favorables en debates públicos
            </p>

            <div className="space-y-3">
              {topicSentiments.map((ts, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{ts.topic}</span>
                    <span className="font-bold text-emerald-400">{ts.percentage}% +</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${ts.percentage}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500">{ts.mentions} menciones analizadas</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-violet-950/30 border border-violet-500/20 text-xs text-slate-300 leading-relaxed">
            <span className="font-bold text-violet-300 block mb-0.5">Recomendación IA:</span>
            Reforzar comunicación sobre <em>Malla Vial & Transporte</em> para elevar el índice de favorabilidad al 75%.
          </div>
        </div>
      </div>

      {/* Trending Hashtags Cloud */}
      <div className="bg-[#12121e] border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          Nube de Etiquetas & Tendencias en Conversación Digital
        </h4>

        <div className="flex flex-wrap gap-2.5 pt-2">
          {[
            { tag: '#SantiagoPerez', count: '14.2k', size: 'text-sm font-black text-violet-300 bg-violet-500/20 border-violet-500/40' },
            { tag: '#SeguridadYa', count: '9.8k', size: 'text-xs font-bold text-emerald-300 bg-emerald-500/20 border-emerald-500/40' },
            { tag: '#CampañaGanadora', count: '8.4k', size: 'text-xs font-bold text-cyan-300 bg-cyan-500/20 border-cyan-500/40' },
            { tag: '#EmpleoJuvenil', count: '6.1k', size: 'text-xs font-semibold text-amber-300 bg-amber-500/20 border-amber-500/40' },
            { tag: '#BecasIA', count: '5.5k', size: 'text-xs font-semibold text-purple-300 bg-purple-500/20 border-purple-500/40' },
            { tag: '#SaludBarrial', count: '4.2k', size: 'text-[11px] text-slate-300 bg-white/5 border-white/10' },
            { tag: '#EnLaCalle', count: '3.8k', size: 'text-[11px] text-slate-300 bg-white/5 border-white/10' },
            { tag: '#Debate2026', count: '3.1k', size: 'text-[11px] text-slate-300 bg-white/5 border-white/10' }
          ].map((item, idx) => (
            <div
              key={idx}
              className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 transition-transform hover:scale-105 cursor-default ${item.size}`}
            >
              <span>{item.tag}</span>
              <span className="text-[10px] opacity-70">({item.count})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
