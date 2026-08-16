import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  MoreVertical, 
  Phone, 
  MapPin, 
  TrendingUp,
  LayoutDashboard,
  UserCheck,
  FileText,
  Shield
} from 'lucide-react';
import { useState } from 'react';
import { Card } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Badge';
import { Button } from '@/src/components/ui/Button';
import { cn } from '@/src/lib/utils';
import { AddVoterForm } from '@/src/modules/crm/components/AddVoterForm';
import { VoterList } from '@/src/modules/crm/components/VoterList';
import { useRBAC } from '@/src/hooks/useRBAC';

type Tab = 'overview' | 'voters' | 'leaders' | 'reports';

export default function CRMPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const { can } = useRBAC();

  const tabs = [
    { id: 'overview', label: 'Dashboard CRM', icon: LayoutDashboard },
    { id: 'voters', label: 'Gestión de Votantes', icon: UserCheck },
    { id: 'leaders', label: 'Directorio de Líderes', icon: Users },
    { id: 'reports', label: 'Informes & Auditoría', icon: FileText },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">CRM Electoral</h1>
          <p className="text-slate-400">Gestión centralizada de simpatizantes, líderes y estructura territorial.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Users className="w-4 h-4" /> Estructura
          </Button>
          {can.create('CRM') && (
            <Button className="gap-2">
              <UserPlus className="w-4 h-4" /> Nuevo Líder
            </Button>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 p-1 bg-white/5 rounded-2xl border border-white/10 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all",
              activeTab === tab.id 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <AddVoterForm />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card title="Estructura por Comuna" subtitle="Distribución territorial de simpatizantes">
                    <div className="h-48 flex items-center justify-center border border-dashed border-white/5 rounded-2xl">
                      <p className="text-slate-600 text-sm italic">Gráfico de Distribución Comunal en Desarrollo</p>
                    </div>
                  </Card>
                  <Card title="Intención de Voto" subtitle="Calificación del compromiso electoral">
                    <div className="h-48 flex items-center justify-center border border-dashed border-white/5 rounded-2xl">
                      <p className="text-slate-600 text-sm italic">Gráfico de Segmentación en Desarrollo</p>
                    </div>
                  </Card>
                </div>
              </div>

              <div className="space-y-6">
                <Card title="Ranking de Líderes" subtitle="Top desempeño semanal">
                  <div className="space-y-4 pt-4">
                    {[
                      { name: 'Santi Restrepo', count: 142, growth: '+12' },
                      { name: 'Ana Patricia Gómez', count: 98, growth: '+5' },
                      { name: 'Carlos Ruiz', count: 86, growth: '+8' },
                      { name: 'Marta Henao', count: 64, growth: '+3' },
                    ].map((leader, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-600/10 text-indigo-400 flex items-center justify-center font-bold text-xs">
                            {i + 1}
                          </div>
                          <span className="text-sm font-medium text-white">{leader.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-white">{leader.count}</p>
                          <p className="text-[10px] text-emerald-400 font-bold">{leader.growth}</p>
                        </div>
                      </div>
                    ))}
                    <Button variant="ghost" className="w-full text-xs text-indigo-400 hover:text-indigo-300">
                      Ver Ranking Completo
                    </Button>
                  </div>
                </Card>

                <Card title="Auditoría de Registros" subtitle="Últimos movimientos validados">
                  <div className="space-y-4 pt-4">
                    {[
                      { action: 'Votante Vinculado', time: 'hace 5 min', user: 'S. Restrepo' },
                      { action: 'Puesto Actualizado', time: 'hace 12 min', user: 'Admin' },
                      { action: 'Nuevo Líder Creado', time: 'hace 45 min', user: 'SuperAdmin' },
                    ].map((item, i) => (
                      <div key={i} className="flex gap-3 text-xs">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5" />
                        <div>
                          <p className="text-white font-medium">{item.action}</p>
                          <p className="text-slate-500">{item.user} • {item.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'voters' && (
          <motion.div
            key="voters"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <VoterList />
          </motion.div>
        )}

        {activeTab === 'leaders' && (
          <motion.div
            key="leaders"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-12 text-center border-2 border-dashed border-white/5 rounded-[3rem]"
          >
            <Users className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-500">Gestión de Equipos en Desarrollo</h3>
            <p className="text-slate-600 mt-2">Integrando perfiles de coordinadores y brigadistas desde PANEL-CENTRAL...</p>
          </motion.div>
        )}

        {activeTab === 'reports' && (
          <motion.div
            key="reports"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-12 text-center border-2 border-dashed border-white/5 rounded-[3rem]"
          >
            <FileText className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-500">Auditoría Electoral Avanzada</h3>
            <p className="text-slate-600 mt-2">Consolidando motores de PDF y CSV de MODIFICACIONES...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
