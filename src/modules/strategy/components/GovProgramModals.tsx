import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  AlertTriangle, 
  Target, 
  Layers, 
  Shield, 
  HeartPulse, 
  GraduationCap, 
  Building2, 
  Briefcase, 
  Leaf, 
  Trophy, 
  BarChart3, 
  FileText,
  MapPin,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { 
  GovProgramInfo, 
  GovStrategicAxis, 
  GovProposal, 
  GovProposalPriority, 
  GovProgramStatus 
} from '@/src/types/governmentProgram';
import { MicroLocalFiche } from '@/src/types/territorialDiagnostic';

// Available icons
export const GOV_AXIS_ICONS = [
  { id: 'Target', label: 'Objetivo', icon: Target },
  { id: 'Layers', label: 'Estructura', icon: Layers },
  { id: 'Shield', label: 'Seguridad', icon: Shield },
  { id: 'HeartPulse', label: 'Salud / Social', icon: HeartPulse },
  { id: 'GraduationCap', label: 'Educación', icon: GraduationCap },
  { id: 'Building2', label: 'Infraestructura', icon: Building2 },
  { id: 'Briefcase', label: 'Economía / Empleo', icon: Briefcase },
  { id: 'Leaf', label: 'Medio Ambiente', icon: Leaf },
  { id: 'Trophy', label: 'Deporte / Cultura', icon: Trophy },
  { id: 'BarChart3', label: 'Gobernanza / Datos', icon: BarChart3 }
];

// Available colors
export const GOV_AXIS_COLORS = [
  { label: 'Índigo', value: '#6366f1' },
  { label: 'Cian', value: '#06b6d4' },
  { label: 'Esmeralda', value: '#10b981' },
  { label: 'Ámbar', value: '#f59e0b' },
  { label: 'Rosa', value: '#ec4899' },
  { label: 'Azul', value: '#3b82f6' }
];

// --- 1. MODAL: EDITAR DATOS GENERALES ---
interface GeneralInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  programInfo: GovProgramInfo;
  onSave: (data: Partial<GovProgramInfo>) => Promise<void>;
}

export function GeneralInfoModal({ isOpen, onClose, programInfo, onSave }: GeneralInfoModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    period: '',
    territory: '',
    candidateName: '',
    partyCoalition: '',
    slogan: '',
    status: 'BORRADOR' as GovProgramStatus,
    legalDeadline: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: programInfo.title || '',
        period: programInfo.period || '',
        territory: programInfo.territory || '',
        candidateName: programInfo.candidateName || '',
        partyCoalition: programInfo.partyCoalition || '',
        slogan: programInfo.slogan || '',
        status: programInfo.status || 'BORRADOR',
        legalDeadline: programInfo.legalDeadline || ''
      });
      setError(null);
    }
  }, [isOpen, programInfo]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('El título del Programa de Gobierno es obligatorio.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await onSave(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al guardar los datos generales.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#141418] border border-white/10 rounded-[32px] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#141418]/95 backdrop-blur z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Editar Datos Generales del Programa</h3>
              <p className="text-xs text-slate-400">Identificación formal, período, candidato y estado del documento</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 flex-1">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Título del Programa de Gobierno *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Ej. Programa de Gobierno Municipal: Desarrollo Sostenible con Seguridad"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Candidato(a) Oficial
              </label>
              <input
                type="text"
                value={formData.candidateName}
                onChange={(e) => setFormData(prev => ({ ...prev, candidateName: e.target.value }))}
                placeholder="Nombre del candidato..."
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Entidad Territorial
              </label>
              <input
                type="text"
                value={formData.territory}
                onChange={(e) => setFormData(prev => ({ ...prev, territory: e.target.value }))}
                placeholder="Ej. Municipio de Medellín, Antioquia"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Período Constitucional
              </label>
              <input
                type="text"
                value={formData.period}
                onChange={(e) => setFormData(prev => ({ ...prev, period: e.target.value }))}
                placeholder="Ej. 2024 - 2027"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Partido / Coalición / Aval
              </label>
              <input
                type="text"
                value={formData.partyCoalition}
                onChange={(e) => setFormData(prev => ({ ...prev, partyCoalition: e.target.value }))}
                placeholder="Partido o movimiento que avala..."
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Lema / Slogan de Campaña
            </label>
            <input
              type="text"
              value={formData.slogan}
              onChange={(e) => setFormData(prev => ({ ...prev, slogan: e.target.value }))}
              placeholder="Ej. Una ciudad para todos con oportunidades reales"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Estado del Documento
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as GovProgramStatus }))}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="BORRADOR">Borrador</option>
                <option value="EN_ELABORACION">En elaboración</option>
                <option value="REVISADO">Revisado</option>
                <option value="FINALIZADO">Finalizado</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Fecha Límite Legal CNE
              </label>
              <input
                type="text"
                value={formData.legalDeadline}
                onChange={(e) => setFormData(prev => ({ ...prev, legalDeadline: e.target.value }))}
                placeholder="Ej. 29 de Julio de 2023"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Footer buttons */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={saving} className="text-xs">
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={saving}
              className="gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- 2. MODAL: EDITAR RESEÑA HISTÓRICA ---
interface HistoricalContextModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialText: string;
  onSave: (text: string) => Promise<void>;
}

export function HistoricalContextModal({ isOpen, onClose, initialText, onSave }: HistoricalContextModalProps) {
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setText(initialText || '');
      setError(null);
    }
  }, [isOpen, initialText]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      await onSave(text.trim());
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al guardar la reseña histórica.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#141418] border border-white/10 rounded-[32px] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#141418]/95 backdrop-blur z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Editar Reseña Histórica</h3>
              <p className="text-xs text-slate-400">Caracterización geográfica, histórica y vocación de la entidad territorial</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 flex-1">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Contenido de la Reseña Territorial
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Describa el contexto histórico, antecedentes fundacionales, división político-administrativa, vocación productiva y evolución demográfica..."
              rows={10}
              className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-amber-500 leading-relaxed font-sans"
            />
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={saving} className="text-xs">
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={saving}
              className="gap-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-amber-600/20"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Guardando...' : 'Guardar Reseña'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- 3. MODAL: EDITAR RESUMEN DEL DIAGNÓSTICO ---
interface DiagnosticSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialText: string;
  onSave: (text: string) => Promise<void>;
}

export function DiagnosticSummaryModal({ isOpen, onClose, initialText, onSave }: DiagnosticSummaryModalProps) {
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setText(initialText || '');
      setError(null);
    }
  }, [isOpen, initialText]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      await onSave(text.trim());
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al guardar el resumen del diagnóstico.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#141418] border border-white/10 rounded-[32px] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#141418]/95 backdrop-blur z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Editar Resumen del Diagnóstico Territorial</h3>
              <p className="text-xs text-slate-400">Principales brechas, necesidades sectoriales y líneas base identificadas</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 flex-1">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Síntesis del Diagnóstico
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Sintetice el estado actual de los sectores (seguridad, salud, educación, movilidad, desarrollo económico) y las problemáticas críticas detectadas en el territorio..."
              rows={10}
              className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-emerald-500 leading-relaxed font-sans"
            />
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={saving} className="text-xs">
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={saving}
              className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-600/20"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Guardando...' : 'Guardar Diagnóstico'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- 4. MODAL: CREAR / EDITAR EJE ESTRATÉGICO ---
interface AxisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    name: string;
    description?: string;
    generalObjective: string;
    diagnosedProblem?: string;
    category?: string;
    iconName?: string;
    color?: string;
    status?: 'ACTIVO' | 'EN_REVISION' | 'COMPLETADO';
  }) => Promise<void>;
  initialData?: GovStrategicAxis | null;
}

export function AxisModal({ isOpen, onClose, onSave, initialData }: AxisModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [generalObjective, setGeneralObjective] = useState('');
  const [diagnosedProblem, setDiagnosedProblem] = useState('');
  const [category, setCategory] = useState('Eje Estratégico');
  const [iconName, setIconName] = useState('Target');
  const [color, setColor] = useState('#6366f1');
  const [status, setStatus] = useState<'ACTIVO' | 'EN_REVISION' | 'COMPLETADO'>('ACTIVO');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name || '');
        setDescription(initialData.description || '');
        setGeneralObjective(initialData.generalObjective || '');
        setDiagnosedProblem(initialData.diagnosedProblem || '');
        setCategory(initialData.category || 'Eje Estratégico');
        setIconName(initialData.iconName || 'Target');
        setColor(initialData.color || '#6366f1');
        setStatus(initialData.status || 'ACTIVO');
      } else {
        setName('');
        setDescription('');
        setGeneralObjective('');
        setDiagnosedProblem('');
        setCategory('Eje Estratégico');
        setIconName('Target');
        setColor('#6366f1');
        setStatus('ACTIVO');
      }
      setError(null);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('El nombre de la línea estratégica es obligatorio.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await onSave({
        name: name.trim(),
        description: description.trim(),
        generalObjective: generalObjective.trim(),
        diagnosedProblem: diagnosedProblem.trim(),
        category: category.trim(),
        iconName,
        color,
        status
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al guardar el eje estratégico.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#141418] border border-white/10 rounded-[32px] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#141418]/95 backdrop-blur z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {initialData ? 'Editar Línea Estratégica' : 'Nueva Línea Estratégica (Eje)'}
              </h3>
              <p className="text-xs text-slate-400">Pilar matriz de desarrollo y articulación programática</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 flex-1">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Nombre de la Línea Estratégica *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Seguridad Integral, Convivencia y Paz Territorial"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Categoría Temática
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ej. Seguridad, Social, Económico, Ambiental"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Estado
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="ACTIVO">Activo</option>
                <option value="EN_REVISION">En Revisión</option>
                <option value="COMPLETADO">Completado</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Descripción General del Eje
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Resumen conceptual y alcance de este eje estratégico..."
              rows={3}
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-rose-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              Problema Diagnosticado (Insumo del Diagnóstico)
            </label>
            <textarea
              value={diagnosedProblem}
              onChange={(e) => setDiagnosedProblem(e.target.value)}
              placeholder="Describa la problemática o necesidad territorial que este eje busca resolver..."
              rows={2}
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-rose-500 leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-emerald-400" />
              Objetivo General del Eje
            </label>
            <textarea
              value={generalObjective}
              onChange={(e) => setGeneralObjective(e.target.value)}
              placeholder="Propósito estratégico que la administración se compromete a alcanzar durante el período..."
              rows={2}
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500 leading-relaxed"
            />
          </div>

          {/* Icon Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Icono Representativo
            </label>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {GOV_AXIS_ICONS.map(ic => {
                const IconComponent = ic.icon;
                const isSelected = iconName === ic.id;
                return (
                  <button
                    key={ic.id}
                    type="button"
                    onClick={() => setIconName(ic.id)}
                    className={`p-2.5 rounded-xl border flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                    title={ic.label}
                  >
                    <IconComponent className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={saving} className="text-xs">
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={saving}
              className="gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Guardando...' : initialData ? 'Actualizar Eje' : 'Crear Eje'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- 5. MODAL: ELIMINAR EJE (CONFIRMACIÓN SEGURA) ---
interface DeleteAxisModalProps {
  isOpen: boolean;
  onClose: () => void;
  axis: GovStrategicAxis | null;
  proposalsCount: number;
  onConfirm: (deleteRelatedProposals: boolean) => Promise<void>;
}

export function DeleteAxisModal({ isOpen, onClose, axis, proposalsCount, onConfirm }: DeleteAxisModalProps) {
  const [deleteRelated, setDeleteRelated] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !axis) return null;

  const handleConfirm = async () => {
    try {
      setDeleting(true);
      setError(null);
      await onConfirm(deleteRelated);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al eliminar el eje.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#141418] border border-rose-500/20 rounded-[32px] w-full max-w-md p-6 shadow-2xl space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div className="text-center space-y-1.5">
          <h3 className="text-base font-bold text-white">¿Eliminar Línea Estratégica?</h3>
          <p className="text-xs text-slate-300 font-semibold">"{axis.name}"</p>
        </div>

        {proposalsCount > 0 ? (
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-2 text-xs text-amber-300">
            <p className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
              Este eje contiene {proposalsCount} propuesta(s) asociada(s).
            </p>
            <label className="flex items-center gap-2 cursor-pointer pt-1 text-slate-300 font-medium">
              <input
                type="checkbox"
                checked={deleteRelated}
                onChange={(e) => setDeleteRelated(e.target.checked)}
                className="rounded border-white/20 bg-black/40 text-rose-500 focus:ring-rose-500"
              />
              <span>Confirmar eliminación de las {proposalsCount} propuestas asociadas</span>
            </label>
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center">
            Esta acción es irreversible y eliminará el eje del Programa de Gobierno.
          </p>
        )}

        {error && (
          <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs">
            {error}
          </div>
        )}

        <div className="flex items-center justify-center gap-3 pt-2">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={deleting} className="text-xs">
            Cancelar
          </Button>
          <Button
            size="sm"
            onClick={handleConfirm}
            disabled={deleting || (proposalsCount > 0 && !deleteRelated)}
            className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-4 py-2 rounded-xl"
          >
            {deleting ? 'Eliminando...' : 'Eliminar Eje'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// --- 6. MODAL: CREAR / EDITAR PROPUESTA ---
interface ProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  axisId: string;
  onSave: (data: {
    axisId: string;
    title: string;
    description: string;
    code?: string;
    relatedProblem?: string;
    objective?: string;
    indicatorName?: string;
    indicatorUnit?: string;
    baselineValue?: string | number | null;
    targetValue?: string | number | null;
    timeframe?: string;
    estimatedBudget?: number | null;
    currency?: string;
    priority?: GovProposalPriority;
    territoryScope?: string;
    fundingSource?: string;
  }) => Promise<void>;
  initialData?: GovProposal | null;
}

export function ProposalModal({ isOpen, onClose, axisId, onSave, initialData }: ProposalModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [code, setCode] = useState('');
  const [relatedProblem, setRelatedProblem] = useState('');
  const [objective, setObjective] = useState('');
  const [indicatorName, setIndicatorName] = useState('');
  const [indicatorUnit, setIndicatorUnit] = useState('');
  const [baselineValue, setBaselineValue] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [timeframe, setTimeframe] = useState('CUATRIENAL');
  const [estimatedBudget, setEstimatedBudget] = useState('');
  const [currency, setCurrency] = useState('COP');
  const [priority, setPriority] = useState<GovProposalPriority>('ALTA');
  const [territoryScope, setTerritoryScope] = useState('');
  const [fundingSource, setFundingSource] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title || '');
        setDescription(initialData.description || '');
        setCode(initialData.code || '');
        setRelatedProblem(initialData.relatedProblem || '');
        setObjective(initialData.objective || '');
        setIndicatorName(initialData.indicatorName || '');
        setIndicatorUnit(initialData.indicatorUnit || '');
        setBaselineValue(initialData.baselineValue != null ? String(initialData.baselineValue) : '');
        setTargetValue(initialData.targetValue != null ? String(initialData.targetValue) : '');
        setTimeframe(initialData.timeframe || 'CUATRIENAL');
        setEstimatedBudget(initialData.estimatedBudget != null ? String(initialData.estimatedBudget) : '');
        setCurrency(initialData.currency || 'COP');
        setPriority(initialData.priority || 'ALTA');
        setTerritoryScope(initialData.territoryScope || '');
        setFundingSource(initialData.fundingSource || '');
      } else {
        setTitle('');
        setDescription('');
        setCode('');
        setRelatedProblem('');
        setObjective('');
        setIndicatorName('');
        setIndicatorUnit('');
        setBaselineValue('');
        setTargetValue('');
        setTimeframe('CUATRIENAL');
        setEstimatedBudget('');
        setCurrency('COP');
        setPriority('ALTA');
        setTerritoryScope('');
        setFundingSource('');
      }
      setError(null);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('El nombre de la propuesta es obligatorio.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const parsedBudget = estimatedBudget.trim() !== '' ? Number(estimatedBudget) : null;
      if (parsedBudget !== null && isNaN(parsedBudget)) {
        setError('El presupuesto estimado debe ser un valor numérico válido.');
        setSaving(false);
        return;
      }

      await onSave({
        axisId,
        title: title.trim(),
        description: description.trim(),
        code: code.trim() || undefined,
        relatedProblem: relatedProblem.trim() || undefined,
        objective: objective.trim() || undefined,
        indicatorName: indicatorName.trim() || undefined,
        indicatorUnit: indicatorUnit.trim() || undefined,
        baselineValue: baselineValue.trim() !== '' ? baselineValue.trim() : null,
        targetValue: targetValue.trim() !== '' ? targetValue.trim() : null,
        timeframe,
        estimatedBudget: parsedBudget,
        currency,
        priority,
        territoryScope: territoryScope.trim() || undefined,
        fundingSource: fundingSource.trim() || undefined
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al guardar la propuesta.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#141418] border border-white/10 rounded-[32px] w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#141418]/95 backdrop-blur z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {initialData ? 'Editar Propuesta Programática' : 'Agregar Propuesta / Proyecto'}
              </h3>
              <p className="text-xs text-slate-400">Defina la iniciativa, indicador de impacto, meta y presupuesto estimado</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 flex-1">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Código Proyecto
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ej. PROP-01"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Nombre del Programa / Proyecto *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Construcción y Dotación de 5 Nuevos Centros de Salud"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div className="sm:col-span-1">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Prioridad
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="CRITICA">Crítica</option>
                <option value="ALTA">Alta</option>
                <option value="MEDIA">Media</option>
                <option value="BAJA">Baja</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Descripción y Alcance de la Propuesta
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalle los componentes de la propuesta, beneficiarios directos y modo de ejecución..."
              rows={3}
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500 leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-rose-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                Problema Territorial Relacionado
              </label>
              <textarea
                value={relatedProblem}
                onChange={(e) => setRelatedProblem(e.target.value)}
                placeholder="Brecha o necesidad territorial que resuelve..."
                rows={2}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Alcance Geográfico / Territorio
              </label>
              <input
                type="text"
                value={territoryScope}
                onChange={(e) => setTerritoryScope(e.target.value)}
                placeholder="Ej. Comuna 13, Corregimiento San Antonio, Toda la ciudad"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Indicador de Impacto + Línea Base + Meta */}
          <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-3">
            <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Medición de Impacto y Metas
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Indicador de Impacto
                </label>
                <input
                  type="text"
                  value={indicatorName}
                  onChange={(e) => setIndicatorName(e.target.value)}
                  placeholder="Ej. Tasa de cobertura de atención primaria"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Unidad de Medida
                </label>
                <input
                  type="text"
                  value={indicatorUnit}
                  onChange={(e) => setIndicatorUnit(e.target.value)}
                  placeholder="Ej. %, Centros construidos, Km viales, Familias"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Línea Base (Situación Actual)
                </label>
                <input
                  type="text"
                  value={baselineValue}
                  onChange={(e) => setBaselineValue(e.target.value)}
                  placeholder="Ej. 35%"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-1">
                  Meta del Cuatrienio
                </label>
                <input
                  type="text"
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  placeholder="Ej. 85%"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Plazo de Ejecución
                </label>
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="CORTO_PLAZO">Corto Plazo (Año 1)</option>
                  <option value="MEDIANO_PLAZO">Mediano Plazo (Años 2-3)</option>
                  <option value="LARGO_PLAZO">Largo Plazo (Año 4)</option>
                  <option value="CUATRIENAL">Cuatrienal / Plurianual</option>
                </select>
              </div>
            </div>
          </div>

          {/* Presupuesto y Fuente de Financiación */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                Presupuesto Estimado (Numérico)
              </label>
              <input
                type="number"
                value={estimatedBudget}
                onChange={(e) => setEstimatedBudget(e.target.value)}
                placeholder="Ej. 1500000000"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Ingrese el valor en moneda local (COP) sin puntos ni comas.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Fuente Proyectada de Financiación
              </label>
              <input
                type="text"
                value={fundingSource}
                onChange={(e) => setFundingSource(e.target.value)}
                placeholder="Ej. SGP, Recursos Propios, Regalías, APP, Cofinanciación"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={saving} className="text-xs">
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={saving}
              className="gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-cyan-600/20"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Guardando...' : initialData ? 'Actualizar Propuesta' : 'Registrar Propuesta'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- 7. MODAL: ELIMINAR PROPUESTA ---
interface DeleteProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposal: GovProposal | null;
  onConfirm: () => Promise<void>;
}

export function DeleteProposalModal({ isOpen, onClose, proposal, onConfirm }: DeleteProposalModalProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !proposal) return null;

  const handleConfirm = async () => {
    try {
      setDeleting(true);
      setError(null);
      await onConfirm();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al eliminar la propuesta.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#141418] border border-rose-500/20 rounded-[32px] w-full max-w-md p-6 shadow-2xl space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div className="text-center space-y-1.5">
          <h3 className="text-base font-bold text-white">¿Eliminar Propuesta Programática?</h3>
          <p className="text-xs text-slate-300 font-semibold">"{proposal.title}"</p>
        </div>

        <p className="text-xs text-slate-400 text-center">
          Esta acción eliminará la propuesta y sus metas cuantitativas asociadas.
        </p>

        {error && (
          <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs">
            {error}
          </div>
        )}

        <div className="flex items-center justify-center gap-3 pt-2">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={deleting} className="text-xs">
            Cancelar
          </Button>
          <Button
            size="sm"
            onClick={handleConfirm}
            disabled={deleting}
            className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-4 py-2 rounded-xl"
          >
            {deleting ? 'Eliminando...' : 'Eliminar Propuesta'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// --- 8. MODAL: IMPORTAR INSUMOS DE DIAGNÓSTICO TERRITORIAL ---
interface DiagnosticImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  axes: GovStrategicAxis[];
  onImportFiche: (fiche: MicroLocalFiche, targetAxisId: string) => Promise<void>;
  tenantId: string;
}

export function DiagnosticImportModal({
  isOpen,
  onClose,
  axes,
  onImportFiche,
  tenantId
}: DiagnosticImportModalProps) {
  const [fiches, setFiches] = useState<MicroLocalFiche[]>([]);
  const [selectedFicheId, setSelectedFicheId] = useState<string | null>(null);
  const [selectedAxisId, setSelectedAxisId] = useState<string>(axes[0]?.id || '');
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Load fiches from localStorage
      const key = `territorial_fiches_${tenantId}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setFiches(parsed);
          if (parsed.length > 0) setSelectedFicheId(parsed[0].id);
        } catch (e) {
          console.error(e);
        }
      }
      if (axes.length > 0) setSelectedAxisId(axes[0].id);
      setError(null);
    }
  }, [isOpen, tenantId, axes]);

  if (!isOpen) return null;

  const handleImport = async () => {
    if (!selectedFicheId) {
      setError('Seleccione una ficha del diagnóstico para importar.');
      return;
    }
    if (!selectedAxisId) {
      setError('Seleccione un eje estratégico de destino.');
      return;
    }

    const fiche = fiches.find(f => f.id === selectedFicheId);
    if (!fiche) return;

    try {
      setImporting(true);
      setError(null);
      await onImportFiche(fiche, selectedAxisId);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al importar insumo.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#141418] border border-white/10 rounded-[32px] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#141418]/95 backdrop-blur z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Importar Insumo del Diagnóstico Territorial</h3>
              <p className="text-xs text-slate-400">Convertir problemática y propuesta comunitaria en propuesta programática</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 flex-1">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Eje Estratégico de Destino *
            </label>
            <select
              value={selectedAxisId}
              onChange={(e) => setSelectedAxisId(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              {axes.map(ax => (
                <option key={ax.id} value={ax.id}>{ax.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Fichas Micro-Locales Disponibles ({fiches.length})
            </label>

            {fiches.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {fiches.map(fiche => {
                  const isSelected = selectedFicheId === fiche.id;
                  return (
                    <div
                      key={fiche.id}
                      onClick={() => setSelectedFicheId(fiche.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-emerald-500/10 border-emerald-500/40 shadow-md shadow-emerald-500/10'
                          : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                              {fiche.comuna} {fiche.barrio ? `• ${fiche.barrio}` : ''}
                            </span>
                            <span className="text-[10px] text-slate-400 bg-white/5 px-1.5 py-0.5 rounded">
                              {fiche.category}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-white">{fiche.proposal || fiche.problem}</p>
                          <p className="text-[11px] text-slate-400 line-clamp-1">Prob: {fiche.problem}</p>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center bg-white/[0.01] rounded-2xl border border-dashed border-white/5 space-y-2">
                <MapPin className="w-6 h-6 text-slate-700 mx-auto" />
                <p className="text-xs text-slate-400">No hay fichas registradas en Diagnóstico Territorial todavía.</p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={importing} className="text-xs">
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleImport}
              disabled={importing || fiches.length === 0}
              className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-600/20"
            >
              <Sparkles className="w-4 h-4" />
              {importing ? 'Importando...' : 'Importar a Propuesta'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
