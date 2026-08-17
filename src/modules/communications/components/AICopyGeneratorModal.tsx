import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  Copy, 
  Check, 
  Send, 
  Tag, 
  Share2, 
  Layers, 
  HelpCircle,
  RefreshCw,
  PlusCircle
} from 'lucide-react';
import { SocialPlatform, ContentItem, KanbanStage } from '@/src/types/communications';

interface AICopyGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertToCalendar: (item: Partial<ContentItem>) => void;
  generateAICopy: (params: {
    topic: string;
    tone: string;
    channels: SocialPlatform[];
    targetAudience: string;
    candidateName?: string;
  }) => Promise<any>;
}

const TOPIC_PRESETS = [
  'Seguridad Ciudadana y Cámaras con IA',
  'Empleo Juvenil y Alivios Tributarios a Pymes',
  'Salud Digna y Farmacias Satélite 24/7',
  'Becas Universitarias de Tecnología e IA',
  'Recuperación de la Malla Vial y Movilidad',
  'Agua Potable y Cuencas Ambientales',
  'Madres Cabeza de Hogar y Casas de Cuidado',
  'Transparencia y Cero Corrupción en Obras'
];

const TONE_PRESETS = [
  { id: 'inspirador', label: 'Emocional & Inspirador', desc: 'Conectar con los sueños y orgullo ciudadano' },
  { id: 'propuesta', label: 'Propuesta Concreta & Técnica', desc: 'Datos, cifras claras y viabilidad' },
  { id: 'convocatoria', label: 'Movilización & Convocatoria', desc: 'Llamado a la acción para eventos y voluntarios' },
  { id: 'contraste', label: 'Contraste & Debate Firme', desc: 'Desmentir noticias falsas y fijar posición' },
  { id: 'cercano', label: 'Cercano & Humano', desc: 'Historias de vida y testimonios de barrio' }
];

const AUDIENCE_PRESETS = [
  'Ciudadanía general y votantes indecisos',
  'Jóvenes y universitarios (16 a 28 años)',
  'Comerciantes, microempresarios y emprendedores',
  'Madres comunitarias y jefas de hogar',
  'Adultos mayores y pensionados'
];

const AVAILABLE_CHANNELS: { id: SocialPlatform; label: string; icon: string }[] = [
  { id: 'instagram', label: 'Instagram', icon: '📸' },
  { id: 'x', label: 'X (Twitter)', icon: '𝕏' },
  { id: 'facebook', label: 'Facebook', icon: '👥' },
  { id: 'tiktok', label: 'TikTok', icon: '🎵' },
  { id: 'youtube', label: 'YouTube', icon: '▶️' },
  { id: 'whatsapp', label: 'WhatsApp', icon: '💬' }
];

export const AICopyGeneratorModal: React.FC<AICopyGeneratorModalProps> = ({
  isOpen,
  onClose,
  onInsertToCalendar,
  generateAICopy
}) => {
  const [topic, setTopic] = useState(TOPIC_PRESETS[0]);
  const [customTopic, setCustomTopic] = useState('');
  const [tone, setTone] = useState(TONE_PRESETS[0].label);
  const [selectedChannels, setSelectedChannels] = useState<SocialPlatform[]>(['instagram', 'x', 'facebook']);
  const [targetAudience, setTargetAudience] = useState(AUDIENCE_PRESETS[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const toggleChannel = (ch: SocialPlatform) => {
    setSelectedChannels(prev => 
      prev.includes(ch) ? (prev.length > 1 ? prev.filter(c => c !== ch) : prev) : [...prev, ch]
    );
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    const activeTopic = customTopic.trim() ? customTopic.trim() : topic;
    const result = await generateAICopy({
      topic: activeTopic,
      tone,
      channels: selectedChannels,
      targetAudience,
      candidateName: 'Santiago Pérez Ospina'
    });
    setGeneratedResult(result);
    setIsLoading(false);
  };

  const handleCopyText = () => {
    if (!generatedResult) return;
    const fullText = `${generatedResult.copy}\n\n${(generatedResult.hashtags || []).join(' ')}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInsert = (stage: KanbanStage = 'idea') => {
    if (!generatedResult) return;
    const activeTopic = customTopic.trim() ? customTopic.trim() : topic;
    onInsertToCalendar({
      title: generatedResult.title || `Publicación: ${activeTopic}`,
      copy: generatedResult.copy,
      hashtags: generatedResult.hashtags || [],
      channels: selectedChannels,
      stage,
      scheduledDate: new Date().toISOString().split('T')[0],
      scheduledTime: '18:00',
      approver: 'Pendiente',
      author: 'Asistente IA (Generador)',
      mediaType: generatedResult.suggestedMediaType || 'carrusel',
      tone,
      targetAudience,
      aiGenerated: true
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#12121e] border border-violet-500/30 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-violet-950/40 via-[#18182a] to-[#12121e]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/30 text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">Generador Inteligente de Copys & Hashtags AI</h3>
                <span className="px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 text-[10px] font-bold border border-violet-500/30">
                  IA Estratégica
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Diseña contenido persuasivo alineado con la narrativa electoral y los ejes programáticos.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
          {/* Left Form Controls */}
          <div className="lg:col-span-5 space-y-4">
            {/* Topic Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-violet-400" />
                Eje Temático o Propuesta
              </label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-violet-500 focus:outline-none"
              >
                {TOPIC_PRESETS.map((t, i) => (
                  <option key={i} value={t}>{t}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="O escribe un tema o propuesta personalizada..."
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                className="w-full bg-[#181828] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none mt-1.5"
              />
            </div>

            {/* Tone Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Tono Discursivo</label>
              <div className="grid grid-cols-1 gap-1.5">
                {TONE_PRESETS.map((tp) => (
                  <button
                    key={tp.id}
                    type="button"
                    onClick={() => setTone(tp.label)}
                    className={`p-2 rounded-xl text-left transition-all border text-xs flex flex-col ${
                      tone === tp.label
                        ? 'bg-violet-950/60 border-violet-500 text-white font-medium shadow-sm'
                        : 'bg-[#181828]/60 border-white/5 text-slate-300 hover:border-violet-500/40 hover:bg-[#181828]'
                    }`}
                  >
                    <span className="font-semibold text-violet-200">{tp.label}</span>
                    <span className="text-[10px] text-slate-400">{tp.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Target Channels */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-violet-400" />
                Canales Objetivos
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {AVAILABLE_CHANNELS.map((ch) => {
                  const isSelected = selectedChannels.includes(ch.id);
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => toggleChannel(ch.id)}
                      className={`p-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all border ${
                        isSelected 
                          ? 'bg-violet-600/30 border-violet-400 text-white shadow-sm' 
                          : 'bg-[#181828]/60 border-white/5 text-slate-400 hover:text-white hover:border-white/20'
                      }`}
                    >
                      <span>{ch.icon}</span>
                      <span>{ch.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Audience */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Audiencia Segmentada</label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-violet-500 focus:outline-none"
              >
                {AUDIENCE_PRESETS.map((a, i) => (
                  <option key={i} value={a}>{a}</option>
                ))}
              </select>
            </div>

            {/* Generate Action Button */}
            <button
              type="button"
              disabled={isLoading}
              onClick={handleGenerate}
              className="w-full py-3 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-violet-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Sintetizando copy estratégico...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generar Copy & Hashtags con IA</span>
                </>
              )}
            </button>
          </div>

          {/* Right Output Panel */}
          <div className="lg:col-span-7 flex flex-col justify-between bg-[#0b0b14] border border-white/10 rounded-2xl p-5 space-y-4">
            {generatedResult ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div>
                    <span className="text-[10px] font-bold tracking-wider text-violet-400 uppercase">
                      Borrador Sugerido por IA
                    </span>
                    <h4 className="text-sm font-bold text-white mt-0.5">
                      {generatedResult.title}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                      {generatedResult.suggestedMediaType?.toUpperCase()}
                    </span>
                    <button
                      onClick={handleCopyText}
                      className="p-1.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg transition-colors flex items-center gap-1 text-xs"
                      title="Copiar al portapapeles"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span className="text-[10px]">{copied ? 'Copiado' : 'Copiar'}</span>
                    </button>
                  </div>
                </div>

                {/* Copy Text Area */}
                <div className="bg-[#141424] border border-violet-500/20 rounded-xl p-4 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
                  {generatedResult.copy}
                </div>

                {/* Hashtags section */}
                {generatedResult.hashtags && generatedResult.hashtags.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-400">Hashtags recomendados:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {generatedResult.hashtags.map((tag: string, i: number) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg bg-violet-500/15 text-violet-300 text-[11px] font-semibold border border-violet-500/30"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Channels indicator */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/5">
                  <span>Optimizado para: <strong>{selectedChannels.join(', ')}</strong></span>
                  <span>{generatedResult.copy?.length || 0} caracteres</span>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3 my-auto">
                <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-bold text-slate-300">
                  Configura tus parámetros y haz clic en "Generar"
                </h4>
                <p className="text-xs text-slate-500 max-w-sm">
                  La IA redactará copys de alto impacto, adaptará el lenguaje para el electorado de Colombia y propondrá los hashtags más virales para tu campaña.
                </p>
              </div>
            )}

            {/* Bottom Actions */}
            {generatedResult && (
              <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="px-3 py-2 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Regenerar Variante
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleInsert('idea')}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
                    Guardar como Idea
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsert('programado')}
                    className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Insertar y Programar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
