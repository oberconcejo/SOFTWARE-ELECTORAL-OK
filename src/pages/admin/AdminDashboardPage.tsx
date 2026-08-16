import React from 'react';
import { 
  Users, 
  Globe, 
  CreditCard, 
  Activity, 
  AlertTriangle, 
  CheckCircle2,
  TrendingUp,
  Clock,
  Shield,
  Layers
} from 'lucide-react';
import { Card } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Badge';

export default function AdminDashboardPage() {
  const stats = [
    { name: 'Clientes Totales', value: '42', change: '+4 este mes', icon: Globe, color: 'text-indigo-500' },
    { name: 'Usuarios Activos', value: '1,284', change: '+12% vs anterior', icon: Users, color: 'text-emerald-500' },
    { name: 'Licencias Vigentes', value: '38', change: '95% de activación', icon: CreditCard, color: 'text-amber-500' },
    { name: 'Salud del Sistema', value: '99.9%', change: 'Sin incidentes', icon: Activity, color: 'text-cyan-500' },
  ];

  const recentLogs = [
    { id: 1, action: 'Nuevo Cliente', details: 'Campaña "Unidos por el Cambio"', user: 'System', time: 'hace 5 min' },
    { id: 2, action: 'Actualización DB', details: 'Migración de esquema v2.4', user: 'AdminGlobal', time: 'hace 15 min' },
    { id: 3, action: 'Alerta de Seguridad', details: 'Intento de acceso fallido (IP: 190.1.X.X)', user: 'WAF', time: 'hace 1 hora' },
    { id: 4, action: 'Nueva Licencia', details: 'Plan Pro - Cliente "Alcaldía de Bogotá"', user: 'SalesBot', time: 'hace 2 horas' },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Dashboard Global</h1>
          <p className="text-slate-400">Control maestro de la infraestructura INFGENERAL-SOFTWARE.</p>
        </div>
        <div className="flex gap-3">
          <div className="px-4 py-2 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl flex items-center gap-3">
            <Shield className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Nivel de Acceso: Master</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.name} className="bg-[#111114] border-white/5 p-6 hover:border-white/10 transition-all">
            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-2xl bg-white/5 ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <Badge variant="neutral" className="text-[10px] bg-white/5 text-slate-400 border-none">{stat.change}</Badge>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-bold text-white">{stat.value}</h3>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">{stat.name}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <Card className="lg:col-span-2 bg-[#111114] border-white/5 overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h3 className="font-bold text-white flex items-center gap-3">
              <Activity className="w-5 h-5 text-indigo-500" /> Auditoría de Actividad Global
            </h3>
            <button className="text-xs font-bold text-indigo-400 hover:text-white transition-colors uppercase tracking-widest">Ver todo</button>
          </div>
          <div className="divide-y divide-white/5">
            {recentLogs.map((log) => (
              <div key={log.id} className="p-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600/10 group-hover:text-indigo-400 transition-all">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{log.action}</p>
                    <p className="text-xs text-slate-500">{log.details}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{log.user}</p>
                  <p className="text-[10px] text-slate-600">{log.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* System Health */}
        <div className="space-y-6">
          <Card className="bg-[#111114] border-white/5 p-6">
            <h3 className="font-bold text-white mb-6 flex items-center gap-3">
              <Layers className="w-5 h-5 text-indigo-500" /> Estado de Servicios
            </h3>
            <div className="space-y-6">
              {[
                { name: 'Base de Datos (Supabase)', status: 'Online', color: 'bg-emerald-500' },
                { name: 'API Gateway', status: 'Online', color: 'bg-emerald-500' },
                { name: 'Motor de Inteligencia Artificial', status: 'Carga Alta', color: 'bg-amber-500' },
                { name: 'Servicio de Correos', status: 'Online', color: 'bg-emerald-500' },
              ].map((service) => (
                <div key={service.name} className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">{service.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{service.status}</span>
                    <div className={`w-2 h-2 rounded-full ${service.color}`} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="bg-indigo-600 p-6 text-white overflow-hidden relative group cursor-pointer">
            <div className="relative z-10">
              <h3 className="font-bold text-lg mb-2">Soporte Prioritario</h3>
              <p className="text-indigo-100 text-sm mb-4">Accede a la consola de soporte para tickets técnicos críticos.</p>
              <button className="px-4 py-2 bg-white text-indigo-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-lg">Abrir Consola</button>
            </div>
            <TrendingUp className="absolute -bottom-6 -right-6 w-32 h-32 text-white/10 group-hover:scale-110 transition-transform duration-500" />
          </Card>
        </div>
      </div>
    </div>
  );
}
