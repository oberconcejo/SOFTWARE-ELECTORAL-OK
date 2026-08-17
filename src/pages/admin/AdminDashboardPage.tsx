import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Users, 
  Globe, 
  CreditCard, 
  Activity, 
  CheckCircle2,
  AlertCircle,
  Clock, 
  Shield, 
  Layers,
  RefreshCw,
  Loader2,
  Server,
  ArrowRight,
  Database
} from 'lucide-react';
import { Card } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Badge';
import { Button } from '@/src/components/ui/Button';
import { useAuth } from '@/src/contexts/AuthContext';
import { supabase } from '@/src/lib/supabase';
import { UserRole } from '@/src/types';

export interface DashboardMetricSummary {
  totalClients: number | null;
  activeClients: number | null;
  totalUsers: number | null;
  activeUsers: number | null;
  totalLicenses: number | null;
  activeLicenses: number | null;
  systemStatus: 'OPERATIONAL' | 'DEGRADED' | 'UNAVAILABLE' | string;
  systemStatusLabel: string;
}

export interface ServiceHealthItem {
  name: string;
  status: string;
  healthy: boolean;
  color: string;
}

export interface RecentAuditLogItem {
  id: string;
  action: string;
  resource: string;
  actor: string;
  clientName: string;
  createdAt: string;
  details?: Record<string, any> | null;
}

export interface DashboardSummaryResponse {
  metrics: DashboardMetricSummary;
  services: ServiceHealthItem[];
  recentLogs: RecentAuditLogItem[];
  lastUpdated: string;
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { sessionToken, user } = useAuth();
  const isSuperadmin = user?.role === UserRole.SUPERADMIN;

  const [data, setData] = useState<DashboardSummaryResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Helper to obtain auth token
  const getAuthToken = async (): Promise<string> => {
    if (sessionToken) return sessionToken;
    if (supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) return session.access_token;
    }
    return '';
  };

  const fetchDashboardSummary = async (showRefreshing = false) => {
    if (!isSuperadmin) {
      setLoading(false);
      return;
    }

    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const token = await getAuthToken();
      if (!token) {
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const response = await fetch('/api/admin/dashboard/summary', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 403) {
        setError('No tienes permisos para acceder al Dashboard Global.');
        setData(null);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'No fue posible cargar la información del dashboard.');
      }

      const summaryData: DashboardSummaryResponse = await response.json();
      setData(summaryData);
    } catch (err: any) {
      console.error('Error fetching dashboard summary:', err);
      setError(err.message || 'No fue posible cargar la información del dashboard.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardSummary();
  }, [isSuperadmin]);

  // Format relative or standard timestamp
  const formatTimeAgo = (isoString: string | null | undefined) => {
    if (!isoString) return 'Reciente';
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return isoString;
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHrs = Math.floor(diffMin / 60);
      const diffDays = Math.floor(diffHrs / 24);

      if (diffMin < 1) return 'Hace un momento';
      if (diffMin < 60) return `Hace ${diffMin} min`;
      if (diffHrs < 24) return `Hace ${diffHrs} ${diffHrs === 1 ? 'hora' : 'horas'}`;
      if (diffDays < 7) return `Hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;

      return new Intl.DateTimeFormat('es-CO', {
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch {
      return isoString;
    }
  };

  if (!isSuperadmin) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center rounded-[32px] bg-[#111114] border border-rose-500/20 space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white">Acceso Denegado</h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            No tienes permisos para acceder al Dashboard Global.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard Global</h1>
            <Badge className="bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold uppercase text-[10px] tracking-wider py-0.5 px-2.5">
              Superadmin
            </Badge>
          </div>
          <p className="text-slate-400 text-sm">Control maestro de la infraestructura INFGENERAL-SOFTWARE.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 bg-indigo-600/10 border border-indigo-500/20 rounded-xl flex items-center gap-2.5">
            <Shield className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Nivel de Acceso: Master</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchDashboardSummary(true)}
            disabled={loading || refreshing}
            className="border-slate-800 bg-[#16161a] hover:bg-slate-800 text-slate-300 gap-2 h-10 px-4 rounded-xl text-xs font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-purple-400' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && !loading && (
        <Card className="bg-[#111114] border-rose-500/20 p-6 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <p className="text-sm font-bold text-white">No fue posible cargar la información del dashboard</p>
              <p className="text-xs text-slate-400">{error}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchDashboardSummary()}
            className="border-slate-800 bg-[#16161a] hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
          >
            Reintentar
          </Button>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Clientes Totales */}
        <Card className="bg-[#111114] border-white/5 p-6 hover:border-white/10 transition-all rounded-2xl">
          <div className="flex items-start justify-between">
            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Globe className="w-6 h-6" />
            </div>
            {loading ? (
              <div className="h-5 w-16 bg-white/5 rounded animate-pulse" />
            ) : data?.metrics.activeClients !== null && data?.metrics.activeClients !== undefined ? (
              <Badge variant="neutral" className="text-[10px] font-bold bg-white/5 text-slate-400 border-none">
                {data.metrics.activeClients} ACTIVOS
              </Badge>
            ) : (
              <Badge variant="neutral" className="text-[10px] font-bold bg-white/5 text-slate-400 border-none">
                REGISTRADOS
              </Badge>
            )}
          </div>
          <div className="mt-4">
            {loading ? (
              <div className="h-9 w-20 bg-white/5 rounded animate-pulse mb-1" />
            ) : (
              <h3 className="text-3xl font-bold text-white tracking-tight">
                {data?.metrics.totalClients !== null && data?.metrics.totalClients !== undefined
                  ? data.metrics.totalClients
                  : 'No disponible'}
              </h3>
            )}
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Clientes Totales</p>
          </div>
        </Card>

        {/* Card 2: Usuarios Activos */}
        <Card className="bg-[#111114] border-white/5 p-6 hover:border-white/10 transition-all rounded-2xl">
          <div className="flex items-start justify-between">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Users className="w-6 h-6" />
            </div>
            {loading ? (
              <div className="h-5 w-16 bg-white/5 rounded animate-pulse" />
            ) : data?.metrics.totalUsers !== null && data?.metrics.totalUsers !== undefined ? (
              <Badge variant="neutral" className="text-[10px] font-bold bg-white/5 text-slate-400 border-none">
                {data.metrics.totalUsers} TOTAL
              </Badge>
            ) : (
              <Badge variant="neutral" className="text-[10px] font-bold bg-white/5 text-slate-400 border-none">
                VERIFICADOS
              </Badge>
            )}
          </div>
          <div className="mt-4">
            {loading ? (
              <div className="h-9 w-20 bg-white/5 rounded animate-pulse mb-1" />
            ) : (
              <h3 className="text-3xl font-bold text-white tracking-tight">
                {data?.metrics.activeUsers !== null && data?.metrics.activeUsers !== undefined
                  ? data.metrics.activeUsers
                  : data?.metrics.totalUsers !== null && data?.metrics.totalUsers !== undefined
                  ? data.metrics.totalUsers
                  : 'No disponible'}
              </h3>
            )}
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Usuarios Activos</p>
          </div>
        </Card>

        {/* Card 3: Licencias Vigentes */}
        <Card className="bg-[#111114] border-white/5 p-6 hover:border-white/10 transition-all rounded-2xl">
          <div className="flex items-start justify-between">
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <CreditCard className="w-6 h-6" />
            </div>
            {loading ? (
              <div className="h-5 w-16 bg-white/5 rounded animate-pulse" />
            ) : data?.metrics.totalLicenses !== null && data?.metrics.totalLicenses !== undefined ? (
              <Badge variant="neutral" className="text-[10px] font-bold bg-white/5 text-slate-400 border-none">
                {data.metrics.totalLicenses} TOTAL
              </Badge>
            ) : (
              <Badge variant="neutral" className="text-[10px] font-bold bg-white/5 text-slate-400 border-none">
                VIGENTES
              </Badge>
            )}
          </div>
          <div className="mt-4">
            {loading ? (
              <div className="h-9 w-20 bg-white/5 rounded animate-pulse mb-1" />
            ) : (
              <h3 className="text-3xl font-bold text-white tracking-tight">
                {data?.metrics.activeLicenses !== null && data?.metrics.activeLicenses !== undefined
                  ? data.metrics.activeLicenses
                  : data?.metrics.totalLicenses !== null && data?.metrics.totalLicenses !== undefined
                  ? data.metrics.totalLicenses
                  : '0'}
              </h3>
            )}
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Licencias Vigentes</p>
          </div>
        </Card>

        {/* Card 4: Salud del Sistema */}
        <Card className="bg-[#111114] border-white/5 p-6 hover:border-white/10 transition-all rounded-2xl">
          <div className="flex items-start justify-between">
            <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Activity className="w-6 h-6" />
            </div>
            {loading ? (
              <div className="h-5 w-16 bg-white/5 rounded animate-pulse" />
            ) : (
              <Badge variant="neutral" className="text-[10px] font-bold bg-white/5 text-slate-400 border-none">
                MONITOREO ACTIVO
              </Badge>
            )}
          </div>
          <div className="mt-4">
            {loading ? (
              <div className="h-9 w-24 bg-white/5 rounded animate-pulse mb-1" />
            ) : (
              <h3 className="text-2xl font-bold text-white tracking-tight">
                {data?.metrics.systemStatusLabel || 'Operacional'}
              </h3>
            )}
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Salud del Sistema</p>
          </div>
        </Card>
      </div>

      {/* Main Bottom Section: Recent Activity & Services Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Audit Activity */}
        <Card className="lg:col-span-2 bg-[#111114] border-white/5 overflow-hidden rounded-2xl">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h3 className="font-bold text-white flex items-center gap-3">
              <Activity className="w-5 h-5 text-indigo-400" /> Auditoría de Actividad Global
            </h3>
            <button 
              onClick={() => navigate('/admin/audit')}
              className="text-xs font-bold text-indigo-400 hover:text-white transition-colors uppercase tracking-widest cursor-pointer flex items-center gap-1"
            >
              Ver todo <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-white/5">
            {loading ? (
              <div className="p-8 text-center space-y-3">
                <Loader2 className="w-6 h-6 text-indigo-500 animate-spin mx-auto" />
                <p className="text-xs text-slate-400">Consultando registros recientes de auditoría...</p>
              </div>
            ) : !data?.recentLogs || data.recentLogs.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mx-auto text-slate-400">
                  <Clock className="w-5 h-5" />
                </div>
                <p className="text-sm font-semibold text-slate-300">No hay actividad reciente registrada.</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Las acciones y operaciones realizadas en la plataforma aparecerán aquí de forma automática.
                </p>
              </div>
            ) : (
              data.recentLogs.map((log) => (
                <div key={log.id} className="p-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600/10 group-hover:text-indigo-400 transition-all shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{log.action}</p>
                      <p className="text-xs text-slate-400">{log.resource} • {log.clientName}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{log.actor}</p>
                    <p className="text-[10px] text-slate-500">{formatTimeAgo(log.createdAt)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* System & Services Status */}
        <div className="space-y-6">
          <Card className="bg-[#111114] border-white/5 p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-white flex items-center gap-3">
                <Layers className="w-5 h-5 text-indigo-400" /> Estado de Servicios
              </h3>
              <button
                onClick={() => navigate('/admin/system')}
                className="text-[11px] font-bold text-indigo-400 hover:text-white uppercase tracking-wider transition-colors"
              >
                Diagnóstico
              </button>
            </div>

            <div className="space-y-5">
              {loading ? (
                <div className="py-6 text-center space-y-2">
                  <Loader2 className="w-5 h-5 text-indigo-500 animate-spin mx-auto" />
                  <p className="text-xs text-slate-400">Verificando estado de componentes...</p>
                </div>
              ) : data?.services && data.services.length > 0 ? (
                data.services.map((service) => (
                  <div key={service.name} className="flex items-center justify-between py-1 border-b border-white/5 last:border-0">
                    <span className="text-xs font-semibold text-slate-300">{service.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{service.status}</span>
                      <div className={`w-2 h-2 rounded-full ${service.color}`} />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-4">Estado no disponible en este momento.</p>
              )}
            </div>
          </Card>

          {/* Quick Admin Supervision Card */}
          <Card 
            onClick={() => navigate('/admin/system')}
            className="bg-indigo-600/90 hover:bg-indigo-600 p-6 text-white overflow-hidden relative group cursor-pointer rounded-2xl transition-all shadow-xl"
          >
            <div className="relative z-10 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                <Server className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-bold text-base tracking-tight">Supervisión de Sistema y DB</h3>
              <p className="text-indigo-100 text-xs leading-relaxed">
                Consulta la salud operacional, latencia de base de datos y matriz de servicios en modo de solo lectura.
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-indigo-700 rounded-xl font-bold text-[11px] uppercase tracking-wider shadow">
                  Abrir Consola <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
            <Database className="absolute -bottom-6 -right-6 w-32 h-32 text-white/10 group-hover:scale-110 transition-transform duration-500 pointer-events-none" />
          </Card>
        </div>
      </div>
    </div>
  );
}
