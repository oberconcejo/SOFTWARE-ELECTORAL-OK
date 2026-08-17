import React, { useState, useEffect } from 'react';
import { 
  X, 
  FileText, 
  Radio, 
  Tv, 
  Globe, 
  Send, 
  User, 
  Calendar, 
  Link as LinkIcon, 
  TrendingUp, 
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { 
  MediaPiece, 
  MediaType, 
  MediaPieceType, 
  MediaPieceStatus, 
  SentimentType 
} from '@/src/types/communications';

interface MediaPieceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (piece: Omit<MediaPiece, 'id' | 'createdAt'> | Partial<MediaPiece>) => void;
  initialData?: MediaPiece | null;
}

const MEDIA_TYPES: { id: MediaType; label: string; icon: any }[] = [
  { id: 'prensa', label: 'Prensa Escrita', icon: FileText },
  { id: 'radio', label: 'Radio', icon: Radio },
  { id: 'tv', label: 'Televisión', icon: Tv },
  { id: 'digital', label: 'Medio Digital / Web', icon: Globe },
  { id: 'podcast', label: 'Podcast / Streaming', icon: Radio },
  { id: 'agencia', label: 'Agencia de Noticias', icon: Globe }
];

const PIECE_TYPES: { id: MediaPieceType; label: string }[] = [
  { id: 'comunicado', label: 'Comunicado Oficial' },
  { id: 'nota_prensa', label: 'Nota de Prensa' },
  { id: 'entrevista', label: 'Entrevista Exclusiva' },
  { id: 'columna', label: 'Columna de Opinión' },
  { id: 'rueda_prensa', label: 'Rueda de Prensa' },
  { id: 'declaracion', label: 'Declaración a Medios' }
];

const STATUS_OPTIONS: { id: MediaPieceStatus; label: string; color: string }[] = [
  { id: 'borrador', label: 'Borrador', color: 'bg-slate-500/20 text-slate-300' },
  { id: 'revision', label: 'En Revisión', color: 'bg-amber-500/20 text-amber-300' },
  { id: 'enviado', label: 'Enviado / Pautado', color: 'bg-cyan-500/20 text-cyan-300' },
  { id: 'publicado', label: 'Publicado / Al Aire', color: 'bg-emerald-500/20 text-emerald-300' },
  { id: 'archivado', label: 'Archivado', color: 'bg-rose-500/20 text-rose-300' }
];

export const MediaPieceModal: React.FC<MediaPieceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const [title, setTitle] = useState('');
  const [mediaType, setMediaType] = useState<MediaType>('prensa');
  const [targetOutlet, setTargetOutlet] = useState('');
  const [pieceType, setPieceType] = useState<MediaPieceType>('comunicado');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [responsible, setResponsible] = useState('María Camila Restrepo (Dir. Prensa)');
  const [status, setStatus] = useState<MediaPieceStatus>('borrador');
  const [url, setUrl] = useState('');
  const [estimatedReach, setEstimatedReach] = useState<number>(150000);
  const [sentiment, setSentiment] = useState<SentimentType>('positivo');
  const [keyMessage, setKeyMessage] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setMediaType(initialData.mediaType);
      setTargetOutlet(initialData.targetOutlet);
      setPieceType(initialData.pieceType);
      setDate(initialData.date);
      setResponsible(initialData.responsible);
      setStatus(initialData.status);
      setUrl(initialData.url || '');
      setEstimatedReach(initialData.estimatedReach || 0);
      setSentiment(initialData.sentiment || 'positivo');
      setKeyMessage(initialData.keyMessage || '');
      setNotes(initialData.notes || '');
    } else {
      setTitle('');
      setMediaType('prensa');
      setTargetOutlet('');
      setPieceType('comunicado');
      setDate(new Date().toISOString().split('T')[0]);
      setResponsible('María Camila Restrepo (Dir. Prensa)');
      setStatus('borrador');
      setUrl('');
      setEstimatedReach(150000);
      setSentiment('positivo');
      setKeyMessage('');
      setNotes('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetOutlet.trim()) return;

    onSave({
      title: title.trim(),
      mediaType,
      targetOutlet: targetOutlet.trim(),
      pieceType,
      date,
      responsible: responsible.trim(),
      status,
      url: url.trim() || undefined,
      estimatedReach: Number(estimatedReach) || 0,
      sentiment,
      keyMessage: keyMessage.trim(),
      notes: notes.trim() || undefined
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#12121e] border border-violet-500/30 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-violet-950/40 to-[#12121e]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-violet-600/20 text-violet-400 flex items-center justify-center border border-violet-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {initialData ? 'Editar Pieza de Comunicación' : 'Nueva Pieza para Plan de Medios'}
              </h3>
              <p className="text-xs text-slate-400">
                Registra comunicados, notas de prensa, columnas o ruedas de prensa
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Titular o Asunto de la Pieza *
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Lanzamiento del Plan Integral de Seguridad y Cámaras con IA"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none font-medium"
            />
          </div>

          {/* Grid 2 cols: Target Outlet and Media Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Medio Objetivo / Difusión *
              </label>
              <input
                type="text"
                required
                placeholder="Ej: El Tiempo, Caracol Radio, Teleantioquia"
                value={targetOutlet}
                onChange={(e) => setTargetOutlet(e.target.value)}
                className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Formato / Tipo de Medio
              </label>
              <select
                value={mediaType}
                onChange={(e) => setMediaType(e.target.value as MediaType)}
                className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-violet-500 focus:outline-none"
              >
                {MEDIA_TYPES.map((m) => (
                  <option key={m.id} value={m.id}>{m.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid 3 cols: Piece Type, Date, Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Tipo de Pieza
              </label>
              <select
                value={pieceType}
                onChange={(e) => setPieceType(e.target.value as MediaPieceType)}
                className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:border-violet-500 focus:outline-none"
              >
                {PIECE_TYPES.map((pt) => (
                  <option key={pt.id} value={pt.id}>{pt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Fecha Programada
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:border-violet-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Estado Actual
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as MediaPieceStatus)}
                className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:border-violet-500 focus:outline-none font-semibold"
              >
                {STATUS_OPTIONS.map((st) => (
                  <option key={st.id} value={st.id}>{st.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid 2 cols: Responsible & Estimated Reach */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Responsable / Portavoz
              </label>
              <input
                type="text"
                placeholder="Nombre del redactor o vocero asignado"
                value={responsible}
                onChange={(e) => setResponsible(e.target.value)}
                className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Alcance / Audiencia Estimada
              </label>
              <input
                type="number"
                min="0"
                step="5000"
                placeholder="150000"
                value={estimatedReach}
                onChange={(e) => setEstimatedReach(Number(e.target.value))}
                className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-violet-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Key Message */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Mensaje Clave y Argumento Central
            </label>
            <textarea
              rows={2}
              placeholder="¿Cuál es la idea fuerza que debe quedar posicionada en el titular o la nota?"
              value={keyMessage}
              onChange={(e) => setKeyMessage(e.target.value)}
              className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Grid 2 cols: URL & Sentiment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Enlace / Testigo de Publicación (Opcional)
              </label>
              <input
                type="url"
                placeholder="https://eltiempo.com/noticia..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Sentimiento Esperado / Recibido
              </label>
              <div className="flex gap-2">
                {(['positivo', 'neutro', 'critico'] as SentimentType[]).map((sent) => (
                  <button
                    key={sent}
                    type="button"
                    onClick={() => setSentiment(sent)}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold capitalize border transition-all ${
                      sentiment === sent
                        ? sent === 'positivo' 
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : sent === 'neutro'
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                            : 'bg-rose-500/20 border-rose-500 text-rose-300'
                        : 'bg-[#181828] border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {sent}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Observaciones del Comité de Comunicaciones
            </label>
            <input
              type="text"
              placeholder="Instrucciones especiales para el vocero o seguimiento con el periodista"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none"
            />
          </div>

          {/* Footer Buttons */}
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
              {initialData ? 'Actualizar Pieza' : 'Guardar en Plan de Medios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
