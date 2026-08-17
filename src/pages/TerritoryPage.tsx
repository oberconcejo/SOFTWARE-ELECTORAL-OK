import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  BookmarkCheck, 
  PieChart, 
  CheckSquare,
  ShieldCheck,
  Plus,
  MapPin,
  Loader2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { VoterList } from '@/src/modules/crm/components/VoterList';
import { AddVoterForm } from '@/src/modules/crm/components/AddVoterForm';
import { useAdministrativeData } from '@/src/hooks/useAdministrativeData';
import { useAuth } from '@/src/contexts/AuthContext';

type TerritoryTab = 'voters' | 'witnesses' | 'surveys' | 'jurors';

export default function TerritoryPage() {
  const [searchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as TerritoryTab) || 'voters';
  const [showAddVoter, setShowAddVoter] = useState(false);
  const { witnesses, jurors, surveys, loading, error, refresh } = useAdministrativeData();
  const { user, checkPermission } = useAuth();

  // Permission validation for territory witnesses section
  const hasWitnessesPermission = user ? (
    user.role === 'SUPERADMIN' || 
    user.role === 'ADMIN_CLIENTE' || 
    user.role === 'DIRECTOR' || 
    user.role === 'COORDINADOR' ||
    user.role === 'USUARIO' ||
    checkPermission('TERRITORY', 'WITNESSES', 'VIEW') ||
    checkPermission('ADMINISTRATIVE', 'WITNESSES', 'VIEW')
  ) : true;

  // Permission validation for territory surveys section
  const hasSurveysPermission = user ? (
    user.role === 'SUPERADMIN' || 
    user.role === 'ADMIN_CLIENTE' || 
    user.role === 'DIRECTOR' || 
    user.role === 'COORDINADOR' ||
    user.role === 'USUARIO' ||
    checkPermission('TERRITORY', 'SURVEYS', 'VIEW') ||
    checkPermission('RESEARCH', 'SURVEYS', 'VIEW') ||
    checkPermission('ADMINISTRATIVE', 'SURVEYS', 'VIEW')
  ) : true;

  // Permission validation for territory jurors section
  const hasJurorsPermission = user ? (
    user.role === 'SUPERADMIN' || 
    user.role === 'ADMIN_CLIENTE' || 
    user.role === 'DIRECTOR' || 
    user.role === 'COORDINADOR' ||
    user.role === 'USUARIO' ||
    checkPermission('TERRITORY', 'JURORS', 'VIEW') ||
    checkPermission('ADMINISTRATIVE', 'JURORS', 'VIEW')
  ) : true;

  return (
    <div className="h-full flex flex-col space-y-6 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Gestión Territorial</h1>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="success" className="gap-1.5 py-1 px-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase tracking-wider text-xs">
              <ShieldCheck className="w-3.5 h-3.5" /> NODO: OPERACIÓN EN TERRITORIO
            </Badge>
            <span className="text-slate-400 text-sm font-normal">Control y despliegue operativo en campo</span>
          </div>
        </div>
      </div>

      {/* Tab Content Driven from Vertical Sidebar */}
      <AnimatePresence mode="wait">
        {/* 1. Registro de Votantes */}
        {activeTab === 'voters' && (
          <motion.div
            key="voters"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <Card className="rounded-[32px] bg-[#111114] border-white/5 p-8 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Registro de Votantes</h3>
                    <p className="text-xs text-slate-500 font-medium">Censo y registro de simpatizantes y votantes en territorio</p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => setShowAddVoter(!showAddVoter)}
                  className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-xs font-bold"
                >
                  <Plus className="w-4 h-4" /> {showAddVoter ? 'Cerrar Formulario' : 'Nuevo Votante'}
                </Button>
              </div>

              {showAddVoter && (
                <div className="mb-8 p-6 bg-white/5 rounded-2xl border border-white/10">
                  <AddVoterForm onSuccess={() => setShowAddVoter(false)} />
                </div>
              )}

              <VoterList />
            </Card>
          </motion.div>
        )}

        {/* 2. Testigos en Campo */}
        {activeTab === 'witnesses' && (
          <motion.div
            key="witnesses"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <Card className="rounded-[32px] bg-[#0d0e17]/95 border border-white/5 p-6 sm:p-8 shadow-2xl space-y-6">
              {/* Card Header */}
              <div className="flex items-center justify-between pb-6 border-b border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                    <BookmarkCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">Testigos en Campo</h3>
                    <p className="text-xs sm:text-sm text-slate-400 font-normal mt-0.5">
                      Monitoreo y cobertura de testigos acreditados en puestos de votación
                    </p>
                  </div>
                </div>
              </div>

              {/* Permission Denied State */}
              {!hasWitnessesPermission ? (
                <div className="min-h-[340px] flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-[28px] bg-white/[0.015] border border-dashed border-rose-500/20 space-y-3">
                  <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
                  <h4 className="text-base sm:text-lg font-bold text-rose-300">Acceso restringido</h4>
                  <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                    No tienes permisos para acceder a los testigos de este territorio.
                  </p>
                </div>
              ) : loading ? (
                /* Loading State */
                <div className="min-h-[340px] flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-[28px] bg-white/[0.015] border border-dashed border-white/5 space-y-3">
                  <Loader2 className="w-10 h-10 text-emerald-400 animate-spin mx-auto" />
                  <p className="text-sm text-slate-400 font-medium">Cargando testigos en campo...</p>
                </div>
              ) : error ? (
                /* Error State */
                <div className="min-h-[340px] flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-[28px] bg-white/[0.015] border border-dashed border-rose-500/20 space-y-4">
                  <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
                  <div className="space-y-1">
                    <h4 className="text-base sm:text-lg font-bold text-white">No fue posible cargar los testigos en campo.</h4>
                    <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                      Verifica tu conexión e inténtalo nuevamente.
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => refresh()} 
                    className="gap-2 border-white/10 hover:bg-white/5 text-slate-300"
                  >
                    <RefreshCw className="w-4 h-4" /> Reintentar
                  </Button>
                </div>
              ) : witnesses && witnesses.length > 0 ? (
                /* Real Witnesses List Display */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {witnesses.map(w => (
                    <div key={w.id} className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3 hover:border-emerald-500/30 transition-all">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-base font-bold text-white">{w.nombre}</h4>
                          <p className="text-xs text-slate-400">C.C. {w.cedula}</p>
                        </div>
                        <Badge variant={w.estado_acreditacion === 'Acreditado' ? 'success' : 'neutral'}>
                          {w.estado_acreditacion}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-xs text-slate-400">
                        <p className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-emerald-400" /> 
                          {w.puesto_votacion}
                        </p>
                        <p>Mesa: {w.mesa || 'Sin asignar'}</p>
                        {w.telefono && <p>Tel: {w.telefono}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Controlled Empty State - Matches Reference Screenshot */
                <div className="min-h-[340px] flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-[28px] bg-white/[0.015] border border-dashed border-white/5 space-y-3">
                  <BookmarkCheck className="w-14 h-14 text-slate-600 stroke-[1.5] mx-auto" />
                  <h4 className="text-base sm:text-lg font-bold text-slate-300">
                    No hay testigos en campo registrados todavía
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                    Aún no se han registrado testigos electorales para este territorio.
                  </p>
                </div>
              )}
            </Card>
          </motion.div>
        )}

        {/* 3. Módulo de Encuestas */}
        {activeTab === 'surveys' && (
          <motion.div
            key="surveys"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <Card className="rounded-[32px] bg-[#0d0e17]/95 border border-white/5 p-6 sm:p-8 shadow-2xl space-y-6">
              {/* Card Header */}
              <div className="flex items-center justify-between pb-6 border-b border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                    <PieChart className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">Módulo de Encuestas</h3>
                    <p className="text-xs sm:text-sm text-slate-400 font-normal mt-0.5">
                      Aplicación y levantamiento de sondeos de opinión en territorio
                    </p>
                  </div>
                </div>
              </div>

              {/* Permission Denied State */}
              {!hasSurveysPermission ? (
                <div className="min-h-[340px] flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-[28px] bg-white/[0.015] border border-dashed border-rose-500/20 space-y-3">
                  <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
                  <h4 className="text-base sm:text-lg font-bold text-rose-300">Acceso restringido</h4>
                  <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                    No tienes permisos para acceder a las encuestas de este territorio.
                  </p>
                </div>
              ) : loading ? (
                /* Loading State */
                <div className="min-h-[340px] flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-[28px] bg-white/[0.015] border border-dashed border-white/5 space-y-3">
                  <Loader2 className="w-10 h-10 text-emerald-400 animate-spin mx-auto" />
                  <p className="text-sm text-slate-400 font-medium">Cargando encuestas territoriales...</p>
                </div>
              ) : error ? (
                /* Error State */
                <div className="min-h-[340px] flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-[28px] bg-white/[0.015] border border-dashed border-rose-500/20 space-y-4">
                  <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
                  <div className="space-y-1">
                    <h4 className="text-base sm:text-lg font-bold text-white">No fue posible cargar las encuestas.</h4>
                    <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                      Verifica tu conexión e inténtalo nuevamente.
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => refresh()} 
                    className="gap-2 border-white/10 hover:bg-white/5 text-slate-300"
                  >
                    <RefreshCw className="w-4 h-4" /> Reintentar
                  </Button>
                </div>
              ) : surveys && surveys.length > 0 ? (
                /* Real Surveys Grid Display */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {surveys.map(s => (
                    <div key={s.id} className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2 hover:border-emerald-500/30 transition-all">
                      <div className="flex justify-between items-start">
                        <h4 className="text-base font-bold text-white">{s.titulo}</h4>
                        <Badge variant={s.estado === 'Activa' || s.estado === 'ACTIVA' ? 'success' : 'neutral'}>
                          {s.estado}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400">{s.descripcion}</p>
                      <div className="pt-2 flex justify-between text-xs text-slate-500">
                        <span>Muestra: {s.muestra_objetivo}</span>
                        <span>Respuestas: {s.respuestas_recolectadas}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Controlled Empty State - Matches Reference Screenshot */
                <div className="min-h-[340px] flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-[28px] bg-white/[0.015] border border-dashed border-white/5 space-y-3">
                  <PieChart className="w-14 h-14 text-slate-600 stroke-[1.5] mx-auto" />
                  <h4 className="text-base sm:text-lg font-bold text-slate-300">
                    Aún no existen encuestas para mostrar
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                    No hay formularios o sondeos territoriales activos actualmente.
                  </p>
                </div>
              )}
            </Card>
          </motion.div>
        )}

        {/* 4. Jurados en Mesa */}
        {activeTab === 'jurors' && (
          <motion.div
            key="jurors"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <Card className="rounded-[32px] bg-[#0d0e17]/95 border border-white/5 p-6 sm:p-8 shadow-2xl space-y-6">
              <div className="flex items-center justify-between pb-6 border-b border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                    <CheckSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">Jurados en Mesa</h3>
                    <p className="text-xs sm:text-sm text-slate-400 font-normal mt-0.5">
                      Identificación y seguimiento de jurados de votación asignados
                    </p>
                  </div>
                </div>
              </div>

              {!hasJurorsPermission ? (
                <div className="min-h-[340px] flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-[28px] bg-white/[0.015] border border-dashed border-rose-500/20 space-y-3">
                  <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
                  <h4 className="text-base sm:text-lg font-bold text-rose-300">Acceso restringido</h4>
                  <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                    No tienes permisos para acceder a los jurados de este territorio.
                  </p>
                </div>
              ) : loading ? (
                <div className="min-h-[340px] flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-[28px] bg-white/[0.015] border border-dashed border-white/5 space-y-3">
                  <Loader2 className="w-10 h-10 text-emerald-400 animate-spin mx-auto" />
                  <p className="text-sm text-slate-400 font-medium">Cargando jurados en mesa...</p>
                </div>
              ) : error ? (
                <div className="min-h-[340px] flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-[28px] bg-white/[0.015] border border-dashed border-rose-500/20 space-y-4">
                  <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
                  <div className="space-y-1">
                    <h4 className="text-base sm:text-lg font-bold text-white">No fue posible cargar la información de jurados.</h4>
                    <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                      Verifica tu conexión e inténtalo nuevamente.
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => refresh()} 
                    className="gap-2 border-white/10 hover:bg-white/5 text-slate-300"
                  >
                    <RefreshCw className="w-4 h-4" /> Reintentar
                  </Button>
                </div>
              ) : jurors && jurors.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {jurors.map(j => (
                    <div key={j.id} className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3 hover:border-emerald-500/30 transition-all">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-base font-bold text-white">{j.nombre}</h4>
                          <p className="text-xs text-slate-400">C.C. {j.cedula}</p>
                        </div>
                        <Badge variant="neutral">{j.tipo_jurado}</Badge>
                      </div>
                      <div className="space-y-1 text-xs text-slate-400">
                        <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-emerald-400" /> {j.puesto_votacion}</p>
                        <p>Mesa: {j.mesa}</p>
                        <p>Estado: {j.estado_asistencia}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="min-h-[340px] flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-[28px] bg-white/[0.015] border border-dashed border-white/5 space-y-3">
                  <CheckSquare className="w-14 h-14 text-slate-600 stroke-[1.5] mx-auto" />
                  <h4 className="text-base sm:text-lg font-bold text-slate-300">No hay información de jurados disponible todavía</h4>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                    Aún no se han cargado las asignaciones de jurados de votación para este territorio.
                  </p>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
