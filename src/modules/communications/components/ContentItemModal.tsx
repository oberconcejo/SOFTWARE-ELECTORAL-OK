import React, { useState, useEffect } from 'react';
import { 
  X, 
  Share2, 
  Calendar, 
  Clock, 
  Send, 
  Sparkles, 
  Layers, 
  Image as ImageIcon,
  Tag,
  User,
  Plus
} from 'lucide-react';
import { 
  ContentItem, 
  SocialPlatform, 
  KanbanStage, 
  ContentMediaType 
} from '@/src/types/communications';

interface ContentItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Omit<ContentItem, 'id' | 'createdAt'> | Partial<ContentItem>) => void;
  initialData?: ContentItem | null;
  onOpenAIGenerator?: () => void;
}

const AVAILABLE_CHANNELS: { id: SocialPlatform; label: string; icon: string }[] = [
  { id: 'instagram', label: 'Instagram', icon: '📸' },
  { id: 'x', label: 'X', icon: '𝕏' },
  { id: 'facebook', label: 'Facebook', icon: '👥' },
  { id: 'tiktok', label: 'TikTok', icon: '🎵' },
  { id: 'youtube', label: 'YouTube', icon: '▶️' },
  { id: 'whatsapp', label: 'WhatsApp', icon: '💬' }
];

const STAGE_OPTIONS: { id: KanbanStage; label: string }[] = [
  { id: 'idea', label: '💡 Idea de Contenido' },
  { id: 'diseno', label: '🎨 En Diseño / Arte' },
  { id: 'aprobacion', label: '⏳ En Aprobación' },
  { id: 'programado', label: '📅 Programado' },
  { id: 'publicado', label: '🚀 Publicado' }
];

const MEDIA_TYPES: { id: ContentMediaType; label: string }[] = [
  { id: 'carrusel', label: 'Carrusel de Imágenes' },
  { id: 'reel', label: 'Reel / TikTok Vertical' },
  { id: 'imagen', label: 'Imagen Única / Grilla' },
  { id: 'video', label: 'Video Horizontal' },
  { id: 'hilo', label: 'Hilo Explicativo (X)' },
  { id: 'texto', label: 'Texto / Comunicado Plano' }
];

export const ContentItemModal: React.FC<ContentItemModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  onOpenAIGenerator
}) => {
  const [title, setTitle] = useState('');
  const [copy, setCopy] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState('');
  const [channels, setChannels] = useState<SocialPlatform[]>(['instagram', 'x']);
  const [stage, setStage] = useState<KanbanStage>('idea');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [scheduledTime, setScheduledTime] = useState('18:00');
  const [approver, setApprover] = useState('Felipe Jaramillo (Director Estrategia)');
  const [author, setAuthor] = useState('Daniela Toro (Community Manager)');
  const [mediaType, setMediaType] = useState<ContentMediaType>('carrusel');
  const [mediaUrl, setMediaUrl] = useState('');
  const [tone, setTone] = useState('Inspirador y Cercano');
  const [targetAudience, setTargetAudience] = useState('Jóvenes y Familias');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setCopy(initialData.copy);
      setHashtags(initialData.hashtags || []);
      setChannels(initialData.channels || ['instagram', 'x']);
      setStage(initialData.stage);
      setScheduledDate(initialData.scheduledDate);
      setScheduledTime(initialData.scheduledTime);
      setApprover(initialData.approver || 'Felipe Jaramillo');
      setAuthor(initialData.author || 'Equipo Digital');
      setMediaType(initialData.mediaType || 'carrusel');
      setMediaUrl(initialData.mediaUrl || '');
      setTone(initialData.tone || 'Inspirador');
      setTargetAudience(initialData.targetAudience || 'General');
    } else {
      setTitle('');
      setCopy('');
      setHashtags(['#SantiagoPerez', '#CampañaGanadora', '#ElFuturoEsAhora']);
      setChannels(['instagram', 'x']);
      setStage('idea');
      setScheduledDate(new Date().toISOString().split('T')[0]);
      setScheduledTime('18:00');
      setApprover('Felipe Jaramillo (Director Estrategia)');
      setAuthor('Daniela Toro (Community Manager)');
      setMediaType('carrusel');
      setMediaUrl('');
      setTone('Inspirador y Cercano');
      setTargetAudience('Jóvenes y Familias');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const toggleChannel = (ch: SocialPlatform) => {
    setChannels(prev => 
      prev.includes(ch) ? (prev.length > 1 ? prev.filter(c => c !== ch) : prev) : [...prev, ch]
    );
  };

  const handleAddHashtag = () => {
    if (!hashtagInput.trim()) return;
    const formatted = hashtagInput.startsWith('#') ? hashtagInput.trim() : `#${hashtagInput.trim()}`;
    if (!hashtags.includes(formatted)) {
      setHashtags(prev => [...prev, formatted]);
    }
    setHashtagInput('');
  };

  const handleRemoveHashtag = (tagToRemove: string) => {
    setHashtags(prev => prev.filter(t => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !copy.trim()) return;

    onSave({
      title: title.trim(),
      copy: copy.trim(),
      hashtags,
      channels,
      stage,
      scheduledDate,
      scheduledTime,
      approver: approver.trim(),
      author: author.trim(),
      mediaType,
      mediaUrl: mediaUrl.trim() || undefined,
      tone,
      targetAudience
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#12121e] border border-violet-500/30 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-violet-950/40 via-[#18182a] to-[#12121e]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center text-white shadow-md">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {initialData ? 'Editar Publicación / Contenido' : 'Nueva Publicación para Redes'}
              </h3>
              <p className="text-xs text-slate-400">
                Planifica artes, copys, canales y fecha en el calendario electoral
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {onOpenAIGenerator && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAIGenerator();
                }}
                className="px-3 py-1.5 bg-violet-600/30 hover:bg-violet-600/50 text-violet-300 border border-violet-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Generar con IA
              </button>
            )}
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Título Interno / Concepto de la Publicación *
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Carrusel: 5 Soluciones concretas a la inseguridad en Comuna 7"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none font-medium"
            />
          </div>

          {/* Copy Text */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-300">
                Copy / Texto de la Publicación *
              </label>
              <span className="text-[10px] text-slate-500">{copy.length} caracteres</span>
            </div>
            <textarea
              required
              rows={4}
              placeholder="Escribe el copy persuasivo con emojis, llamados a la acción y enlaces..."
              value={copy}
              onChange={(e) => setCopy(e.target.value)}
              className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Hashtags */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Hashtags de Campaña
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="+ Agregar hashtag (#Santiago2026)..."
                value={hashtagInput}
                onChange={(e) => setHashtagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddHashtag())}
                className="flex-1 bg-[#1a1a2e] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddHashtag}
                className="px-3 py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Agregar
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {hashtags.map((tag, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-violet-500/15 text-violet-300 text-[11px] font-semibold border border-violet-500/30 flex items-center gap-1.5"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveHashtag(tag)}
                    className="text-violet-400 hover:text-rose-400 transition-colors"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Channels Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Canales / Redes de Difusión
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {AVAILABLE_CHANNELS.map((ch) => {
                const isSelected = channels.includes(ch.id);
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => toggleChannel(ch.id)}
                    className={`p-2 rounded-xl text-xs font-medium flex flex-col items-center justify-center gap-1 transition-all border ${
                      isSelected 
                        ? 'bg-violet-600/30 border-violet-400 text-white shadow-sm' 
                        : 'bg-[#181828]/60 border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="text-base">{ch.icon}</span>
                    <span className="text-[10px]">{ch.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grid 3 cols: Stage, Format, Approver */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Estado / Etapa Kanban
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as KanbanStage)}
                className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:border-violet-500 focus:outline-none font-semibold"
              >
                {STAGE_OPTIONS.map((st) => (
                  <option key={st.id} value={st.id}>{st.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Formato Visual
              </label>
              <select
                value={mediaType}
                onChange={(e) => setMediaType(e.target.value as ContentMediaType)}
                className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:border-violet-500 focus:outline-none"
              >
                {MEDIA_TYPES.map((m) => (
                  <option key={m.id} value={m.id}>{m.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Aprobador Responsable
              </label>
              <input
                type="text"
                placeholder="Nombre del aprobador"
                value={approver}
                onChange={(e) => setApprover(e.target.value)}
                className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:border-violet-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Grid 2 cols: Scheduled Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Fecha Programada
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:border-violet-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Hora de Publicación (Óptima)
              </label>
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:border-violet-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Media URL / Preview link */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              URL del Arte / Video / Drive (Opcional)
            </label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/... o enlace de Figma / Drive"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-violet-600/30 transition-all flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {initialData ? 'Actualizar Publicación' : 'Guardar en el Calendario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
