import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Search, 
  Filter, 
  RefreshCw, 
  Eye, 
  X, 
  AlertCircle, 
  Loader2, 
  Calendar, 
  User as UserIcon, 
  Building2, 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Activity, 
  CheckCircle2, 
  Database, 
  SlidersHorizontal,
  Info,
  Layers,
  Lock
} from 'lucide-react';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { Input } from '@/src/components/ui/Input';
import { useAuth } from '@/src/contexts/AuthContext';
import { supabase } from '@/src/lib/supabase';
import { UserRole } from '@/src/types';

export interface AuditActor {
  id: string | null;
  displayName: string;
  email: string;
  role?: string;
}

export interface AuditLogItem {
  id: string;
  timestamp: string | number;
  action: string;
  resource: string;
  userId?: string | null;
  actor: AuditActor;
  clientId?: string | null;
  clientName: string;
  details?: Record<string, any> | null;
}

export interface ClientOption {
  id: string;
  name: string;
}

export default function AdminAuditPage() {
  const { sessionToken, user } = useAuth();
  const isSuperadmin = user?.role === UserRole.SUPERADMIN;

  // Logs state
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);

  // Loading & Error states
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [serviceUnavailable, setServiceUnavailable] = useState<boolean>(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [clientFilter, setClientFilter] = useState<string>('ALL');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  // Clients list for dropdown
  const [availableClients, setAvailableClients] = useState<ClientOption[]>([]);
  const [availableActions, setAvailableActions] = useState<string[]>([]);

  // Selected log for Read-Only Inspection Modal
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  // Helper to obtain auth token
  const getAuthToken = async (): Promise<string> => {
    if (sessionToken) return sessionToken;
    if (supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) return session.access_token;
    }
    return '';
  };

  // Fetch Clients for Filter Dropdown
  useEffect(() => {
    const fetchClientsList = async () => {
      if (!isSuperadmin || !supabase) return;
      try {
        const { data, error } = await supabase.from('clients').select('id, name').order('name');
        if (!error && data) {
          setAvailableClients(data);
        }
      } catch (err) {
        console.warn('Could not load clients list for filter:', err);
      }
    };
    fetchClientsList();
  }, [isSuperadmin]);

  // Main fetch function for audit logs
  const fetchAuditLogs = async (page: number = currentPage) => {
    if (!isSuperadmin) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setServiceUnavailable(false);

    try {
      const token = await getAuthToken();
      if (!token) {
        setLoading(false);
        return;
      }

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString()
      });

      if (searchTerm.trim()) queryParams.append('search', searchTerm.trim());
      if (actionFilter !== 'ALL') queryParams.append('action', actionFilter);
      if (clientFilter !== 'ALL') queryParams.append('clientId', clientFilter);
      if (dateFrom) queryParams.append('dateFrom', dateFrom);
      if (dateTo) queryParams.append('dateTo', dateTo);

      const response = await fetch(`/api/admin/audit-logs?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 403) {
        setError('No tienes permisos para acceder a la auditoría global.');
        setLogs([]);
        setLoading(false);
        return;
      }

      if (response.status === 503 || response.status === 502) {
        setServiceUnavailable(true);
        setError('El servicio de auditoría no está disponible en este momento.');
        setLogs([]);
        setLoading(false);
        return;
      }

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'No fue posible cargar la auditoría global.');
      }

      const data = await response.json();
      setLogs(data.logs || []);
      setTotalCount(data.total || 0);
      setTotalPages(data.totalPages || 1);
      setCurrentPage(data.page || page);

      // Extract unique actions dynamically from loaded logs if available
      if (data.logs && Array.isArray(data.logs)) {
        const extracted = Array.from(new Set(data.logs.map((l: AuditLogItem) => l.action).filter(Boolean))) as string[];
        setAvailableActions(prev => Array.from(new Set([...prev, ...extracted])));
      }
    } catch (err: any) {
      console.error('Error fetching audit logs:', err);
      setError(err.message || 'No fue posible cargar la auditoría global.');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch when page, pageSize, or main filters change
  useEffect(() => {
    fetchAuditLogs(currentPage);
  }, [currentPage, pageSize, actionFilter, clientFilter]);

  // Debounced search on search term or date range apply
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchAuditLogs(1);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setActionFilter('ALL');
    setClientFilter('ALL');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm !== '' || actionFilter !== 'ALL' || clientFilter !== 'ALL' || dateFrom !== '' || dateTo !== '';

  // Format date helper (safe for timestamps, ISO strings, numeric epoch)
  const formatTimestamp = (ts: string | number | undefined) => {
    if (!ts) return 'Fecha no registrada';
    try {
      const date = new Date(typeof ts === 'number' && ts < 10000000000 ? ts * 1000 : ts);
      if (isNaN(date.getTime())) return String(ts);
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
      return String(ts);
    }
  };

  // Semantic action badge generator
  const getActionBadge = (action: string) => {
    const act = (action || '').toUpperCase();
    if (act.includes('CREATE') || act.includes('INSERT') || act.includes('SUBMIT')) {
      return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-mono font-bold uppercase">{action}</Badge>;
    }
    if (act.includes('APPROVE') || act.includes('ACTIVATE')) {
      return <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-[10px] font-mono font-bold uppercase">{action}</Badge>;
    }
    if (act.includes('REJECT') || act.includes('DELETE') || act.includes('REVOKE')) {
      return <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/20 text-[10px] font-mono font-bold uppercase">{action}</Badge>;
    }
    if (act.includes('UPDATE') || act.includes('EDIT') || act.includes('ADJUST')) {
      return <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px] font-mono font-bold uppercase">{action}</Badge>;
    }
    if (act.includes('STRATEGY') || act.includes('DIAGNOSTIC') || act.includes('AI')) {
      return <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-[10px] font-mono font-bold uppercase">{action}</Badge>;
    }
    return <Badge className="bg-slate-800 text-slate-300 border-slate-700 text-[10px] font-mono uppercase">{action}</Badge>;
  };

  // Permission Guard: Superadmin Only
  if (!isSuperadmin) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center rounded-[32px] bg-[#111114] border border-rose-500/20 space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white">Acceso Denegado</h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            No tienes permisos para acceder a la auditoría global.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold text-white tracking-tight">Auditoría Global</h1>
            <Badge className="bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold uppercase text-[10px] tracking-wider py-0.5 px-2.5">
              Superadmin
            </Badge>
          </div>
          <p className="text-sm text-slate-400">
            Consulta de eventos y operaciones registradas en la plataforma
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchAuditLogs(currentPage)}
            disabled={loading}
            className="border-slate-800 bg-[#16161a] hover:bg-slate-800 text-slate-300 gap-2 h-10 px-4 rounded-xl text-xs font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-purple-400' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* KPI Cards (Real Values) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-[#111114] border-white/5 p-4 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Eventos Registrados
            </span>
            <span className="text-2xl font-bold text-white tracking-tight">
              {loading ? '-' : totalCount}
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <FileText className="w-5 h-5" />
          </div>
        </Card>

        <Card className="bg-[#111114] border-white/5 p-4 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Página Actual
            </span>
            <span className="text-2xl font-bold text-white tracking-tight">
              {currentPage} <span className="text-sm font-normal text-slate-500">/ {totalPages}</span>
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Clock className="w-5 h-5" />
          </div>
        </Card>

        <Card className="bg-[#111114] border-white/5 p-4 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Modo de Consulta
            </span>
            <span className="text-base font-bold text-slate-200 tracking-tight flex items-center gap-1.5 mt-1">
              <Lock className="w-4 h-4 text-purple-400" />
              Solo Lectura
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Search and Filters Bar */}
      <Card className="bg-[#111114] border-white/5 p-4 rounded-2xl shadow-xl space-y-4">
        <form onSubmit={handleSearchSubmit} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="md:col-span-4 relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por acción, recurso, actor o campaña..."
                className="pl-10 h-11 bg-[#16161a] border-white/5 text-sm text-white placeholder:text-slate-500 rounded-xl focus:border-purple-500/50"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setCurrentPage(1);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Action Filter */}
            <div className="md:col-span-3">
              <select
                value={actionFilter}
                onChange={(e) => {
                  setActionFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full h-11 bg-[#16161a] border border-white/5 text-sm text-slate-300 rounded-xl px-3.5 focus:border-purple-500/50 outline-none"
              >
                <option value="ALL">Todas las Acciones</option>
                {availableActions.map((act) => (
                  <option key={act} value={act}>
                    {act}
                  </option>
                ))}
              </select>
            </div>

            {/* Client Filter */}
            <div className="md:col-span-3">
              <select
                value={clientFilter}
                onChange={(e) => {
                  setClientFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full h-11 bg-[#16161a] border border-white/5 text-sm text-slate-300 rounded-xl px-3.5 focus:border-purple-500/50 outline-none"
              >
                <option value="ALL">Todos los Clientes / Campañas</option>
                {availableClients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit / Clear */}
            <div className="md:col-span-2 flex items-center gap-2 justify-end">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-11 px-4 rounded-xl font-medium w-full md:w-auto"
              >
                Buscar
              </Button>
              {hasActiveFilters && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="text-xs text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 h-11 px-3 rounded-xl font-medium"
                >
                  <X className="w-3.5 h-3.5 mr-1" />
                  Limpiar
                </Button>
              )}
            </div>
          </div>

          {/* Date Range Sub-Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-white/5">
            <div className="flex items-center gap-2 bg-[#16161a] px-3 py-1.5 rounded-xl border border-white/5">
              <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
              <span className="text-xs text-slate-400 shrink-0">Desde:</span>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-xs text-white outline-none w-full cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-2 bg-[#16161a] px-3 py-1.5 rounded-xl border border-white/5">
              <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
              <span className="text-xs text-slate-400 shrink-0">Hasta:</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-xs text-white outline-none w-full cursor-pointer"
              />
            </div>

            <div className="sm:col-span-2 flex items-center justify-between text-xs text-slate-500 px-1">
              <span>Registros por página:</span>
              <div className="flex items-center gap-1.5">
                {[10, 25, 50].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => {
                      setPageSize(size);
                      setCurrentPage(1);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      pageSize === size
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'text-slate-400 hover:text-white bg-white/5'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </form>
      </Card>

      {/* Main Content Area */}
      {loading ? (
        <Card className="bg-[#111114] border-white/5 p-12 rounded-2xl flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
          <p className="text-sm font-medium text-slate-400">
            Consultando registros de auditoría global...
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
                ? "El servicio de auditoría no está disponible en este momento."
                : "No fue posible cargar la auditoría global."}
            </h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">{error}</p>
          </div>
          <Button
            variant="outline"
            onClick={() => fetchAuditLogs(currentPage)}
            className="border-slate-800 bg-[#16161a] hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl"
          >
            Reintentar consulta
          </Button>
        </Card>
      ) : logs.length === 0 ? (
        // Empty State (Strictly as specified)
        <Card className="bg-[#111114] border-white/5 p-12 rounded-2xl text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto text-purple-400">
            <FileText className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">
              {hasActiveFilters
                ? "No se encontraron eventos con los filtros seleccionados."
                : "No hay eventos de auditoría registrados todavía."}
            </h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              {hasActiveFilters
                ? "Intenta modificar el término de búsqueda, rango de fechas o filtros seleccionados."
                : "Los eventos de auditoría se registrarán automáticamente a medida que se realicen operaciones en la plataforma."}
            </p>
          </div>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              className="border-slate-800 bg-[#16161a] hover:bg-slate-800 text-slate-200 text-xs rounded-xl"
            >
              Limpiar filtros
            </Button>
          )}
        </Card>
      ) : (
        // Audit Logs List & Table
        <div className="space-y-4">
          <Card className="bg-[#111114] border-white/5 rounded-2xl overflow-hidden shadow-xl">
            {/* Desktop Table View */}
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#16161a] border-b border-white/5 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="py-3.5 px-4 min-w-[170px]">Fecha y Hora</th>
                    <th className="py-3.5 px-4 min-w-[160px]">Actor / Usuario</th>
                    <th className="py-3.5 px-4 min-w-[180px]">Acción</th>
                    <th className="py-3.5 px-4 min-w-[160px]">Recurso / Entidad</th>
                    <th className="py-3.5 px-4 min-w-[160px]">Campaña / Cliente</th>
                    <th className="py-3.5 px-4 text-right min-w-[100px]">Detalle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {logs.map((log) => (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className="hover:bg-white/[0.02] transition-colors cursor-pointer group"
                    >
                      {/* Date & Time */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2 text-white font-medium">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>{formatTimestamp(log.timestamp)}</span>
                        </div>
                      </td>

                      {/* Actor */}
                      <td className="py-3.5 px-4">
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <UserIcon className="w-3 h-3 text-purple-400" />
                            <span className="truncate max-w-[140px]">{log.actor.displayName}</span>
                          </div>
                          {log.actor.email && (
                            <div className="text-[10px] text-slate-500 truncate max-w-[140px]">
                              {log.actor.email}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4">
                        {getActionBadge(log.action)}
                      </td>

                      {/* Resource */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-slate-300 text-[11px] truncate max-w-[150px] block" title={log.resource}>
                          {log.resource || '-'}
                        </span>
                      </td>

                      {/* Client / Campaign */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="truncate max-w-[140px]">{log.clientName}</span>
                        </div>
                      </td>

                      {/* Detail Button */}
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLog(log);
                          }}
                          className="text-slate-400 hover:text-white hover:bg-white/5 h-8 px-2.5 rounded-lg text-xs"
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

            {/* Pagination Ribbon */}
            <div className="p-4 bg-[#16161a] border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
              <div>
                Mostrando {logs.length} de {totalCount} eventos (Página {currentPage} de {totalPages})
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const prev = Math.max(1, currentPage - 1);
                    setCurrentPage(prev);
                  }}
                  disabled={currentPage <= 1 || loading}
                  className="border-slate-800 bg-[#111114] hover:bg-slate-800 text-slate-300 h-8 px-3 rounded-lg text-xs"
                >
                  <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                  Anterior
                </Button>

                <div className="px-2.5 py-1 text-slate-300 font-bold bg-[#111114] rounded-lg border border-white/5">
                  {currentPage}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const next = Math.min(totalPages, currentPage + 1);
                    setCurrentPage(next);
                  }}
                  disabled={currentPage >= totalPages || loading}
                  className="border-slate-800 bg-[#111114] hover:bg-slate-800 text-slate-300 h-8 px-3 rounded-lg text-xs"
                >
                  Siguiente
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ================= READ-ONLY AUDIT EVENT DETAIL MODAL ================= */}
      <AnimatePresence>
        {selectedLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLog(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-2xl bg-[#121216] border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-white/5 flex items-start justify-between bg-gradient-to-b from-purple-500/10 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold tracking-widest text-purple-400 uppercase">
                        Detalle de Evento de Auditoría
                      </span>
                      <Badge className="bg-slate-800 text-slate-400 border-slate-700 text-[9px] uppercase">
                        Solo Lectura
                      </Badge>
                    </div>
                    <h2 className="text-lg font-bold text-white mt-0.5">{selectedLog.action}</h2>
                    <span className="text-xs text-slate-400">{formatTimestamp(selectedLog.timestamp)}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
                {/* Event Core Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 bg-[#16161a] border border-white/5 rounded-2xl space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Identificador de Registro (ID)
                    </span>
                    <div className="font-mono text-xs text-purple-300 break-all select-all">
                      {selectedLog.id}
                    </div>
                  </div>

                  <div className="p-3.5 bg-[#16161a] border border-white/5 rounded-2xl space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Recurso / Entidad Afectada
                    </span>
                    <div className="font-mono text-xs text-emerald-300 break-all">
                      {selectedLog.resource || 'No especificado'}
                    </div>
                  </div>

                  <div className="p-3.5 bg-[#16161a] border border-white/5 rounded-2xl space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Actor Responsable
                    </span>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <UserIcon className="w-3.5 h-3.5 text-purple-400" />
                      <span>{selectedLog.actor.displayName}</span>
                    </div>
                    {selectedLog.actor.email && (
                      <div className="text-[11px] text-slate-400">{selectedLog.actor.email}</div>
                    )}
                    {selectedLog.actor.role && (
                      <div className="text-[10px] text-slate-500 font-mono">Rol: {selectedLog.actor.role}</div>
                    )}
                  </div>

                  <div className="p-3.5 bg-[#16161a] border border-white/5 rounded-2xl space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Cliente / Organización
                    </span>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{selectedLog.clientName}</span>
                    </div>
                    {selectedLog.clientId && (
                      <div className="text-[10px] text-slate-500 font-mono">{selectedLog.clientId}</div>
                    )}
                  </div>
                </div>

                {/* Safe Context & Details */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Contexto y Metadatos del Evento
                  </span>
                  {selectedLog.details && Object.keys(selectedLog.details).length > 0 ? (
                    <div className="p-4 bg-[#0a0a0c] border border-white/5 rounded-2xl overflow-x-auto">
                      <pre className="text-xs font-mono text-purple-300/90 whitespace-pre-wrap break-all leading-relaxed">
                        {JSON.stringify(selectedLog.details, null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-500 bg-[#16161a] rounded-2xl border border-white/5">
                      No se registraron metadatos adicionales para este evento.
                    </div>
                  )}
                </div>

                {/* Immutability Notice */}
                <div className="p-3.5 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-start gap-2.5 text-xs text-purple-300">
                  <Info className="w-4 h-4 shrink-0 text-purple-400 mt-0.5" />
                  <p>
                    <strong>Registro Inmutable de Seguridad:</strong> Este registro de auditoría es estrictamente de solo lectura y no puede ser modificado, eliminado ni revertido desde la interfaz administrativa.
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-white/5 bg-[#0e0e11] flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => setSelectedLog(null)}
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
