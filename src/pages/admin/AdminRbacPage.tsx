import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  RefreshCw, 
  Users, 
  ChevronDown, 
  ChevronRight, 
  Eye, 
  X, 
  AlertCircle, 
  Loader2, 
  CheckCircle2, 
  XCircle,
  Layers, 
  Key, 
  Lock, 
  SlidersHorizontal,
  Info,
  Sparkles,
  Building2,
  Shield,
  Activity,
  MapPin,
  Target,
  Vote,
  BarChart3,
  Megaphone,
  Check,
  Minus
} from 'lucide-react';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { Input } from '@/src/components/ui/Input';
import { useAuth } from '@/src/contexts/AuthContext';
import { supabase } from '@/src/lib/supabase';
import { UserRole, Permission, ModuleName } from '@/src/types';
import { ROLE_PERMISSIONS } from '@/src/lib/permissions';
import { MODULE_REGISTRY, CanonicalModuleCode } from '@/src/lib/moduleAuth';

// Role definition interface with real metadata
export interface SystemRoleDefinition {
  code: UserRole;
  name: string;
  shortLabel: string;
  hierarchyLevel: number;
  hierarchyLabel: string;
  scopeType: 'GLOBAL_SYSTEM' | 'CLIENT_ADMIN' | 'STRATEGY' | 'TERRITORY' | 'OPERATIVE' | 'READONLY';
  scopeLabel: string;
  description: string;
  responsibilities: string[];
  allowedModuleCodes: CanonicalModuleCode[];
  defaultStatus: 'ACTIVE';
}

// User summary assigned to a role
export interface RoleAssignedUser {
  id: string;
  email: string;
  displayName: string;
  clientName?: string;
  status: string;
  createdAt?: string;
}

// Permission action metadata
export interface PermissionActionMeta {
  code: Permission;
  label: string;
  description: string;
  category: 'LECTURA' | 'ESCRITURA' | 'GESTION' | 'SISTEMA';
}

// System Action Catalog (Real canonical actions in types/index.ts)
const SYSTEM_ACTIONS_CATALOG: PermissionActionMeta[] = [
  { code: 'VIEW', label: 'Consultar (VIEW)', description: 'Lectura y visualización de registros, dashboards y métricas.', category: 'LECTURA' },
  { code: 'CREATE', label: 'Registrar (CREATE)', description: 'Creación de votantes, eventos, encuestas, gastos y actas E-14.', category: 'ESCRITURA' },
  { code: 'EDIT', label: 'Modificar (EDIT)', description: 'Actualización y edición de datos, propuestas y parámetros.', category: 'ESCRITURA' },
  { code: 'DELETE', label: 'Eliminar (DELETE)', description: 'Borrado controlado y baja lógica de registros y documentos.', category: 'ESCRITURA' },
  { code: 'EXPORT', label: 'Exportar (EXPORT)', description: 'Descarga de padrones, reportes oficiales CNE y archivos CSV/Excel.', category: 'LECTURA' },
  { code: 'APPROVE', label: 'Aprobar (APPROVE)', description: 'Validación jerárquica de solicitudes de gasto, eventos y preconteo.', category: 'GESTION' },
  { code: 'MANAGE', label: 'Gestionar (MANAGE)', description: 'Administración de equipos, asignación de mesas y control zonal.', category: 'GESTION' },
  { code: 'CONFIGURE', label: 'Configurar (CONFIGURE)', description: 'Ajuste de parámetros del sistema, claves, planes y conexiones.', category: 'SISTEMA' },
];

// Base Canonical Definitions for the 6 Real Roles
const CANONICAL_SYSTEM_ROLES: SystemRoleDefinition[] = [
  {
    code: UserRole.SUPERADMIN,
    name: 'Superadministrador Global (Root)',
    shortLabel: 'Superadmin',
    hierarchyLevel: 1,
    hierarchyLabel: 'Nivel 1 - Control Total',
    scopeType: 'GLOBAL_SYSTEM',
    scopeLabel: 'Plataforma Global (Multi-Tenant)',
    description: 'Control absoluto del sistema, infraestructura en la nube, clientes, planes, módulos, claves de API, monitoreo y base de datos.',
    responsibilities: [
      'Administración de tenants y clientes de campaña.',
      'Gestión de planes, licencias y módulos de la plataforma.',
      'Monitoreo de seguridad, auditoría global y API keys.',
      'Acceso irrestricto de configuración a todas las bases de datos.'
    ],
    allowedModuleCodes: ['ADMINISTRATIVE', 'TERRITORY', 'STRATEGY', 'CRM', 'ELECTORAL', 'ANALYSIS', 'COMMUNICATIONS'],
    defaultStatus: 'ACTIVE'
  },
  {
    code: UserRole.ADMIN_CLIENTE,
    name: 'Administrador de Cliente / Campaña',
    shortLabel: 'Admin Campaña',
    hierarchyLevel: 2,
    hierarchyLabel: 'Nivel 2 - Tenant Principal',
    scopeType: 'CLIENT_ADMIN',
    scopeLabel: 'Campaña Principal / Tenant',
    description: 'Gestión integral del comando de campaña, presupuesto oficial CNE, organigrama de equipo, tesorería y asignación de permisos.',
    responsibilities: [
      'Administración del equipo de campaña y usuarios locales.',
      'Control de presupuesto oficial, topes legales y cuentas de cobro.',
      'Aprobación de gastos, giras y logística de campaña.',
      'Supervisión de métricas territoriales y electorales.'
    ],
    allowedModuleCodes: ['ADMINISTRATIVE', 'TERRITORY', 'STRATEGY', 'CRM', 'ELECTORAL', 'COMMUNICATIONS'],
    defaultStatus: 'ACTIVE'
  },
  {
    code: UserRole.DIRECTOR,
    name: 'Director de Campaña / Estratega',
    shortLabel: 'Director',
    hierarchyLevel: 3,
    hierarchyLabel: 'Nivel 3 - Estrategia',
    scopeType: 'STRATEGY',
    scopeLabel: 'Dirección Estratégica',
    description: 'Liderazgo político, análisis DOFA, diseño de narrativa, programa de gobierno, control de agenda del candidato e investigación.',
    responsibilities: [
      'Elaboración del programa de gobierno y ejes estratégicos.',
      'Diseño y validación de mensajes clave y argumentarios.',
      'Supervisión del calendario electoral y giras del candidato.',
      'Análisis de datos electorales, encuestas y umbrales.'
    ],
    allowedModuleCodes: ['STRATEGY', 'ADMINISTRATIVE', 'TERRITORY', 'CRM', 'ELECTORAL', 'COMMUNICATIONS'],
    defaultStatus: 'ACTIVE'
  },
  {
    code: UserRole.COORDINADOR,
    name: 'Coordinador Territorial / Zonal',
    shortLabel: 'Coordinador',
    hierarchyLevel: 4,
    hierarchyLabel: 'Nivel 4 - Territorio',
    scopeType: 'TERRITORY',
    scopeLabel: 'Operación Territorial',
    description: 'Coordinación de líderes barriales, zonificación territorial, registro de votantes, control de testigos de mesa y logística del Día E.',
    responsibilities: [
      'Gestión y verificación de la red de líderes barriales.',
      'Padrón territorial de votantes y georreferenciación.',
      'Coordinación de testigos electorales en puestos de votación.',
      'Levantamiento de sondeos de percepción en campo.'
    ],
    allowedModuleCodes: ['TERRITORY', 'CRM', 'ELECTORAL', 'ADMINISTRATIVE', 'STRATEGY'],
    defaultStatus: 'ACTIVE'
  },
  {
    code: UserRole.USUARIO,
    name: 'Digitador / Operador de Campo',
    shortLabel: 'Operador',
    hierarchyLevel: 5,
    hierarchyLabel: 'Nivel 5 - Operación Base',
    scopeType: 'OPERATIVE',
    scopeLabel: 'Captura y Validación',
    description: 'Registro directo de simpatizantes, encuestas presenciales, consulta de lugares de votación y soporte operativo en campo.',
    responsibilities: [
      'Registro individual de votantes y cruce con censo electoral.',
      'Aplicación de encuestas y formularios en terreno.',
      'Consulta asistida de puesto y mesa de votación.',
      'Carga de evidencias fotográficas y actas E-14.'
    ],
    allowedModuleCodes: ['TERRITORY', 'CRM', 'ADMINISTRATIVE', 'STRATEGY', 'ELECTORAL'],
    defaultStatus: 'ACTIVE'
  },
  {
    code: UserRole.USUARIO_LIMITADO,
    name: 'Usuario Consulta (Solo Lectura)',
    shortLabel: 'Solo Lectura',
    hierarchyLevel: 6,
    hierarchyLabel: 'Nivel 6 - Consulta',
    scopeType: 'READONLY',
    scopeLabel: 'Auditoría y Visualización',
    description: 'Acceso restringido en modo lectura para auditoría o visualización de reportes asignados, sin permisos de modificación ni registro.',
    responsibilities: [
      'Visualización de paneles e informes autorizados.',
      'Consulta de estado de metas territoriales asignadas.',
      'Revisión de avance sin facultades de edición.'
    ],
    allowedModuleCodes: ['ADMINISTRATIVE', 'TERRITORY', 'CRM'],
    defaultStatus: 'ACTIVE'
  }
];

export default function AdminRbacPage() {
  const { user } = useAuth();
  const isSuperadmin = user?.role === UserRole.SUPERADMIN;

  // Navigation tab: 'ROLES' | 'PERMISSIONS'
  const [activeTab, setActiveTab] = useState<'ROLES' | 'PERMISSIONS'>('ROLES');

  // Loading & Error states
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Real Database users mapped by role
  const [roleUsersMap, setRoleUsersMap] = useState<Record<string, RoleAssignedUser[]>>({});
  const [totalUsersCount, setTotalUsersCount] = useState<number>(0);

  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedScope, setSelectedScope] = useState<string>('ALL');
  const [selectedModuleFilter, setSelectedModuleFilter] = useState<string>('ALL');

  // Accordion state
  const [expandedRoleCards, setExpandedRoleCards] = useState<Record<string, boolean>>({
    SUPERADMIN: true,
    ADMIN_CLIENTE: true
  });

  // Modal states for Read-Only Inspection
  const [selectedRoleForDetail, setSelectedRoleForDetail] = useState<SystemRoleDefinition | null>(null);
  const [selectedActionForDetail, setSelectedActionForDetail] = useState<PermissionActionMeta | null>(null);

  // Fetch real users from profiles for role counting
  const fetchRbacData = async () => {
    if (!isSuperadmin) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (supabase) {
        // Fetch clients map for user affiliation names
        const { data: clientsData } = await supabase.from('clients').select('id, name');
        const clientsMap: Record<string, string> = {};
        if (clientsData && Array.isArray(clientsData)) {
          clientsData.forEach(c => {
            clientsMap[c.id] = c.name;
          });
        }

        // Fetch profiles to count assigned users per role
        const { data: profilesData, error: profilesErr } = await supabase
          .from('profiles')
          .select('id, email, display_name, role, client_id, status, created_at');

        if (profilesErr) {
          throw profilesErr;
        }

        if (profilesData && Array.isArray(profilesData)) {
          const map: Record<string, RoleAssignedUser[]> = {};
          profilesData.forEach(p => {
            const roleKey = (p.role || 'USUARIO').toUpperCase();
            if (!map[roleKey]) {
              map[roleKey] = [];
            }
            map[roleKey].push({
              id: p.id,
              email: p.email || '',
              displayName: p.display_name || p.email?.split('@')[0] || 'Usuario',
              clientName: p.client_id ? clientsMap[p.client_id] || 'Campaña' : 'Global',
              status: p.status || 'ACTIVE',
              createdAt: p.created_at
            });
          });

          setRoleUsersMap(map);
          setTotalUsersCount(profilesData.length);
        }
      }
    } catch (err: any) {
      console.error('Error fetching RBAC data:', err);
      setError('No fue posible cargar la configuración de roles y permisos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRbacData();
  }, [isSuperadmin]);

  // Toggle Accordion for a role card
  const toggleRoleAccordion = (code: string) => {
    setExpandedRoleCards(prev => ({
      ...prev,
      [code]: !prev[code]
    }));
  };

  const handleExpandAll = () => {
    const all: Record<string, boolean> = {};
    CANONICAL_SYSTEM_ROLES.forEach(r => {
      all[r.code] = true;
    });
    setExpandedRoleCards(all);
  };

  const handleCollapseAll = () => {
    setExpandedRoleCards({});
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedScope('ALL');
    setSelectedModuleFilter('ALL');
  };

  const hasActiveFilters = searchTerm !== '' || selectedScope !== 'ALL' || selectedModuleFilter !== 'ALL';

  // Filter roles based on search and selected scopes/modules
  const filteredRoles = useMemo(() => {
    return CANONICAL_SYSTEM_ROLES.filter(role => {
      const query = searchTerm.toLowerCase();

      // Search match
      const matchesSearch = 
        !query ||
        role.name.toLowerCase().includes(query) ||
        role.code.toLowerCase().includes(query) ||
        role.description.toLowerCase().includes(query) ||
        role.scopeLabel.toLowerCase().includes(query);

      // Scope match
      const matchesScope = selectedScope === 'ALL' || role.scopeType === selectedScope;

      // Module match
      const matchesModule = selectedModuleFilter === 'ALL' || role.allowedModuleCodes.includes(selectedModuleFilter as CanonicalModuleCode);

      return matchesSearch && matchesScope && matchesModule;
    });
  }, [searchTerm, selectedScope, selectedModuleFilter]);

  // Filter actions based on search
  const filteredActions = useMemo(() => {
    return SYSTEM_ACTIONS_CATALOG.filter(action => {
      const query = searchTerm.toLowerCase();
      return (
        !query ||
        action.code.toLowerCase().includes(query) ||
        action.label.toLowerCase().includes(query) ||
        action.description.toLowerCase().includes(query) ||
        action.category.toLowerCase().includes(query)
      );
    });
  }, [searchTerm]);

  // Helper to check if a role has a specific permission for a module
  const checkRolePermission = (roleCode: UserRole, moduleKey: string, action: Permission): boolean => {
    const roleConfig = ROLE_PERMISSIONS[roleCode];
    if (!roleConfig) return false;

    // Superadmin has full access
    if (roleCode === UserRole.SUPERADMIN) return true;

    const modulePermissions = (roleConfig as any)[moduleKey] as Permission[] | undefined;
    if (!modulePermissions) return false;

    return modulePermissions.includes(action);
  };

  // Helper for scope badge styling
  const getScopeBadge = (scopeType: SystemRoleDefinition['scopeType']) => {
    switch (scopeType) {
      case 'GLOBAL_SYSTEM':
        return <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/20 text-[10px] font-bold uppercase">Root Global</Badge>;
      case 'CLIENT_ADMIN':
        return <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-[10px] font-bold uppercase">Admin Campaña</Badge>;
      case 'STRATEGY':
        return <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px] font-bold uppercase">Estrategia</Badge>;
      case 'TERRITORY':
        return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-bold uppercase">Territorial</Badge>;
      case 'OPERATIVE':
        return <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px] font-bold uppercase">Operador</Badge>;
      case 'READONLY':
        return <Badge className="bg-slate-700/50 text-slate-400 border-slate-600/30 text-[10px] font-bold uppercase">Solo Lectura</Badge>;
    }
  };

  // Permission Guard: Superadmin Only
  if (!isSuperadmin) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center rounded-[32px] bg-[#111114] border border-rose-500/20 space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white">Acceso Denegado</h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            No tienes permisos para acceder a la gestión global de roles y permisos.
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
            <h1 className="text-3xl font-bold text-white tracking-tight">Roles y Permisos Globales</h1>
            <Badge className="bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold uppercase text-[10px] tracking-wider py-0.5 px-2.5">
              Superadmin
            </Badge>
          </div>
          <p className="text-sm text-slate-400">
            Consulta de la estructura de acceso y autorización de la plataforma
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExpandAll}
            className="border-slate-800 bg-[#16161a] hover:bg-slate-800 text-slate-300 h-10 px-3 rounded-xl text-xs font-semibold"
          >
            Expandir todos
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCollapseAll}
            className="border-slate-800 bg-[#16161a] hover:bg-slate-800 text-slate-300 h-10 px-3 rounded-xl text-xs font-semibold"
          >
            Contraer todos
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchRbacData}
            disabled={loading}
            className="border-slate-800 bg-[#16161a] hover:bg-slate-800 text-slate-300 gap-2 h-10 px-4 rounded-xl text-xs font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-purple-400' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* KPI Cards (Real Data Only) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-[#111114] border-white/5 p-4 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Roles del Sistema
            </span>
            <span className="text-2xl font-bold text-white tracking-tight">
              {CANONICAL_SYSTEM_ROLES.length}
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </Card>

        <Card className="bg-[#111114] border-white/5 p-4 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Usuarios con Rol Asignado
            </span>
            <span className="text-2xl font-bold text-white tracking-tight">
              {loading ? '-' : totalUsersCount}
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Users className="w-5 h-5" />
          </div>
        </Card>

        <Card className="bg-[#111114] border-white/5 p-4 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Acciones Canónicas
            </span>
            <span className="text-2xl font-bold text-white tracking-tight">
              {SYSTEM_ACTIONS_CATALOG.length}
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Key className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Navigation Tabs (Roles vs Matrix) */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-2">
        <button
          role="tab"
          aria-selected={activeTab === 'ROLES'}
          onClick={() => setActiveTab('ROLES')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'ROLES'
              ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Roles del Sistema ({CANONICAL_SYSTEM_ROLES.length})
        </button>

        <button
          role="tab"
          aria-selected={activeTab === 'PERMISSIONS'}
          onClick={() => setActiveTab('PERMISSIONS')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'PERMISSIONS'
              ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Key className="w-4 h-4" />
          Matriz de Permisos & Acciones
        </button>
      </div>

      {/* Search and Filters Bar */}
      <Card className="bg-[#111114] border-white/5 p-4 rounded-2xl shadow-xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Main Search Input */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={activeTab === 'ROLES' ? "Buscar rol por nombre, código o descripción..." : "Buscar acción o permiso por nombre, código o categoría..."}
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

          {/* Scope Filter (Only for Roles Tab) */}
          <div className="md:col-span-3">
            <select
              value={selectedScope}
              onChange={(e) => setSelectedScope(e.target.value)}
              disabled={activeTab === 'PERMISSIONS'}
              className={`w-full h-11 bg-[#16161a] border border-white/5 text-sm text-slate-300 rounded-xl px-3.5 focus:border-purple-500/50 outline-none ${
                activeTab === 'PERMISSIONS' ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <option value="ALL">Todos los Ámbitos</option>
              <option value="GLOBAL_SYSTEM">Sistema Global (Multi-Tenant)</option>
              <option value="CLIENT_ADMIN">Administración de Campaña</option>
              <option value="STRATEGY">Estrategia y Dirección</option>
              <option value="TERRITORY">Operación Territorial</option>
              <option value="OPERATIVE">Captura y Operación Base</option>
              <option value="READONLY">Solo Lectura / Auditoría</option>
            </select>
          </div>

          {/* Module Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedModuleFilter}
              onChange={(e) => setSelectedModuleFilter(e.target.value)}
              className="w-full h-11 bg-[#16161a] border border-white/5 text-sm text-slate-300 rounded-xl px-3.5 focus:border-purple-500/50 outline-none"
            >
              <option value="ALL">Todos los Módulos</option>
              <option value="ADMINISTRATIVE">Gestión Administrativa</option>
              <option value="TERRITORY">Gestión Territorial</option>
              <option value="STRATEGY">Gestión Estratégica</option>
              <option value="CRM">CRM Político</option>
              <option value="ELECTORAL">Electoral / E-14</option>
              <option value="ANALYSIS">Análisis de Datos</option>
              <option value="COMMUNICATIONS">Comunicaciones</option>
            </select>
          </div>

          {/* Clear Button */}
          <div className="md:col-span-1 flex items-center justify-end">
            {hasActiveFilters ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="w-full text-xs text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 h-11 rounded-xl font-medium"
              >
                <X className="w-3.5 h-3.5 mr-1" />
                Limpiar
              </Button>
            ) : (
              <div className="text-[11px] text-slate-500 text-center w-full">
                {activeTab === 'ROLES' ? `${filteredRoles.length} roles` : `${filteredActions.length} acciones`}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Main Content Area */}
      {loading ? (
        <Card className="bg-[#111114] border-white/5 p-12 rounded-2xl flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
          <p className="text-sm font-medium text-slate-400">
            Consultando la estructura de roles y permisos en la plataforma...
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
            onClick={fetchRbacData}
            className="border-slate-800 bg-[#16161a] hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl"
          >
            Reintentar consulta
          </Button>
        </Card>
      ) : activeTab === 'ROLES' ? (
        // ================= TAB 1: ROLES LIST & ACCORDIONS =================
        filteredRoles.length === 0 ? (
          <Card className="bg-[#111114] border-white/5 p-12 rounded-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto text-purple-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">
                {hasActiveFilters ? "Sin resultados" : "No hay roles registrados todavía."}
              </h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto">
                {hasActiveFilters
                  ? "No se encontraron roles o permisos con los filtros seleccionados."
                  : "No hay roles registrados todavía."}
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
            {filteredRoles.map((roleDef) => {
              const isExpanded = !!expandedRoleCards[roleDef.code];
              const assignedUsers = roleUsersMap[roleDef.code] || [];

              return (
                <Card
                  key={roleDef.code}
                  className="bg-[#111114] border-white/5 rounded-2xl overflow-hidden shadow-xl transition-all"
                >
                  {/* Role Header Accordion */}
                  <div
                    role="button"
                    tabIndex={0}
                    aria-expanded={isExpanded}
                    onClick={() => toggleRoleAccordion(roleDef.code)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleRoleAccordion(roleDef.code);
                      }
                    }}
                    className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.02] transition-colors border-b border-transparent focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                  >
                    <div className="flex items-start md:items-center gap-3.5">
                      <button
                        type="button"
                        aria-label={isExpanded ? 'Contraer rol' : 'Expandir rol'}
                        className="mt-0.5 md:mt-0 text-slate-400 hover:text-white transition-transform"
                      >
                        <ChevronRight
                          className={`w-5 h-5 transition-transform duration-200 ${
                            isExpanded ? 'rotate-90 text-purple-400' : 'text-slate-500'
                          }`}
                        />
                      </button>

                      <div className="w-11 h-11 rounded-2xl bg-[#16161a] border border-white/5 flex items-center justify-center shrink-0">
                        <Shield className="w-5 h-5 text-purple-400" />
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-bold text-white tracking-tight">
                            {roleDef.name}
                          </h3>
                          <Badge className="bg-purple-950/40 text-purple-300 border-purple-800/30 text-[10px] font-mono font-bold uppercase py-0.5 px-2">
                            {roleDef.code}
                          </Badge>
                          {getScopeBadge(roleDef.scopeType)}
                          <Badge className="bg-slate-800 text-slate-400 border-slate-700 text-[10px] py-0.5 px-2">
                            {roleDef.hierarchyLabel}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                          {roleDef.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end md:self-center">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                          Activo
                        </span>
                      </div>

                      <Badge className="bg-slate-800 text-slate-300 border-slate-700 text-xs font-bold px-2.5 py-1 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-purple-400" />
                        {assignedUsers.length} usuarios
                      </Badge>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRoleForDetail(roleDef);
                        }}
                        className="text-slate-400 hover:text-white hover:bg-white/5 h-9 px-3 rounded-xl text-xs"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1.5" />
                        Detalle del Rol
                      </Button>
                    </div>
                  </div>

                  {/* Role Expanded Body */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-white/5 bg-[#0e0e11]"
                      >
                        <div className="p-5 space-y-5">
                          {/* Modules & Permissions Ribbon */}
                          <div className="space-y-2">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                              Módulos Autorizados ({roleDef.allowedModuleCodes.length})
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {roleDef.allowedModuleCodes.map(modCode => {
                                const modMeta = MODULE_REGISTRY[modCode];
                                return (
                                  <div
                                    key={modCode}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#16161a] border border-white/5 rounded-xl text-xs text-slate-300"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                    <span className="font-semibold text-white">{modMeta?.name || modCode}</span>
                                    <span className="font-mono text-[10px] text-slate-500">({modCode})</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Responsibilities */}
                          <div className="space-y-2">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                              Alcance de Responsabilidades
                            </span>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {roleDef.responsibilities.map((resp, idx) => (
                                <div key={idx} className="p-2.5 bg-[#16161a] border border-white/5 rounded-xl text-xs text-slate-300 flex items-start gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                                  <span>{resp}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Assigned Users Sample */}
                          <div className="space-y-2 pt-2 border-t border-white/5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                Usuarios Asignados en Plataforma ({assignedUsers.length})
                              </span>
                              {assignedUsers.length > 3 && (
                                <button
                                  onClick={() => setSelectedRoleForDetail(roleDef)}
                                  className="text-[11px] text-purple-400 hover:text-purple-300 font-semibold"
                                >
                                  Ver todos ({assignedUsers.length}) &rarr;
                                </button>
                              )}
                            </div>

                            {assignedUsers.length === 0 ? (
                              <div className="p-4 text-center text-xs text-slate-500 bg-[#16161a] rounded-xl border border-white/5">
                                No hay usuarios asignados a este rol actualmente.
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                {assignedUsers.slice(0, 3).map((u) => (
                                  <div
                                    key={u.id}
                                    className="p-2.5 bg-[#16161a] border border-white/5 rounded-xl text-xs flex items-center justify-between"
                                  >
                                    <div className="truncate">
                                      <div className="font-bold text-white truncate">{u.displayName}</div>
                                      <div className="text-[10px] text-slate-400 truncate">{u.email}</div>
                                    </div>
                                    <Badge className="bg-slate-800 text-slate-400 border-slate-700 text-[9px] shrink-0 ml-2">
                                      {u.clientName}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              );
            })}
          </div>
        )
      ) : (
        // ================= TAB 2: PERMISSIONS & ACTIONS MATRIX =================
        <div className="space-y-4">
          {/* Actions Catalog Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {filteredActions.map((action) => (
              <Card
                key={action.code}
                onClick={() => setSelectedActionForDetail(action)}
                className="bg-[#111114] hover:bg-[#16161a] border-white/5 hover:border-purple-500/30 p-4 rounded-2xl cursor-pointer transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                      <Key className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                      {action.code}
                    </span>
                  </div>
                  <Badge className="bg-slate-800 text-slate-400 border-slate-700 text-[9px] uppercase">
                    {action.category}
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2">
                  {action.description}
                </p>
                <div className="flex items-center justify-between text-[10px] text-purple-400 pt-1 border-t border-white/5">
                  <span>Ver matriz de rol</span>
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Card>
            ))}
          </div>

          {/* Full Canonical RBAC Matrix Table */}
          <Card className="bg-[#111114] border-white/5 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Matriz de Acceso Canónica por Módulo</h3>
                <p className="text-xs text-slate-400">
                  Nivel de permisos preconfigurados por rol en cada módulo del sistema
                </p>
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-bold uppercase">
                Solo Lectura
              </Badge>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#16161a] border-b border-white/5 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="py-3.5 px-4 sticky left-0 bg-[#16161a] z-10 min-w-[200px]">Módulo</th>
                    <th className="py-3.5 px-3 text-center min-w-[120px]">Superadmin</th>
                    <th className="py-3.5 px-3 text-center min-w-[120px]">Admin Campaña</th>
                    <th className="py-3.5 px-3 text-center min-w-[120px]">Director</th>
                    <th className="py-3.5 px-3 text-center min-w-[120px]">Coordinador</th>
                    <th className="py-3.5 px-3 text-center min-w-[120px]">Operador</th>
                    <th className="py-3.5 px-3 text-center min-w-[120px]">Solo Lectura</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {(Object.keys(MODULE_REGISTRY) as CanonicalModuleCode[])
                    .filter(mKey => selectedModuleFilter === 'ALL' || mKey === selectedModuleFilter)
                    .map((modCode) => {
                      const mod = MODULE_REGISTRY[modCode];

                      return (
                        <tr key={modCode} className="hover:bg-white/[0.02] transition-colors">
                          {/* Module Info */}
                          <td className="py-3.5 px-4 sticky left-0 bg-[#111114] z-10">
                            <div className="font-bold text-white">{mod.name}</div>
                            <div className="font-mono text-[10px] text-purple-400">{modCode}</div>
                          </td>

                          {/* SUPERADMIN */}
                          <td className="py-3.5 px-3 text-center">
                            <Badge className="bg-rose-500/10 text-rose-300 border-rose-500/20 text-[10px] font-bold">
                              TOTAL (ALL)
                            </Badge>
                          </td>

                          {/* ADMIN_CLIENTE */}
                          <td className="py-3.5 px-3 text-center">
                            {modCode === 'ANALYSIS' ? (
                              <span className="text-slate-600 font-mono text-[11px]">-</span>
                            ) : (
                              <div className="flex flex-wrap justify-center gap-1">
                                <Badge className="bg-purple-950/40 text-purple-300 border-purple-800/30 text-[9px]">VIEW</Badge>
                                <Badge className="bg-purple-950/40 text-purple-300 border-purple-800/30 text-[9px]">CREATE</Badge>
                                <Badge className="bg-purple-950/40 text-purple-300 border-purple-800/30 text-[9px]">EDIT</Badge>
                                <Badge className="bg-purple-950/40 text-purple-300 border-purple-800/30 text-[9px]">DELETE</Badge>
                              </div>
                            )}
                          </td>

                          {/* DIRECTOR */}
                          <td className="py-3.5 px-3 text-center">
                            <div className="flex flex-wrap justify-center gap-1">
                              <Badge className="bg-amber-950/40 text-amber-300 border-amber-800/30 text-[9px]">VIEW</Badge>
                              <Badge className="bg-amber-950/40 text-amber-300 border-amber-800/30 text-[9px]">CREATE</Badge>
                              <Badge className="bg-amber-950/40 text-amber-300 border-amber-800/30 text-[9px]">EDIT</Badge>
                              <Badge className="bg-amber-950/40 text-amber-300 border-amber-800/30 text-[9px]">MANAGE</Badge>
                            </div>
                          </td>

                          {/* COORDINADOR */}
                          <td className="py-3.5 px-3 text-center">
                            {modCode === 'TERRITORY' || modCode === 'CRM' ? (
                              <div className="flex flex-wrap justify-center gap-1">
                                <Badge className="bg-emerald-950/40 text-emerald-300 border-emerald-800/30 text-[9px]">VIEW</Badge>
                                <Badge className="bg-emerald-950/40 text-emerald-300 border-emerald-800/30 text-[9px]">CREATE</Badge>
                                <Badge className="bg-emerald-950/40 text-emerald-300 border-emerald-800/30 text-[9px]">EDIT</Badge>
                              </div>
                            ) : modCode === 'ELECTORAL' ? (
                              <div className="flex flex-wrap justify-center gap-1">
                                <Badge className="bg-emerald-950/40 text-emerald-300 border-emerald-800/30 text-[9px]">VIEW</Badge>
                                <Badge className="bg-emerald-950/40 text-emerald-300 border-emerald-800/30 text-[9px]">CREATE</Badge>
                              </div>
                            ) : (
                              <Badge className="bg-slate-800 text-slate-400 border-slate-700 text-[9px]">VIEW</Badge>
                            )}
                          </td>

                          {/* USUARIO */}
                          <td className="py-3.5 px-3 text-center">
                            <Badge className="bg-slate-800 text-slate-400 border-slate-700 text-[9px]">VIEW</Badge>
                          </td>

                          {/* USUARIO_LIMITADO */}
                          <td className="py-3.5 px-3 text-center">
                            {['ADMINISTRATIVE', 'TERRITORY', 'CRM'].includes(modCode) ? (
                              <Badge className="bg-slate-800 text-slate-400 border-slate-700 text-[9px]">VIEW</Badge>
                            ) : (
                              <span className="text-slate-600 font-mono text-[11px]">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ================= ROLE DETAIL MODAL (READ-ONLY) ================= */}
      <AnimatePresence>
        {selectedRoleForDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRoleForDetail(null)}
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
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold tracking-widest text-purple-400 uppercase">
                      Detalle de Rol Global (Solo Lectura)
                    </span>
                    <h2 className="text-xl font-bold text-white">{selectedRoleForDetail.name}</h2>
                    <span className="text-xs font-mono text-slate-500 uppercase">{selectedRoleForDetail.code}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedRoleForDetail(null)}
                  className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
                {/* Description */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Descripción del Alcance</span>
                  <p className="text-sm text-slate-200 bg-[#16161a] p-3.5 rounded-xl border border-white/5">
                    {selectedRoleForDetail.description}
                  </p>
                </div>

                {/* Scope & Hierarchy Attributes */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 bg-[#16161a] border border-white/5 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Jerarquía del Sistema</span>
                    <span className="font-bold text-slate-200">{selectedRoleForDetail.hierarchyLabel}</span>
                  </div>

                  <div className="p-3.5 bg-[#16161a] border border-white/5 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Ámbito Operativo</span>
                    <span className="font-bold text-slate-200">{selectedRoleForDetail.scopeLabel}</span>
                  </div>
                </div>

                {/* Responsibilities */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Responsabilidades Principales
                  </span>
                  <div className="space-y-1.5">
                    {selectedRoleForDetail.responsibilities.map((r, i) => (
                      <div key={i} className="p-2.5 bg-[#16161a] border border-white/5 rounded-xl text-xs text-slate-300 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Allowed Modules */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Módulos con Acceso ({selectedRoleForDetail.allowedModuleCodes.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedRoleForDetail.allowedModuleCodes.map((modCode) => (
                      <Badge key={modCode} className="bg-[#16161a] text-slate-300 border-white/10 text-xs py-1 px-2.5">
                        {MODULE_REGISTRY[modCode]?.name || modCode}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Users Assigned List */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Usuarios con este Rol Asignado ({(roleUsersMap[selectedRoleForDetail.code] || []).length})
                  </span>
                  <div className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                    {(roleUsersMap[selectedRoleForDetail.code] || []).length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-500 bg-[#16161a] rounded-xl border border-white/5">
                        No hay usuarios asignados a este rol actualmente.
                      </div>
                    ) : (
                      (roleUsersMap[selectedRoleForDetail.code] || []).map((u) => (
                        <div key={u.id} className="p-3 bg-[#16161a] border border-white/5 rounded-xl text-xs flex items-center justify-between">
                          <div>
                            <div className="font-bold text-white">{u.displayName}</div>
                            <div className="text-[10px] text-slate-400">{u.email}</div>
                          </div>
                          <div className="text-right">
                            <Badge className="bg-purple-950/30 text-purple-300 border-purple-800/30 text-[10px]">
                              {u.clientName}
                            </Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Read-Only Notice */}
                <div className="p-3 bg-purple-950/20 border border-purple-800/30 rounded-xl flex items-start gap-2.5 text-xs text-purple-300">
                  <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <p>
                    <strong>Fase de Consulta:</strong> En esta fase solo se permite la supervisión de roles y permisos existentes. La asignación o modificación de permisos se gestionará en las siguientes fases operativas.
                  </p>
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
                  onClick={() => setSelectedRoleForDetail(null)}
                  className="border-slate-800 bg-[#111114] hover:bg-slate-800 text-slate-200 text-xs rounded-xl"
                >
                  Cerrar
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= PERMISSION ACTION DETAIL MODAL (READ-ONLY) ================= */}
      <AnimatePresence>
        {selectedActionForDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedActionForDetail(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-[#121216] border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-white/5 flex items-start justify-between bg-gradient-to-b from-purple-500/10 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    <Key className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold tracking-widest text-purple-400 uppercase">
                      Detalle de Acción Canónica (Solo Lectura)
                    </span>
                    <h2 className="text-xl font-bold text-white">{selectedActionForDetail.label}</h2>
                    <span className="text-xs font-mono text-slate-500">{selectedActionForDetail.code}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedActionForDetail(null)}
                  className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Categoría de la Acción</span>
                  <Badge className="bg-purple-950/40 text-purple-300 border-purple-800/30 text-xs">
                    {selectedActionForDetail.category}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Descripción del Permiso</span>
                  <p className="text-xs text-slate-300 bg-[#16161a] p-3 rounded-xl border border-white/5 leading-relaxed">
                    {selectedActionForDetail.description}
                  </p>
                </div>

                {/* Roles that have this action */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Roles con este permiso habilitado
                  </span>
                  <div className="space-y-1.5">
                    {CANONICAL_SYSTEM_ROLES.map((r) => {
                      const hasAccess = 
                        selectedActionForDetail.code === 'VIEW' ? true :
                        r.code === UserRole.SUPERADMIN ||
                        (r.code === UserRole.ADMIN_CLIENTE && selectedActionForDetail.code !== 'CONFIGURE') ||
                        (r.code === UserRole.DIRECTOR && ['VIEW', 'CREATE', 'EDIT', 'MANAGE'].includes(selectedActionForDetail.code)) ||
                        (r.code === UserRole.COORDINADOR && ['VIEW', 'CREATE', 'EDIT'].includes(selectedActionForDetail.code));

                      return (
                        <div
                          key={r.code}
                          className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                            hasAccess
                              ? 'bg-[#16161a] border-white/5 text-white'
                              : 'bg-[#101014] border-white/5 text-slate-500 opacity-60'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {hasAccess ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5 text-slate-600" />
                            )}
                            <span className="font-semibold">{r.name}</span>
                          </div>
                          <span className="text-[10px] font-mono">{r.code}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Read-Only Notice */}
                <div className="p-3 bg-purple-950/20 border border-purple-800/30 rounded-xl flex items-start gap-2.5 text-xs text-purple-300">
                  <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <p>
                    <strong>Fase de Consulta:</strong> En esta fase solo se permite la supervisión de roles y permisos existentes.
                  </p>
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
                  onClick={() => setSelectedActionForDetail(null)}
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
