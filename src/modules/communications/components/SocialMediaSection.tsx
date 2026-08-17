import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Sparkles, 
  Calendar, 
  Share2, 
  Clock, 
  User, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Edit3, 
  Trash2, 
  Copy, 
  Check, 
  ExternalLink,
  Filter,
  Image as ImageIcon,
  Tag
} from 'lucide-react';
import { 
  SocialChannel, 
  ContentItem, 
  KanbanStage, 
  SocialPlatform 
} from '@/src/types/communications';

interface SocialMediaSectionProps {
  socialChannels: SocialChannel[];
  contentItems: ContentItem[];
  onToggleConnection: (id: string) => void;
  onAddContent: () => void;
  onEditContent: (item: ContentItem) => void;
  onDeleteContent: (id: string) => void;
  onMoveStage: (id: string, newStage: KanbanStage) => void;
  onOpenAICopy: () => void;
}

const KANBAN_COLUMNS: { id: KanbanStage; label: string; icon: string; color: string; badge: string }[] = [
  { id: 'idea', label: 'Ideas de Contenido', icon: '💡', color: 'border-amber-500/40 text-amber-300', badge: 'bg-amber-500/10 text-amber-300 border-amber-500/20' },
  { id: 'diseno', label: 'En Diseño / Arte', icon: '🎨', color: 'border-cyan-500/40 text-cyan-300', badge: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20' },
  { id: 'aprobacion', label: 'En Aprobación', icon: '⏳', color: 'border-purple-500/40 text-purple-300', badge: 'bg-purple-500/10 text-purple-300 border-purple-500/20' },
  { id: 'programado', label: 'Programado', icon: '📅', color: 'border-blue-500/40 text-blue-300', badge: 'bg-blue-500/10 text-blue-300 border-blue-500/20' },
  { id: 'publicado', label: 'Publicado', icon: '🚀', color: 'border-emerald-500/40 text-emerald-300', badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' }
];

const PLATFORM_ICONS: Record<SocialPlatform, string> = {
  instagram: '📸',
  x: '𝕏',
  facebook: '👥',
  tiktok: '🎵',
  youtube: '▶️',
  whatsapp: '💬',
  telegram: '✈️'
};

export const SocialMediaSection: React.FC<SocialMediaSectionProps> = ({
  socialChannels,
  contentItems,
  onToggleConnection,
  onAddContent,
  onEditContent,
  onDeleteContent,
  onMoveStage,
  onOpenAICopy
}) => {
  const [selectedChannelFilter, setSelectedChannelFilter] = useState<string>('todos');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter content items
  const filteredItems = useMemo(() => {
    if (selectedChannelFilter === 'todos') return contentItems;
    return contentItems.filter(item => item.channels.includes(selectedChannelFilter as SocialPlatform));
  }, [contentItems, selectedChannelFilter]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getNextStage = (current: KanbanStage): KanbanStage | null => {
    const stages: KanbanStage[] = ['idea', 'diseno', 'aprobacion', 'programado', 'publicado'];
    const idx = stages.indexOf(current);
    return idx < stages.length - 1 ? stages[idx + 1] : null;
  };

  const getPrevStage = (current: KanbanStage): KanbanStage | null => {
    const stages: KanbanStage[] = ['idea', 'diseno', 'aprobacion', 'programado', 'publicado'];
    const idx = stages.indexOf(current);
    return idx > 0 ? stages[idx - 1] : null;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Connected Channels Carousel / Grid */}
      <div className="bg-[#12121e] border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Share2 className="w-5 h-5 text-fuchsia-400" />
              Ecosistema de Canales Digitales & Redes Oficiales
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Monitorea crecimiento de seguidores, engagement y sincronización de cuentas
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAICopy}
              className="px-3.5 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold text-xs rounded-xl shadow-md shadow-violet-600/30 flex items-center gap-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Generador de Copys AI
            </button>
            <button
              onClick={onAddContent}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-violet-400" />
              + Nueva Publicación
            </button>
          </div>
        </div>

        {/* Social Channels Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {socialChannels.map((ch) => (
            <div
              key={ch.id}
              className="p-3.5 rounded-xl bg-[#18182a] border border-white/5 flex flex-col justify-between space-y-2 group hover:border-violet-500/40 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xl">{PLATFORM_ICONS[ch.platform]}</span>
                <button
                  onClick={() => onToggleConnection(ch.id)}
                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase transition-colors ${
                    ch.isConnected
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-700 text-slate-400'
                  }`}
                  title="Haz clic para conectar/desconectar cuenta"
                >
                  {ch.isConnected ? 'Conectado' : 'Inactivo'}
                </button>
              </div>

              <div>
                <div className="text-xs font-bold text-white truncate">{ch.name}</div>
                <div className="text-[10px] text-slate-400 truncate">{ch.handle}</div>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="font-bold text-white">
                  {(ch.followers / 1000).toFixed(1)}k
                </span>
                <span className="text-[10px] text-emerald-400 font-bold">
                  +{ch.followerGrowth}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Kanban Board Controls & Header */}
      <div className="bg-[#12121e] border border-white/10 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-violet-400" />
          <span className="text-xs font-bold text-slate-300">Filtrar tablero por canal:</span>
          <div className="flex flex-wrap gap-1.5">
            {['todos', 'instagram', 'x', 'facebook', 'tiktok', 'youtube'].map((p) => (
              <button
                key={p}
                onClick={() => setSelectedChannelFilter(p)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                  selectedChannelFilter === p
                    ? 'bg-violet-600 text-white'
                    : 'bg-[#18182a] text-slate-400 hover:text-white'
                }`}
              >
                {p === 'todos' ? 'Todos' : PLATFORM_ICONS[p as SocialPlatform] + ' ' + p}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs text-slate-400">
          Total contenidos en flujo: <strong className="text-white">{filteredItems.length}</strong>
        </div>
      </div>

      {/* 5-Column Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {KANBAN_COLUMNS.map((col) => {
          const columnItems = filteredItems.filter(item => item.stage === col.id);

          return (
            <div
              key={col.id}
              className="bg-[#12121e] border border-white/10 rounded-2xl p-3.5 shadow-xl flex flex-col space-y-3 min-h-[500px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span>{col.icon}</span>
                  <h4 className="text-xs font-bold text-white">{col.label}</h4>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${col.badge}`}>
                  {columnItems.length}
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] pr-1">
                {columnItems.length === 0 ? (
                  <div className="h-32 border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center p-3 text-center text-slate-500 text-xs">
                    <span>Sin publicaciones</span>
                    <button
                      onClick={onAddContent}
                      className="text-[10px] text-violet-400 hover:underline mt-1 font-semibold"
                    >
                      + Agregar aquí
                    </button>
                  </div>
                ) : (
                  columnItems.map((item) => {
                    const next = getNextStage(item.stage);
                    const prev = getPrevStage(item.stage);

                    return (
                      <div
                        key={item.id}
                        className="bg-[#18182a] border border-white/5 hover:border-violet-500/40 rounded-xl p-3.5 space-y-2.5 shadow-md transition-all group relative"
                      >
                        {/* Channels & Media Type */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            {item.channels.map((ch, idx) => (
                              <span key={idx} className="text-xs" title={ch}>
                                {PLATFORM_ICONS[ch]}
                              </span>
                            ))}
                          </div>

                          <span className="px-2 py-0.5 rounded-md bg-white/5 text-slate-400 text-[9px] font-bold uppercase">
                            {item.mediaType}
                          </span>
                        </div>

                        {/* Title */}
                        <h5 className="text-xs font-bold text-white leading-snug group-hover:text-violet-200 transition-colors">
                          {item.title}
                        </h5>

                        {/* Copy snippet */}
                        <p className="text-[11px] text-slate-400 line-clamp-3 leading-relaxed">
                          {item.copy}
                        </p>

                        {/* Hashtags */}
                        {item.hashtags && item.hashtags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {item.hashtags.slice(0, 2).map((tag, i) => (
                              <span key={i} className="text-[9px] text-violet-300 bg-violet-500/10 px-1.5 py-0.5 rounded">
                                {tag}
                              </span>
                            ))}
                            {item.hashtags.length > 2 && (
                              <span className="text-[9px] text-slate-500">
                                +{item.hashtags.length - 2}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Date & Approver */}
                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-white/5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            {item.scheduledDate} {item.scheduledTime}
                          </span>
                          <span className="truncate max-w-[90px]" title={`Aprobador: ${item.approver}`}>
                            {item.approver?.split(' ')[0]}
                          </span>
                        </div>

                        {/* Card Actions */}
                        <div className="flex items-center justify-between pt-2 border-t border-white/5">
                          {/* Move Left Button */}
                          {prev ? (
                            <button
                              onClick={() => onMoveStage(item.id, prev)}
                              className="p-1 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded transition-colors"
                              title={`Mover a ${prev}`}
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                          ) : <div />}

                          {/* Quick Tools */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleCopy(item.id, `${item.copy}\n\n${(item.hashtags || []).join(' ')}`)}
                              className="p-1 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded transition-colors"
                              title="Copiar texto completo"
                            >
                              {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => onEditContent(item)}
                              className="p-1 text-slate-400 hover:text-violet-300 bg-white/5 hover:bg-white/10 rounded transition-colors"
                              title="Editar publicación"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteContent(item.id)}
                              className="p-1 text-slate-400 hover:text-rose-400 bg-white/5 hover:bg-white/10 rounded transition-colors"
                              title="Eliminar publicación"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Move Right Button */}
                          {next ? (
                            <button
                              onClick={() => onMoveStage(item.id, next)}
                              className="p-1 text-slate-400 hover:text-emerald-400 bg-white/5 hover:bg-white/10 rounded transition-colors"
                              title={`Avanzar a ${next}`}
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          ) : <div />}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
