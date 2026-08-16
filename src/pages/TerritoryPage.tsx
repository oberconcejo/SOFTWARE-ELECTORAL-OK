import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  BookmarkCheck, 
  PieChart, 
  CheckSquare,
  ShieldCheck,
  Plus,
  Search,
  UserCheck,
  AlertCircle,
  MapPin,
  FileSpreadsheet
} from 'lucide-react';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { cn } from '@/src/lib/utils';
import { VoterList } from '@/src/modules/crm/components/VoterList';
import { AddVoterForm } from '@/src/modules/crm/components/AddVoterForm';
import { useAdministrativeData } from '@/src/hooks/useAdministrativeData';

type TerritoryTab = 'voters' | 'witnesses' | 'surveys' | 'jurors';

export default function TerritoryPage() {
  const [searchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as TerritoryTab) || 'voters';
  const [showAddVoter, setShowAddVoter] = useState(false);
  const { witnesses, jurors, surveys, loading } = useAdministrativeData();

  return (
    <div className="h-full flex flex-col space-y-6 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1.5 tracking-tight">Gestión Territorial</h1>
          <div className="flex items-center gap-3">
            <Badge variant="success" className="gap-1.5 py-1 px-3 bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" /> Nodo: Operación en Territorio
            </Badge>
            <span className="text-slate-500 text-sm font-medium">Control y despliegue operativo en campo</span>
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
            <Card className="rounded-[32px] bg-[#111114] border-white/5 p-8 shadow-xl">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    <BookmarkCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Testigos en Campo</h3>
                    <p className="text-xs text-slate-500 font-medium">Monitoreo y cobertura de testigos acreditados en puestos de votación</p>
                  </div>
                </div>
              </div>

              {witnesses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {witnesses.map(w => (
                    <div key={w.id} className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-3">
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
                        <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-emerald-400" /> {w.puesto_votacion}</p>
                        <p>Mesa: {w.mesa || 'Sin asignar'}</p>
                        <p>Tel: {w.telefono}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center bg-white/[0.01] rounded-[28px] border border-dashed border-white/5 space-y-3">
                  <BookmarkCheck className="w-12 h-12 text-slate-700 mx-auto" />
                  <h4 className="text-lg font-bold text-slate-400">No hay testigos en campo registrados todavía</h4>
                  <p className="text-sm text-slate-500 max-w-md mx-auto">
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
            <Card className="rounded-[32px] bg-[#111114] border-white/5 p-8 shadow-xl">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    <PieChart className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Módulo de Encuestas</h3>
                    <p className="text-xs text-slate-500 font-medium">Aplicación y levantamiento de sondeos de opinión en territorio</p>
                  </div>
                </div>
              </div>

              {surveys.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {surveys.map(s => (
                    <div key={s.id} className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                      <div className="flex justify-between items-start">
                        <h4 className="text-base font-bold text-white">{s.titulo}</h4>
                        <Badge variant={s.estado === 'Activa' ? 'success' : 'neutral'}>{s.estado}</Badge>
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
                <div className="p-12 text-center bg-white/[0.01] rounded-[28px] border border-dashed border-white/5 space-y-3">
                  <PieChart className="w-12 h-12 text-slate-700 mx-auto" />
                  <h4 className="text-lg font-bold text-slate-400">Aún no existen encuestas para mostrar</h4>
                  <p className="text-sm text-slate-500 max-w-md mx-auto">
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
            <Card className="rounded-[32px] bg-[#111114] border-white/5 p-8 shadow-xl">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    <CheckSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Jurados en Mesa</h3>
                    <p className="text-xs text-slate-500 font-medium">Identificación y seguimiento de jurados de votación asignados</p>
                  </div>
                </div>
              </div>

              {jurors.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {jurors.map(j => (
                    <div key={j.id} className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-3">
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
                <div className="p-12 text-center bg-white/[0.01] rounded-[28px] border border-dashed border-white/5 space-y-3">
                  <CheckSquare className="w-12 h-12 text-slate-700 mx-auto" />
                  <h4 className="text-lg font-bold text-slate-400">No hay información de jurados disponible todavía</h4>
                  <p className="text-sm text-slate-500 max-w-md mx-auto">
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
