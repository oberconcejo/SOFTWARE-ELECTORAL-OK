import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Vote, 
  UserCheck, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Building2, 
  Layers, 
  FileText, 
  Clock, 
  ShieldCheck, 
  Copy, 
  Check, 
  AlertTriangle,
  RotateCcw,
  Loader2,
  Lock,
  Calendar,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/src/contexts/AuthContext';
import { VotingLocationApiResponse, QueryExecutionState, UserRole } from '@/src/types';
import { 
  queryVotingLocation, 
  validateCedulaInput, 
  QUERY_STATE_MESSAGES 
} from '@/src/services/votingLocationService';

interface PollingPlaceLookupViewProps {
  moduleSource: 'ADMINISTRATIVE' | 'STRATEGY' | 'TERRITORY';
  title?: string;
  subtitle?: string;
}

export default function PollingPlaceLookupView({
  moduleSource,
  title = 'Consulta lugar de votación',
  subtitle = 'Servicio oficial de consulta para verificación de censo, puesto y mesa de votación.'
}: PollingPlaceLookupViewProps) {
  const { user, client, apiUsage, refreshUserData } = useAuth();

  // State Management
  const [cedulaInput, setCedulaInput] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [queryState, setQueryState] = useState<QueryExecutionState>('IDLE');
  const [result, setResult] = useState<VotingLocationApiResponse | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Handle Input with Strict Numbers-Only Rule
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    // Strictly strip non-digits
    const numericVal = rawVal.replace(/\D/g, '');
    setCedulaInput(numericVal);
    if (inputError) setInputError(null);
  };

  // Block non-numeric keystrokes
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow navigation, backspace, tab, delete, enter
    const allowedKeys = ['Backspace', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter'];
    if (allowedKeys.includes(e.key) || e.ctrlKey || e.metaKey) {
      return;
    }
    // Block non-numeric characters
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  };

  // Handle Search Submission
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent double-clicking
    if (queryState === 'CARGANDO') return;

    // 1. Client Balance Check
    const assigned = apiUsage?.total_assigned || 0;
    const consumed = apiUsage?.total_consumed || 0;
    const remaining = Math.max(0, assigned - consumed);

    if (remaining <= 0 && user?.role !== UserRole.SUPERADMIN) {
      setQueryState('LIMITE_CONSULTAS');
      return;
    }

    const { isValid, cleanCedula, errorMessage } = validateCedulaInput(cedulaInput);
    if (!isValid) {
      setInputError(errorMessage || 'Ingrese un número de cédula válido.');
      return;
    }

    setInputError(null);
    setQueryState('CARGANDO');
    setResult(null);

    try {
      const response = await queryVotingLocation(cleanCedula);
      setResult(response);
      setQueryState(response.status);

      // 2. Automatic Consumption Refresh
      if (response.status === 'ENCONTRADO' || response.status === 'NO_ENCONTRADO') {
        refreshUserData();
      }
    } catch (err) {
      console.error('Lookup exception:', err);
      setQueryState('ERROR_CONEXION');
      setResult({
        status: 'ERROR_CONEXION',
        message: QUERY_STATE_MESSAGES.ERROR_CONEXION,
        cedula: cleanCedula,
        queryTimestamp: new Date().toISOString()
      });
    }
  };

  // Reset form to search again
  const handleReset = () => {
    setCedulaInput('');
    setInputError(null);
    setQueryState('IDLE');
    setResult(null);
  };

  // Helper to copy text to clipboard
  const handleCopy = (text: string, fieldKey: string) => {
    if (!text || text === 'No disponible') return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Format Display Dates
  const formatDateTime = (isoString?: string) => {
    if (!isoString) return 'No disponible';
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return isoString;
      return d.toLocaleString('es-CO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    } catch {
      return isoString;
    }
  };

  // Electoral Status Styling Helpers
  const getElectoralStatusStyles = (variant?: string) => {
    switch (variant) {
      case 'active':
        return {
          container: 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300',
          dot: 'bg-emerald-400 animate-pulse',
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
        };
      case 'deceased':
        return {
          container: 'bg-rose-950/40 border-rose-500/30 text-rose-300',
          dot: 'bg-rose-500',
          badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40'
        };
      case 'in_process':
        return {
          container: 'bg-amber-950/40 border-amber-500/30 text-amber-300',
          dot: 'bg-amber-400',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
        };
      case 'not_eligible':
        return {
          container: 'bg-orange-950/40 border-orange-500/30 text-orange-300',
          dot: 'bg-orange-500',
          badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40'
        };
      case 'unavailable':
      default:
        return {
          container: 'bg-slate-800/40 border-slate-700 text-slate-300',
          dot: 'bg-slate-400',
          badge: 'bg-slate-700/50 text-slate-300 border-slate-600'
        };
    }
  };

  const statusStyles = getElectoralStatusStyles(result?.electoralStatus?.badgeVariant);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-12">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">{title}</h1>
              <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-800/80 text-slate-300 border border-slate-700">
            <Lock className="w-3.5 h-3.5 text-blue-400" />
            Consulta Oficial
          </span>
        </div>
      </div>

      {/* 2. Main Search Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-sm shadow-xl relative overflow-hidden">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label 
                htmlFor="cedulaInput" 
                className="block text-sm font-semibold text-slate-200 mb-2"
              >
                Cédula de Ciudadanía <span className="text-rose-400">*</span>
              </label>
              
              <div className="relative">
                <input
                  id="cedulaInput"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={cedulaInput}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Ej. 1098765432"
                  disabled={queryState === 'CARGANDO'}
                  className={`w-full bg-slate-950/80 border ${
                    inputError ? 'border-rose-500/70 focus:border-rose-500 focus:ring-rose-500/20' : 'border-slate-700 focus:border-blue-500 focus:ring-blue-500/20'
                  } rounded-xl px-4 py-3.5 text-base text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                  autoComplete="off"
                />

                {cedulaInput && queryState !== 'CARGANDO' && (
                  <button
                    type="button"
                    onClick={() => setCedulaInput('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                    title="Borrar texto"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                )}
              </div>

              {inputError && (
                <p className="text-xs text-rose-400 mt-2 flex items-center gap-1.5 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {inputError}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="submit"
                id="btnConsultar"
                disabled={queryState === 'CARGANDO' || !cedulaInput.trim()}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-lg shadow-blue-900/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {queryState === 'CARGANDO' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Verificando...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Consultar</span>
                  </>
                )}
              </button>

              {result && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  Nueva Consulta
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* 3. Loading State Feedback */}
      <AnimatePresence>
        {queryState === 'CARGANDO' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center"
          >
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
              </div>
              <h3 className="text-base font-semibold text-white">Verificando información...</h3>
              <p className="text-xs text-slate-400 max-w-sm">
                Consultando el estado del censo y ubicación electoral con la fuente autorizada.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Unconfigured / Error States */}
      <AnimatePresence>
        {queryState === 'SERVICIO_NO_CONFIGURADO' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-6 sm:p-8"
          >
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-amber-300">
                  Servicio de consulta no configurado
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  La integración con la API oficial de consulta de lugar de votación está preparada en la arquitectura del sistema y requiere la parametrización de las variables de entorno de conexión segura (<code className="text-xs bg-slate-900 px-2 py-0.5 rounded text-amber-300">VOTING_API_BASE_URL</code>, <code className="text-xs bg-slate-900 px-2 py-0.5 rounded text-amber-300">VOTING_API_KEY</code>).
                </p>
                <p className="text-xs text-slate-400 pt-1">
                  Por políticas de integridad y estricto apego a datos oficiales, el sistema no emite datos simulados sin un proveedor verificado.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {queryState === 'NO_ENCONTRADO' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 text-center"
          >
            <div className="max-w-md mx-auto space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-white">
                No encontramos información asociada a esta cédula.
              </h3>
              <p className="text-xs text-slate-400">
                Verifique que el número de cédula esté escrito correctamente o que el ciudadano se encuentre habilitado en el censo electoral oficial.
              </p>
            </div>
          </motion.div>
        )}

        {queryState === 'ERROR_CONEXION' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="bg-rose-950/20 border border-rose-500/30 rounded-2xl p-6 sm:p-8"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-rose-300">
                  No fue posible conectar con el servicio de consulta.
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Revise su conexión de red o intente nuevamente en unos instantes.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {queryState === 'ERROR_AUTENTICACION' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="bg-rose-950/20 border border-rose-500/30 rounded-2xl p-6"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-rose-300">
                  La autorización de la API no es válida.
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Contacte al administrador técnico para validar las credenciales del servicio.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {queryState === 'LIMITE_CONSULTAS' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-6 sm:p-8"
          >
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-amber-300">
                  Has alcanzado el límite de consultas disponibles.
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-900/50 p-3 rounded-xl border border-white/5">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Asignadas</p>
                    <p className="text-lg font-bold text-white">{(apiUsage?.total_assigned || 0).toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-900/50 p-3 rounded-xl border border-white/5">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Consumidas</p>
                    <p className="text-lg font-bold text-white">{(apiUsage?.total_consumed || 0).toLocaleString()}</p>
                  </div>
                  <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                    <p className="text-[10px] font-bold text-amber-500/70 uppercase tracking-widest mb-1">Disponibles</p>
                    <p className="text-lg font-bold text-amber-400">0</p>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  Su cupo de consultas API se ha agotado completamente. Por favor contacte al administrador de su organización para solicitar una ampliación de créditos.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {queryState === 'ERROR_PROVEEDOR' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-slate-200">
                  El servicio de consulta no está disponible temporalmente.
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  El servidor del proveedor oficial se encuentra en mantenimiento o no responde. Intente más tarde.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. SUCCESS RESULTS SECTION (Strict Visual Order) */}
      <AnimatePresence>
        {queryState === 'ENCONTRADO' && result && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* 5.1 Tarjeta "ESTADO ELECTORAL" (Highlight Card at the Top) */}
            <div className={`rounded-2xl border p-5 sm:p-6 backdrop-blur-sm shadow-lg ${statusStyles.container}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    ESTADO ELECTORAL
                  </div>
                  
                  <div className="flex items-center gap-2.5">
                    <span className={`w-3 h-3 rounded-full shrink-0 ${statusStyles.dot}`} />
                    <span className="text-lg sm:text-xl font-bold tracking-tight text-white">
                      {result.electoralStatus?.statusText || 'ESTADO NO DISPONIBLE'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                      Estado reportado por la fuente oficial
                    </span>
                    {result.verificationDate && (
                      <span className="text-slate-400 border-l border-slate-700 pl-3">
                        Última verificación: {result.verificationDate}
                      </span>
                    )}
                  </div>
                </div>

                <div className="shrink-0 self-start sm:self-center">
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold border ${statusStyles.badge}`}>
                    {result.electoralStatus?.isVerified ? 'Estado verificado' : 'Sin verificar'}
                  </span>
                </div>
              </div>
            </div>

            {/* 5.2 Section "Datos de la consulta" */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
              <div className="border-b border-slate-800 pb-4 mb-6">
                <h2 className="text-lg font-bold text-white tracking-tight">Datos de la consulta</h2>
                <p className="text-xs text-blue-400 font-medium mt-0.5">Datos verificados por API</p>
              </div>

              {/* Read-Only Official Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Cédula */}
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between group">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">Número de cédula</span>
                    <button
                      onClick={() => handleCopy(result.cedula, 'cedula')}
                      className="text-slate-500 hover:text-slate-300 transition-colors p-1"
                      title="Copiar cédula"
                    >
                      {copiedField === 'cedula' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <span className="text-base font-bold text-white tracking-wider mt-2">
                    {result.cedula || 'No disponible'}
                  </span>
                </div>

                {/* Nombre Completo */}
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between md:col-span-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">Nombre completo</span>
                    <button
                      onClick={() => handleCopy(result.nombreCompleto || '', 'nombre')}
                      className="text-slate-500 hover:text-slate-300 transition-colors p-1"
                      title="Copiar nombre"
                    >
                      {copiedField === 'nombre' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <span className="text-base font-bold text-white mt-2">
                    {result.nombreCompleto || 'No disponible'}
                  </span>
                </div>

                {/* Fecha de Nacimiento */}
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
                  <span className="text-xs text-slate-400 font-medium">Fecha de nacimiento</span>
                  <span className="text-sm font-semibold text-slate-200 mt-2">
                    {result.fechaNacimiento || 'No disponible'}
                  </span>
                </div>

                {/* Departamento */}
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
                  <span className="text-xs text-slate-400 font-medium">Departamento</span>
                  <span className="text-sm font-semibold text-slate-200 mt-2">
                    {result.departamento || 'No disponible'}
                  </span>
                </div>

                {/* Municipio */}
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
                  <span className="text-xs text-slate-400 font-medium">Municipio</span>
                  <span className="text-sm font-semibold text-slate-200 mt-2">
                    {result.municipio || 'No disponible'}
                  </span>
                </div>

                {/* Comuna / Zona */}
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
                  <span className="text-xs text-slate-400 font-medium">Comuna / Zona</span>
                  <span className="text-sm font-semibold text-slate-200 mt-2">
                    {result.comuna || 'No disponible'}
                  </span>
                </div>

                {/* Barrio */}
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
                  <span className="text-xs text-slate-400 font-medium">Barrio</span>
                  <span className="text-sm font-semibold text-slate-200 mt-2">
                    {result.barrio || 'No disponible'}
                  </span>
                </div>

                {/* Mesa */}
                <div className="bg-blue-950/30 border border-blue-500/30 rounded-xl p-4 flex flex-col justify-between">
                  <span className="text-xs text-blue-300 font-medium">Mesa asignada</span>
                  <span className="text-base font-bold text-blue-200 mt-2">
                    {result.mesa || 'No disponible'}
                  </span>
                </div>

                {/* Puesto de Votación */}
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between md:col-span-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">Puesto de votación</span>
                    <button
                      onClick={() => handleCopy(result.puestoVotacion || '', 'puesto')}
                      className="text-slate-500 hover:text-slate-300 transition-colors p-1"
                      title="Copiar puesto"
                    >
                      {copiedField === 'puesto' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <span className="text-sm font-bold text-white mt-2">
                    {result.puestoVotacion || 'No disponible'}
                  </span>
                </div>

                {/* Dirección del Puesto */}
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between md:col-span-1">
                  <span className="text-xs text-slate-400 font-medium">Dirección del puesto</span>
                  <span className="text-sm font-semibold text-slate-300 mt-2">
                    {result.direccionPuesto || 'No disponible'}
                  </span>
                </div>

                {/* Estado de la consulta */}
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
                  <span className="text-xs text-slate-400 font-medium">Estado de la consulta</span>
                  <span className="text-xs font-semibold text-emerald-400 mt-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {result.estadoConsultaTexto || 'Encontrado'}
                  </span>
                </div>

                {/* Fecha / Hora de Consulta */}
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between md:col-span-2">
                  <span className="text-xs text-slate-400 font-medium">Fecha y hora de consulta</span>
                  <span className="text-xs font-medium text-slate-300 mt-2 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {formatDateTime(result.queryTimestamp)}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
