import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cpu, 
  Key, 
  Sliders, 
  Activity, 
  Shield, 
  Search, 
  Filter, 
  RefreshCw, 
  Eye, 
  X, 
  AlertCircle, 
  Loader2, 
  CheckCircle2, 
  Clock, 
  Building2, 
  Layers, 
  Lock, 
  Server, 
  Sparkles, 
  Info, 
  ChevronRight, 
  BarChart3,
  ExternalLink,
  Zap,
  Globe,
  Database,
  Mail,
  MapPin,
  FileCheck
} from 'lucide-react';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { Input } from '@/src/components/ui/Input';
import { useAuth } from '@/src/contexts/AuthContext';
import { supabase } from '@/src/lib/supabase';
import { UserRole } from '@/src/types';

export interface ApiIntegration {
  id: string;
  name: string;
  provider: string;
  category: string;
  status: 'ACTIVE' | 'NOT_CONFIGURED' | 'PENDING_CONFIG' | 'ERROR';
  environment: string;
  description: string;
  authType: string;
  lastActivity: string | null;
}

export interface ApiCredentialMetadata {
  id: string;
  name: string;
  service: string;
  type: 'SERVER_SECRET' | 'CLIENT_PUBLIC';
  status: 'ACTIVE' | 'INACTIVE';
  prefix: string;
  environment: string;
  scope: string;
  createdAt: string;
  lastUsed: string | null;
  target: string;
}

export interface ClientUsageItem {
  clientId: string;
  clientName: string;
  clientEmail: string;
  totalAssigned: number;
  totalConsumed: number;
  balance: number;
  status: 'ACTIVE' | 'LIMIT_REACHED' | 'SUSPENDED';
  lastQueryAt: string | null;
  updatedAt: string | null;
}

export interface ApiTransactionItem {
  id: string;
  clientId: string;
  clientName: string;
  amount: number;
  type: 'CONSUMO' | 'ASIGNACION' | 'AJUSTE' | 'DEVOLUCION';
  previousBalance: number;
  newBalance: number;
  details: string;
  createdAt: string;
}

export interface ApiManagementOverviewData {
  integrations: ApiIntegration[];
  credentials: ApiCredentialMetadata[];
  usage: {
    clientUsageList: ClientUsageItem[];
    summary: {
      totalAssigned: number;
      totalConsumed: number;
      totalBalance: number;
      activeClientsCount: number;
      totalClientsCount: number;
    };
    recentTransactions: ApiTransactionItem[];
  };
}

export default function AdminApiManagementPage() {
  const { sessionToken, user } = useAuth();
  const isSuperadmin = user?.role === UserRole.SUPERADMIN;

  // Active Tab: 'integrations' | 'credentials' | 'usage'
  const [activeTab, setActiveTab] = useState<'integrations' | 'credentials' | 'usage'>('integrations');

  // Overview Data
  const [data, setData] = useState<ApiManagementOverviewData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [serviceUnavailable, setServiceUnavailable] = useState<boolean>(false);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Selected Items for Safe Read-Only Modals
  const [selectedIntegration, setSelectedIntegration] = useState<ApiIntegration | null>(null);
  const [selectedCredential, setSelectedCredential] = useState<ApiCredentialMetadata | null>(null);
  const [selectedClientUsage, setSelectedClientUsage] = useState<ClientUsageItem | null>(null);

  // Helper to obtain auth token
  const getAuthToken = async (): Promise<string> => {
    if (sessionToken) return sessionToken;
    if (supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) return session.access_token;
    }
    return '';
  };

  // Fetch API Overview Data from server
  const fetchOverview = async (showRefreshing = false) => {
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

      const response = await fetch('/api/admin/api-management/overview', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 403) {
        setError('No tienes permisos para acceder a la administración de API.');
        setData(null);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (response.status === 503 || response.status === 502) {
        setServiceUnavailable(true);
        setError('El servicio de administración API no está disponible en este momento.');
        setData(null);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'No fue posible cargar la información de administración API.');
      }

      const resData = await response.json();
      setData(resData);
    } catch (err: any) {
      console.error('Error fetching API management overview:', err);
      setError(err.message || 'No fue posible cargar la información de administración API.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOverview();
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
        hour12: true
      }).format(date);
    } catch {
      return isoString;
    }
  };

  // Filtered Integrations
  const filteredIntegrations = useMemo(() => {
    if (!data?.integrations) return [];
    return data.integrations.filter(item => {
      const matchesSearch = 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.environment.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = 
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && item.status === 'ACTIVE') ||
        (statusFilter === 'INACTIVE' && (item.status === 'NOT_CONFIGURED' || item.status === 'PENDING_CONFIG'));

      return matchesSearch && matchesStatus;
    });
  }, [data?.integrations, searchTerm, statusFilter]);

  // Filtered Credentials
  const filteredCredentials = useMemo(() => {
    if (!data?.credentials) return [];
    return data.credentials.filter(item => {
      const matchesSearch = 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.environment.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = 
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && item.status === 'ACTIVE') ||
        (statusFilter === 'INACTIVE' && item.status === 'INACTIVE');

      return matchesSearch && matchesStatus;
    });
  }, [data?.credentials, searchTerm, statusFilter]);

  // Filtered Usage List
  const filteredUsageList = useMemo(() => {
    if (!data?.usage?.clientUsageList) return [];
    return data.usage.clientUsageList.filter(item => {
      const matchesSearch = 
        item.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.clientEmail.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = 
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && item.status === 'ACTIVE') ||
        (statusFilter === 'INACTIVE' && (item.status === 'LIMIT_REACHED' || item.status === 'SUSPENDED'));

      return matchesSearch && matchesStatus;
    });
  }, [data?.usage?.clientUsageList, searchTerm, statusFilter]);

  const hasActiveFilters = searchTerm !== '' || statusFilter !== 'ALL';

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
  };

  // Helper for Integration Icon
  const getIntegrationIcon = (id: string) => {
    if (id.includes('gemini')) return <Zap className="w-5 h-5 text-indigo-400" />;
    if (id.includes('supabase')) return <Database className="w-5 h-5 text-emerald-400" />;
    if (id.includes('voting')) return <FileCheck className="w-5 h-5 text-purple-400" />;
    if (id.includes('email')) return <Mail className="w-5 h-5 text-amber-400" />;
    if (id.includes('osm') || id.includes('maps')) return <MapPin className="w-5 h-5 text-cyan-400" />;
    return <Cpu className="w-5 h-5 text-indigo-400" />;
  };

  // Permission Guard
  if (!isSuperadmin) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center rounded-[32px] bg-[#111114] border border-rose-500/20 space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white">Acceso Denegado</h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            No tienes permisos para acceder a la administración de API.
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
            <h1 className="text-3xl font-bold text-white tracking-tight">Administración de API</h1>
            <Badge className="bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold uppercase text-[10px] tracking-wider py-0.5 px-2.5">
              Superadmin
            </Badge>
          </div>
          <p className="text-slate-400 text-sm">
            Supervisión de integraciones, credenciales y consumo de servicios
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 bg-indigo-600/10 border border-indigo-500/20 rounded-xl flex items-center gap-2.5">
            <Shield className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
              Nivel de Acceso: Master
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchOverview(true)}
            disabled={loading || refreshing}
            className="border-slate-800 bg-[#16161a] hover:bg-slate-800 text-slate-300 gap-2 h-10 px-4 rounded-xl text-xs font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-purple-400' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* KPI Overview Strip (Real Values Only) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-[#111114] border-white/5 p-4 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Integraciones del Sistema
            </span>
            <span className="text-2xl font-bold text-white tracking-tight">
              {loading ? '-' : data?.integrations?.length || 0}
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Layers className="w-5 h-5" />
          </div>
        </Card>

        <Card className="bg-[#111114] border-white/5 p-4 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Credenciales Registradas
            </span>
            <span className="text-2xl font-bold text-white tracking-tight">
              {loading ? '-' : data?.credentials?.length || 0}
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Key className="w-5 h-5" />
          </div>
        </Card>

        <Card className="bg-[#111114] border-white/5 p-4 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Consultas Totales Asignadas
            </span>
            <span className="text-2xl font-bold text-emerald-400 tracking-tight">
              {loading ? '-' : data?.usage?.summary?.totalAssigned?.toLocaleString() || 0}
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <BarChart3 className="w-5 h-5" />
          </div>
        </Card>

        <Card className="bg-[#111114] border-white/5 p-4 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Consultas Consumidas
            </span>
            <span className="text-2xl font-bold text-amber-400 tracking-tight">
              {loading ? '-' : data?.usage?.summary?.totalConsumed?.toLocaleString() || 0}
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Activity className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Tabs Navigation & Search Bar */}
      <Card className="bg-[#111114] border-white/5 p-4 rounded-2xl shadow-xl space-y-4">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-white/5 pb-3">
          <button
            onClick={() => setActiveTab('integrations')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'integrations'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers className="w-4 h-4" />
            Integraciones
            {data?.integrations && (
              <span className="px-1.5 py-0.5 rounded-md bg-white/10 text-[10px] font-mono font-normal">
                {data.integrations.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('credentials')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'credentials'
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Key className="w-4 h-4" />
            Credenciales
            {data?.credentials && (
              <span className="px-1.5 py-0.5 rounded-md bg-white/10 text-[10px] font-mono font-normal">
                {data.credentials.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('usage')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'usage'
                ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sliders className="w-4 h-4" />
            Consumo
            {data?.usage?.clientUsageList && (
              <span className="px-1.5 py-0.5 rounded-md bg-white/10 text-[10px] font-mono font-normal">
                {data.usage.clientUsageList.length}
              </span>
            )}
          </button>
        </div>

        {/* Search & Filter Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-1">
          <div className="md:col-span-8 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                activeTab === 'integrations'
                  ? 'Buscar por nombre, proveedor o categoría...'
                  : activeTab === 'credentials'
                  ? 'Buscar por credencial, servicio o entorno...'
                  : 'Buscar campaña por nombre o correo...'
              }
              className="pl-10 h-10 bg-[#16161a] border-white/5 text-xs text-white placeholder:text-slate-500 rounded-xl focus:border-indigo-500/50"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="md:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-10 bg-[#16161a] border border-white/5 text-xs text-slate-300 rounded-xl px-3 focus:border-indigo-500/50 outline-none"
            >
              <option value="ALL">Todos los Estados</option>
              <option value="ACTIVE">Activos / Configurados</option>
              <option value="INACTIVE">Inactivos / Pendientes</option>
            </select>
          </div>

          <div className="md:col-span-1 flex justify-end">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-xs text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 h-10 px-3 rounded-xl font-medium w-full"
              >
                <X className="w-3.5 h-3.5 mr-1" />
                Limpiar
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Main Content Area */}
      {loading ? (
        <Card className="bg-[#111114] border-white/5 p-12 rounded-2xl flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-sm font-medium text-slate-400">
            Consultando servicios y administración de API...
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
                ? "El servicio de administración API no está disponible en este momento."
                : "No fue posible cargar la información de administración API."}
            </h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">{error}</p>
          </div>
          <Button
            variant="outline"
            onClick={() => fetchOverview()}
            className="border-slate-800 bg-[#16161a] hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl"
          >
            Reintentar consulta
          </Button>
        </Card>
      ) : (
        <div>
          {/* ================= TAB 1: INTEGRACIONES ================= */}
          {activeTab === 'integrations' && (
            <div className="space-y-4">
              {filteredIntegrations.length === 0 ? (
                <Card className="bg-[#111114] border-white/5 p-12 rounded-2xl text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-400">
                    <Layers className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white">
                    {hasActiveFilters
                      ? "No se encontraron resultados con los filtros seleccionados."
                      : "No hay integraciones API configuradas todavía."}
                  </h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    {hasActiveFilters
                      ? "Intenta modificar el término de búsqueda o el filtro de estado."
                      : "Las integraciones conectadas del sistema aparecerán listadas aquí con su estado y entorno correspondiente."}
                  </p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredIntegrations.map((item) => (
                    <Card
                      key={item.id}
                      onClick={() => setSelectedIntegration(item)}
                      className="bg-[#111114] border-white/5 hover:border-indigo-500/30 p-5 rounded-2xl space-y-4 transition-all cursor-pointer group relative overflow-hidden"
                    >
                      <div className="flex items-start justify-between">
                        <div className="p-3 rounded-2xl bg-[#16161a] border border-white/5 group-hover:border-indigo-500/20 transition-colors">
                          {getIntegrationIcon(item.id)}
                        </div>
                        {item.status === 'ACTIVE' ? (
                          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-bold">
                            Activa
                          </Badge>
                        ) : item.status === 'PENDING_CONFIG' ? (
                          <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px] font-bold">
                            Pendiente Config.
                          </Badge>
                        ) : (
                          <Badge className="bg-slate-800 text-slate-400 border-slate-700 text-[10px]">
                            No Configurada
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                          {item.name}
                        </h3>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-white/5 grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-slate-500 block">Proveedor:</span>
                          <span className="text-slate-300 font-medium truncate block">{item.provider}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Entorno:</span>
                          <span className="text-slate-300 font-medium truncate block">{item.environment}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                        <span>{item.category}</span>
                        <span className="text-indigo-400 font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                          Ver detalle <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 2: CREDENCIALES ================= */}
          {activeTab === 'credentials' && (
            <div className="space-y-4">
              {filteredCredentials.length === 0 ? (
                <Card className="bg-[#111114] border-white/5 p-12 rounded-2xl text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto text-purple-400">
                    <Key className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white">
                    {hasActiveFilters
                      ? "No se encontraron resultados con los filtros seleccionados."
                      : "No hay credenciales API registradas todavía."}
                  </h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    {hasActiveFilters
                      ? "Intenta modificar el término de búsqueda o el filtro de estado."
                      : "Los metadatos seguros de credenciales del sistema se mostrarán aquí sin revelar secretos."}
                  </p>
                </Card>
              ) : (
                <Card className="bg-[#111114] border-white/5 rounded-2xl overflow-hidden shadow-xl">
                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#16161a] border-b border-white/5 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                          <th className="py-3.5 px-4 min-w-[200px]">Nombre de Credencial</th>
                          <th className="py-3.5 px-4 min-w-[150px]">Servicio / Destino</th>
                          <th className="py-3.5 px-4 min-w-[130px]">Tipo</th>
                          <th className="py-3.5 px-4 min-w-[130px]">Estado</th>
                          <th className="py-3.5 px-4 min-w-[120px]">Prefijo Seguro</th>
                          <th className="py-3.5 px-4 min-w-[150px]">Entorno</th>
                          <th className="py-3.5 px-4 text-right min-w-[90px]">Detalle</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-slate-300">
                        {filteredCredentials.map((cred) => (
                          <tr
                            key={cred.id}
                            onClick={() => setSelectedCredential(cred)}
                            className="hover:bg-white/[0.02] transition-colors cursor-pointer group"
                          >
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2.5">
                                <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
                                  <Key className="w-3.5 h-3.5" />
                                </div>
                                <div>
                                  <span className="font-bold text-white block group-hover:text-purple-300 transition-colors">
                                    {cred.name}
                                  </span>
                                  <span className="text-[10px] text-slate-500">{cred.scope}</span>
                                </div>
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              <span className="text-slate-300 font-medium">{cred.service}</span>
                            </td>

                            <td className="py-3.5 px-4">
                              {cred.type === 'SERVER_SECRET' ? (
                                <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/20 text-[10px] font-mono">
                                  Servidor Privada
                                </Badge>
                              ) : (
                                <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-[10px] font-mono">
                                  Cliente Pública
                                </Badge>
                              )}
                            </td>

                            <td className="py-3.5 px-4">
                              {cred.status === 'ACTIVE' ? (
                                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                                  Configurada
                                </Badge>
                              ) : (
                                <Badge className="bg-slate-800 text-slate-400 border-slate-700 text-[10px]">
                                  Inactiva
                                </Badge>
                              )}
                            </td>

                            <td className="py-3.5 px-4">
                              <span className="font-mono text-purple-300 bg-purple-500/5 px-2 py-0.5 rounded border border-purple-500/10 text-[11px]">
                                {cred.prefix}
                              </span>
                            </td>

                            <td className="py-3.5 px-4">
                              <span className="text-slate-400 text-[11px]">{cred.environment}</span>
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedCredential(cred);
                                }}
                                className="text-slate-400 hover:text-white hover:bg-white/5 h-7 px-2 rounded-lg text-xs"
                              >
                                <Eye className="w-3.5 h-3.5 mr-1" />
                                Ver
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* ================= TAB 3: CONSUMO ================= */}
          {activeTab === 'usage' && (
            <div className="space-y-6">
              {filteredUsageList.length === 0 ? (
                <Card className="bg-[#111114] border-white/5 p-12 rounded-2xl text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
                    <Sliders className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white">
                    {hasActiveFilters
                      ? "No se encontraron resultados con los filtros seleccionados."
                      : "No hay información de consumo disponible todavía."}
                  </h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    {hasActiveFilters
                      ? "Intenta modificar el término de búsqueda o el filtro de estado."
                      : "Los consumos y transacciones de consultas de las campañas aparecerán consolidados aquí."}
                  </p>
                </Card>
              ) : (
                <div className="space-y-6">
                  {/* Clients Usage Table */}
                  <Card className="bg-[#111114] border-white/5 rounded-2xl overflow-hidden shadow-xl">
                    <div className="p-4 bg-[#16161a] border-b border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-emerald-400" />
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                          Consumo de Consultas por Campaña / Cliente
                        </h3>
                      </div>
                      <span className="text-xs text-slate-400">
                        {filteredUsageList.length} campañas registradas
                      </span>
                    </div>

                    <div className="overflow-x-auto custom-scrollbar">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-[#16161a]/60 border-b border-white/5 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                            <th className="py-3 px-4 min-w-[200px]">Campaña / Cliente</th>
                            <th className="py-3 px-4 min-w-[120px] text-right">Asignadas</th>
                            <th className="py-3 px-4 min-w-[120px] text-right">Consumidas</th>
                            <th className="py-3 px-4 min-w-[120px] text-right">Saldo Restante</th>
                            <th className="py-3 px-4 min-w-[130px]">Estado Cuota</th>
                            <th className="py-3 px-4 min-w-[150px]">Última Consulta</th>
                            <th className="py-3 px-4 text-right min-w-[90px]">Detalle</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-slate-300">
                          {filteredUsageList.map((item) => (
                            <tr
                              key={item.clientId}
                              onClick={() => setSelectedClientUsage(item)}
                              className="hover:bg-white/[0.02] transition-colors cursor-pointer group"
                            >
                              <td className="py-3.5 px-4">
                                <div className="font-bold text-white group-hover:text-emerald-300 transition-colors">
                                  {item.clientName}
                                </div>
                                {item.clientEmail && (
                                  <div className="text-[10px] text-slate-500">{item.clientEmail}</div>
                                )}
                              </td>

                              <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-300">
                                {item.totalAssigned.toLocaleString()}
                              </td>

                              <td className="py-3.5 px-4 text-right font-mono font-bold text-amber-400">
                                {item.totalConsumed.toLocaleString()}
                              </td>

                              <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">
                                {item.balance.toLocaleString()}
                              </td>

                              <td className="py-3.5 px-4">
                                {item.status === 'ACTIVE' && item.balance > 0 ? (
                                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                                    Activo
                                  </Badge>
                                ) : item.status === 'LIMIT_REACHED' || item.balance <= 0 ? (
                                  <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/20 text-[10px]">
                                    Límite Alcanzado
                                  </Badge>
                                ) : (
                                  <Badge className="bg-slate-800 text-slate-400 border-slate-700 text-[10px]">
                                    {item.status}
                                  </Badge>
                                )}
                              </td>

                              <td className="py-3.5 px-4 text-[11px] text-slate-400">
                                {formatDate(item.lastQueryAt)}
                              </td>

                              <td className="py-3.5 px-4 text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedClientUsage(item);
                                  }}
                                  className="text-slate-400 hover:text-white hover:bg-white/5 h-7 px-2 rounded-lg text-xs"
                                >
                                  <Eye className="w-3.5 h-3.5 mr-1" />
                                  Ver
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>

                  {/* Recent Safe Transactions Sub-Section */}
                  {data?.usage?.recentTransactions && data.usage.recentTransactions.length > 0 && (
                    <Card className="bg-[#111114] border-white/5 rounded-2xl overflow-hidden shadow-xl">
                      <div className="p-4 bg-[#16161a] border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-indigo-400" />
                          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                            Transacciones y Eventos de Consumo Recientes
                          </h3>
                        </div>
                        <span className="text-[11px] text-slate-500">Últimos 20 registros</span>
                      </div>

                      <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-[#16161a]/60 border-b border-white/5 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                              <th className="py-2.5 px-4 min-w-[150px]">Fecha</th>
                              <th className="py-2.5 px-4 min-w-[160px]">Campaña</th>
                              <th className="py-2.5 px-4 min-w-[120px]">Tipo</th>
                              <th className="py-2.5 px-4 min-w-[100px] text-right">Cantidad</th>
                              <th className="py-2.5 px-4 min-w-[120px] text-right">Saldo Resultante</th>
                              <th className="py-2.5 px-4 min-w-[200px]">Detalle</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 text-slate-300">
                            {data.usage.recentTransactions.map((tr) => (
                              <tr key={tr.id} className="hover:bg-white/[0.01]">
                                <td className="py-2.5 px-4 text-[11px] text-slate-400">
                                  {formatDate(tr.createdAt)}
                                </td>
                                <td className="py-2.5 px-4 font-medium text-white">
                                  {tr.clientName}
                                </td>
                                <td className="py-2.5 px-4">
                                  <Badge className="bg-slate-800 text-slate-300 border-slate-700 text-[10px] font-mono uppercase">
                                    {tr.type}
                                  </Badge>
                                </td>
                                <td className="py-2.5 px-4 text-right font-mono font-bold text-indigo-400">
                                  {tr.amount > 0 ? `+${tr.amount}` : tr.amount}
                                </td>
                                <td className="py-2.5 px-4 text-right font-mono text-slate-300">
                                  {tr.newBalance?.toLocaleString()}
                                </td>
                                <td className="py-2.5 px-4 text-[11px] text-slate-400 truncate max-w-[220px]">
                                  {tr.details}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </Card>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ================= MODAL: DETALLE DE INTEGRACIÓN (SOLO LECTURA) ================= */}
      <AnimatePresence>
        {selectedIntegration && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedIntegration(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-xl bg-[#121216] border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-white/5 flex items-start justify-between bg-gradient-to-b from-indigo-500/10 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    {getIntegrationIcon(selectedIntegration.id)}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase">
                      Detalle de Integración
                    </span>
                    <h2 className="text-lg font-bold text-white">{selectedIntegration.name}</h2>
                    <span className="text-xs text-slate-400">{selectedIntegration.category}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedIntegration(null)}
                  className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
                <div className="p-4 bg-[#16161a] border border-white/5 rounded-2xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Descripción Operativa
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedIntegration.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-[#16161a] border border-white/5 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Proveedor
                    </span>
                    <div className="text-xs font-bold text-white">{selectedIntegration.provider}</div>
                  </div>

                  <div className="p-3 bg-[#16161a] border border-white/5 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Entorno de Ejecución
                    </span>
                    <div className="text-xs font-bold text-indigo-300">{selectedIntegration.environment}</div>
                  </div>

                  <div className="p-3 bg-[#16161a] border border-white/5 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Tipo de Autenticación
                    </span>
                    <div className="text-xs font-mono text-slate-300">{selectedIntegration.authType}</div>
                  </div>

                  <div className="p-3 bg-[#16161a] border border-white/5 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Estado Actual
                    </span>
                    <div>
                      {selectedIntegration.status === 'ACTIVE' ? (
                        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                          Activa y Operativa
                        </Badge>
                      ) : (
                        <Badge className="bg-slate-800 text-slate-400 border-slate-700 text-[10px]">
                          Pendiente de Configuración
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-3.5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-start gap-2.5 text-xs text-indigo-300">
                  <Info className="w-4 h-4 shrink-0 text-indigo-400 mt-0.5" />
                  <p>
                    <strong>Protección de Infraestructura:</strong> Los endpoints internos, parámetros de red y credenciales de esta integración se gestionan exclusivamente en el servidor y no son expuestos al navegador.
                  </p>
                </div>
              </div>

              <div className="p-4 border-t border-white/5 bg-[#0e0e11] flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => setSelectedIntegration(null)}
                  className="border-slate-800 bg-[#16161a] hover:bg-slate-800 text-slate-300 text-xs font-semibold px-4 h-9 rounded-xl"
                >
                  Cerrar
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODAL: DETALLE DE CREDENCIAL (SOLO LECTURA) ================= */}
      <AnimatePresence>
        {selectedCredential && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCredential(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-xl bg-[#121216] border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-white/5 flex items-start justify-between bg-gradient-to-b from-purple-500/10 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    <Key className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold tracking-widest text-purple-400 uppercase">
                      Metadatos Seguros de Credencial
                    </span>
                    <h2 className="text-lg font-bold text-white">{selectedCredential.name}</h2>
                    <span className="text-xs text-slate-400">{selectedCredential.service}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCredential(null)}
                  className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 bg-[#16161a] border border-white/5 rounded-2xl space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Prefijo Identificador Seguro
                    </span>
                    <div className="font-mono text-xs text-purple-300 select-all font-bold">
                      {selectedCredential.prefix}
                    </div>
                  </div>

                  <div className="p-3.5 bg-[#16161a] border border-white/5 rounded-2xl space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Tipo de Llave
                    </span>
                    <div>
                      {selectedCredential.type === 'SERVER_SECRET' ? (
                        <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/20 text-[10px] font-mono">
                          Servidor / Secret Vault
                        </Badge>
                      ) : (
                        <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-[10px] font-mono">
                          Cliente Pública (RLS)
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="p-3.5 bg-[#16161a] border border-white/5 rounded-2xl space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Alcance / Scope
                    </span>
                    <div className="text-xs text-slate-300 font-medium">
                      {selectedCredential.scope}
                    </div>
                  </div>

                  <div className="p-3.5 bg-[#16161a] border border-white/5 rounded-2xl space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Entorno de Aislamiento
                    </span>
                    <div className="text-xs text-slate-300 font-medium">
                      {selectedCredential.environment}
                    </div>
                  </div>
                </div>

                <div className="p-3.5 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-start gap-2.5 text-xs text-purple-300">
                  <Lock className="w-4 h-4 shrink-0 text-purple-400 mt-0.5" />
                  <p>
                    <strong>Seguridad por Diseño:</strong> Por directriz estricta de seguridad, los valores secretos de llaves API nunca son revelados ni transmitidos a la interfaz de usuario.
                  </p>
                </div>
              </div>

              <div className="p-4 border-t border-white/5 bg-[#0e0e11] flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => setSelectedCredential(null)}
                  className="border-slate-800 bg-[#16161a] hover:bg-slate-800 text-slate-300 text-xs font-semibold px-4 h-9 rounded-xl"
                >
                  Cerrar
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODAL: DETALLE DE CONSUMO DE CLIENTE ================= */}
      <AnimatePresence>
        {selectedClientUsage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedClientUsage(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-xl bg-[#121216] border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-white/5 flex items-start justify-between bg-gradient-to-b from-emerald-500/10 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase">
                      Detalle de Consumo de Campaña
                    </span>
                    <h2 className="text-lg font-bold text-white">{selectedClientUsage.clientName}</h2>
                    <span className="text-xs text-slate-400">{selectedClientUsage.clientEmail}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedClientUsage(null)}
                  className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3.5 bg-[#16161a] border border-white/5 rounded-2xl text-center space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Asignadas
                    </span>
                    <span className="text-lg font-bold text-white font-mono">
                      {selectedClientUsage.totalAssigned.toLocaleString()}
                    </span>
                  </div>

                  <div className="p-3.5 bg-[#16161a] border border-white/5 rounded-2xl text-center space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Consumidas
                    </span>
                    <span className="text-lg font-bold text-amber-400 font-mono">
                      {selectedClientUsage.totalConsumed.toLocaleString()}
                    </span>
                  </div>

                  <div className="p-3.5 bg-[#16161a] border border-white/5 rounded-2xl text-center space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Saldo Restante
                    </span>
                    <span className="text-lg font-bold text-emerald-400 font-mono">
                      {selectedClientUsage.balance.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 bg-[#16161a] border border-white/5 rounded-2xl space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Estado de Cuota
                    </span>
                    <div>
                      {selectedClientUsage.balance > 0 ? (
                        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                          Cuota Disponible
                        </Badge>
                      ) : (
                        <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/20 text-[10px]">
                          Límite Alcanzado
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="p-3.5 bg-[#16161a] border border-white/5 rounded-2xl space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Última Consulta
                    </span>
                    <span className="text-xs text-slate-300 font-medium">
                      {formatDate(selectedClientUsage.lastQueryAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-white/5 bg-[#0e0e11] flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => setSelectedClientUsage(null)}
                  className="border-slate-800 bg-[#16161a] hover:bg-slate-800 text-slate-300 text-xs font-semibold px-4 h-9 rounded-xl"
                >
                  Cerrar
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
