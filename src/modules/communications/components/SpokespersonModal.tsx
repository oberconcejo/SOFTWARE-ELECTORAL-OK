import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Phone, 
  Mail, 
  Tag, 
  Send, 
  Star, 
  Check, 
  ShieldCheck, 
  Mic, 
  Radio, 
  Calendar,
  Layers,
  Plus
} from 'lucide-react';
import { 
  Spokesperson, 
  PublicIntervention, 
  TalkingPoint, 
  SentimentType 
} from '@/src/types/communications';

// 1. Spokesperson Modal
interface SpokespersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (spk: Omit<Spokesperson, 'id' | 'interventionsCount'> | Partial<Spokesperson>) => void;
  initialData?: Spokesperson | null;
}

export const SpokespersonModal: React.FC<SpokespersonModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('');
  const [authorizedTopics, setAuthorizedTopics] = useState<string[]>([]);
  const [topicInput, setTopicInput] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'activo' | 'entrenamiento' | 'restringido'>('activo');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [mediaRating, setMediaRating] = useState(4.8);

  useEffect(() => {
    if (initialData) {
      setFullName(initialData.fullName);
      setRole(initialData.role);
      setAuthorizedTopics(initialData.authorizedTopics || []);
      setPhone(initialData.phone);
      setEmail(initialData.email);
      setStatus(initialData.status);
      setAvatarUrl(initialData.avatarUrl || '');
      setMediaRating(initialData.mediaRating || 4.8);
    } else {
      setFullName('');
      setRole('');
      setAuthorizedTopics(['Seguridad Ciudadana', 'Educación']);
      setPhone('+57 ');
      setEmail('');
      setStatus('activo');
      setAvatarUrl('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80');
      setMediaRating(4.8);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleAddTopic = () => {
    if (!topicInput.trim()) return;
    if (!authorizedTopics.includes(topicInput.trim())) {
      setAuthorizedTopics(prev => [...prev, topicInput.trim()]);
    }
    setTopicInput('');
  };

  const handleRemoveTopic = (top: string) => {
    setAuthorizedTopics(prev => prev.filter(t => t !== top));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !role.trim()) return;

    onSave({
      fullName: fullName.trim(),
      role: role.trim(),
      authorizedTopics,
      phone: phone.trim(),
      email: email.trim(),
      status,
      avatarUrl: avatarUrl.trim() || undefined,
      mediaRating
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#12121e] border border-violet-500/30 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-violet-950/40 to-[#12121e]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-violet-600/20 text-violet-400 flex items-center justify-center border border-violet-500/30">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {initialData ? 'Editar Vocero Oficial' : 'Registrar Nuevo Vocero Oficial'}
              </h3>
              <p className="text-xs text-slate-400">
                Define temas autorizados y control institucional de vocerías
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Nombre Completo *</label>
            <input
              type="text"
              required
              placeholder="Ej: Dra. Elena Mosquera Garcés"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-violet-500 focus:outline-none font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Cargo / Rol en Campaña *</label>
            <input
              type="text"
              required
              placeholder="Ej: Jefa de Programa de Gobierno / Asesor de Seguridad"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-violet-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Teléfono / WhatsApp</label>
              <input
                type="text"
                placeholder="+57 300 000 0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-violet-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Correo Electrónico</label>
              <input
                type="email"
                placeholder="vocero@campanaganadora.co"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-violet-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Temas y Ejes Habilitados</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="+ Agregar tema autorizado (ej: Salud)..."
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTopic())}
                className="flex-1 bg-[#1a1a2e] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-violet-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddTopic}
                className="px-3 py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl"
              >
                Agregar
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {authorizedTopics.map((top, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-violet-500/20 text-violet-300 text-[11px] font-semibold border border-violet-500/30 flex items-center gap-1.5"
                >
                  {top}
                  <button type="button" onClick={() => handleRemoveTopic(top)} className="text-violet-400 hover:text-rose-400">×</button>
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Estado de Habilitación</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-violet-500 focus:outline-none"
              >
                <option value="activo">🟢 Habilitado / Activo</option>
                <option value="entrenamiento">🟡 En Media Training</option>
                <option value="restringido">🔴 Restringido / En Pausa</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Media Rating (1 a 5)</label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="5"
                value={mediaRating}
                onChange={(e) => setMediaRating(Number(e.target.value))}
                className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-violet-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-violet-600/30 flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Guardar Vocero
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 2. Public Intervention Modal
interface InterventionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (inv: Omit<PublicIntervention, 'id'> | Partial<PublicIntervention>) => void;
  spokespersons: Spokesperson[];
  initialData?: PublicIntervention | null;
}

export const InterventionModal: React.FC<InterventionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  spokespersons,
  initialData
}) => {
  const [spokespersonId, setSpokespersonId] = useState('');
  const [outletName, setOutletName] = useState('');
  const [mediaType, setMediaType] = useState<'radio' | 'tv' | 'prensa' | 'digital' | 'foro'>('radio');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [topic, setTopic] = useState('');
  const [sentiment, setSentiment] = useState<SentimentType>('positivo');
  const [summary, setSummary] = useState('');
  const [impactReach, setImpactReach] = useState(150000);
  const [recordingUrl, setRecordingUrl] = useState('');

  useEffect(() => {
    if (initialData) {
      setSpokespersonId(initialData.spokespersonId);
      setOutletName(initialData.outletName);
      setMediaType(initialData.mediaType);
      setDate(initialData.date);
      setTopic(initialData.topic);
      setSentiment(initialData.sentiment);
      setSummary(initialData.summary);
      setImpactReach(initialData.impactReach);
      setRecordingUrl(initialData.recordingUrl || '');
    } else {
      setSpokespersonId(spokespersons[0]?.id || '');
      setOutletName('');
      setMediaType('radio');
      setDate(new Date().toISOString().split('T')[0]);
      setTopic('');
      setSentiment('positivo');
      setSummary('');
      setImpactReach(150000);
      setRecordingUrl('');
    }
  }, [initialData, isOpen, spokespersons]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!outletName.trim() || !topic.trim()) return;

    const matchedSpk = spokespersons.find(s => s.id === spokespersonId);

    onSave({
      spokespersonId,
      spokespersonName: matchedSpk ? matchedSpk.fullName : 'Vocero Asignado',
      outletName: outletName.trim(),
      mediaType,
      date,
      topic: topic.trim(),
      sentiment,
      summary: summary.trim(),
      impactReach: Number(impactReach) || 0,
      recordingUrl: recordingUrl.trim() || undefined
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#12121e] border border-violet-500/30 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-violet-950/40 to-[#12121e]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {initialData ? 'Editar Intervención Pública' : 'Registrar Intervención en Medios'}
              </h3>
              <p className="text-xs text-slate-400">
                Bitácora de entrevistas, debates radiales y apariciones en TV
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Vocero Titular</label>
            <select
              value={spokespersonId}
              onChange={(e) => setSpokespersonId(e.target.value)}
              className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:border-violet-500 focus:outline-none"
            >
              {spokespersons.map((s) => (
                <option key={s.id} value={s.id}>{s.fullName} ({s.role})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Medio / Emisora *</label>
              <input
                type="text"
                required
                placeholder="Ej: Caracol Radio 6AM"
                value={outletName}
                onChange={(e) => setOutletName(e.target.value)}
                className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-violet-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Tipo de Medio</label>
              <select
                value={mediaType}
                onChange={(e) => setMediaType(e.target.value as any)}
                className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:border-violet-500 focus:outline-none"
              >
                <option value="radio">Radio</option>
                <option value="tv">Televisión</option>
                <option value="prensa">Prensa Escrita</option>
                <option value="digital">Digital / Streaming</option>
                <option value="foro">Foro / Auditorio</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Fecha</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:border-violet-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Alcance de Audiencia</label>
              <input
                type="number"
                step="5000"
                value={impactReach}
                onChange={(e) => setImpactReach(Number(e.target.value))}
                className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:border-violet-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Tema / Eje Discutido *</label>
            <input
              type="text"
              required
              placeholder="Ej: Debate sobre reactivación de empleo y seguridad barrial"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-violet-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Resumen del Impacto y Desempeño</label>
            <textarea
              rows={3}
              placeholder="Cómo se desenvolvió el vocero, preguntas incómodas respondidas y acogida de la audiencia..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl p-3 text-xs text-white focus:border-violet-500 focus:outline-none leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Sentimiento Evaluado</label>
              <select
                value={sentiment}
                onChange={(e) => setSentiment(e.target.value as any)}
                className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-violet-500 focus:outline-none"
              >
                <option value="positivo">🟢 Favorable / Positivo</option>
                <option value="neutro">🟡 Neutro / Informativo</option>
                <option value="critico">🔴 Tenso / Desafiante</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Enlace a Grabación / Audio</label>
              <input
                type="url"
                placeholder="https://..."
                value={recordingUrl}
                onChange={(e) => setRecordingUrl(e.target.value)}
                className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-violet-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold text-slate-400">Cancelar</button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-600/30 flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Guardar Intervención
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
