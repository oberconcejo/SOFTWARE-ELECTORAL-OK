import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  UserPlus, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  AlertTriangle, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  Calendar,
  XCircle,
  Vote
} from 'lucide-react';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { useVoters } from '@/src/hooks/useVoters';
import { useAuth } from '@/src/contexts/AuthContext';
import { supabase } from '@/src/lib/supabase';
import { lookupSingleCitizen } from '@/src/services/pollingStationService';
import { queryVotingLocation, validateCedulaInput } from '@/src/services/votingLocationService';

export interface AddVoterFormProps {
  onSuccess?: () => void;
  initialCedula?: string;
}

interface ValidatedCitizenData {
  documento: string;
  nombreCompleto: string;
  fechaNacimiento?: string;
  departamento: string;
  municipio: string;
  comuna?: string;
  puestoVotacion: string;
  mesa?: string | number;
  direccionPuesto?: string;
  estadoValidacion: string;
}

type VoterIntention = 'Voto Seguro' | 'Simpatizante' | 'Indeciso' | 'Opositor';

export function AddVoterForm({ onSuccess, initialCedula = '' }: AddVoterFormProps) {
  const { addVoter, voters } = useVoters();
  const { user, checkPermission } = useAuth();

  const [cedula, setCedula] = useState(initialCedula);
  const [isConsulting, setIsConsulting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Query Result State
  const [validatedData, setValidatedData] = useState<ValidatedCitizenData | null>(null);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [duplicateMessage, setDuplicateMessage] = useState<string | null>(null);
  
  // Status & Error Banners
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form Fields
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [intencion, setIntencion] = useState<VoterIntention>('Indeciso');

  // Permission Check: Can current user create/link voters?
  const hasPermission = user ? (
    user.role === 'SUPERADMIN' || 
    user.role === 'ADMIN_CLIENTE' || 
    user.role === 'DIRECTOR' || 
    user.role === 'COORDINADOR' ||
    user.role === 'USUARIO' ||
    checkPermission('CRM', 'VOTERS', 'CREATE') ||
    checkPermission('TERRITORY', 'VOTERS', 'CREATE')
  ) : true;

  // Format date helper for regional display (e.g. 15 may 1985)
  const formatBirthDate = (rawDate?: string): string => {
    if (!rawDate || rawDate === 'No disponible' || rawDate.trim() === '') {
      return 'No disponible';
    }
    try {
      const parsed = new Date(rawDate);
      if (isNaN(parsed.getTime())) {
        return rawDate;
      }
      return parsed.toLocaleDateString('es-CO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return 'No disponible';
    }
  };

  // Validate phone format (Colombian standard 7 to 10 digits)
  const validatePhone = (value: string): boolean => {
    if (!value.trim()) {
      setPhoneError('Ingresa un número de teléfono de contacto.');
      return false;
    }
    const cleanNumber = value.replace(/[\s\-\(\)\+]/g, '');
    if (!/^\d{7,12}$/.test(cleanNumber)) {
      setPhoneError('Ingresa un número de teléfono válido (entre 7 y 10 dígitos).');
      return false;
    }
    setPhoneError(null);
    return true;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPhone(val);
    if (phoneError && val.trim()) {
      validatePhone(val);
    }
  };

  // Handle Identity Consultation via Real Available Sources
  const handleConsult = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous states
    setErrorMessage(null);
    setInfoMessage(null);
    setSuccessMessage(null);
    setValidatedData(null);
    setIsDuplicate(false);
    setDuplicateMessage(null);

    const validation = validateCedulaInput(cedula);
    if (!validation.isValid) {
      setErrorMessage(validation.errorMessage || 'Ingresa un documento de identidad válido.');
      return;
    }

    const cleanDoc = validation.cleanCedula;

    // Check if user has required permissions
    if (!hasPermission) {
      setErrorMessage('No tienes permisos para realizar esta acción.');
      return;
    }

    setIsConsulting(true);

    try {
      // 1. Check if voter already exists in this campaign/territory
      let duplicateFound = false;
      
      // Check local cache
      const localMatch = voters.find(v => v.cedula === cleanDoc);
      if (localMatch) {
        duplicateFound = true;
      } else if (supabase && user?.tenantId) {
        // Check Supabase 'voters' table
        try {
          const { data: existingVoter } = await supabase
            .from('voters')
            .select('id, nombre, cedula, comuna, puesto')
            .eq('cedula', cleanDoc)
            .eq('client_id', user.tenantId)
            .maybeSingle();

          if (existingVoter) {
            duplicateFound = true;
          }
        } catch (dbErr) {
          console.warn('Database duplicate check error:', dbErr);
        }
      }

      if (duplicateFound) {
        setIsDuplicate(true);
        setDuplicateMessage('Este votante ya se encuentra vinculado a este territorio.');
      }

      // 2. Query Identity using configured official backend proxy first
      let citizenInfo: ValidatedCitizenData | null = null;

      try {
        const proxyResponse = await queryVotingLocation(cleanDoc);
        
        if (proxyResponse.status === 'ENCONTRADO' && proxyResponse.nombreCompleto && proxyResponse.nombreCompleto !== 'No disponible') {
          citizenInfo = {
            documento: proxyResponse.cedula || cleanDoc,
            nombreCompleto: proxyResponse.nombreCompleto,
            fechaNacimiento: proxyResponse.fechaNacimiento,
            departamento: proxyResponse.departamento || 'No disponible',
            municipio: proxyResponse.municipio || 'No disponible',
            comuna: proxyResponse.comuna,
            puestoVotacion: proxyResponse.puestoVotacion || 'No disponible',
            mesa: proxyResponse.mesa !== 'No disponible' ? proxyResponse.mesa : undefined,
            direccionPuesto: proxyResponse.direccionPuesto,
            estadoValidacion: 'Identidad Validada CNE'
          };
        } else if (proxyResponse.status === 'NO_ENCONTRADO') {
          // Continue to secondary check or return controlled message
        }
      } catch (proxyErr) {
        console.warn('Backend voting location proxy error:', proxyErr);
      }

      // 3. If backend proxy was unconfigured or didn't return, query local/census database source
      if (!citizenInfo) {
        const localSourceResult = await lookupSingleCitizen(cleanDoc, user?.tenantId);
        
        if (localSourceResult.estadoConsulta === 'ENCONTRADO' && localSourceResult.nombreCompleto) {
          citizenInfo = {
            documento: localSourceResult.documento,
            nombreCompleto: localSourceResult.nombreCompleto,
            fechaNacimiento: undefined, // Not provided by this specific source
            departamento: localSourceResult.departamento || 'No disponible',
            municipio: localSourceResult.municipio || 'No disponible',
            comuna: localSourceResult.comuna || localSourceResult.zona,
            puestoVotacion: localSourceResult.puestoVotacion || 'No disponible',
            mesa: localSourceResult.mesa || undefined,
            direccionPuesto: localSourceResult.direccionPuesto,
            estadoValidacion: 'Identidad Validada CNE'
          };
        } else if (localSourceResult.estadoConsulta === 'NO_ENCONTRADO') {
          setErrorMessage('No se encontró información para el documento consultado.');
          return;
        } else if (localSourceResult.estadoConsulta === 'ERROR') {
          setErrorMessage(localSourceResult.mensajeError || 'No fue posible verificar la identidad. Inténtalo nuevamente.');
          return;
        }
      }

      // 4. Evaluate query outcome
      if (citizenInfo) {
        setValidatedData(citizenInfo);
      } else {
        setErrorMessage('No se encontró información para el documento consultado.');
      }

    } catch (err: any) {
      console.error('Error during voter identity verification:', err);
      setErrorMessage('No fue posible verificar la identidad. Inténtalo nuevamente.');
    } finally {
      setIsConsulting(false);
    }
  };

  // Handle Voter Confirmation and Territorial Linking
  const handleSubmit = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!validatedData) {
      setErrorMessage('Ingresa un documento para verificar la identidad.');
      return;
    }

    if (!hasPermission) {
      setErrorMessage('No tienes permisos para realizar esta acción.');
      return;
    }

    if (isDuplicate) {
      setErrorMessage('Este votante ya se encuentra vinculado a este territorio.');
      return;
    }

    if (!validatePhone(phone)) {
      return;
    }

    if (!intencion) {
      setErrorMessage('Completa los campos obligatorios antes de continuar.');
      return;
    }

    try {
      setIsSubmitting(true);

      // Verify again for duplicates in database
      if (supabase && user?.tenantId) {
        const { data: existingCheck } = await supabase
          .from('voters')
          .select('id')
          .eq('cedula', validatedData.documento)
          .eq('client_id', user.tenantId)
          .maybeSingle();

        if (existingCheck) {
          setIsDuplicate(true);
          setErrorMessage('Este votante ya se encuentra vinculado a este territorio.');
          return;
        }
      }

      // Parse numerical table value if available
      let mesaNumber = 0;
      if (validatedData.mesa) {
        const mesaStr = String(validatedData.mesa).replace(/\D/g, '');
        mesaNumber = mesaStr ? parseInt(mesaStr, 10) : 0;
      }

      // Call voter creation service
      await addVoter({
        nombre: validatedData.nombreCompleto,
        cedula: validatedData.documento,
        telefono: phone.trim(),
        comuna: validatedData.comuna || 'Zona Principal',
        puesto: validatedData.puestoVotacion || 'Puesto Central',
        mesa: mesaNumber,
        intencion: intencion,
        lider_nombre: user?.name || 'Administrador'
      });

      // Show success notification and reset form
      setSuccessMessage(`Votante ${validatedData.nombreCompleto} vinculado exitosamente al territorio.`);
      
      // Reset form fields
      setCedula('');
      setValidatedData(null);
      setPhone('');
      setPhoneError(null);
      setIntencion('Indeciso');
      setIsDuplicate(false);
      setDuplicateMessage(null);

      // Trigger optional callback
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1200);
      }

    } catch (err: any) {
      console.error('Error linking voter:', err);
      setErrorMessage('No fue posible vincular el votante. Inténtalo nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = Boolean(
    validatedData && 
    !isDuplicate && 
    phone.trim() && 
    !phoneError && 
    hasPermission && 
    !isSubmitting
  );

  return (
    <Card className="border border-white/10 bg-[#0e0f18]/95 p-6 sm:p-8 rounded-[32px] shadow-2xl space-y-6">
      <div className="space-y-6">
        {/* Header with Title and Real-Time Validation Badge */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/30 text-white shrink-0">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Vincular Nuevo Votante</h3>
            <p className="text-slate-400 text-xs sm:text-sm font-normal mt-0.5">
              Validación en tiempo real con el Censo Electoral Nacional
            </p>
          </div>
        </div>

        {/* Identity Query Search Bar */}
        <form onSubmit={handleConsult} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" aria-hidden="true" />
            <input
              id="voter-cedula-input"
              type="text"
              inputMode="numeric"
              value={cedula}
              onChange={(e) => {
                setCedula(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="Ingrese Cédula del Ciudadano..."
              className="w-full bg-black/50 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all font-medium text-sm sm:text-base"
              aria-label="Cédula de identidad del ciudadano"
              disabled={isConsulting}
            />
          </div>
          <Button 
            type="submit" 
            disabled={isConsulting || !cedula.trim()} 
            className="px-8 rounded-2xl h-[52px] bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed font-bold uppercase tracking-widest text-[11px] text-white shadow-md shadow-indigo-600/20 transition-all cursor-pointer shrink-0"
          >
            {isConsulting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verificando...</span>
              </span>
            ) : (
              'Verificar Identidad'
            )}
          </Button>
        </form>

        {/* Global Notifications & Feedback */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between gap-3 text-rose-300 text-xs sm:text-sm font-medium"
              role="alert"
            >
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
              <button 
                type="button" 
                onClick={() => setErrorMessage(null)} 
                className="text-rose-400 hover:text-white p-1"
                aria-label="Cerrar alerta"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2.5 text-emerald-300 text-xs sm:text-sm font-medium"
              role="status"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Validated Information Card (Displayed strictly upon real valid response) */}
        <AnimatePresence mode="wait">
          {validatedData && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="space-y-6 p-6 sm:p-7 rounded-[28px] bg-white/[0.03] border border-white/5 mt-2 shadow-inner">
                {/* Status Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
                  <Badge variant="success" className="gap-2 py-1.5 px-4 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold w-fit">
                    <ShieldCheck className="w-4 h-4" />
                    <span>{validatedData.estadoValidacion}</span>
                  </Badge>
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                    {validatedData.municipio}{validatedData.departamento !== 'No disponible' ? `, ${validatedData.departamento}` : ''}
                  </span>
                </div>

                {/* Read-Only Official Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  {/* Nombre Completo Registrado */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block">
                      Nombre Completo Registrado
                    </span>
                    <p className="text-white font-black text-lg sm:text-xl leading-tight tracking-tight">
                      {validatedData.nombreCompleto}
                    </p>
                  </div>

                  {/* Lugar de Votación Actual y Mesa */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block">
                      Lugar de Votación Actual
                    </span>
                    <p className="text-indigo-400 text-sm sm:text-base font-bold flex items-center gap-2 leading-tight">
                      <MapPin className="w-4 h-4 shrink-0 text-indigo-400" />
                      <span>
                        {validatedData.puestoVotacion}
                        {validatedData.mesa ? ` - Mesa ${String(validatedData.mesa).replace(/\D/g, '') || validatedData.mesa}` : ''}
                      </span>
                    </p>
                  </div>

                  {/* Fecha de Nacimiento (Si existe en respuesta real o 'No disponible') */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block">
                      Fecha de Nacimiento
                    </span>
                    <p className="text-slate-300 text-sm font-semibold flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      <span>{formatBirthDate(validatedData.fechaNacimiento)}</span>
                    </p>
                  </div>

                  {/* Sector / Comuna territorial */}
                  {validatedData.comuna && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block">
                        Sector / Territorio
                      </span>
                      <p className="text-slate-300 text-sm font-semibold">
                        {validatedData.comuna}
                      </p>
                    </div>
                  )}
                </div>

                {/* Warning if voter is duplicate */}
                {isDuplicate && (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3 text-amber-300 text-xs sm:text-sm font-semibold">
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                    <span>{duplicateMessage || 'Este votante ya se encuentra vinculado a este territorio.'}</span>
                  </div>
                )}

                {/* Editable Data Row: Phone & Intention */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/5">
                  {/* Teléfono de Contacto (WhatsApp) */}
                  <div className="space-y-2">
                    <label 
                      htmlFor="voter-phone-input" 
                      className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest"
                    >
                      Teléfono de Contacto (WhatsApp) <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" aria-hidden="true" />
                      <input 
                        id="voter-phone-input"
                        type="tel" 
                        value={phone}
                        onChange={handlePhoneChange}
                        disabled={isSubmitting || isDuplicate}
                        className={`w-full bg-black/40 border rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none transition-all ${
                          phoneError 
                            ? 'border-rose-500 focus:border-rose-500' 
                            : 'border-white/10 focus:border-indigo-500'
                        }`} 
                        placeholder="Ej: 310 123 4567" 
                      />
                    </div>
                    {phoneError && (
                      <p className="text-xs text-rose-400 font-medium">{phoneError}</p>
                    )}
                  </div>

                  {/* Intención de Voto */}
                  <div className="space-y-2">
                    <label 
                      htmlFor="voter-intention-select" 
                      className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest"
                    >
                      Intención de Voto <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <select 
                        id="voter-intention-select"
                        value={intencion}
                        onChange={(e) => setIntencion(e.target.value as VoterIntention)}
                        disabled={isSubmitting || isDuplicate}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white appearance-none focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
                      >
                        <option value="Voto Seguro" className="bg-[#12131f] text-white">Voto Seguro (100% Comprometido)</option>
                        <option value="Simpatizante" className="bg-[#12131f] text-white">Simpatizante (Posible)</option>
                        <option value="Indeciso" className="bg-[#12131f] text-white">Indeciso (Por convencer)</option>
                        <option value="Opositor" className="bg-[#12131f] text-white">Opositor (En contra)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Final Confirmation Button */}
                <Button 
                  type="button"
                  onClick={handleSubmit}
                  disabled={!isFormValid}
                  className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl font-extrabold uppercase tracking-wider text-xs sm:text-sm text-white shadow-xl shadow-emerald-600/20 transition-all hover:scale-[1.005] active:scale-[0.99] cursor-pointer"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Vinculando Votante al Territorio...</span>
                    </span>
                  ) : (
                    'Confirmar y Vincular al Territorio'
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
}
