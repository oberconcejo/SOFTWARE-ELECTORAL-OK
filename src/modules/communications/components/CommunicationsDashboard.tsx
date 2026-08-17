import React from 'react';
import { 
  Users, 
  TrendingUp, 
  MessageSquare, 
  Share2, 
  Sparkles, 
  Calendar, 
  PlusCircle, 
  ArrowUpRight, 
  Radio, 
  Tv, 
  Globe, 
  FileText, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { 
  CommsKPIs, 
  MediaPiece, 
  SocialChannel, 
  ContentItem, 
  PublicIntervention,
  TrendDataPoint,
  TopicSentiment
} from '@/src/types/communications';

interface CommunicationsDashboardProps {
  kpis: CommsKPIs;
  mediaPieces: MediaPiece[];
  socialChannels: SocialChannel[];
  contentItems: ContentItem[];
  interventions: PublicIntervention[];
  weeklyTrend: TrendDataPoint[];
  topicSentiments: TopicSentiment[];
  onOpenAICopyGenerator: () => void;
  onOpenNewMediaPiece: () => void;
  onOpenNewContentItem: () => void;
  onNavigateTab: (tab: 'resumen' | 'medios' | 'redes' | 'vocerias' | 'analitica') => void;
}

export const CommunicationsDashboard: React.FC<CommunicationsDashboardProps> = ({
  kpis,
  mediaPieces,
  socialChannels,
  contentItems,
  interventions,
  weeklyTrend,
  topicSentiments,
  onOpenAICopyGenerator,
  onOpenNewMediaPiece,
  onOpenNewContentItem,
  onNavigateTab
}) => {
  // Format numbers nicely
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toLocaleString('es-CO');
  };

  // Recent timeline events (upcoming and recently published pieces + scheduled posts)
  const combinedTimeline = [
    ...mediaPieces.slice(0, 3).map(m => ({
      id: m.id,
      title: m.title,
      type: 'Medio Masivo',
      outlet: m.targetOutlet,
      date: m.date,
      status: m.status,
      icon: m.mediaType === 'radio' ? Radio : m.mediaType === 'tv' ? Tv : FileText,
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
    })),
    ...contentItems.slice(0, 3).map(c => ({
      id: c.id,
      title: c.title,
      type: 'Redes Sociales',
      outlet: c.channels.join(', ').toUpperCase(),
      date: `${c.scheduledDate} ${c.scheduledTime || ''}`,
      status: c.stage,
      icon: Share2,
      badgeColor: 'bg-violet-500/20 text-violet-300 border-violet-500/30'
    }))
  ].slice(0, 5);

  return (
    <div className="space-y-6">
      {/* 4 Hero KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Reach */}
        <div className="bg-gradient-to-br from-[#151528] to-[#111120] border border-white/10 rounded-2xl p-5 shadow-xl relative overflow-hidden group hover:border-violet-500/40 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-violet-600/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Alcance Total Estimado</span>
            <div className="w-8 h-8 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center border border-violet-500/20">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-black text-white tracking-tight">
              {formatNumber(kpis.totalReach)}
            </h3>
            <span className="text-xs font-bold text-emerald-400 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +28.4%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
            <span>Prensa & TV: <strong>{formatNumber(mediaPieces.reduce((a,b)=>a+(b.estimatedReach||0),0))}</strong></span>
            <span>Redes: <strong>{formatNumber(socialChannels.reduce((a,b)=>a+(b.totalReach||0),0))}</strong></span>
          </p>
        </div>

        {/* Card 2: Media Mentions */}
        <div className="bg-gradient-to-br from-[#151528] to-[#111120] border border-white/10 rounded-2xl p-5 shadow-xl relative overflow-hidden group hover:border-blue-500/40 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Impactos & Menciones Medios</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-black text-white tracking-tight">
              {mediaPieces.length + interventions.length}
            </h3>
            <span className="text-xs font-bold text-cyan-400 flex items-center">
              {mediaPieces.filter(m => m.status === 'publicado').length} al aire
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-3 flex">
            <div 
              className="bg-emerald-400 h-full" 
              style={{ width: `${kpis.positiveSentimentPct}%` }}
              title={`Positivo: ${kpis.positiveSentimentPct}%`}
            />
            <div 
              className="bg-amber-400 h-full" 
              style={{ width: `${kpis.neutralSentimentPct}%` }}
              title={`Neutro: ${kpis.neutralSentimentPct}%`}
            />
            <div 
              className="bg-rose-400 h-full" 
              style={{ width: `${kpis.negativeSentimentPct}%` }}
              title={`Crítico: ${kpis.negativeSentimentPct}%`}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>{kpis.positiveSentimentPct}% Positivo</span>
            <span>{kpis.neutralSentimentPct}% Neutro</span>
            <span>{kpis.negativeSentimentPct}% Crítico</span>
          </div>
        </div>

        {/* Card 3: Sentiment Index */}
        <div className="bg-gradient-to-br from-[#151528] to-[#111120] border border-white/10 rounded-2xl p-5 shadow-xl relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-600/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Favorabilidad / Sentimiento</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-black text-emerald-400 tracking-tight">
              {kpis.positiveSentimentPct}%
            </h3>
            <span className="text-xs font-semibold text-slate-300">Positivo</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Basado en monitoreo de prensa, radio y comentarios en redes sociales.
          </p>
        </div>

        {/* Card 4: Social Media Stats */}
        <div className="bg-gradient-to-br from-[#151528] to-[#111120] border border-white/10 rounded-2xl p-5 shadow-xl relative overflow-hidden group hover:border-fuchsia-500/40 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-fuchsia-600/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Publicaciones & Redes</span>
            <div className="w-8 h-8 rounded-xl bg-fuchsia-500/10 text-fuchsia-400 flex items-center justify-center border border-fuchsia-500/20">
              <Share2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-black text-white tracking-tight">
              {contentItems.length}
            </h3>
            <span className="text-xs font-bold text-violet-300">
              {kpis.scheduledPosts} programadas
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
            <span>Comunidad: <strong>{formatNumber(socialChannels.reduce((a,b)=>a+b.followers, 0))}</strong></span>
            <span>Engagement: <strong>{(socialChannels.reduce((a,b)=>a+b.engagementRate, 0)/socialChannels.length).toFixed(1)}%</strong></span>
          </div>
        </div>
      </div>

      {/* AI Quick Strategy Banner */}
      <div className="bg-gradient-to-r from-violet-950/60 via-[#18182d] to-purple-950/50 border border-violet-500/30 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-left">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-600/40 text-white shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              Asistente de Comunicación y Contenido Estratégico AI
              <span className="px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 text-[10px] font-bold border border-violet-500/30">
                En línea
              </span>
            </h4>
            <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">
              Genera copys persuasivos, redacta comunicados de prensa con enfoque territorial y monitorea el sentimiento ciudadano en tiempo real.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full md:w-auto">
          <button
            onClick={onOpenAICopyGenerator}
            className="flex-1 md:flex-initial px-4 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-violet-600/30 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Generar Copy con IA
          </button>
          <button
            onClick={onOpenNewMediaPiece}
            className="flex-1 md:flex-initial px-3.5 py-2.5 bg-white/10 hover:bg-white/15 text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            + Pieza de Prensa
          </button>
          <button
            onClick={onOpenNewContentItem}
            className="flex-1 md:flex-initial px-3.5 py-2.5 bg-white/10 hover:bg-white/15 text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5" />
            + Publicación
          </button>
        </div>
      </div>

      {/* Middle Grid: Trend Chart & Channels Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Trend Evolution (8 cols) */}
        <div className="lg:col-span-8 bg-[#12121e] border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-violet-400" />
                Evolución de Alcance & Menciones Semanales
              </h4>
              <p className="text-xs text-slate-400">
                Trayectoria de impactos en medios de comunicación y redes sociales
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('analitica')}
              className="text-xs font-bold text-violet-400 hover:text-violet-300 flex items-center gap-1"
            >
              Ver Analítica Completa <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* SVG Responsive Area / Bar Chart */}
          <div className="pt-2">
            <div className="h-44 w-full flex items-end justify-between gap-3 px-2">
              {weeklyTrend.map((item, idx) => {
                const maxReach = 2500000;
                const heightPct = Math.round((item.reach / maxReach) * 100);
                const isCurrent = idx === weeklyTrend.length - 1;

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] p-1.5 rounded-lg border border-white/20 whitespace-nowrap shadow-lg mb-1 pointer-events-none">
                      <div className="font-bold text-violet-300">{item.period}</div>
                      <div>Alcance: {formatNumber(item.reach)}</div>
                      <div>Menciones: {item.mentions}</div>
                      <div className="text-emerald-400 font-semibold">{item.sentimentScore}% Favorable</div>
                    </div>

                    {/* Bar visual */}
                    <div className="w-full max-w-[48px] bg-slate-800/80 rounded-t-xl overflow-hidden flex flex-col justify-end p-0.5" style={{ height: '100%' }}>
                      <div 
                        className={`w-full rounded-t-lg transition-all duration-500 ${
                          isCurrent 
                            ? 'bg-gradient-to-t from-violet-600 via-purple-500 to-fuchsia-500 shadow-lg shadow-violet-500/50' 
                            : 'bg-gradient-to-t from-violet-950 via-violet-800 to-violet-600 group-hover:from-violet-700'
                        }`}
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>

                    <span className={`text-[10px] font-semibold ${isCurrent ? 'text-violet-300 font-bold' : 'text-slate-400'}`}>
                      {item.period.split(' ')[0]} {item.period.split(' ')[1]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Topics Sentiment pills */}
          <div className="pt-4 border-t border-white/5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Clima de Opinión por Eje Temático:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {topicSentiments.map((ts, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-[#18182a] border border-white/5 flex items-center justify-between">
                  <div className="truncate pr-2">
                    <span className="text-xs font-semibold text-slate-200 block truncate">{ts.topic}</span>
                    <span className="text-[10px] text-slate-400">{ts.mentions} menciones</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 shrink-0">
                    {ts.percentage}% +
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Connected Social Channels Snapshot (4 cols) */}
        <div className="lg:col-span-4 bg-[#12121e] border border-white/10 rounded-2xl p-5 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Share2 className="w-4 h-4 text-fuchsia-400" />
                Canales Oficiales
              </h4>
              <button
                onClick={() => onNavigateTab('redes')}
                className="text-xs font-bold text-fuchsia-400 hover:text-fuchsia-300"
              >
                Kanban Redes →
              </button>
            </div>

            <div className="space-y-2.5">
              {socialChannels.map((ch) => (
                <div
                  key={ch.id}
                  className="p-3 rounded-xl bg-[#18182a] border border-white/5 flex items-center justify-between hover:border-violet-500/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-base">
                      {ch.platform === 'x' && '𝕏'}
                      {ch.platform === 'instagram' && '📸'}
                      {ch.platform === 'facebook' && '👥'}
                      {ch.platform === 'tiktok' && '🎵'}
                      {ch.platform === 'youtube' && '▶️'}
                      {ch.platform === 'whatsapp' && '💬'}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        {ch.name}
                        {ch.isConnected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Activo y sincronizado" />
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400">{ch.handle}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold text-white">
                      {formatNumber(ch.followers)}
                    </div>
                    <div className="text-[10px] text-emerald-400 font-semibold">
                      +{ch.followerGrowth}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-white/5">
            <button
              onClick={() => onNavigateTab('redes')}
              className="w-full py-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              Ver Calendario & Parrilla de Contenidos
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Row: Upcoming Timeline of Media & Posts */}
      <div className="bg-[#12121e] border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              Próximas Acciones & Agenda de Difusión
            </h4>
            <p className="text-xs text-slate-400">
              Cronograma inmediato de ruedas de prensa, entrevistas en vivo y publicaciones programadas
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('medios')}
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            Ver Plan de Medios <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {combinedTimeline.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-[#18182a] border border-white/5 flex flex-col justify-between space-y-3 hover:border-violet-500/40 transition-all group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${item.badgeColor}`}>
                      {item.type}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {item.date}
                    </span>
                  </div>

                  <h5 className="text-xs font-bold text-white group-hover:text-violet-300 transition-colors line-clamp-2">
                    {item.title}
                  </h5>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/5">
                  <span className="truncate max-w-[150px] font-medium text-slate-300">{item.outlet}</span>
                  <span className="px-2 py-0.5 rounded-full bg-white/5 text-slate-300 text-[10px] font-semibold capitalize">
                    {item.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
