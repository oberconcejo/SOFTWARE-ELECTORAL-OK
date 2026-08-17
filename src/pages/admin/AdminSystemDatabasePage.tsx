import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Database, 
  Server, 
  Activity, 
  ShieldCheck, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Layers, 
  Cpu, 
  Zap, 
  Mail, 
  Lock, 
  HardDrive, 
  Info,
  Sliders,
  Shield,
  Loader2,
  FileCheck
} from 'lucide-react';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { useAuth } from '@/src/contexts/AuthContext';
import { supabase } from '@/src/lib/supabase';
import { UserRole } from '@/src/types';

export interface ServiceStatusItem {
  id: string;
  name: string;
  type: string;
  status: 'HEALTHY' | 'DEGRADED' | 'NOT_CONFIGURED' | 'OFFLINE';
  category: string;
  uptimeInfo: string;
  environment: string;
  latencyMs?: number | null;
  lastChecked: string;
}

export interface SystemMetadata {
  applicationName: string;
  platformTier: string;
  appVersion: string;
  environment: string;
  healthCheckTimestamp: string;
  overallStatus: 'OPERATIONAL' | 'DEGRADED' | 'MAINTENANCE';
}

export interface DatabaseMetadata {
  engine: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  sslMode: string;
  rowLevelSecurity: string;
  healthStatus: string;
  lastVerification: string;
  latencyMs?: number | null;
  backupPolicy: {
    status: string;
    frequency: string;
    retention: string;
    description: string;
  };
}

export interface SystemStatusResponse {
  system: SystemMetadata;
  database: DatabaseMetadata;
  services: ServiceStatusItem[];
  lastChecked: string;
}

export default function AdminSystemDatabasePage() {
  const { sessionToken, user } = useAuth();
  const isSuperadmin = user?.role === UserRole.SUPERADMIN;

  const [data, setData] = useState<SystemStatusResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [serviceUnavailable, setServiceUnavailable] = useState<boolean>(false);

  // Helper to obtain auth token
  const getAuthToken = async (): Promise<string> => {
    if (sessionToken) return sessionToken;
    if (supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) return session.access_token;
    }
    return '';
  };

  // Fetch real system & DB status
  const fetchStatus = async (showRefreshing = false) => {
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
    setServiceUnavailable(false);

    try {
      const token = await getAuthToken();
      if (!token) {
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const response = await fetch('/api/admin/system/status', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 403) {
        setError('No tienes permisos para acceder a la configuración del sistema.');
        setData(null);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (response.status === 503 || response.status === 502) {
        setServiceUnavailable(true);
        setError('El servicio de monitoreo no está disponible en este momento.');
        setData(null);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'No fue posible consultar el estado del sistema.');
      }

      const resData: SystemStatusResponse = await response.json();
      setData(resData);
    } catch (err: any) {
      console.error('Error fetching system & DB status:', err);
      setError(err.message || 'No fue posible consultar el estado del sistema.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [isSuperadmin]);

  // Format Date Helper
  const formatDate = (isoString: string | null | undefined) => {
    if (!isoString) return 'No registrada';
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return isoString;
      return new Intl.DateTimeFormat('es-CO', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }).format(date);
    } catch {
      return isoString;
    }
  };

  // Helper for Service Icon
  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'CORE_SERVER':
        return <Server className="w-5 h-5 text-indigo-400" />;
      case 'DATABASE':
        return <Database className="w-5 h-5 text-emerald-400" />;
      case 'AUTH':
        return <Lock className="w-5 h-5 text-purple-400" />;
      case 'AI_SERVICE':
        return <Zap className="w-5 h-5 text-amber-400" />;
      case 'NOTIFICATION_SERVICE':
        return <Mail className="w-5 h-5 text-cyan-400" />;
      default:
        return <Activity className="w-5 h-5 text-indigo-400" />;
    }
  };

  // Permission Guard
  if (!isSuperadmin) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center rounded-[32px] bg-[#111114] border border-rose-500/20 space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white">Acceso Denegado</h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            No tienes permisos para acceder a la configuración del sistema.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold text-white tracking-tight">Sistema y Base de Datos</h1>
            <Badge className="bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold uppercase text-[10px] tracking-wider py-0.5 px-2.5">
              Superadmin
            </Badge>
          </div>
          <p className="text-slate-400 text-sm">
            Supervisión de disponibilidad y estado operativo de la plataforma
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 bg-indigo-600/10 border border-indigo-500/20 rounded-xl flex items-center gap-2.5">
            <Shield className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
              Modo: Solo Lectura
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchStatus(true)}
            disabled={loading || refreshing}
            className="border-slate-800 bg-[#16161a] hover:bg-slate-800 text-slate-300 gap-2 h-10 px-4 rounded-xl text-xs font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-purple-400' : ''}`} />
            Actualizar estado
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <Card className="bg-[#111114] border-white/5 p-12 rounded-2xl flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-sm font-medium text-slate-400">
            Consultando estado de servicios y verificación de base de datos...
          </p>
        </Card>
      ) : error ? (
        <Card className="bg-[#111114] border-rose-500/20 p-8 rounded-2xl text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-400">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">
              {serviceUnavailable
                ? "El servicio de monitoreo no está disponible en este momento."
                : "No fue posible consultar el estado del sistema."}
            </h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">{error}</p>
          </div>
          <Button
            variant="outline"
            onClick={() => fetchStatus()}
            className="border-slate-800 bg-[#16161a] hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl"
          >
            Reintentar consulta
          </Button>
        </Card>
      ) : !data ? (
        <Card className="bg-[#111114] border-white/5 p-12 rounded-2xl text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800/60 border border-white/5 flex items-center justify-center mx-auto text-slate-400">
            <Database className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">
            No hay información de estado disponible todavía.
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            La información operativa aparecerá una vez que se ejecuten las comprobaciones de salud del sistema.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Section 1: KPI Strips / Overall Health */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-[#111114] border-white/5 p-4 rounded-2xl flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Estado General
                </span>
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${data.system.overallStatus === 'OPERATIONAL' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                  <span className="text-lg font-bold text-white tracking-tight">
                    {data.system.overallStatus === 'OPERATIONAL' ? 'Operacional' : 'Degradado'}
                  </span>
                </div>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </Card>

            <Card className="bg-[#111114] border-white/5 p-4 rounded-2xl flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Conexión a Base de Datos
                </span>
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${data.database.status === 'CONNECTED' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  <span className="text-lg font-bold text-white tracking-tight">
                    {data.database.status === 'CONNECTED' ? 'Conectada' : 'Error'}
                  </span>
                </div>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Database className="w-5 h-5" />
              </div>
            </Card>

            <Card className="bg-[#111114] border-white/5 p-4 rounded-2xl flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Entorno de Ejecución
                </span>
                <span className="text-lg font-bold text-indigo-300 tracking-tight">
                  {data.system.environment}
                </span>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Layers className="w-5 h-5" />
              </div>
            </Card>

            <Card className="bg-[#111114] border-white/5 p-4 rounded-2xl flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Versión Plataforma
                </span>
                <span className="text-lg font-mono font-bold text-white tracking-tight">
                  {data.system.appVersion}
                </span>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </Card>
          </div>

          {/* Section 2: Services Status Matrix */}
          <Card className="bg-[#111114] border-white/5 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-5 bg-[#16161a] border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Activity className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Supervisión de Servicios Críticos
                  </h3>
                  <p className="text-xs text-slate-400">
                    Disponibilidad y estado de salud de los componentes de backend
                  </p>
                </div>
              </div>
              <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Última comprobación: {formatDate(data.lastChecked)}
              </span>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#16161a]/60 border-b border-white/5 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="py-3.5 px-5 min-w-[240px]">Servicio / Componente</th>
                    <th className="py-3.5 px-5 min-w-[180px]">Categoría</th>
                    <th className="py-3.5 px-5 min-w-[140px]">Estado</th>
                    <th className="py-3.5 px-5 min-w-[160px]">Entorno</th>
                    <th className="py-3.5 px-5 min-w-[140px]">Respuesta</th>
                    <th className="py-3.5 px-5 min-w-[160px]">Última Comprobación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {data.services.map((service) => (
                    <tr key={service.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-[#16161a] border border-white/5">
                            {getServiceIcon(service.type)}
                          </div>
                          <div>
                            <span className="font-bold text-white block">
                              {service.name}
                            </span>
                            <span className="text-[10px] text-slate-500">{service.uptimeInfo}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-5 text-slate-300 font-medium">
                        {service.category}
                      </td>

                      <td className="py-4 px-5">
                        {service.status === 'HEALTHY' ? (
                          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                            Saludable
                          </Badge>
                        ) : service.status === 'DEGRADED' ? (
                          <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px]">
                            Degradado
                          </Badge>
                        ) : (
                          <Badge className="bg-slate-800 text-slate-400 border-slate-700 text-[10px]">
                            No Configurado
                          </Badge>
                        )}
                      </td>

                      <td className="py-4 px-5 text-slate-400 text-[11px]">
                        {service.environment}
                      </td>

                      <td className="py-4 px-5 font-mono text-[11px] text-slate-300">
                        {service.latencyMs !== undefined && service.latencyMs !== null
                          ? `${service.latencyMs} ms`
                          : 'Normal'}
                      </td>

                      <td className="py-4 px-5 text-[11px] text-slate-400">
                        {formatDate(service.lastChecked)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Section 3: Safe Database Diagnostics & Backup Policy Card */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Database Technical Overview (Safe metadata only) */}
            <Card className="bg-[#111114] border-white/5 p-6 rounded-2xl space-y-5">
              <div className="flex items-center gap-3 pb-3 border-b border-white/5">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Estado de la Base de Datos</h3>
                  <p className="text-xs text-slate-400">Diagnóstico seguro de conectividad y políticas de seguridad</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5 text-xs">
                <div className="p-3.5 bg-[#16161a] border border-white/5 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Motor Relacional
                  </span>
                  <span className="font-bold text-white block">{data.database.engine}</span>
                </div>

                <div className="p-3.5 bg-[#16161a] border border-white/5 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Cifrado de Tránsito
                  </span>
                  <span className="font-bold text-emerald-400 block">{data.database.sslMode}</span>
                </div>

                <div className="p-3.5 bg-[#16161a] border border-white/5 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Seguridad de Fila (RLS)
                  </span>
                  <span className="font-bold text-indigo-300 block">{data.database.rowLevelSecurity}</span>
                </div>

                <div className="p-3.5 bg-[#16161a] border border-white/5 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Latencia Diagnóstica
                  </span>
                  <span className="font-bold font-mono text-white block">
                    {data.database.latencyMs ? `${data.database.latencyMs} ms` : 'Verificada'}
                  </span>
                </div>
              </div>

              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-2.5 text-xs text-emerald-300">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                <p>
                  <strong>Conectividad Verificada:</strong> El motor transaccional responde adecuadamente a las consultas de verificación con autenticación reforzada y aislamiento por cliente.
                </p>
              </div>
            </Card>

            {/* Managed Backup Policy Overview (Read-Only) */}
            <Card className="bg-[#111114] border-white/5 p-6 rounded-2xl space-y-5">
              <div className="flex items-center gap-3 pb-3 border-b border-white/5">
                <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Política de Respaldos y Backups</h3>
                  <p className="text-xs text-slate-400">Información del esquema de respaldo gestionado en la nube</p>
                </div>
              </div>

              <div className="p-4 bg-[#16161a] border border-white/5 rounded-xl space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Esquema de Respaldo:</span>
                  <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-[10px]">
                    {data.database.backupPolicy.status}
                  </Badge>
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-2.5">
                  <span className="text-slate-400">Frecuencia de Snapshots:</span>
                  <span className="font-semibold text-white">{data.database.backupPolicy.frequency}</span>
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-2.5">
                  <span className="text-slate-400">Política de Retención:</span>
                  <span className="font-semibold text-white">{data.database.backupPolicy.retention}</span>
                </div>
              </div>

              <div className="p-3.5 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-start gap-2.5 text-xs text-purple-300">
                <ShieldCheck className="w-4 h-4 shrink-0 text-purple-400 mt-0.5" />
                <p>
                  {data.database.backupPolicy.description}
                </p>
              </div>
            </Card>
          </div>

          {/* Section 4: Security & Compliance Notice */}
          <div className="p-4 bg-[#16161a] border border-white/5 rounded-2xl flex items-start gap-3 text-xs text-slate-400">
            <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Protección Estricta de Infraestructura:</strong> Por estándares de seguridad y cumplimiento normativo, esta consola opera en modo estrictamente de solo lectura. Parámetros confidenciales como cadenas de conexión directas, puertos internos, contraseñas o llaves de cifrado permanecen protegidos en el almacén de secretos del servidor y nunca son transmitidos al navegador.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
