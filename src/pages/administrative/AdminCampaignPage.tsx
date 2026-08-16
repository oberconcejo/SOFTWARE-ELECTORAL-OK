import React, { useState, useEffect } from 'react';
import { 
  Flag, 
  Plus, 
  Calendar, 
  Target, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  User, 
  X, 
  Save, 
  AlertCircle,
  TrendingUp,
  Award,
  Layers,
  MapPin,
  Building2
} from 'lucide-react';
import { supabase } from '@/src/lib/supabase';
import { useAuth } from '@/src/contexts/AuthContext';
import { useAdministrativeData } from '@/src/hooks/useAdministrativeData';
import { CampaignData } from '@/src/types';
import { COLOMBIA_TERRITORIAL_DATA } from '@/src/data/colombiaData';

// Territorial Data Constants
const COLOMBIA_DEPARTAMENTOS = Object.keys(COLOMBIA_TERRITORIAL_DATA).sort();

// Number Formatting Utilities
const formatThousands = (val: string | number) => {
  if (val === undefined || val === null || val === '') return '';
  const numStr = val.toString().replace(/\D/g, '');
  if (!numStr) return '';
  return new Intl.NumberFormat('es-CO').format(parseInt(numStr));
};

const parseThousands = (val: string) => {
  if (!val) return 0;
  return parseInt(val.replace(/\D/g, '') || '0');
};

export default function AdminCampaignPage() {
  const { user, client } = useAuth();
  const { campaigns, subusers, refresh, loading } = useAdministrativeData();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form State
  const [form, setForm] = useState({
    nombre: '',
    candidatoNombre: '',
    cargoPostulacion: '' as 'Gobernación' | 'Asamblea' | 'Alcaldía' | 'Concejo' | '',
    departamento: '',
    municipio: '',
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaEleccion: '2026-10-25',
    metaVotos: 0,
    presupuestoTotal: 0,
    estado: 'ACTIVA' as 'PLANIFICACION' | 'ACTIVA' | 'PAUSADA' | 'FINALIZADA',
    descripcion: ''
  });

  // Visual inputs for numbers to handle dots
  const [visualMetaVotos, setVisualMetaVotos] = useState('');
  const [visualPresupuesto, setVisualPresupuesto] = useState('');
  const [municipioSearch, setMunicipioSearch] = useState('');
  const [isMunOpen, setIsMunOpen] = useState(false);

  // Filtered municipalities
  const filteredMunicipios = form.departamento 
    ? (COLOMBIA_TERRITORIAL_DATA[form.departamento] || []).filter(m => 
        m.toLowerCase().includes(municipioSearch.toLowerCase())
      )
    : [];

  // Clear location if cargo changes
  useEffect(() => {
    // If switching to Gobernación or Asamblea, clear municipio
    if (['Gobernación', 'Asamblea'].includes(form.cargoPostulacion)) {
      setForm(prev => ({ ...prev, municipio: '' }));
    }
  }, [form.cargoPostulacion]);

  // Clear municipio if departamento changes
  useEffect(() => {
    setForm(prev => ({ ...prev, municipio: '' }));
    setMunicipioSearch('');
    setIsMunOpen(false);
  }, [form.departamento]);

  const handleNumericChange = (field: 'metaVotos' | 'presupuestoTotal', value: string) => {
    const formatted = formatThousands(value);
    const raw = parseThousands(value);
    
    if (field === 'metaVotos') {
      setVisualMetaVotos(formatted);
      setForm(prev => ({ ...prev, metaVotos: raw }));
    } else {
      setVisualPresupuesto(formatted);
      setForm(prev => ({ ...prev, presupuestoTotal: raw }));
    }
  };

  const handleSaveCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validations
    if (!form.nombre.trim()) {
      setMessage({ text: 'El nombre de la campaña es obligatorio', type: 'error' });
      return;
    }
    if (!form.cargoPostulacion) {
      setMessage({ text: 'Selecciona el cargo a postular.', type: 'error' });
      return;
    }
    if (!form.departamento) {
      setMessage({ text: 'Selecciona el departamento.', type: 'error' });
      return;
    }
    
    const needsMunicipio = ['Alcaldía', 'Concejo'].includes(form.cargoPostulacion);
    if (needsMunicipio && !form.municipio) {
      setMessage({ text: 'Selecciona el municipio.', type: 'error' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const clientId = user?.tenantId || client?.id;
      
      // Prepare data for persistence
      const campaignToSave = {
        client_id: clientId,
        nombre: form.nombre.trim(),
        candidato_nombre: form.candidatoNombre.trim(),
        cargo_postulacion: form.cargoPostulacion,
        departamento: form.departamento,
        municipio: needsMunicipio ? form.municipio : null,
        // Mantener circunscripcion por compatibilidad si es necesario
        circunscripcion: needsMunicipio ? `${form.departamento} | ${form.municipio}` : form.departamento,
        fecha_inicio: form.fechaInicio,
        fecha_eleccion: form.fechaEleccion,
        meta_votos: form.metaVotos,
        presupuesto_total: form.presupuestoTotal,
        estado: form.estado,
        descripcion: form.descripcion.trim()
      };

      const { error } = await supabase.from('campaigns').insert([campaignToSave]);

      if (error) throw error;

      setMessage({ text: 'Campaña creada con éxito', type: 'success' });
      await refresh();
      setForm({
        nombre: '',
        candidatoNombre: '',
        cargoPostulacion: '',
        departamento: '',
        municipio: '',
        fechaInicio: new Date().toISOString().split('T')[0],
        fechaEleccion: '2026-10-25',
        metaVotos: 0,
        presupuestoTotal: 0,
        estado: 'ACTIVA',
        descripcion: ''
      });
      setVisualMetaVotos('');
      setVisualPresupuesto('');
      setTimeout(() => {
        setIsModalOpen(false);
        setMessage(null);
      }, 800);
    } catch (err: any) {
      console.error('Error saving campaign:', err);
      setMessage({ text: err.message || 'Error al guardar campaña', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Flag className="w-5 h-5 text-indigo-400" />
            Gestión de Campaña Electoral
          </h2>
          <p className="text-xs text-slate-400">
            Planificación estratégica, fechas clave, metas electorales y cronograma de actividades.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-lg shadow-indigo-600/30"
        >
          <Plus className="w-4 h-4" />
          Nueva Campaña
        </button>
      </div>

      {/* Campaigns List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {campaigns.length === 0 ? (
          <div className="lg:col-span-2 py-12 text-center rounded-2xl bg-slate-900/40 border border-dashed border-white/10 p-8">
            <Flag className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-300">No hay campañas electorales configuradas</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Crea tu campaña electoral para definir el candidato, la meta de votos requerida y el presupuesto autorizado.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
            >
              Crear Campaña Ahora
            </button>
          </div>
        ) : (
          campaigns.map((camp) => (
            <div
              key={camp.id}
              className="rounded-2xl bg-slate-900/70 border border-white/10 p-6 space-y-5 shadow-xl relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-white">{camp.nombre}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      camp.estado === 'ACTIVA' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {camp.estado}
                    </span>
                  </div>
                  <p className="text-xs text-indigo-400 font-medium mt-0.5">
                    Candidato: {camp.candidatoNombre || 'Sin asignar'} • {camp.cargoPostulacion || 'Cargo Electoral'}
                  </p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                    {camp.departamento}{camp.municipio ? ` • ${camp.municipio}` : ''}
                  </p>
                </div>
              </div>

              {camp.descripcion && (
                <p className="text-xs text-slate-400">
                  {camp.descripcion}
                </p>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-white/5">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5">
                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                    <Target className="w-3.5 h-3.5 text-indigo-400" />
                    Meta de Votos
                  </div>
                  <span className="text-base font-extrabold text-white mt-1 block">
                    {camp.metaVotos.toLocaleString()}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5">
                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                    Presupuesto
                  </div>
                  <span className="text-base font-extrabold text-white mt-1 block">
                    ${camp.presupuestoTotal.toLocaleString('es-CO')}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 sm:col-span-1 col-span-2">
                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    Elecciones
                  </div>
                  <span className="text-xs font-bold text-white mt-1 block font-mono">
                    {camp.fechaEleccion || '2026-10-25'}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Campaign Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Flag className="w-4 h-4 text-indigo-400" />
                Crear Nueva Campaña Electoral
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {message && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}>
                {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {message.text}
              </div>
            )}

            <form onSubmit={handleSaveCampaign} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre de la Campaña *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Campaña Alcaldía 2026"
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre del Candidato</label>
                  <input
                    type="text"
                    placeholder="Ej. Juan Manuel Pérez"
                    value={form.candidatoNombre}
                    onChange={(e) => setForm({ ...form, candidatoNombre: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Cargo a Postular *</label>
                  <select
                    required
                    value={form.cargoPostulacion}
                    onChange={(e) => setForm({ ...form, cargoPostulacion: e.target.value as any })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                  >
                    <option value="">Seleccione un cargo</option>
                    <option value="Gobernación">Gobernación</option>
                    <option value="Asamblea">Asamblea</option>
                    <option value="Alcaldía">Alcaldía</option>
                    <option value="Concejo">Concejo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Departamento *</label>
                  <select
                    required
                    value={form.departamento}
                    onChange={(e) => setForm({ ...form, departamento: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                  >
                    <option value="">Seleccionar departamento</option>
                    {COLOMBIA_DEPARTAMENTOS.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                {['Alcaldía', 'Concejo'].includes(form.cargoPostulacion) && (
                  <div className="sm:col-span-2 space-y-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Municipio *</label>
                    <div className="relative">
                      {/* Dropdown Trigger */}
                      <button
                        type="button"
                        disabled={!form.departamento}
                        onClick={() => setIsMunOpen(!isMunOpen)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-left text-white focus:border-indigo-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between"
                      >
                        <span className={form.municipio ? 'text-white' : 'text-slate-500'}>
                          {form.municipio || (form.departamento ? 'Seleccionar municipio' : 'Primero seleccione un departamento')}
                        </span>
                        <Building2 className={`w-3.5 h-3.5 transition-transform ${isMunOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Dropdown Menu */}
                      {isMunOpen && form.departamento && (
                        <div className="absolute z-[60] left-0 right-0 mt-1 bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-64">
                          <div className="p-2 border-b border-white/10 bg-slate-950">
                            <input
                              type="text"
                              autoFocus
                              placeholder="Buscar municipio..."
                              value={municipioSearch}
                              onChange={(e) => setMunicipioSearch(e.target.value)}
                              className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-indigo-500"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                          <div className="overflow-y-auto flex-1 custom-scrollbar">
                            {filteredMunicipios.length === 0 ? (
                              <div className="p-4 text-center text-slate-500 text-[10px]">
                                No se encontraron municipios
                              </div>
                            ) : (
                              filteredMunicipios.map((mun) => (
                                <button
                                  key={mun}
                                  type="button"
                                  onClick={() => {
                                    setForm({ ...form, municipio: mun });
                                    setIsMunOpen(false);
                                    setMunicipioSearch('');
                                  }}
                                  className={`w-full text-left px-4 py-2 text-xs transition-colors hover:bg-indigo-600/20 ${
                                    form.municipio === mun ? 'bg-indigo-600/40 text-white font-bold' : 'text-slate-300'
                                  }`}
                                >
                                  {mun}
                                </button>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Click outside to close */}
                      {isMunOpen && (
                        <div 
                          className="fixed inset-0 z-[55]" 
                          onClick={() => setIsMunOpen(false)}
                        />
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Meta de Votos Objetivo</label>
                  <input
                    type="text"
                    placeholder="Ej. 15.000"
                    value={visualMetaVotos}
                    onChange={(e) => handleNumericChange('metaVotos', e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Presupuesto Total (COP)</label>
                  <input
                    type="text"
                    placeholder="Ej. 250.000.000"
                    value={visualPresupuesto}
                    onChange={(e) => handleNumericChange('presupuestoTotal', e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Fecha de Elecciones</label>
                  <input
                    type="date"
                    value={form.fechaEleccion}
                    onChange={(e) => setForm({ ...form, fechaEleccion: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Estado de Campaña</label>
                  <select
                    value={form.estado}
                    onChange={(e) => setForm({ ...form, estado: e.target.value as any })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                  >
                    <option value="PLANIFICACION">Planificación</option>
                    <option value="ACTIVA">Activa</option>
                    <option value="PAUSADA">Pausada</option>
                    <option value="FINALIZADA">Finalizada</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Descripción / Objetivos</label>
                <textarea
                  rows={2}
                  placeholder="Detalles sobre la estrategia y meta principal..."
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30"
                >
                  <Save className="w-3.5 h-3.5" />
                  {saving ? 'Creando...' : 'Crear Campaña'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
