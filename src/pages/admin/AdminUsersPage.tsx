import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Search, 
  Filter, 
  RefreshCw, 
  Shield, 
  ShieldCheck, 
  Mail, 
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
  Phone,
  User as UserIcon,
  Briefcase
} from 'lucide-react';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { Input } from '@/src/components/ui/Input';
import { useAuth } from '@/src/contexts/AuthContext';
import { supabase } from '@/src/lib/supabase';
import { UserRole } from '@/src/types';

export interface GlobalUserProfile {
  id: string;
  email: string;
  display_name: string;
  role: UserRole | string;
  client_id?: string | null;
  client_name?: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | string;
  created_at: string;
  allowed_modules?: string[];
  phone?: string | null;
  permissions?: Record<string, any>;
  last_login?: string | null;
}

export interface SimpleClient {
  id: string;
  name: string;
  email?: string;
  plan?: string;
  status?: string;
}

export default function AdminUsersPage() {
  const { user } = useAuth();
  const isSuperadmin = user?.role === UserRole.SUPERADMIN;

  const [usersList, setUsersList] = useState<GlobalUserProfile[]>([]);
  const [clientsList, setClientsList] = useState<SimpleClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedClient, setSelectedClient] = useState<string>('ALL');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Detail Modal state
  const [selectedUser, setSelectedUser] = useState<GlobalUserProfile | null>(null);

  const fetchGlobalUsers = async () => {
    if (!isSuperadmin || !supabase) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Fetch clients for cross-referencing
      const { data: clientsData, error: clientsErr } = await supabase
        .from('clients')
        .select('id, name, email, plan, status');

      const clientsMap: Record<string, SimpleClient> = {};
      if (clientsData && Array.isArray(clientsData)) {
        setClientsList(clientsData);
        clientsData.forEach(c => {
          clientsMap[c.id] = c;
        });
      }

      // 2. Fetch profiles from database
      const { data: profilesData, error: profilesErr } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesErr) {
        throw profilesErr;
      }

      // 3. Map profiles with client metadata
      const mapped: GlobalUserProfile[] = (profilesData || []).map(p => {
        const client = p.client_id ? clientsMap[p.client_id] : null;
        return {
          id: p.id,
          email: p.email || '',
          display_name: p.display_name || p.email?.split('@')[0] || 'Usuario Sin Nombre',
          role: p.role || UserRole.USUARIO,
          client_id: p.client_id || null,
          client_name: client ? client.name : (p.role === UserRole.SUPERADMIN ? 'Administración Global' : 'Sin Organización'),
          status: p.status || (p.is_active === false ? 'INACTIVE' : 'ACTIVE'),
          created_at: p.created_at || new Date().toISOString(),
          allowed_modules: Array.isArray(p.allowed_modules) ? p.allowed_modules : [],
          phone: p.phone || null,
          permissions: p.permissions || {},
          last_login: p.last_login || null
        };
      });

      setUsersList(mapped);
    } catch (err: any) {
      console.error('Error fetching global users:', err);
      setError(err.message || 'No fue posible cargar los usuarios globales.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalUsers();
  }, [isSuperadmin]);

  // Filtered users calculation
  const filteredUsers = useMemo(() => {
    return usersList.filter(u => {
      const matchesSearch = 
        u.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.client_name && u.client_name.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesRole = selectedRole === 'ALL' || u.role === selectedRole;
      const matchesStatus = selectedStatus === 'ALL' || u.status === selectedStatus;
      const matchesClient = selectedClient === 'ALL' || 
        (selectedClient === 'GLOBAL' ? !u.client_id : u.client_id === selectedClient);

      return matchesSearch && matchesRole && matchesStatus && matchesClient;
    });
  }, [usersList, searchTerm, selectedRole, selectedStatus, selectedClient]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedRole, selectedStatus, selectedClient]);

  // Pagination slicing
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedRole('ALL');
    setSelectedStatus('ALL');
    setSelectedClient('ALL');
  };

  // Helper for role badge colors
  const getRoleBadge = (role: string) => {
    switch (role) {
      case UserRole.SUPERADMIN:
      case 'SUPERADMIN':
        return <Badge className="bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold text-[10px] tracking-wider uppercase">SUPERADMIN</Badge>;
      case UserRole.ADMIN_CLIENTE:
      case 'ADMIN_CLIENTE':
        return <Badge className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold text-[10px] tracking-wider uppercase">ADMIN CLIENTE</Badge>;
      case UserRole.DIRECTOR:
      case 'DIRECTOR':
        return <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-[10px] tracking-wider uppercase">DIRECTOR</Badge>;
      case UserRole.COORDINADOR:
      case 'COORDINADOR':
        return <Badge className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold text-[10px] tracking-wider uppercase">COORDINADOR</Badge>;
      case UserRole.USUARIO_LIMITADO:
      case 'USUARIO_LIMITADO':
        return <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold text-[10px] tracking-wider uppercase">LIMITADO</Badge>;
      default:
        return <Badge className="bg-slate-500/10 text-slate-400 border border-slate-500/20 font-bold text-[10px] tracking-wider uppercase">USUARIO</Badge>;
    }
  };

  // Helper for status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
      case 'ACTIVO':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full w-fit">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Activo</span>
          </div>
        );
      case 'SUSPENDED':
      case 'SUSPENDIDO':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-500/10 border border-rose-500/20 rounded-full w-fit">
            <div className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">Suspendido</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-500/10 border border-slate-500/20 rounded-full w-fit">
            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inactivo</span>
          </div>
        );
    }
  };

  // Security Check: strictly Superadmin only
  if (!isSuperadmin) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center rounded-[32px] bg-[#111114] border border-rose-500/20 space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white">Acceso Denegado</h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            No tienes permisos para acceder a la gestión de usuarios globales.
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
            <h1 className="text-3xl font-bold text-white tracking-tight">Gestión de Usuarios Globales</h1>
            <Badge className="bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold uppercase text-[10px] tracking-wider py-0.5 px-2.5">
              Superadmin
            </Badge>
          </div>
          <p className="text-sm text-slate-400">
            Consulta y supervisión de usuarios registrados en la plataforma
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchGlobalUsers}
            disabled={loading}
            className="gap-2 border-white/10 hover:bg-white/5 text-slate-300 font-bold text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-purple-400' : ''}`} />
            Sincronizar
          </Button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <Card className="p-4 sm:p-6 rounded-[28px] bg-[#111114] border border-white/5 shadow-xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <Input 
              type="text"
              placeholder="Buscar por nombre o correo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-xs text-white placeholder:text-slate-500 rounded-xl focus:border-purple-500"
            />
          </div>

          {/* Role Filter */}
          <div className="relative">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full bg-[#18181b] border border-white/10 text-xs text-slate-300 rounded-xl px-3 py-2.5 focus:border-purple-500 outline-none transition-all"
            >
              <option value="ALL">Todos los Roles</option>
              <option value={UserRole.SUPERADMIN}>SUPERADMIN</option>
              <option value={UserRole.ADMIN_CLIENTE}>ADMIN CLIENTE</option>
              <option value={UserRole.DIRECTOR}>DIRECTOR</option>
              <option value={UserRole.COORDINADOR}>COORDINADOR</option>
              <option value={UserRole.USUARIO}>USUARIO</option>
              <option value={UserRole.USUARIO_LIMITADO}>USUARIO LIMITADO</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-[#18181b] border border-white/10 text-xs text-slate-300 rounded-xl px-3 py-2.5 focus:border-purple-500 outline-none transition-all"
            >
              <option value="ALL">Todos los Estados</option>
              <option value="ACTIVE">Activo</option>
              <option value="INACTIVE">Inactivo</option>
              <option value="SUSPENDED">Suspendido</option>
            </select>
          </div>

          {/* Client / Organization Filter */}
          <div className="relative">
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full bg-[#18181b] border border-white/10 text-xs text-slate-300 rounded-xl px-3 py-2.5 focus:border-purple-500 outline-none transition-all"
            >
              <option value="ALL">Todas las Organizaciones</option>
              <option value="GLOBAL">Administración Global (Sin Tenant)</option>
              {clientsList.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filters Summary & Reset */}
        {(searchTerm || selectedRole !== 'ALL' || selectedStatus !== 'ALL' || selectedClient !== 'ALL') && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-purple-400" />
              <span>Filtros activos aplicados</span>
            </div>
            <button 
              onClick={handleClearFilters}
              className="text-purple-400 hover:text-purple-300 text-xs font-bold hover:underline"
            >
              Limpiar todos los filtros
            </button>
          </div>
        )}
      </Card>

      {/* Main Content Area */}
      <Card className="rounded-[32px] bg-[#111114] border border-white/5 shadow-2xl overflow-hidden">
        {loading ? (
          /* Loading State */
          <div className="min-h-[380px] flex flex-col items-center justify-center p-8 text-center space-y-4">
            <Loader2 className="w-10 h-10 text-purple-500 animate-spin mx-auto" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-white tracking-wide">Sincronizando Usuarios Globales...</p>
              <p className="text-xs text-slate-500">Consultando perfiles registrados en el ecosistema</p>
            </div>
          </div>
        ) : error ? (
          /* Error State */
          <div className="min-h-[380px] flex flex-col items-center justify-center p-8 sm:p-12 text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">No fue posible cargar los usuarios globales.</h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                Verifica tu conexión e inténtalo nuevamente.
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchGlobalUsers}
              className="gap-2 border-white/10 hover:bg-white/5 text-slate-300 font-bold text-xs"
            >
              <RefreshCw className="w-4 h-4" /> Reintentar
            </Button>
          </div>
        ) : usersList.length === 0 ? (
          /* Empty State (No users in entire database) */
          <div className="min-h-[380px] flex flex-col items-center justify-center p-8 sm:p-12 text-center space-y-3">
            <Users className="w-14 h-14 text-slate-600 stroke-[1.5] mx-auto" />
            <h3 className="text-base sm:text-lg font-bold text-slate-300">
              No hay usuarios globales registrados todavía.
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Aún no se han dado de alta usuarios en la plataforma.
            </p>
          </div>
        ) : filteredUsers.length === 0 ? (
          /* No search results */
          <div className="min-h-[380px] flex flex-col items-center justify-center p-8 sm:p-12 text-center space-y-3">
            <Search className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base sm:text-lg font-bold text-slate-300">
              No se encontraron usuarios con los filtros seleccionados.
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-2">
              Prueba modificando los términos de búsqueda o limpiando los filtros.
            </p>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClearFilters}
              className="text-purple-400 hover:text-purple-300 font-bold text-xs"
            >
              Restablecer filtros
            </Button>
          </div>
        ) : (
          /* Table & Desktop View */
          <div>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02] text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <th className="px-6 py-4">Usuario</th>
                    <th className="px-6 py-4">Rol del Sistema</th>
                    <th className="px-6 py-4">Organización / Cliente</th>
                    <th className="px-6 py-4">Estado</th>
                    <th className="px-6 py-4">Registro</th>
                    <th className="px-6 py-4 text-right">Detalle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs">
                  {paginatedUsers.map((u) => (
                    <tr 
                      key={u.id}
                      className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                      onClick={() => setSelectedUser(u)}
                    >
                      {/* User identity */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold shrink-0">
                            {u.display_name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-white truncate group-hover:text-purple-300 transition-colors">
                              {u.display_name}
                            </p>
                            <p className="text-[11px] text-slate-400 flex items-center gap-1 truncate">
                              <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                              {u.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* System Role */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRoleBadge(u.role)}
                      </td>

                      {/* Organization / Client */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="truncate max-w-[180px]" title={u.client_name || 'Sin Organización'}>
                            {u.client_name || 'Sin Organización'}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(u.status)}
                      </td>

                      {/* Registration Date */}
                      <td className="px-6 py-4 text-slate-400 whitespace-nowrap text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          {new Date(u.created_at).toLocaleDateString('es-CO', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUser(u);
                          }}
                          className="p-2 h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl"
                          title="Ver detalle del usuario"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="p-4 sm:p-6 bg-white/[0.01] border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                Mostrando {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredUsers.length)} de {filteredUsers.length} usuarios
              </p>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="gap-1 text-xs text-slate-400 hover:text-white disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" /> Anterior
                </Button>
                
                <span className="text-xs text-slate-400 px-2 font-medium">
                  Página {currentPage} de {totalPages}
                </span>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage >= totalPages}
                  className="gap-1 text-xs text-purple-400 hover:text-purple-300 disabled:opacity-30"
                >
                  Siguiente <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* User Detail Read-Only Modal */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[80] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[#111114] border border-white/10 rounded-[32px] w-full max-w-2xl overflow-hidden shadow-2xl my-8"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold">
                    <UserIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">Expediente de Usuario</h3>
                    <p className="text-xs text-slate-500">Consulta de datos del perfil global (Modo Solo Lectura)</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedUser(null)}
                  className="text-slate-500 hover:text-white transition-colors p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
                {/* User Identity Banner */}
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600/30 to-indigo-600/30 border border-purple-500/30 flex items-center justify-center text-xl font-bold text-white shrink-0">
                      {selectedUser.display_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white">{selectedUser.display_name}</h4>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <Mail className="w-3.5 h-3.5 text-purple-400" />
                        {selectedUser.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-start sm:items-end gap-2">
                    {getRoleBadge(selectedUser.role)}
                    {getStatusBadge(selectedUser.status)}
                  </div>
                </div>

                {/* Grid of Profile Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Organization */}
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5">
                    <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                      <Building2 className="w-3.5 h-3.5 text-purple-400" />
                      Organización / Cliente
                    </div>
                    <p className="text-sm font-bold text-white">
                      {selectedUser.client_name || 'Administración Global'}
                    </p>
                    {selectedUser.client_id && (
                      <p className="text-[10px] text-slate-500 font-mono truncate">
                        ID: {selectedUser.client_id}
                      </p>
                    )}
                  </div>

                  {/* Contact / Phone */}
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5">
                    <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                      <Phone className="w-3.5 h-3.5 text-purple-400" />
                      Teléfono / WhatsApp
                    </div>
                    <p className="text-sm font-bold text-white">
                      {selectedUser.phone || 'No registrado'}
                    </p>
                  </div>

                  {/* Registration Date */}
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5">
                    <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                      <Calendar className="w-3.5 h-3.5 text-purple-400" />
                      Fecha de Registro
                    </div>
                    <p className="text-sm font-bold text-white">
                      {new Date(selectedUser.created_at).toLocaleString('es-CO', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>

                  {/* System Identifier */}
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5">
                    <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                      <Shield className="w-3.5 h-3.5 text-purple-400" />
                      Identificador de Usuario (UUID)
                    </div>
                    <p className="text-xs font-mono text-slate-400 truncate select-all" title={selectedUser.id}>
                      {selectedUser.id}
                    </p>
                  </div>
                </div>

                {/* Allowed Modules */}
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                    <Layers className="w-4 h-4 text-purple-400" />
                    Módulos Autorizados
                  </div>
                  {selectedUser.allowed_modules && selectedUser.allowed_modules.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedUser.allowed_modules.map((mod, i) => (
                        <Badge 
                          key={i} 
                          className="bg-white/5 border border-white/10 text-slate-300 text-xs py-1 px-3"
                        >
                          {mod}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">
                      Sin módulos específicos asignados (Aplica permisos por rol predeterminado).
                    </p>
                  )}
                </div>

                {/* Phase 1 Advisory Notice */}
                <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/15 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5 text-xs">
                    <p className="font-bold text-purple-300">Fase 1: Consulta y Auditoría Segura</p>
                    <p className="text-slate-400">
                      Esta vista es de solo lectura. Las opciones de edición, asignación de roles y suspensión de cuentas se habilitarán en la siguiente fase tras la validación de políticas globales.
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-white/5 flex items-center justify-end bg-white/[0.01]">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedUser(null)}
                  className="border-white/10 hover:bg-white/5 text-slate-300 text-xs font-bold"
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
