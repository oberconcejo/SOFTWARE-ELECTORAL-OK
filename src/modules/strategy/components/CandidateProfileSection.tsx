import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  UserCheck, 
  Camera, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Trash2, 
  Check, 
  ShieldCheck, 
  Save, 
  AlertCircle, 
  Loader2,
  Award,
  User,
  Building2,
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  X,
  Shield
} from 'lucide-react';
import { useCandidateProfile, SWOTCategoryKey } from '@/src/hooks/useCandidateProfile';
import { useAuth } from '@/src/contexts/AuthContext';
import { SWOTSection } from './SWOTSection';

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

export function CandidateProfileSection() {
  const navigate = useNavigate();
  const { user, login } = useAuth();

  const {
    candidate,
    setCandidate,
    swot,
    loading,
    savingCandidate,
    savingSwot,
    canEdit,
    message,
    setMessage,
    saveCandidate,
    toggleVariable,
    addVariable,
    removeVariable,
    updateCategoryDescription
  } = useCandidateProfile();

  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [tempPhotoUrl, setTempPhotoUrl] = useState('');

  // Authentication Modal State for Gestión Administrativa Gate
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Input states for new variables in 4 categories
  const [newVarInputs, setNewVarInputs] = useState<Record<SWOTCategoryKey, string>>({
    fortalezas: '',
    oportunidades: '',
    debilidades: '',
    amenazas: ''
  });

  const handleOpenAuthModal = () => {
    setAuthUsername(user?.email || '');
    setAuthPassword('');
    setAuthError(null);
    setShowPassword(false);
    setIsAuthModalOpen(true);
  };

  const handleCancelAuth = () => {
    setIsAuthModalOpen(false);
    setAuthPassword('');
    setAuthError(null);
    setAuthLoading(false);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUsername.trim() || !authPassword) {
      setAuthError('Por favor ingresa usuario y contraseña.');
      return;
    }

    setAuthLoading(true);
    setAuthError(null);

    try {
      // Validate credentials using the platform's existing authentication mechanism and check administrative access
      const result = await login(authUsername.trim(), authPassword, { requiredModule: 'ADMINISTRATIVE' });

      if (result && result.authorized) {
        setIsAuthModalOpen(false);
        setAuthPassword('');
        setAuthError(null);
        navigate('/gestion-administrativa/campana?tab=candidate');
      } else {
        setAuthError(result?.reason || 'Usuario o contraseña incorrectos.');
      }
    } catch (err: any) {
      console.warn('Authentication failed for administrative access:', err);
      setAuthError('Usuario o contraseña incorrectos.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAddVar = (catKey: SWOTCategoryKey) => {
    const text = newVarInputs[catKey];
    if (!text.trim()) {
      setMessage({ text: 'Ingresa una descripción para la nueva variable.', type: 'error' });
      return;
    }
    const success = addVariable(catKey, text);
    if (success) {
      setNewVarInputs(prev => ({ ...prev, [catKey]: '' }));
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidate) return;
    await saveCandidate();
  };

  const openPhotoModal = () => {
    setTempPhotoUrl(candidate?.foto_url || '');
    setIsPhotoModalOpen(true);
  };

  const handleSavePhoto = () => {
    if (!candidate) return;
    const url = tempPhotoUrl.trim();
    setCandidate(prev => prev ? { ...prev, foto_url: url } : null);
    saveCandidate({ ...candidate, foto_url: url });
    setIsPhotoModalOpen(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
        <p className="text-sm text-slate-400">Cargando perfil estratégico del candidato...</p>
      </div>
    );
  }

  // Estado vacío: Cuando no existe un candidato registrado
  if (!candidate) {
    return (
      <div className="space-y-6 select-none">
        <div className="bg-[#0b1329] border border-cyan-500/20 rounded-3xl p-10 sm:p-14 text-center shadow-2xl relative overflow-hidden backdrop-blur-md">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-lg mx-auto space-y-4">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-teal-400 shadow-lg shadow-cyan-500/10">
              <User className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white tracking-tight">
                Perfil del Candidato
              </h2>
              <p className="text-sm font-semibold text-slate-300">
                No hay información del candidato registrada todavía.
              </p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                Registra primero el perfil del candidato desde Gestión Administrativa.
              </p>
            </div>

            <div className="pt-4 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleOpenAuthModal}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Building2 className="w-4 h-4" />
                Registrar Perfil en Gestión Administrativa
              </button>
            </div>
          </div>
        </div>

        {/* Modal de Autenticación para Acceso a Gestión Administrativa */}
        <AnimatePresence>
          {isAuthModalOpen && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-slate-900 border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative overflow-hidden"
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Autenticación Requerida</h3>
                      <p className="text-[11px] text-slate-400">Acceso a Gestión Administrativa</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={handleCancelAuth}
                    className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Error Banner */}
                {authError && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2 font-medium"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{authError}</span>
                  </motion.div>
                )}

                {/* Form */}
                <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Usuario *
                    </label>
                    <input
                      type="text"
                      required
                      autoFocus
                      placeholder="Correo electrónico o usuario"
                      value={authUsername}
                      onChange={(e) => setAuthUsername(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-teal-400 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Contraseña *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-teal-400 focus:outline-none transition-colors pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
                    <button
                      type="button"
                      onClick={handleCancelAuth}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={authLoading}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-teal-500/20 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                      {authLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Validando...</span>
                        </>
                      ) : (
                        <span>Ingresar</span>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  const initials = candidate.nombre
    ? candidate.nombre.split(' ').map(n => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
    : 'CA';

  return (
    <div className="space-y-8 select-none">
      {/* Alert Notification */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`p-4 rounded-xl flex items-center justify-between text-xs font-semibold border ${
            message.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-950/80 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{message.text}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setMessage(null)}
            className="text-slate-400 hover:text-white ml-4 font-bold"
          >
            ✕
          </button>
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* ÁREA 1 — INFORMACIÓN Y CONFIGURACIÓN COMPLETA DEL CANDIDATO */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Candidate Identification & Summary Panel */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#0b1329] border border-cyan-500/20 rounded-2xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-md">
            {/* Top decorative gradient glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Avatar Section */}
            <div className="relative mx-auto w-28 h-28 mb-4">
              {candidate.foto_url ? (
                <img 
                  src={candidate.foto_url} 
                  alt={candidate.nombre}
                  referrerPolicy="no-referrer"
                  className="w-28 h-28 rounded-full object-cover border-2 border-teal-400 p-1 bg-slate-900 shadow-lg shadow-teal-500/10"
                />
              ) : (
                <div className="w-28 h-28 rounded-full border-2 border-teal-400 p-1 bg-gradient-to-br from-slate-900 to-[#06121f] shadow-lg shadow-teal-500/10 flex items-center justify-center text-teal-300 font-extrabold text-2xl tracking-wider">
                  {initials}
                </div>
              )}
              {canEdit && (
                <button
                  type="button"
                  onClick={openPhotoModal}
                  title="Cambiar fotografía del candidato"
                  className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center shadow-md transition-transform hover:scale-105"
                >
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Identity Info */}
            <div className="text-center space-y-1">
              <h2 className="text-xl font-extrabold text-white tracking-tight">{candidate.nombre || 'Candidato sin nombre'}</h2>
              {candidate.nombre_politico && (
                <p className="text-xs font-semibold text-teal-400">{candidate.nombre_politico}</p>
              )}
            </div>

            {/* Official Candidacy Badge */}
            <div className="mt-4 flex items-center justify-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold shadow-inner">
                <Award className="w-3.5 h-3.5 text-teal-400" />
                <span>Candidato Oficial a {candidate.cargo || 'Cargo por Definir'}</span>
              </div>
            </div>

            {/* Meta Key-Values */}
            <div className="mt-6 pt-4 border-t border-cyan-500/10 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Territorio:</span>
                <span className="text-white font-bold">{candidate.territorio || 'No especificado'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Cédula de Ciudadanía:</span>
                <span className="text-teal-400 font-bold">{candidate.identificacion || 'No registrada'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Sello Inhabilidades:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {candidate.sello_inhabilidades || '100% Verificado'}
                </span>
              </div>
            </div>
          </div>

          {/* Left Column Secondary Card (Summary, Slogan, and DOFA Counts) */}
          <div className="bg-[#0b1329] border border-cyan-500/20 rounded-2xl p-5 shadow-xl space-y-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400 mb-1">
                Eslogan de Campaña:
              </p>
              <p className="text-xs text-amber-200 font-semibold italic">
                {candidate.eslogan ? `"${candidate.eslogan}"` : 'Sin eslogan definido'}
              </p>
            </div>

            <div className="pt-2 border-t border-white/5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-teal-400 mb-1">
                Resumen Perfil Profesional:
              </p>
              <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 font-normal">
                {candidate.resumen_profesional || 'Sin perfil profesional registrado'}
              </p>
            </div>

            <div className="pt-2 border-t border-white/5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-teal-400 mb-1">
                Reseña del Candidato:
              </p>
              <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 font-normal">
                {candidate.resena || 'Sin reseña biográfica registrada'}
              </p>
            </div>

            {/* Quick DOFA Counters */}
            <div className="pt-3 border-t border-white/5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1 mb-2">
                <Clock className="w-3 h-3" /> Matriz DOFA Resumida:
              </p>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-emerald-950/40 border border-emerald-500/20 rounded-lg p-2 text-emerald-300 flex items-center justify-between">
                  <span>Fortalezas:</span>
                  <span className="font-bold">{swot.fortalezas.selectedVariables.length}</span>
                </div>
                <div className="bg-cyan-950/40 border border-cyan-500/20 rounded-lg p-2 text-cyan-300 flex items-center justify-between">
                  <span>Oportunidades:</span>
                  <span className="font-bold">{swot.oportunidades.selectedVariables.length}</span>
                </div>
                <div className="bg-amber-950/40 border border-amber-500/20 rounded-lg p-2 text-amber-300 flex items-center justify-between">
                  <span>Debilidades:</span>
                  <span className="font-bold">{swot.debilidades.selectedVariables.length}</span>
                </div>
                <div className="bg-rose-950/40 border border-rose-500/20 rounded-lg p-2 text-rose-300 flex items-center justify-between">
                  <span>Amenazas:</span>
                  <span className="font-bold">{swot.amenazas.selectedVariables.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Full Candidate Configuration Form */}
        <div className="lg:col-span-8">
          <form 
            onSubmit={handleSaveProfile}
            className="bg-[#0b1329] border border-cyan-500/20 rounded-2xl p-6 shadow-2xl space-y-5"
          >
            <div className="flex items-center justify-between pb-4 border-b border-cyan-500/10">
              <div className="flex items-center gap-2.5">
                <UserCheck className="w-5 h-5 text-teal-400" />
                <h3 className="text-base font-extrabold text-white tracking-wide">
                  Configuración Completa del Candidato
                </h3>
              </div>
              {canEdit && (
                <button
                  type="submit"
                  disabled={savingCandidate}
                  className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-teal-500/20 flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {savingCandidate ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Guardar Cambios
                </button>
              )}
            </div>

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Nombre Completo */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Nombre Completo (Registro CNE):
                </label>
                <input
                  type="text"
                  disabled={!canEdit}
                  required
                  value={candidate.nombre}
                  onChange={(e) => setCandidate(prev => prev ? ({ ...prev, nombre: e.target.value }) : null)}
                  className="w-full bg-[#060c18] border border-cyan-500/20 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-teal-400 focus:outline-none transition-colors"
                />
              </div>

              {/* Nombre Político / Seudónimo */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Nombre Político / Seudónimo:
                </label>
                <input
                  type="text"
                  disabled={!canEdit}
                  value={candidate.nombre_politico}
                  onChange={(e) => setCandidate(prev => prev ? ({ ...prev, nombre_politico: e.target.value }) : null)}
                  className="w-full bg-[#060c18] border border-cyan-500/20 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-teal-400 focus:outline-none transition-colors"
                />
              </div>

              {/* Cargo de Elección Popular */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Cargo de Elección Popular al que Aspira:
                </label>
                <select
                  disabled={!canEdit}
                  value={candidate.cargo}
                  onChange={(e) => setCandidate(prev => prev ? ({ ...prev, cargo: e.target.value }) : null)}
                  className="w-full bg-[#060c18] border border-cyan-500/20 rounded-xl px-3.5 py-2.5 text-white focus:border-teal-400 focus:outline-none transition-colors cursor-pointer"
                >
                  {CARGO_OPTIONS.map(opt => (
                    <option key={opt} value={opt} className="bg-slate-900 text-white">
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Partido / Coalición / Grupo Significativo */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Partido / Coalición / Grupo Significativo:
                </label>
                <input
                  type="text"
                  disabled={!canEdit}
                  value={candidate.partido}
                  onChange={(e) => setCandidate(prev => prev ? ({ ...prev, partido: e.target.value }) : null)}
                  className="w-full bg-[#060c18] border border-cyan-500/20 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-teal-400 focus:outline-none transition-colors"
                />
              </div>

              {/* Municipio / Departamento */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Municipio / Departamento:
                </label>
                <input
                  type="text"
                  disabled={!canEdit}
                  value={candidate.territorio}
                  onChange={(e) => setCandidate(prev => prev ? ({ ...prev, territorio: e.target.value }) : null)}
                  className="w-full bg-[#060c18] border border-cyan-500/20 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-teal-400 focus:outline-none transition-colors"
                />
              </div>

              {/* Cédula de Ciudadanía */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Cédula de Ciudadanía:
                </label>
                <input
                  type="text"
                  disabled={!canEdit}
                  value={candidate.identificacion}
                  onChange={(e) => setCandidate(prev => prev ? ({ ...prev, identificacion: e.target.value }) : null)}
                  className="w-full bg-[#060c18] border border-cyan-500/20 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-teal-400 focus:outline-none transition-colors"
                />
              </div>

              {/* Eslogan Principal de Campaña */}
              <div className="md:col-span-2">
                <label className="block text-slate-300 font-semibold mb-1">
                  Eslogan Principal de Campaña:
                </label>
                <input
                  type="text"
                  disabled={!canEdit}
                  value={candidate.eslogan}
                  onChange={(e) => setCandidate(prev => prev ? ({ ...prev, eslogan: e.target.value }) : null)}
                  className="w-full bg-[#060c18] border border-cyan-500/20 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-teal-400 focus:outline-none transition-colors"
                />
              </div>

              {/* Resumen del Perfil Profesional */}
              <div className="md:col-span-2">
                <label className="block text-slate-300 font-semibold mb-1">
                  Resumen del Perfil Profesional:
                </label>
                <textarea
                  rows={3}
                  disabled={!canEdit}
                  value={candidate.resumen_profesional}
                  onChange={(e) => setCandidate(prev => prev ? ({ ...prev, resumen_profesional: e.target.value }) : null)}
                  className="w-full bg-[#060c18] border border-cyan-500/20 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-teal-400 focus:outline-none transition-colors resize-none"
                />
              </div>

              {/* Reseña del Candidato (Biografía & Trayectoria) */}
              <div className="md:col-span-2">
                <label className="block text-slate-300 font-semibold mb-1">
                  Reseña del Candidato (Biografía & Trayectoria):
                </label>
                <textarea
                  rows={3}
                  disabled={!canEdit}
                  value={candidate.resena}
                  onChange={(e) => setCandidate(prev => prev ? ({ ...prev, resena: e.target.value }) : null)}
                  className="w-full bg-[#060c18] border border-cyan-500/20 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-teal-400 focus:outline-none transition-colors resize-none"
                />
              </div>
            </div>

            {canEdit && (
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={savingCandidate}
                  className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-teal-500/20 flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {savingCandidate ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Guardar Información del Candidato
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ÁREA 2 — MATRIZ DOFA / SWOT DEL CANDIDATO (4 BLOQUES 2X2) */}
      {/* ========================================================================= */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-2.5 pb-2">
          <Clock className="w-5 h-5 text-teal-400" />
          <h3 className="text-lg font-extrabold text-white tracking-wide">
            Matriz DOFA / SWOT del Candidato
          </h3>
        </div>

        <SWOTSection />
      </div>

      {/* Modal for Photo URL edit */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b1329] border border-teal-500/30 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Camera className="w-4 h-4 text-teal-400" />
              Actualizar Fotografía del Candidato
            </h3>
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-medium">URL de la Imagen:</label>
              <input 
                type="url" 
                value={tempPhotoUrl} 
                onChange={(e) => setTempPhotoUrl(e.target.value)}
                placeholder="https://..." 
                className="w-full bg-[#060c18] border border-cyan-500/30 rounded-xl px-3 py-2 text-xs text-white focus:border-teal-400 outline-none"
              />
            </div>
            {tempPhotoUrl && (
              <div className="flex justify-center py-2">
                <img 
                  src={tempPhotoUrl} 
                  alt="Preview" 
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 rounded-full object-cover border-2 border-teal-400 p-1"
                />
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <button 
                type="button" 
                onClick={() => setIsPhotoModalOpen(false)}
                className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button 
                type="button" 
                onClick={handleSavePhoto}
                className="px-4 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs"
              >
                Guardar Foto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
