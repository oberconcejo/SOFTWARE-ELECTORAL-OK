import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  MoreVertical, 
  Shield, 
  Lock, 
  Mail, 
  Phone,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronRight,
  Settings,
  Eye,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { Badge } from '@/src/components/ui/Badge';
import { useAuth } from '@/src/contexts/AuthContext';
import { User, UserRole, Permission, ModuleFunction } from '@/src/types';
import { MODULE_FUNCTIONS } from '@/src/config/moduleFunctions';
import { supabase } from '@/src/lib/supabase';

import { UserCreationForm } from '@/src/modules/administrative/components/UserCreationForm';
import { usePermissions } from '@/src/hooks/usePermissions';
import { PermissionGuard } from '@/src/components/auth/PermissionGuard';

export default function UsersManagementPage() {
  const { user: currentUser, client, license } = useAuth();
  const { hasPermission } = usePermissions();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form State for New/Edit User
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: UserRole.USUARIO,
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
    allowedModules: [] as string[],
    permissions: [] as any[]
  });

  useEffect(() => {
    fetchUsers();
  }, [currentUser?.tenantId]);

  const fetchUsers = async () => {
    if (!currentUser?.tenantId) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('client_id', currentUser.tenantId);

      if (error) throw error;
      
      const mappedUsers: User[] = data.map(p => ({
        id: p.id,
        email: p.email,
        displayName: p.display_name,
        role: p.role as UserRole,
        tenantId: p.client_id,
        status: p.status,
        allowedModules: p.allowed_modules || []
      }));

      setUsers(mappedUsers);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* User Creation Modal */}
      <AnimatePresence>
        {isAddingUser && (
          <UserCreationForm 
            onClose={() => setIsAddingUser(false)}
            onSuccess={fetchUsers}
            allowedModules={license?.allowedModules || []}
          />
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Administración de Usuarios</h1>
          <p className="text-slate-400">Gestiona los accesos y permisos de tu organización.</p>
        </div>
        <PermissionGuard moduleCode="ADMINISTRATIVE" functionCode="USERS" action="CREATE">
          <Button 
            onClick={() => setIsAddingUser(true)}
            className="gap-2 bg-indigo-600 hover:bg-indigo-500"
          >
            <UserPlus className="w-4 h-4" /> Nuevo Usuario
          </Button>
        </PermissionGuard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <Card className="bg-indigo-500/5 border-indigo-500/20">
          <div className="p-4">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Usuarios Activos</p>
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-white">{users.filter(u => u.status === 'ACTIVE').length}</h3>
              <Badge variant="primary">Límite: {license?.maxUsers || 'N/A'}</Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Buscar por nombre o correo..." 
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2 bg-white/5">
            <Filter className="w-4 h-4" /> Filtros
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nombre</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Rol</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Módulos</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Estado</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              [1, 2, 3].map(i => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={5} className="px-6 py-8 bg-white/5" />
                </tr>
              ))
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                  No se encontraron usuarios.
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center font-bold">
                        {u.displayName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{u.displayName}</p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="neutral" className="text-[10px]">
                      {u.role.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {u.allowedModules.map(mod => (
                        <span key={mod} className="text-[10px] bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/20">
                          {mod}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {u.status === 'ACTIVE' ? (
                      <span className="flex items-center gap-1.5 text-emerald-500 text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Activo
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-slate-500 text-xs font-bold">
                        <XCircle className="w-3.5 h-3.5" /> Inactivo
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <PermissionGuard moduleCode="ADMINISTRATIVE" functionCode="USERS" action="EDIT">
                        <button className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                      </PermissionGuard>
                      <PermissionGuard moduleCode="ADMINISTRATIVE" functionCode="USERS" action="MANAGE">
                        <button className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
                          <Settings className="w-4 h-4" />
                        </button>
                      </PermissionGuard>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
