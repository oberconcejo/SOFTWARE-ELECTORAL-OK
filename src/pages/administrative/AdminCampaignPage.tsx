import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  Building2,
  UserCheck,
  Camera,
  Trash2,
  Edit,
  ShieldCheck,
  Loader2,
  Sparkles
} from 'lucide-react';
import { supabase } from '@/src/lib/supabase';
import { useAuth } from '@/src/contexts/AuthContext';
import { useAdministrativeData } from '@/src/hooks/useAdministrativeData';
import { CampaignData } from '@/src/types';
import { COLOMBIA_TERRITORIAL_DATA } from '@/src/data/colombiaData';

// Territorial Data Constants
const COLOMBIA_DEPARTAMENTOS = Object.keys(COLOMBIA_TERRITORIAL_DATA).sort();

const CARGO_OPTIONS = [
  'Alcaldía Municipal/Distrital',
  'Gobernación Departamental',
  'Concejo Municipal/Distrital',
  'Asamblea Departamental',
  'Senado de la República',
  'Cámara de Representantes',
  'Junta Administradora Local (JAL)',
  'Presidencia de la República'
];

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
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'candidate' ? 'candidate' : 'campaigns';
  const [activeTab, setActiveTab] = useState<'campaigns' | 'candidate'>(initialTab);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Sync tab with URL search params
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'candidate' && activeTab !== 'candidate') {
      setActiveTab('candidate');
    } else if (!tab && activeTab !== 'campaigns') {
      setActiveTab('campaigns');
    }
  }, [searchParams]);

  const handleTabChange = (tab: 'campaigns' | 'candidate') => {
    setActiveTab(tab);
    if (tab === 'candidate') {
      setSearchParams({ tab: 'candidate' });
    } else {
      setSearchParams({});
    }
  };

  // Campaign Form State
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

  // Candidate Profile State
  const [candidateData, setCandidateData] = useState<{
    id?: string;
    nombre: string;
    nombre_politico: string;
    cargo: string;
    partido: string;
    departamento: string;
    municipio: string;
    territorio: string;
    identificacion: string;
    eslogan: string;
    resumen_profesional: string;
    resena: string;
    foto_url: string;
    sello_inhabilidades: string;
  } | null>(null);

  const [candidateForm, setCandidateForm] = useState({
    nombre: '',
    nombre_politico: '',
    cargo: 'Alcaldía Municipal/Distrital',
    partido: '',
    departamento: '',
    municipio: '',
    identificacion: '',
    eslogan: '',
    resumen_profesional: '',
    resena: '',
    foto_url: '',
    sello_inhabilidades: '100% Verificado'
  });

  const [loadingCandidate, setLoadingCandidate] = useState(false);
  const [savingCandidate, setSavingCandidate] = useState(false);
  const [candidateMessage, setCandidateMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Fetch Candidate Profile
  const fetchCandidate = useCallback(async () => {
    try {
      setLoadingCandidate(true);
      const { data: { session } } = supabase ? await supabase.auth.getSession() : { data: { session: null } };
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const res = await fetch('/api/strategy/candidate', { headers });
      if (res.ok) {
        const json = await res.json();
        if (json.candidate && (json.candidate.nombre || json.candidate.identificacion || json.candidate.cargo)) {
          const raw = json.candidate;
          const meta = raw.redes_sociales || {};
          const cand = {
            id: raw.id,
            nombre: raw.nombre || '',
            nombre_politico: meta.nombre_politico || '',
            cargo: raw.cargo || 'Alcaldía Municipal/Distrital',
            partido: raw.partido || '',
            departamento: meta.departamento || raw.departamento || '',
            municipio: meta.municipio || raw.municipio || '',
            territorio: raw.territorio || (meta.municipio && meta.departamento ? `${meta.municipio}, ${meta.departamento}` : meta.departamento || ''),
            identificacion: raw.identificacion || '',
            eslogan: meta.eslogan || raw.propuesta_valor || '',
            resumen_profesional: meta.resumen_profesional || raw.perfil_profesional || '',
            resena: meta.resena || '',
            foto_url: raw.foto_url || '',
            sello_inhabilidades: meta.sello_inhabilidades || '100% Verificado'
          };
          setCandidateData(cand);
          setCandidateForm({
            nombre: cand.nombre,
            nombre_politico: cand.nombre_politico,
            cargo: cand.cargo,
            partido: cand.partido,
            departamento: cand.departamento,
            municipio: cand.municipio,
            identificacion: cand.identificacion,
            eslogan: cand.eslogan,
            resumen_profesional: cand.resumen_profesional,
            resena: cand.resena,
            foto_url: cand.foto_url,
            sello_inhabilidades: cand.sello_inhabilidades
          });
        } else {
          setCandidateData(null);
        }
      }
    } catch (err) {
      console.warn('Error fetching candidate:', err);
    } finally {
      setLoadingCandidate(false);
    }
  }, []);

  useEffect(() => {
    fetchCandidate();
  }, [fetchCandidate]);

  // Save Candidate Profile
  const handleSaveCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateForm.nombre.trim()) {
      setCandidateMessage({ text: 'El nombre completo del candidato es obligatorio.', type: 'error' });
      return;
    }

    setSavingCandidate(true);
    setCandidateMessage(null);

    try {
      const { data: { session } } = supabase ? await supabase.auth.getSession() : { data: { session: null } };
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const territorioFormatted = candidateForm.municipio && candidateForm.departamento 
        ? `${candidateForm.municipio}, ${candidateForm.departamento}`
        : candidateForm.departamento || candidateForm.municipio || '';

      const payload = {
        id: candidateData?.id,
        nombre: candidateForm.nombre.trim(),
        nombre_politico: candidateForm.nombre_politico.trim(),
        cargo: candidateForm.cargo,
        partido: candidateForm.partido.trim(),
        departamento: candidateForm.departamento,
        municipio: candidateForm.municipio,
        territorio: territorioFormatted,
        identificacion: candidateForm.identificacion.trim(),
        eslogan: candidateForm.eslogan.trim(),
        resumen_profesional: candidateForm.resumen_profesional.trim(),
        resena: candidateForm.resena.trim(),
        foto_url: candidateForm.foto_url.trim(),
        sello_inhabilidades: candidateForm.sello_inhabilidades || '100% Verificado'
      };

      const res = await fetch('/api/strategy/candidate', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Error al guardar el perfil del candidato');
      }

      setCandidateMessage({ text: 'Perfil del candidato guardado con éxito. Disponible de inmediato en Gestión Estratégica.', type: 'success' });
      await fetchCandidate();
    } catch (err: any) {
      console.error('Error saving candidate:', err);
      setCandidateMessage({ text: err.message || 'Error al guardar el perfil del candidato', type: 'error' });
    } finally {
      setSavingCandidate(false);
    }
  };

  // Delete Candidate Profile
  const handleDeleteCandidate = async () => {
    if (!confirm('¿Estás seguro de eliminar el perfil del candidato? Esta acción limpiará los datos del candidato.')) {
      return;
    }

    setSavingCandidate(true);
    try {
      const { data: { session } } = supabase ? await supabase.auth.getSession() : { data: { session: null } };
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const res = await fetch('/api/strategy/candidate', {
        method: 'DELETE',
        headers
      });

      if (!res.ok) {
        throw new Error('Error al eliminar el candidato');
      }

      setCandidateData(null);
      setCandidateForm({
        nombre: '',
        nombre_politico: '',
        cargo: 'Alcaldía Municipal/Distrital',
        partido: '',
        departamento: '',
        municipio: '',
        identificacion: '',
        eslogan: '',
        resumen_profesional: '',
        resena: '',
        foto_url: '',
        sello_inhabilidades: '100% Verificado'
      });
      setCandidateMessage({ text: 'Perfil del candidato eliminado con éxito.', type: 'success' });
    } catch (err: any) {
      console.error('Error deleting candidate:', err);
      setCandidateMessage({ text: err.message || 'Error al eliminar', type: 'error' });
    } finally {
      setSavingCandidate(false);
    }
  };

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
      {/* Header & Sub-Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Flag className="w-5 h-5 text-indigo-400" />
            Gestión Administrativa de Campaña
          </h2>
          <p className="text-xs text-slate-400">
            Administración centralizada de campañas electorales y registro oficial del candidato.
          </p>
        </div>

        {activeTab === 'campaigns' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-lg shadow-indigo-600/30"
          >
            <Plus className="w-4 h-4" />
            Nueva Campaña
          </button>
        )}
      </div>

      {/* Subtabs Selector */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <button
          onClick={() => handleTabChange('campaigns')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'campaigns'
              ? 'bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 shadow-inner'
              : 'bg-slate-900/50 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Flag className="w-4 h-4" />
          <span>Campañas Electorales</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
            {campaigns.length}
          </span>
        </button>

        <button
          onClick={() => handleTabChange('candidate')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'candidate'
              ? 'bg-teal-600/20 border border-teal-500/30 text-teal-300 shadow-inner'
              : 'bg-slate-900/50 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Crear / Registrar Perfil de Candidato</span>
          {candidateData ? (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-medium">
              Registrado
            </span>
          ) : (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-950 text-amber-300 border border-amber-500/30 font-medium">
              Pendiente
            </span>
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: CAMPAÑAS ELECTORALES */}
      {/* ========================================================================= */}
      {activeTab === 'campaigns' && (
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
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CREAR / REGISTRAR PERFIL DE CANDIDATO */}
      {/* ========================================================================= */}
      {activeTab === 'candidate' && (
        <div className="space-y-6">
          {candidateMessage && (
            <div className={`p-4 rounded-xl flex items-center justify-between text-xs font-semibold border ${
              candidateMessage.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-950/80 border-rose-500/30 text-rose-300'
            }`}>
              <div className="flex items-center gap-2">
                {candidateMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{candidateMessage.text}</span>
              </div>
              <button 
                type="button" 
                onClick={() => setCandidateMessage(null)}
                className="text-slate-400 hover:text-white ml-4 font-bold"
              >
                ✕
              </button>
            </div>
          )}

          {/* Current Candidate Card if Registered */}
          {candidateData && (
            <div className="bg-slate-900/80 border border-teal-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {candidateData.foto_url ? (
                    <img 
                      src={candidateData.foto_url} 
                      alt={candidateData.nombre}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-full object-cover border-2 border-teal-400 bg-slate-950 shadow-md"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full border-2 border-teal-400 bg-slate-950 flex items-center justify-center text-teal-300 font-black text-xl shadow-md">
                      {candidateData.nombre ? candidateData.nombre.slice(0, 2).toUpperCase() : 'CA'}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-black text-white">{candidateData.nombre}</h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-300 border border-teal-500/30">
                        {candidateData.cargo}
                      </span>
                    </div>
                    {candidateData.nombre_politico && (
                      <p className="text-xs text-teal-400 font-semibold">{candidateData.nombre_politico}</p>
                    )}
                    <p className="text-xs text-slate-400 mt-1">
                      CC: <span className="text-white font-mono">{candidateData.identificacion || 'No registrada'}</span> • Partido: <span className="text-white">{candidateData.partido || 'No registrado'}</span> • Territorio: <span className="text-white">{candidateData.territorio || 'No registrado'}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDeleteCandidate}
                    disabled={savingCandidate}
                    className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Eliminar Perfil
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Candidate Registration Form */}
          <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-teal-400" />
                  {candidateData ? 'Modificar Información del Candidato' : 'Registrar Nuevo Perfil de Candidato'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Esta información se vinculará de forma automática con el expediente estratégico y la matriz DOFA en Gestión Estratégica.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveCandidate} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nombre Completo */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Nombre Completo (Registro CNE) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Juan Carlos Restrepo Gómez"
                    value={candidateForm.nombre}
                    onChange={(e) => setCandidateForm({ ...candidateForm, nombre: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-teal-400 focus:outline-none transition-colors"
                  />
                </div>

                {/* Nombre Político */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Nombre Político / Seudónimo
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Juan Carlos 'La Voz de la Gente'"
                    value={candidateForm.nombre_politico}
                    onChange={(e) => setCandidateForm({ ...candidateForm, nombre_politico: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-teal-400 focus:outline-none transition-colors"
                  />
                </div>

                {/* Cargo */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Cargo de Elección Popular *
                  </label>
                  <select
                    value={candidateForm.cargo}
                    onChange={(e) => setCandidateForm({ ...candidateForm, cargo: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:border-teal-400 focus:outline-none transition-colors cursor-pointer"
                  >
                    {CARGO_OPTIONS.map(opt => (
                      <option key={opt} value={opt} className="bg-slate-900 text-white">
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Partido */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Partido / Coalición / Grupo Significativo
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Movimiento Independiente Ciudadano"
                    value={candidateForm.partido}
                    onChange={(e) => setCandidateForm({ ...candidateForm, partido: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-teal-400 focus:outline-none transition-colors"
                  />
                </div>

                {/* Cédula */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Cédula de Ciudadanía
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. 1.020.345.678"
                    value={candidateForm.identificacion}
                    onChange={(e) => setCandidateForm({ ...candidateForm, identificacion: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-teal-400 focus:outline-none transition-colors font-mono"
                  />
                </div>

                {/* Departamento */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Departamento
                  </label>
                  <select
                    value={candidateForm.departamento}
                    onChange={(e) => setCandidateForm({ ...candidateForm, departamento: e.target.value, municipio: '' })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:border-teal-400 focus:outline-none transition-colors cursor-pointer"
                  >
                    <option value="">Seleccionar departamento</option>
                    {COLOMBIA_DEPARTAMENTOS.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                {/* Municipio */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Municipio
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Medellín"
                    value={candidateForm.municipio}
                    onChange={(e) => setCandidateForm({ ...candidateForm, municipio: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-teal-400 focus:outline-none transition-colors"
                  />
                </div>

                {/* Foto URL */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    URL Fotografía Oficial
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={candidateForm.foto_url}
                    onChange={(e) => setCandidateForm({ ...candidateForm, foto_url: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-teal-400 focus:outline-none transition-colors"
                  />
                </div>

                {/* Eslogan */}
                <div className="md:col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">
                    Eslogan Principal de Campaña
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. ¡Unidos por la transformación y el progreso!"
                    value={candidateForm.eslogan}
                    onChange={(e) => setCandidateForm({ ...candidateForm, eslogan: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-teal-400 focus:outline-none transition-colors"
                  />
                </div>

                {/* Resumen Profesional */}
                <div className="md:col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">
                    Resumen del Perfil Profesional
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Formación académica, experiencia laboral y liderazgo público/privado..."
                    value={candidateForm.resumen_profesional}
                    onChange={(e) => setCandidateForm({ ...candidateForm, resumen_profesional: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-teal-400 focus:outline-none transition-colors resize-none"
                  />
                </div>

                {/* Reseña Biográfica */}
                <div className="md:col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">
                    Reseña del Candidato (Biografía & Trayectoria)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Historia de vida, vocación comunitaria y logros destacados..."
                    value={candidateForm.resena}
                    onChange={(e) => setCandidateForm({ ...candidateForm, resena: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-teal-400 focus:outline-none transition-colors resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="submit"
                  disabled={savingCandidate}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {savingCandidate ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {candidateData ? 'Guardar Modificaciones' : 'Registrar Perfil de Candidato'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
