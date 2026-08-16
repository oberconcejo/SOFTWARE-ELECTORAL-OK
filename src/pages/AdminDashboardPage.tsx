import { useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  AlertCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { Badge } from '@/src/components/ui/Badge';
import { Button } from '@/src/components/ui/Button';
import { cn } from '@/src/lib/utils';
import { useClients } from '@/src/hooks/useClients';

export default function AdminDashboardPage() {
  const { clients, loading } = useClients();

  const stats = useMemo(() => {
    const activeClients = clients.filter(c => c.status === 'ACTIVE').length;
    const totalUsers = clients.reduce((acc, c) => acc + (c.max_users || 0), 0);
    
    return [
      { label: 'Clientes Totales', value: clients.length.toString(), trend: '+0%', icon: Users, color: 'text-indigo-400' },
      { label: 'Licencias Activas', value: activeClients.toString(), trend: '+0%', icon: ShieldCheck, color: 'text-emerald-400' },
      { label: 'Capacidad Usuarios', value: totalUsers.toLocaleString(), trend: '+0%', icon: Users, color: 'text-blue-400' },
      { label: 'Estado Global', value: 'Sincronizado', trend: '100%', icon: TrendingUp, color: 'text-purple-400' },
    ];
  }, [clients]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-sm font-bold uppercase tracking-widest text-white">Cargando Inteligencia Operativa...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Resumen Global</h1>
          <p className="text-slate-400">Estado general de la plataforma SOFTWARE ELECTORAL.</p>
        </div>
        <select className="bg-slate-900 border border-slate-800 text-slate-400 text-sm rounded-xl px-4 py-2 focus:outline-none">
          <option>Vista en tiempo real</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-6 rounded-2xl bg-[#111114] border border-white/5"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" /> {stat.trend}
                </span>
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">vs ayer</span>
              </div>
            </div>
            <p className="text-slate-400 text-sm font-medium mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Revenue Chart Placeholder */}
          <div className="p-8 rounded-3xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-white">Ingresos por Suscripciones</h3>
              <div className="flex gap-2">
                <Badge variant="primary">Pro</Badge>
                <Badge variant="success">Business</Badge>
                <Badge variant="warning">Starter</Badge>
              </div>
            </div>
            <div className="h-72 flex items-center justify-center border-2 border-dashed border-slate-800 rounded-2xl text-slate-600">
              [Gráfica de Ingresos Mensuales]
            </div>
          </div>

          {/* Recent Activity */}
          <div className="p-8 rounded-3xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Actividad Reciente</h3>
              <button className="text-indigo-400 text-sm font-semibold hover:text-indigo-300 transition-colors">Ver todo</button>
            </div>
            <div className="space-y-4">
              {[
                { type: 'license', text: 'Nueva licencia activada para TechCorp Solutions', time: 'Hace 5 min', variant: 'success' },
                { type: 'user', text: 'Nuevo usuario administrador creado: maria@techcorp.com', time: 'Hace 15 min', variant: 'primary' },
                { type: 'renewal', text: 'Renovación de suscripción de DataFlow Analytics', time: 'Hace 30 min', variant: 'warning' },
                { type: 'alert', text: 'Licencia suspendida: CloudSync Inc (Facturación fallida)', time: 'Hace 1 hora', variant: 'error' },
              ].map((activity, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      'w-2 h-2 rounded-full',
                      activity.variant === 'success' ? 'bg-emerald-500' : 
                      activity.variant === 'primary' ? 'bg-indigo-500' :
                      activity.variant === 'warning' ? 'bg-amber-500' : 'bg-rose-500'
                    )} />
                    <p className="text-white text-sm">{activity.text}</p>
                  </div>
                  <span className="text-xs text-slate-500 whitespace-nowrap">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Licenses by Status Chart */}
          <div className="p-8 rounded-3xl bg-white/5 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-6">Estado de Licencias</h3>
            <div className="aspect-square relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">248</p>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Total</p>
                </div>
              </div>
              <div className="w-full h-full border-8 border-slate-800 rounded-full flex items-center justify-center overflow-hidden">
                {/* Simulated Donut Chart */}
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500 to-indigo-500 opacity-20" />
              </div>
            </div>
            <div className="mt-8 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-sm text-slate-400">Activas</span>
                </div>
                <span className="text-sm font-bold text-white">231 (93%)</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <span className="text-sm text-slate-400">Vencidas</span>
                </div>
                <span className="text-sm font-bold text-white">9 (4%)</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="text-sm text-slate-400">Suspendidas</span>
                </div>
                <span className="text-sm font-bold text-white">5 (2%)</span>
              </div>
            </div>
          </div>

          {/* Expiring Soon */}
          <div className="p-8 rounded-3xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Próximas a Vencer</h3>
              <Clock className="w-5 h-5 text-slate-500" />
            </div>
            <div className="space-y-4">
              {[
                { client: 'TechCorp Solutions', days: 5, plan: 'Enterprise' },
                { client: 'DataFlow Analytics', days: 8, plan: 'Professional' },
                { client: 'CloudSync Inc', days: 12, plan: 'Enterprise' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between group cursor-pointer">
                  <div>
                    <p className="text-white text-sm font-medium group-hover:text-indigo-400 transition-colors">{item.client}</p>
                    <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">{item.plan}</p>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "text-sm font-bold",
                      item.days <= 5 ? "text-rose-400" : "text-amber-400"
                    )}>{item.days} días</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" className="w-full mt-8">Ver todas</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
