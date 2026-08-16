import { motion } from 'motion/react';
import { 
  Users, 
  FileCheck, 
  BarChart3, 
  Calendar, 
  TrendingUp, 
  MapPin, 
  AlertCircle,
  UserPlus
} from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { useAuth } from '@/src/contexts/AuthContext';
import { PermissionGuard } from '@/src/components/auth/PermissionGuard';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../types';

const stats = [
  { label: 'Votantes Registrados', value: '12,456', trend: '+12.5%', icon: Users, color: 'text-blue-500' },
  { label: 'Testigos Electorales', value: '456', trend: '+8.2%', icon: FileCheck, color: 'text-emerald-500' },
  { label: 'E14 Procesados', value: '89%', trend: '+15.3%', icon: BarChart3, color: 'text-purple-500' },
  { label: 'Puestos Cubiertos', value: '42/50', trend: '84%', icon: MapPin, color: 'text-amber-500' },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Hola, {user?.displayName?.split(' ')[0] || 'Usuario'}! 👋</h1>
          <p className="text-slate-400">Aquí tienes el resumen de tu actividad en la Gestión Administrativa.</p>
        </div>
        
        {user?.role === UserRole.ADMIN_CLIENTE && (
          <Button 
            onClick={() => navigate('users')}
            className="gap-2 bg-indigo-600 hover:bg-indigo-500"
          >
            <UserPlus className="w-4 h-4" /> Gestionar Usuarios
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-500/30 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-emerald-400 px-2 py-1 rounded-full bg-emerald-400/10">
                {stat.trend}
              </span>
            </div>
            <p className="text-slate-400 text-sm font-medium mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="p-8 rounded-3xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-white">Actividad de Votantes</h3>
              <select className="bg-slate-900 border border-slate-800 text-slate-400 text-xs rounded-lg px-3 py-1.5 focus:outline-none">
                <option>Últimos 7 días</option>
                <option>Último mes</option>
              </select>
            </div>
            <div className="h-64 flex items-center justify-center text-slate-600 border-2 border-dashed border-slate-800 rounded-2xl">
              [Gráfica de Recharts aquí]
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-white/5 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-6">Tareas Recientes</h3>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">Revisión de E14 - Comuna 4</p>
                    <p className="text-slate-500 text-xs">Asignado a: Maria Lopez • Hace 2 horas</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase">Pendiente</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="p-8 rounded-3xl bg-white/5 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-6">Próximos Eventos</h3>
            <div className="space-y-6">
              {[1, 2].map((i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-indigo-600 flex flex-col items-center justify-center text-white">
                    <span className="text-xs font-bold uppercase">Ago</span>
                    <span className="text-lg font-bold">1{i}</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">Cierre de Inscripciones</p>
                    <p className="text-slate-500 text-xs">8:00 AM - Registraduría</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" className="w-full mt-8">Ver Calendario</Button>
          </div>

          <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white relative overflow-hidden group">
            <div className="relative z-10">
              <AlertCircle className="w-8 h-8 mb-4" />
              <h3 className="text-lg font-bold mb-2">Licencia Profesional</h3>
              <p className="text-indigo-100 text-sm mb-6">Tu licencia vence en 15 días. Renueva ahora para no perder el acceso a los módulos de IA.</p>
              <Button variant="glass" size="sm" className="w-full">Renovar Ahora</Button>
            </div>
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-32 h-32 bg-white/10 blur-2xl rounded-full group-hover:scale-150 transition-transform duration-700" />
          </div>
        </div>
      </div>
    </div>
  );
}
