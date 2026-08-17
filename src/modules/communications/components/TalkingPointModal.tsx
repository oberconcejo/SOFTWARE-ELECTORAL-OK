import React, { useState, useEffect } from 'react';
import { 
  X, 
  BookOpen, 
  AlertTriangle, 
  CheckCircle, 
  ShieldAlert, 
  Send, 
  Plus, 
  Trash2,
  Tag
} from 'lucide-react';
import { TalkingPoint } from '@/src/types/communications';

interface TalkingPointModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tp: Omit<TalkingPoint, 'id' | 'lastUpdated'> | Partial<TalkingPoint>) => void;
  initialData?: TalkingPoint | null;
}

export const TalkingPointModal: React.FC<TalkingPointModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const [topic, setTopic] = useState('');
  const [keyMessage, setKeyMessage] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [supportingArguments, setSupportingArguments] = useState<string[]>(['']);
  const [crisisResponses, setCrisisResponses] = useState<string[]>(['']);
  const [forbiddenPhrases, setForbiddenPhrases] = useState<string[]>(['']);

  useEffect(() => {
    if (initialData) {
      setTopic(initialData.topic);
      setKeyMessage(initialData.keyMessage);
      setTargetAudience(initialData.targetAudience || '');
      setSupportingArguments(initialData.supportingArguments.length > 0 ? initialData.supportingArguments : ['']);
      setCrisisResponses(initialData.crisisResponses.length > 0 ? initialData.crisisResponses : ['']);
      setForbiddenPhrases(initialData.forbiddenPhrases.length > 0 ? initialData.forbiddenPhrases : ['']);
    } else {
      setTopic('');
      setKeyMessage('');
      setTargetAudience('Ciudadanía general, comerciantes y familias');
      setSupportingArguments(['']);
      setCrisisResponses(['']);
      setForbiddenPhrases(['']);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // Helpers for array fields
  const handleAddArg = () => setSupportingArguments(prev => [...prev, '']);
  const handleUpdateArg = (index: number, val: string) => {
    setSupportingArguments(prev => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };
  const handleRemoveArg = (index: number) => {
    setSupportingArguments(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddCrisis = () => setCrisisResponses(prev => [...prev, '']);
  const handleUpdateCrisis = (index: number, val: string) => {
    setCrisisResponses(prev => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };
  const handleRemoveCrisis = (index: number) => {
    setCrisisResponses(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddForbidden = () => setForbiddenPhrases(prev => [...prev, '']);
  const handleUpdateForbidden = (index: number, val: string) => {
    setForbiddenPhrases(prev => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };
  const handleRemoveForbidden = (index: number) => {
    setForbiddenPhrases(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || !keyMessage.trim()) return;

    onSave({
      topic: topic.trim(),
      keyMessage: keyMessage.trim(),
      targetAudience: targetAudience.trim() || undefined,
      supportingArguments: supportingArguments.map(s => s.trim()).filter(Boolean),
      crisisResponses: crisisResponses.map(s => s.trim()).filter(Boolean),
      forbiddenPhrases: forbiddenPhrases.map(s => s.trim()).filter(Boolean)
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#12121e] border border-violet-500/30 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-violet-950/40 via-[#18182a] to-[#12121e]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {initialData ? 'Editar Argumentario / Talking Point' : 'Nuevo Argumentario & Guion Estratégico'}
              </h3>
              <p className="text-xs text-slate-400">
                Líneas discursivas oficiales, argumentos técnicos y blindaje ante ataques
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Topic & Audience */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Eje Temático *</label>
              <input
                type="text"
                required
                placeholder="Ej: Seguridad y Cámaras con Inteligencia Artificial"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-violet-500 focus:outline-none font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Audiencia / Público Clave</label>
              <input
                type="text"
                placeholder="Ej: Comerciantes, familias, jóvenes universitarios"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-violet-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Key Message */}
          <div>
            <label className="block text-xs font-bold text-violet-300 mb-1.5 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              Mensaje Fuerza Principal (La idea central que debe retener el ciudadano) *
            </label>
            <textarea
              required
              rows={2}
              placeholder="Ej: La seguridad es un derecho sagrado. Gobernaremos con autoridad, alta tecnología y presencia policial continua en los 120 puntos críticos."
              value={keyMessage}
              onChange={(e) => setKeyMessage(e.target.value)}
              className="w-full bg-[#1a1a2e] border border-emerald-500/30 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Supporting Arguments */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
                Argumentos de Soporte & Cifras Técnicas (¿Cómo lo haremos?)
              </label>
              <button
                type="button"
                onClick={handleAddArg}
                className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Añadir argumento
              </button>
            </div>
            {supportingArguments.map((arg, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  type="text"
                  placeholder={`Argumento ${idx + 1}: Ej: Reducción del 35% en hurto con 2.000 cámaras analíticas...`}
                  value={arg}
                  onChange={(e) => handleUpdateArg(idx, e.target.value)}
                  className="flex-1 bg-[#1a1a2e] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                />
                {supportingArguments.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveArg(idx)}
                    className="p-2 text-slate-500 hover:text-rose-400 rounded-xl"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Crisis Responses / Defense Playbook */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                Blindaje ante Ataques & Respuestas de Crisis (Si preguntan o atacan...)
              </label>
              <button
                type="button"
                onClick={handleAddCrisis}
                className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Añadir defensa
              </button>
            </div>
            {crisisResponses.map((res, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  type="text"
                  placeholder={`Defensa ${idx + 1}: Si dicen que es costoso -> Explicar que se financia con recorte de nóminas paralelas...`}
                  value={res}
                  onChange={(e) => handleUpdateCrisis(idx, e.target.value)}
                  className="flex-1 bg-[#1a1a2e] border border-amber-500/20 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
                {crisisResponses.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveCrisis(idx)}
                    className="p-2 text-slate-500 hover:text-rose-400 rounded-xl"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Forbidden Phrases */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                Frases Prohibidas / Trampas a Evitar (¡Bajo ninguna circunstancia decir!)
              </label>
              <button
                type="button"
                onClick={handleAddForbidden}
                className="text-[11px] font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Añadir frase prohibida
              </button>
            </div>
            {forbiddenPhrases.map((ph, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  type="text"
                  placeholder={`Frase prohibida ${idx + 1}: Ej: "La delincuencia nos tiene ganados" o "Subiremos impuestos"`}
                  value={ph}
                  onChange={(e) => handleUpdateForbidden(idx, e.target.value)}
                  className="flex-1 bg-[#1a1a2e] border border-rose-500/20 rounded-xl px-3 py-2 text-xs text-rose-200 focus:border-rose-500 focus:outline-none"
                />
                {forbiddenPhrases.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveForbidden(idx)}
                    className="p-2 text-slate-500 hover:text-rose-400 rounded-xl"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white">
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-violet-600/30 flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Guardar Argumentario
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
