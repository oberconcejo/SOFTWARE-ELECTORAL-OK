import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  AlertTriangle, 
  Layers, 
  Shield, 
  HeartPulse, 
  GraduationCap, 
  Building2, 
  Briefcase, 
  Leaf, 
  Trophy, 
  MapPin, 
  Target, 
  BarChart3,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { 
  ThematicSector, 
  SectorVariable, 
  MicroLocalFiche, 
  ImpactLevel, 
  VariableStatus 
} from '@/src/types/territorialDiagnostic';

// Helper for sector icons
export const SECTOR_ICONS: Record<string, any> = {
  Layers: Layers,
  Shield: Shield,
  HeartPulse: HeartPulse,
  GraduationCap: GraduationCap,
  Building2: Building2,
  Briefcase: Briefcase,
  Leaf: Leaf,
  Trophy: Trophy,
  Target: Target,
  BarChart3: BarChart3
};

// Available colors
export const SECTOR_COLORS = [
  { label: 'Índigo', value: '#6366f1', bg: 'bg-indigo-500/20', text: 'text-indigo-400', border: 'border-indigo-500/30' },
  { label: 'Cian / Turquesa', value: '#06b6d4', bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  { label: 'Esmeralda', value: '#10b981', bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  { label: 'Ámbar', value: '#f59e0b', bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
  { label: 'Rosa / Violeta', value: '#ec4899', bg: 'bg-pink-500/20', text: 'text-pink-400', border: 'border-pink-500/30' },
  { label: 'Azul Eléctrico', value: '#3b82f6', bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' }
];

// --- MODAL: CREAR / EDITAR SECTOR ---
interface SectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; description?: string; iconName?: string; color?: string }) => Promise<void>;
  initialData?: ThematicSector | null;
}

export function SectorModal({ isOpen, onClose, onSave, initialData }: SectorModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [iconName, setIconName] = useState('Layers');
  const [color, setColor] = useState('#6366f1');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setDescription(initialData.description || '');
      setIconName(initialData.iconName || 'Layers');
      setColor(initialData.color || '#6366f1');
    } else {
      setName('');
      setDescription('');
      setIconName('Layers');
      setColor('#6366f1');
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('El nombre del sector temático es obligatorio.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await onSave({ name, description, iconName, color });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al guardar el sector.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#111114] border border-white/10 rounded-[28px] w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {initialData ? 'Editar Sector Temático' : 'Crear Nuevo Sector Temático'}
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Clasificación sectorial para la evaluación del territorio
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-400 text-xs font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest mb-1.5">
              Nombre del Sector <span className="text-indigo-400">*</span>
            </label>
            <input 
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Seguridad y Convivencia, Salud, Educación..."
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest mb-1.5">
              Descripción del Enfoque
            </label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Breve alcance temático para el diagnóstico municipal o departamental..."
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest mb-2">
              Icono Representativo
            </label>
            <div className="grid grid-cols-5 gap-2">
              {Object.keys(SECTOR_ICONS).map((iconKey) => {
                const IconComponent = SECTOR_ICONS[iconKey];
                const isSelected = iconName === iconKey;
                return (
                  <button
                    key={iconKey}
                    type="button"
                    onClick={() => setIconName(iconKey)}
                    className={`h-11 rounded-xl flex items-center justify-center border transition-all ${
                      isSelected 
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-md shadow-indigo-500/20' 
                        : 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest mb-2">
              Color Distintivo
            </label>
            <div className="flex items-center gap-3">
              {SECTOR_COLORS.map((c) => {
                const isSelected = color === c.value;
                return (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setColor(c.value)}
                    className={`w-8 h-8 rounded-full transition-transform ${c.bg} border-2 ${
                      isSelected ? 'scale-110 border-white ring-2 ring-white/30' : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: c.value }}
                    title={c.label}
                  />
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="text-xs font-bold text-slate-400 hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-500 text-xs font-bold gap-2 text-white shadow-lg shadow-indigo-600/30"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Guardando...' : initialData ? 'Guardar Cambios' : 'Crear Sector'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- MODAL: AGREGAR / EDITAR VARIABLE ---
interface VariableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    sectorId: string;
    name: string;
    description?: string;
    indicatorName?: string;
    unit?: string;
    baselineValue?: string | number | null;
    targetValue?: string | number | null;
    currentValue?: string | number | null;
    status?: VariableStatus;
    source?: string;
    surveyFinding?: string;
  }) => Promise<void>;
  sector: ThematicSector | null;
  initialData?: SectorVariable | null;
}

export function VariableModal({ isOpen, onClose, onSave, sector, initialData }: VariableModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [indicatorName, setIndicatorName] = useState('');
  const [unit, setUnit] = useState('%');
  const [baselineValue, setBaselineValue] = useState<string>('');
  const [targetValue, setTargetValue] = useState<string>('');
  const [currentValue, setCurrentValue] = useState<string>('');
  const [status, setStatus] = useState<VariableStatus>('EN_DIAGNOSTICO');
  const [source, setSource] = useState('');
  const [surveyFinding, setSurveyFinding] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setDescription(initialData.description || '');
      setIndicatorName(initialData.indicatorName || '');
      setUnit(initialData.unit || '%');
      setBaselineValue(initialData.baselineValue !== undefined && initialData.baselineValue !== null ? String(initialData.baselineValue) : '');
      setTargetValue(initialData.targetValue !== undefined && initialData.targetValue !== null ? String(initialData.targetValue) : '');
      setCurrentValue(initialData.currentValue !== undefined && initialData.currentValue !== null ? String(initialData.currentValue) : '');
      setStatus(initialData.status || 'EN_DIAGNOSTICO');
      setSource(initialData.source || '');
      setSurveyFinding(initialData.surveyFinding || '');
    } else {
      setName('');
      setDescription('');
      setIndicatorName('');
      setUnit('%');
      setBaselineValue('');
      setTargetValue('');
      setCurrentValue('');
      setStatus('EN_DIAGNOSTICO');
      setSource('');
      setSurveyFinding('');
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen || !sector) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('El nombre de la variable temática es obligatorio.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await onSave({
        sectorId: sector.id,
        name,
        description,
        indicatorName,
        unit,
        baselineValue: baselineValue.trim() !== '' ? baselineValue : null,
        targetValue: targetValue.trim() !== '' ? targetValue : null,
        currentValue: currentValue.trim() !== '' ? currentValue : null,
        status,
        source,
        surveyFinding
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al guardar la variable.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#111114] border border-white/10 rounded-[28px] w-full max-w-xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-white/[0.02] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {initialData ? 'Editar Variable e Indicador' : 'Agregar Variable al Sector'}
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Sector: <span className="text-indigo-300 font-bold">{sector.name}</span>
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 scrollbar-hide">
          {error && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-400 text-xs font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest mb-1.5">
              Nombre de la Variable <span className="text-indigo-400">*</span>
            </label>
            <input 
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Tasa de Homicidios, Cobertura en Salud, Deserción Escolar..."
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest mb-1.5">
                Indicador Asociado
              </label>
              <input 
                type="text"
                value={indicatorName}
                onChange={(e) => setIndicatorName(e.target.value)}
                placeholder="Ej. Homicidios x 100k hab"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest mb-1.5">
                Unidad de Medida
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
              >
                <option value="%">% (Porcentaje)</option>
                <option value="Tasa x 100k hab">Tasa x 100k hab</option>
                <option value="Cantidad">Cantidad Numérica</option>
                <option value="Puntos / Índice">Puntos / Índice</option>
                <option value="Minutos">Minutos</option>
                <option value="COP">Pesos (COP)</option>
                <option value="Otra">Otra Unidad</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
            <div>
              <label className="block text-xs font-bold text-amber-400 uppercase tracking-widest mb-1.5">
                Línea Base (Diagnóstico Real)
              </label>
              <input 
                type="text"
                value={baselineValue}
                onChange={(e) => setBaselineValue(e.target.value)}
                placeholder="Ej. 18.5 (o dejar vacío si no hay)"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1.5">
                Meta Programática
              </label>
              <input 
                type="text"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                placeholder="Ej. 12.0 (o dejar vacío si no hay)"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest mb-1.5">
                Estado del Diagnóstico
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as VariableStatus)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
              >
                <option value="EN_DIAGNOSTICO">En Diagnóstico</option>
                <option value="LINEA_BASE_DEFINIDA">Línea Base Definida</option>
                <option value="EN_META">En Meta / Favorable</option>
                <option value="CRITICO">Estado Crítico</option>
                <option value="SIN_INFORMACION">Sin Información Disponible</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest mb-1.5">
                Fuente Oficial de Datos
              </label>
              <input 
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="Ej. DANE, Policía Nal., SISPRO, Secretaría..."
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest mb-1.5">
              Insumo de Sondeo de Opinión (Opcional)
            </label>
            <textarea 
              value={surveyFinding}
              onChange={(e) => setSurveyFinding(e.target.value)}
              rows={2}
              placeholder="Hallazgos o percepción ciudadana recopilada en encuestas para esta variable..."
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="text-xs font-bold text-slate-400 hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-cyan-600 hover:bg-cyan-500 text-xs font-bold gap-2 text-white shadow-lg shadow-cyan-600/30"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Guardando...' : initialData ? 'Guardar Cambios' : 'Agregar Variable'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- MODAL: REGISTRAR / EDITAR FICHA MICRO-LOCAL ---
interface FicheModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    comuna: string;
    corregimiento?: string;
    barrio?: string;
    sectorId: string;
    category?: string;
    impact: ImpactLevel;
    problem: string;
    proposal: string;
    isLinkedToGovProgram?: boolean;
  }) => Promise<void>;
  sectors: ThematicSector[];
  initialData?: MicroLocalFiche | null;
}

export function FicheModal({ isOpen, onClose, onSave, sectors, initialData }: FicheModalProps) {
  const [comuna, setComuna] = useState('');
  const [barrio, setBarrio] = useState('');
  const [sectorId, setSectorId] = useState('');
  const [impact, setImpact] = useState<ImpactLevel>('ALTO');
  const [problem, setProblem] = useState('');
  const [proposal, setProposal] = useState('');
  const [isLinkedToGovProgram, setIsLinkedToGovProgram] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setComuna(initialData.comuna || '');
      setBarrio(initialData.barrio || '');
      setSectorId(initialData.sectorId || (sectors.length > 0 ? sectors[0].id : ''));
      setImpact(initialData.impact || 'ALTO');
      setProblem(initialData.problem || '');
      setProposal(initialData.proposal || '');
      setIsLinkedToGovProgram(initialData.isLinkedToGovProgram || false);
    } else {
      setComuna('');
      setBarrio('');
      setSectorId(sectors.length > 0 ? sectors[0].id : '');
      setImpact('ALTO');
      setProblem('');
      setProposal('');
      setIsLinkedToGovProgram(false);
    }
    setError(null);
  }, [initialData, isOpen, sectors]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comuna.trim()) {
      setError('La Comuna o Corregimiento es obligatoria.');
      return;
    }
    if (!problem.trim()) {
      setError('El problema diagnosticado es obligatorio.');
      return;
    }
    if (!proposal.trim()) {
      setError('La propuesta programática es obligatoria.');
      return;
    }

    const selectedSec = sectors.find(s => s.id === sectorId);

    try {
      setSaving(true);
      setError(null);
      await onSave({
        comuna,
        barrio,
        sectorId: sectorId || (sectors.length > 0 ? sectors[0].id : 'general'),
        category: selectedSec?.name || 'General',
        impact,
        problem,
        proposal,
        isLinkedToGovProgram
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al registrar la ficha micro-local.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#111114] border border-white/10 rounded-[28px] w-full max-w-xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-white/[0.02] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {initialData ? 'Editar Ficha Micro-Local' : 'Registrar Ficha Comunal / Micro-Local'}
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Diagnóstico geográfico y propuesta de insumo programático
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 scrollbar-hide">
          {error && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-400 text-xs font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest mb-1.5">
                Comuna / Corregimiento <span className="text-indigo-400">*</span>
              </label>
              <input 
                type="text"
                value={comuna}
                onChange={(e) => setComuna(e.target.value)}
                placeholder="Ej. Comuna 1 - Popular, Corregimiento San Antonio..."
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest mb-1.5">
                Barrio o Sector Específico
              </label>
              <input 
                type="text"
                value={barrio}
                onChange={(e) => setBarrio(e.target.value)}
                placeholder="Ej. Santo Domingo, Manrique Oriental..."
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest mb-1.5">
                Sector Temático Asociado
              </label>
              <select
                value={sectorId}
                onChange={(e) => setSectorId(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
              >
                {sectors.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
                {sectors.length === 0 && (
                  <option value="">General (Sin sector registrado)</option>
                )}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest mb-1.5">
                Nivel de Impacto
              </label>
              <select
                value={impact}
                onChange={(e) => setImpact(e.target.value as ImpactLevel)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="CRITICO">Impacto Crítico</option>
                <option value="ALTO">Impacto Alto</option>
                <option value="MEDIO">Impacto Medio</option>
                <option value="BAJO">Impacto Bajo</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-amber-400 uppercase tracking-widest mb-1.5">
              Problema Diagnosticado <span className="text-amber-400">*</span>
            </label>
            <textarea 
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              rows={3}
              placeholder="Describe detalladamente el problema o necesidad identificado en el territorio..."
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1.5">
              Propuesta Programática (Insumo) <span className="text-emerald-400">*</span>
            </label>
            <textarea 
              value={proposal}
              onChange={(e) => setProposal(e.target.value)}
              rows={3}
              placeholder="Solución o propuesta electoral planteada para incorporar al Programa de Gobierno..."
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors resize-none"
              required
            />
          </div>

          <div className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-2xl">
            <input 
              type="checkbox"
              id="linkGov"
              checked={isLinkedToGovProgram}
              onChange={(e) => setIsLinkedToGovProgram(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-black/40 border-white/20"
            />
            <label htmlFor="linkGov" className="text-xs text-slate-300 font-medium cursor-pointer">
              Marcar como insumo priorizado para el <span className="text-indigo-400 font-bold">Programa de Gobierno</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="text-xs font-bold text-slate-400 hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-500 text-xs font-bold gap-2 text-white shadow-lg shadow-indigo-600/30"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Guardando...' : initialData ? 'Guardar Cambios' : 'Registrar Ficha'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- MODAL: CONFIRMAR ELIMINACIÓN ---
interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  message: string;
}

export function DeleteConfirmModal({ isOpen, onClose, onConfirm, title, message }: DeleteConfirmModalProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    try {
      setDeleting(true);
      setError(null);
      await onConfirm();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al eliminar el elemento.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#111114] border border-white/10 rounded-[28px] w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div className="text-center space-y-2">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <p className="text-sm text-slate-400 leading-relaxed">{message}</p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        <div className="flex items-center justify-center gap-3 pt-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={deleting}
            className="text-xs font-bold text-slate-400 hover:text-white"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={deleting}
            className="bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-lg shadow-rose-600/30"
          >
            {deleting ? 'Eliminando...' : 'Sí, Eliminar'}
          </Button>
        </div>
      </div>
    </div>
  );
}
