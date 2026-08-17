import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CreditCard, 
  KeyRound, 
  Search, 
  Filter, 
  RefreshCw, 
  ShieldCheck, 
  Calendar, 
  Building2, 
  Eye, 
  X, 
  AlertCircle, 
  Loader2, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  Layers, 
  Users, 
  Flag,
  FileCheck,
  Clock,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { Input } from '@/src/components/ui/Input';
import { useAuth } from '@/src/contexts/AuthContext';
import { supabase } from '@/src/lib/supabase';
import { UserRole } from '@/src/types';
import { MODULE_REGISTRY, CanonicalModuleCode } from '@/src/lib/moduleAuth';

// Real Data Interfaces based on Database Schema
export interface RealPlan {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  max_users?: number | null;
  max_campaigns?: number | null;
  allowed_module_codes?: string[] | null;
  created_at?: string | null;
}

export interface RealLicense {
  id: string;
  client_id?: string | null;
  client_name?: string | null;
  plan_id?: string | null;
  plan_name?: string | null;
  plan_code?: string | null;
  start_date?: string | null;
  expiry_date?: string | null;
  status: 'ACTIVA' | 'SUSPENDIDA' | 'VENCIDA' | 'PENDIENTE' | 'CANCELADA' | string;
  allowed_modules?: string[] | null;
  created_at?: string | null;
}

export interface SimpleClientRef {
  id: string;
  name: string;
  email?: string;
  status?: string;
}

export default function AdminPlansLicensesPage() {
  const { user } = useAuth();
  const isSuperadmin = user?.role === UserRole.SUPERADMIN;

  // Active Tab: 'PLANS' | 'LICENSES'
  const [activeTab, setActiveTab] = useState<'PLANS' | 'LICENSES'>('PLANS');

  // Data states
  const [plansList, setPlansList] = useState<RealPlan[]>([]);
  const [licensesList, setLicensesList] = useState<RealLicense[]>([]);
  const [clientsList, setClientsList] = useState<SimpleClientRef[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedPlanFilter, setSelectedPlanFilter] = useState<string>('ALL');
  const [selectedModuleFilter, setSelectedModuleFilter] = useState<string>('ALL');
  const [selectedClientFilter, setSelectedClientFilter] = useState<string>('ALL');

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Detail Modal states
  const [selectedPlan, setSelectedPlan] = useState<RealPlan | null>(null);
  const [selectedLicense, setSelectedLicense] = useState<RealLicense | null>(null);

  // Fetch real data from database
  const fetchData = async () => {
    if (!isSuperadmin || !supabase) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Fetch Clients for cross-referencing
      let clientsMap: Record<string, SimpleClientRef> = {};
      try {
        const { data: clientsData } = await supabase
          .from('clients')
          .select('id, name, email, status');

        if (clientsData && Array.isArray(clientsData)) {
          setClientsList(clientsData);
          clientsData.forEach(c => {
            clientsMap[c.id] = c;
          });
        }
      } catch (err) {
        console.warn('Clients cross-reference notice:', err);
      }

      // 2. Fetch Plans
      let fetchedPlans: RealPlan[] = [];
      try {
        const { data: plansData, error: plansErr } = await supabase
          .from('plans')
          .select('id, name, code, description, max_users, max_campaigns, allowed_module_codes, created_at')
          .order('created_at', { ascending: true });

        if (plansErr && plansErr.code !== '42P01') {
          console.warn('Plans table query notice:', plansErr);
        }
        if (plansData && Array.isArray(plansData)) {
          fetchedPlans = plansData.map(p => ({
            id: p.id,
            name: p.name || 'Plan Sin Nombre',
            code: p.code || '',
            description: p.description || '',
            max_users: p.max_users !== null && p.max_users !== undefined ? p.max_users : null,
            max_campaigns: p.max_campaigns !== null && p.max_campaigns !== undefined ? p.max_campaigns : null,
            allowed_module_codes: Array.isArray(p.allowed_module_codes) ? p.allowed_module_codes : [],
            created_at: p.created_at || null
          }));
        }
      } catch (err) {
        console.warn('Plans query caught:', err);
      }

      // Plans Map for License referencing
      const plansMap: Record<string, RealPlan> = {};
      fetchedPlans.forEach(p => {
        plansMap[p.id] = p;
      });

      // 3. Fetch Licenses
      let fetchedLicenses: RealLicense[] = [];
      try {
        const { data: licensesData, error: licensesErr } = await supabase
          .from('licenses')
          .select('id, client_id, plan_id, start_date, expiry_date, status, allowed_modules, created_at')
          .order('created_at', { ascending: false });

        if (licensesErr && licensesErr.code !== '42P01') {
          console.warn('Licenses table query notice:', licensesErr);
        }
        if (licensesData && Array.isArray(licensesData)) {
          fetchedLicenses = licensesData.map(l => {
            const client = l.client_id ? clientsMap[l.client_id] : null;
            const plan = l.plan_id ? plansMap[l.plan_id] : null;
            return {
              id: l.id,
              client_id: l.client_id || null,
              client_name: client ? client.name : 'Organización no asignada',
              plan_id: l.plan_id || null,
              plan_name: plan ? plan.name : (l.plan_id ? 'Plan Asignado' : 'Sin Plan Vinculado'),
              plan_code: plan ? plan.code : '',
              start_date: l.start_date || null,
              expiry_date: l.expiry_date || null,
              status: l.status || 'ACTIVA',
              allowed_modules: Array.isArray(l.allowed_modules) ? l.allowed_modules : (plan?.allowed_module_codes || []),
              created_at: l.created_at || null
            };
          });
        }
      } catch (err) {
        console.warn('Licenses query caught:', err);
      }

      setPlansList(fetchedPlans);
      setLicensesList(fetchedLicenses);
    } catch (err: any) {
      console.error('Error fetching plans and licenses:', err);
      setError('No fue posible cargar la información de planes y licencias.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isSuperadmin]);

  // Reset pagination when tab or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm, selectedStatus, selectedPlanFilter, selectedModuleFilter, selectedClientFilter]);

  // Filtered Plans
  const filteredPlans = useMemo(() => {
    return plansList.filter(p => {
      const query = searchTerm.toLowerCase();
      const matchesSearch = 
        p.name.toLowerCase().includes(query) ||
        p.code.toLowerCase().includes(query) ||
        (p.description && p.description.toLowerCase().includes(query));

      const matchesModule = selectedModuleFilter === 'ALL' || 
        (p.allowed_module_codes && p.allowed_module_codes.includes(selectedModuleFilter));

      return matchesSearch && matchesModule;
    });
  }, [plansList, searchTerm, selectedModuleFilter]);

  // Filtered Licenses
  const filteredLicenses = useMemo(() => {
    return licensesList.filter(l => {
      const query = searchTerm.toLowerCase();
      const matchesSearch = 
        (l.client_name && l.client_name.toLowerCase().includes(query)) ||
        (l.plan_name && l.plan_name.toLowerCase().includes(query)) ||
        (l.plan_code && l.plan_code.toLowerCase().includes(query)) ||
        l.id.toLowerCase().includes(query);

      const matchesStatus = selectedStatus === 'ALL' || l.status.toUpperCase() === selectedStatus.toUpperCase();
      const matchesPlan = selectedPlanFilter === 'ALL' || l.plan_id === selectedPlanFilter;
      const matchesClient = selectedClientFilter === 'ALL' || l.client_id === selectedClientFilter;

      return matchesSearch && matchesStatus && matchesPlan && matchesClient;
    });
  }, [licensesList, searchTerm, selectedStatus, selectedPlanFilter, selectedClientFilter]);

  // Current paginated slice
  const paginatedPlans = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPlans.slice(start, start + itemsPerPage);
  }, [filteredPlans, currentPage]);

  const paginatedLicenses = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLicenses.slice(start, start + itemsPerPage);
  }, [filteredLicenses, currentPage]);

  const totalPages = activeTab === 'PLANS' 
    ? Math.ceil(filteredPlans.length / itemsPerPage) || 1
    : Math.ceil(filteredLicenses.length / itemsPerPage) || 1;

  // Helper for Status Badge
  const getLicenseStatusBadge = (status: string) => {
    const normalized = (status || '').toUpperCase();
    switch (normalized) {
      case 'ACTIVA':
      case 'ACTIVE':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full w-fit">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Activa</span>
          </div>
        );
      case 'SUSPENDIDA':
      case 'SUSPENDED':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-500/10 border border-rose-500/20 rounded-full w-fit">
            <div className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">Suspendida</span>
          </div>
        );
      case 'VENCIDA':
      case 'EXPIRED':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full w-fit">
            <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Vencida</span>
          </div>
        );
      case 'PENDIENTE':
      case 'PENDING':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full w-fit">
            <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Pendiente</span>
          </div>
        );
      case 'CANCELADA':
      case 'CANCELLED':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-500/10 border border-slate-500/20 rounded-full w-fit">
            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cancelada</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-500/10 border border-slate-500/20 rounded-full w-fit">
            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{status}</span>
          </div>
        );
    }
  };

  // Helper for Date formatting
  const formatDate = (isoString?: string | null) => {
    if (!isoString) return 'Sin fecha de corte';
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return isoString;
      return d.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return isoString;
    }
  };

  // Helper for Module Name
  const getModuleName = (code: string) => {
    const metadata = MODULE_REGISTRY[code as CanonicalModuleCode];
    return metadata ? metadata.name : code;
  };

  // Reset Filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('ALL');
    setSelectedPlanFilter('ALL');
    setSelectedModuleFilter('ALL');
    setSelectedClientFilter('ALL');
  };

  const hasActiveFilters = 
    searchTerm !== '' || 
    selectedStatus !== 'ALL' || 
    selectedPlanFilter !== 'ALL' || 
    selectedModuleFilter !== 'ALL' || 
    selectedClientFilter !== 'ALL';

  // Permission Check
  if (!isSuperadmin) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center rounded-[32px] bg-[#111114] border border-rose-500/20 space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white">Acceso Denegado</h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            No tienes permisos para acceder a la gestión de planes y licencias.
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
            <h1 className="text-3xl font-bold text-white tracking-tight">Planes y Licencias</h1>
            <Badge className="bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold uppercase text-[10px] tracking-wider py-0.5 px-2.5">
              Superadmin
            </Badge>
          </div>
          <p className="text-sm text-slate-400">
            Consulta y supervisión de planes y licencias de la plataforma
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={loading}
            className="border-slate-800 bg-[#16161a] hover:bg-slate-800 text-slate-300 gap-2 h-10 px-4 rounded-xl text-xs font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-purple-400' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 p-1.5 bg-[#111114] border border-white/5 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('PLANS')}
          className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'PLANS'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Planes de Suscripción</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
            activeTab === 'PLANS' ? 'bg-purple-800/60 text-purple-100' : 'bg-slate-800 text-slate-400'
          }`}>
            {plansList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('LICENSES')}
          className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'LICENSES'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Licencias Asignadas</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
            activeTab === 'LICENSES' ? 'bg-purple-800/60 text-purple-100' : 'bg-slate-800 text-slate-400'
          }`}>
            {licensesList.length}
          </span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <Card className="bg-[#111114] border-white/5 p-4 rounded-2xl shadow-xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Main Search */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                activeTab === 'PLANS'
                  ? "Buscar por nombre, código o descripción de plan..."
                  : "Buscar por cliente, plan o identificador de licencia..."
              }
              className="pl-10 h-11 bg-[#16161a] border-white/5 text-sm text-white placeholder:text-slate-500 rounded-xl focus:border-purple-500/50"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Conditional Filters based on Tab */}
          {activeTab === 'PLANS' ? (
            <>
              <div className="md:col-span-4">
                <select
                  value={selectedModuleFilter}
                  onChange={(e) => setSelectedModuleFilter(e.target.value)}
                  className="w-full h-11 bg-[#16161a] border border-white/5 text-sm text-slate-300 rounded-xl px-3.5 focus:border-purple-500/50 outline-none"
                >
                  <option value="ALL">Todos los Módulos</option>
                  {Object.entries(MODULE_REGISTRY).map(([code, meta]) => (
                    <option key={code} value={code}>
                      Incluye {meta.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2 flex items-center">
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFilters}
                    className="w-full text-xs text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 h-11 rounded-xl font-medium gap-1.5"
                  >
                    <X className="w-3.5 h-3.5" />
                    Limpiar
                  </Button>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Licenses Status Filter */}
              <div className="md:col-span-2">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full h-11 bg-[#16161a] border border-white/5 text-sm text-slate-300 rounded-xl px-3.5 focus:border-purple-500/50 outline-none"
                >
                  <option value="ALL">Todos los Estados</option>
                  <option value="ACTIVA">Activa</option>
                  <option value="SUSPENDIDA">Suspendida</option>
                  <option value="VENCIDA">Vencida</option>
                  <option value="PENDIENTE">Pendiente</option>
                  <option value="CANCELADA">Cancelada</option>
                </select>
              </div>

              {/* Licenses Plan Filter */}
              <div className="md:col-span-2">
                <select
                  value={selectedPlanFilter}
                  onChange={(e) => setSelectedPlanFilter(e.target.value)}
                  className="w-full h-11 bg-[#16161a] border border-white/5 text-sm text-slate-300 rounded-xl px-3.5 focus:border-purple-500/50 outline-none"
                >
                  <option value="ALL">Todos los Planes</option>
                  {plansList.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Licenses Client Filter */}
              <div className="md:col-span-2">
                {hasActiveFilters ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFilters}
                    className="w-full text-xs text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 h-11 rounded-xl font-medium gap-1.5"
                  >
                    <X className="w-3.5 h-3.5" />
                    Limpiar filtros
                  </Button>
                ) : (
                  <div className="flex items-center justify-end px-3 text-xs text-slate-500 h-11">
                    {filteredLicenses.length} resultados
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Main Content Area */}
      {loading ? (
        <Card className="bg-[#111114] border-white/5 p-12 rounded-2xl flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
          <p className="text-sm font-medium text-slate-400">
            Consultando registros de {activeTab === 'PLANS' ? 'planes' : 'licencias'} en la base de datos...
          </p>
        </Card>
      ) : error ? (
        <Card className="bg-[#111114] border-rose-500/20 p-8 rounded-2xl text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-400">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Error de Consulta</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">{error}</p>
          </div>
          <Button
            variant="outline"
            onClick={fetchData}
            className="border-slate-800 bg-[#16161a] hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl"
          >
            Reintentar consulta
          </Button>
        </Card>
      ) : activeTab === 'PLANS' ? (
        /* ================= PLANS TABLE / CARDS ================= */
        filteredPlans.length === 0 ? (
          <Card className="bg-[#111114] border-white/5 p-12 rounded-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto text-purple-400">
              <CreditCard className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">
                {hasActiveFilters ? "Sin resultados" : "No hay planes registrados"}
              </h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto">
                {hasActiveFilters
                  ? "No se encontraron resultados con los filtros seleccionados."
                  : "No hay planes registrados todavía."}
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
          <div className="space-y-4">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-hidden rounded-2xl border border-white/5 bg-[#111114] shadow-xl">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-[#16161a] text-[11px] uppercase tracking-wider text-slate-400 font-bold border-b border-white/5">
                  <tr>
                    <th className="py-3.5 px-4">Plan / Código</th>
                    <th className="py-3.5 px-4">Descripción</th>
                    <th className="py-3.5 px-4 text-center">Usuarios Máx.</th>
                    <th className="py-3.5 px-4 text-center">Campañas Máx.</th>
                    <th className="py-3.5 px-4">Módulos Incluidos</th>
                    <th className="py-3.5 px-4">Fecha Registro</th>
                    <th className="py-3.5 px-4 text-right">Detalle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-medium">
                  {paginatedPlans.map((plan) => (
                    <tr
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan)}
                      className="hover:bg-white/[0.02] cursor-pointer transition-colors group"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:border-purple-500/40 transition-colors">
                            <CreditCard className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-white text-sm group-hover:text-purple-300 transition-colors">
                              {plan.name}
                            </div>
                            <div className="text-[11px] font-mono text-slate-500 uppercase">
                              {plan.code}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 max-w-xs">
                        <p className="text-xs text-slate-400 truncate">
                          {plan.description || 'Sin descripción especificada'}
                        </p>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <Badge className="bg-slate-800 text-slate-300 border-slate-700 font-mono text-xs">
                          {plan.max_users !== null ? `${plan.max_users} usuarios` : 'Ilimitados'}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <Badge className="bg-slate-800 text-slate-300 border-slate-700 font-mono text-xs">
                          {plan.max_campaigns !== null ? `${plan.max_campaigns} campañas` : 'Ilimitadas'}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {(plan.allowed_module_codes || []).slice(0, 3).map((modCode) => (
                            <Badge
                              key={modCode}
                              className="bg-purple-950/40 text-purple-300 border-purple-800/30 text-[10px] py-0 px-1.5"
                            >
                              {getModuleName(modCode)}
                            </Badge>
                          ))}
                          {(plan.allowed_module_codes || []).length > 3 && (
                            <Badge className="bg-slate-800 text-slate-400 text-[10px] py-0 px-1.5">
                              +{(plan.allowed_module_codes || []).length - 3}
                            </Badge>
                          )}
                          {(!plan.allowed_module_codes || plan.allowed_module_codes.length === 0) && (
                            <span className="text-xs text-slate-500">Ninguno</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-400">
                        {formatDate(plan.created_at)}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPlan(plan);
                          }}
                          className="text-slate-400 hover:text-white hover:bg-white/5 h-8 px-2.5 rounded-lg text-xs"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          Consultar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Grid */}
            <div className="grid grid-cols-1 gap-3 md:hidden">
              {paginatedPlans.map((plan) => (
                <Card
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan)}
                  className="bg-[#111114] border-white/5 p-4 rounded-2xl space-y-3 cursor-pointer hover:border-purple-500/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">{plan.name}</h4>
                        <span className="text-[10px] font-mono text-slate-500 uppercase">{plan.code}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-400 hover:text-white h-8 w-8 p-0"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>

                  {plan.description && (
                    <p className="text-xs text-slate-400 line-clamp-2">{plan.description}</p>
                  )}

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-xs text-slate-400">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Usuarios</span>
                      <span className="font-semibold text-slate-200">
                        {plan.max_users !== null ? `${plan.max_users} usuarios` : 'Ilimitados'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Campañas</span>
                      <span className="font-semibold text-slate-200">
                        {plan.max_campaigns !== null ? `${plan.max_campaigns} campañas` : 'Ilimitadas'}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )
      ) : (
        /* ================= LICENSES TABLE / CARDS ================= */
        filteredLicenses.length === 0 ? (
          <Card className="bg-[#111114] border-white/5 p-12 rounded-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto text-purple-400">
              <KeyRound className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">
                {hasActiveFilters ? "Sin resultados" : "No hay licencias registradas"}
              </h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto">
                {hasActiveFilters
                  ? "No se encontraron resultados con los filtros seleccionados."
                  : "No hay licencias registradas todavía."}
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
          <div className="space-y-4">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-hidden rounded-2xl border border-white/5 bg-[#111114] shadow-xl">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-[#16161a] text-[11px] uppercase tracking-wider text-slate-400 font-bold border-b border-white/5">
                  <tr>
                    <th className="py-3.5 px-4">Organización / Cliente</th>
                    <th className="py-3.5 px-4">Plan Asignado</th>
                    <th className="py-3.5 px-4">Estado</th>
                    <th className="py-3.5 px-4">Fecha Inicio</th>
                    <th className="py-3.5 px-4">Fecha Vencimiento</th>
                    <th className="py-3.5 px-4">Módulos Habilitados</th>
                    <th className="py-3.5 px-4 text-right">Detalle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-medium">
                  {paginatedLicenses.map((lic) => (
                    <tr
                      key={lic.id}
                      onClick={() => setSelectedLicense(lic)}
                      className="hover:bg-white/[0.02] cursor-pointer transition-colors group"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:border-indigo-500/40 transition-colors">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-white text-sm group-hover:text-indigo-300 transition-colors">
                              {lic.client_name}
                            </div>
                            <div className="text-[11px] font-mono text-slate-500">
                              ID: {lic.id.substring(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-bold">
                            {lic.plan_name}
                          </Badge>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {getLicenseStatusBadge(lic.status)}
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-400">
                        {formatDate(lic.start_date)}
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-400">
                        {formatDate(lic.expiry_date)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {(lic.allowed_modules || []).slice(0, 2).map((modCode) => (
                            <Badge
                              key={modCode}
                              className="bg-indigo-950/40 text-indigo-300 border-indigo-800/30 text-[10px] py-0 px-1.5"
                            >
                              {getModuleName(modCode)}
                            </Badge>
                          ))}
                          {(lic.allowed_modules || []).length > 2 && (
                            <Badge className="bg-slate-800 text-slate-400 text-[10px] py-0 px-1.5">
                              +{(lic.allowed_modules || []).length - 2}
                            </Badge>
                          )}
                          {(!lic.allowed_modules || lic.allowed_modules.length === 0) && (
                            <span className="text-xs text-slate-500">Sin módulos</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLicense(lic);
                          }}
                          className="text-slate-400 hover:text-white hover:bg-white/5 h-8 px-2.5 rounded-lg text-xs"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          Consultar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Grid */}
            <div className="grid grid-cols-1 gap-3 md:hidden">
              {paginatedLicenses.map((lic) => (
                <Card
                  key={lic.id}
                  onClick={() => setSelectedLicense(lic)}
                  className="bg-[#111114] border-white/5 p-4 rounded-2xl space-y-3 cursor-pointer hover:border-purple-500/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">{lic.client_name}</h4>
                        <span className="text-[10px] font-mono text-purple-400">{lic.plan_name}</span>
                      </div>
                    </div>
                    <div>{getLicenseStatusBadge(lic.status)}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-xs text-slate-400">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Inicio</span>
                      <span className="font-medium text-slate-300">{formatDate(lic.start_date)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Vencimiento</span>
                      <span className="font-medium text-slate-300">{formatDate(lic.expiry_date)}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )
      )}

      {/* Pagination Footer */}
      {!loading && !error && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="text-xs text-slate-400 font-medium">
            Mostrando{' '}
            <span className="text-white font-bold">
              {activeTab === 'PLANS'
                ? filteredPlans.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1
                : filteredLicenses.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
            </span>{' '}
            a{' '}
            <span className="text-white font-bold">
              {activeTab === 'PLANS'
                ? Math.min(currentPage * itemsPerPage, filteredPlans.length)
                : Math.min(currentPage * itemsPerPage, filteredLicenses.length)}
            </span>{' '}
            de{' '}
            <span className="text-white font-bold">
              {activeTab === 'PLANS' ? filteredPlans.length : filteredLicenses.length}
            </span>{' '}
            {activeTab === 'PLANS' ? 'planes registrados' : 'licencias registradas'}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || loading}
              className="border-slate-800 bg-[#16161a] hover:bg-slate-800 text-slate-300 h-9 px-3 rounded-xl text-xs gap-1 disabled:opacity-40"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Anterior
            </Button>
            <div className="text-xs font-bold text-slate-400 px-2">
              Página {currentPage} de {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage >= totalPages || loading}
              className="border-slate-800 bg-[#16161a] hover:bg-slate-800 text-slate-300 h-9 px-3 rounded-xl text-xs gap-1 disabled:opacity-40"
            >
              Siguiente
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* ================= PLAN DETAIL MODAL (READ-ONLY) ================= */}
      <AnimatePresence>
        {selectedPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPlan(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-xl bg-[#121216] border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-white/5 flex items-start justify-between bg-gradient-to-b from-purple-500/10 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold tracking-widest text-purple-400 uppercase">
                      Detalle de Plan (Solo Lectura)
                    </span>
                    <h2 className="text-xl font-bold text-white">{selectedPlan.name}</h2>
                    <span className="text-xs font-mono text-slate-500 uppercase">{selectedPlan.code}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPlan(null)}
                  className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                {/* Description */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Descripción</span>
                  <p className="text-sm text-slate-200 bg-[#16161a] p-3.5 rounded-xl border border-white/5">
                    {selectedPlan.description || 'Este plan no cuenta con una descripción detallada registrada.'}
                  </p>
                </div>

                {/* Limits Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 bg-[#16161a] border border-white/5 rounded-xl space-y-1">
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                      <Users className="w-3.5 h-3.5 text-purple-400" />
                      Límite de Usuarios
                    </div>
                    <p className="text-lg font-bold text-white">
                      {selectedPlan.max_users !== null ? `${selectedPlan.max_users}` : 'Ilimitados'}
                    </p>
                  </div>

                  <div className="p-3.5 bg-[#16161a] border border-white/5 rounded-xl space-y-1">
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                      <Flag className="w-3.5 h-3.5 text-purple-400" />
                      Límite de Campañas
                    </div>
                    <p className="text-lg font-bold text-white">
                      {selectedPlan.max_campaigns !== null ? `${selectedPlan.max_campaigns}` : 'Ilimitadas'}
                    </p>
                  </div>
                </div>

                {/* Included Modules */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <Layers className="w-3.5 h-3.5 text-purple-400" />
                    Módulos Autorizados en este Plan
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(selectedPlan.allowed_module_codes || []).map((modCode) => {
                      const meta = MODULE_REGISTRY[modCode as CanonicalModuleCode];
                      return (
                        <div
                          key={modCode}
                          className="p-3 bg-[#16161a] border border-white/5 rounded-xl flex items-start gap-2.5"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <div>
                            <div className="text-xs font-bold text-white">{meta ? meta.name : modCode}</div>
                            <div className="text-[10px] text-slate-400 line-clamp-1">
                              {meta ? meta.description : 'Módulo del sistema'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {(!selectedPlan.allowed_module_codes || selectedPlan.allowed_module_codes.length === 0) && (
                      <div className="col-span-2 text-xs text-slate-500 py-3 text-center bg-[#16161a] rounded-xl border border-white/5">
                        No hay módulos explícitamente asignados a este plan.
                      </div>
                    )}
                  </div>
                </div>

                {/* Metadata */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-slate-500">
                  <span>ID: <code className="font-mono text-slate-400">{selectedPlan.id}</code></span>
                  <span>Fecha de registro: {formatDate(selectedPlan.created_at)}</span>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-white/5 bg-[#16161a] flex items-center justify-between">
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                  Registro de solo lectura
                </div>
                <Button
                  variant="outline"
                  onClick={() => setSelectedPlan(null)}
                  className="border-slate-800 bg-[#111114] hover:bg-slate-800 text-slate-200 text-xs rounded-xl"
                >
                  Cerrar
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= LICENSE DETAIL MODAL (READ-ONLY) ================= */}
      <AnimatePresence>
        {selectedLicense && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLicense(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-xl bg-[#121216] border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-white/5 flex items-start justify-between bg-gradient-to-b from-indigo-500/10 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <KeyRound className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase">
                      Detalle de Licencia (Solo Lectura)
                    </span>
                    <h2 className="text-xl font-bold text-white">{selectedLicense.client_name}</h2>
                    <span className="text-xs font-mono text-slate-500">ID: {selectedLicense.id}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLicense(null)}
                  className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                {/* Status and Plan */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 bg-[#16161a] border border-white/5 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Estado de la Licencia</span>
                    <div>{getLicenseStatusBadge(selectedLicense.status)}</div>
                  </div>

                  <div className="p-3.5 bg-[#16161a] border border-white/5 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Plan Vinculado</span>
                    <Badge className="bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-bold">
                      {selectedLicense.plan_name}
                    </Badge>
                  </div>
                </div>

                {/* Validity Dates */}
                <div className="p-4 bg-[#16161a] border border-white/5 rounded-2xl space-y-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                    Vigencia y Temporalidad
                  </span>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Fecha de Inicio</span>
                      <span className="font-semibold text-slate-200">{formatDate(selectedLicense.start_date)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Fecha de Vencimiento</span>
                      <span className="font-semibold text-slate-200">{formatDate(selectedLicense.expiry_date)}</span>
                    </div>
                  </div>
                </div>

                {/* Enabled Modules */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    Módulos Habilitados para esta Organización
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(selectedLicense.allowed_modules || []).map((modCode) => {
                      const meta = MODULE_REGISTRY[modCode as CanonicalModuleCode];
                      return (
                        <div
                          key={modCode}
                          className="p-3 bg-[#16161a] border border-white/5 rounded-xl flex items-start gap-2.5"
                        >
                          <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                          <div>
                            <div className="text-xs font-bold text-white">{meta ? meta.name : modCode}</div>
                            <div className="text-[10px] text-slate-400 line-clamp-1">
                              {meta ? meta.description : 'Módulo del sistema'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {(!selectedLicense.allowed_modules || selectedLicense.allowed_modules.length === 0) && (
                      <div className="col-span-2 text-xs text-slate-500 py-3 text-center bg-[#16161a] rounded-xl border border-white/5">
                        Esta licencia no tiene módulos específicos habilitados.
                      </div>
                    )}
                  </div>
                </div>

                {/* Phase Notice */}
                <div className="p-3 bg-purple-950/20 border border-purple-800/30 rounded-xl flex items-start gap-2.5 text-xs text-purple-300">
                  <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <p>
                    <strong>Fase de Consulta:</strong> En esta versión solo se permite la supervisión de planes y licencias existentes. Las acciones de emisión, modificación o suspensión se integrarán en las siguientes fases operativas.
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-white/5 bg-[#16161a] flex items-center justify-between">
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  Registro de solo lectura
                </div>
                <Button
                  variant="outline"
                  onClick={() => setSelectedLicense(null)}
                  className="border-slate-800 bg-[#111114] hover:bg-slate-800 text-slate-200 text-xs rounded-xl"
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
