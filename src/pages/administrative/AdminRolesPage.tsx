import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Trash2, 
  Settings, 
  ShieldCheck, 
  Check, 
  X, 
  Key, 
  Layers, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  Lock,
  Compass,
  MapPin,
  Briefcase
} from 'lucide-react';
import { supabase } from '@/src/lib/supabase';
import { useAuth } from '@/src/contexts/AuthContext';
import { useAdministrativeData } from '@/src/hooks/useAdministrativeData';
import { UserRole, Permission, User } from '@/src/types';

interface RolePermissionMatrix {
  moduleCode: string;
  moduleName: string;
  functions: {
    code: string;
    name: string;
    actions: {
      action: Permission;
      label: string;
      granted: boolean;
    }[];
  }[];
}

const DEFAULT_MODULE_PERMISSIONS: RolePermissionMatrix[] = [
  {
    moduleCode: 'ADMINISTRATIVE',
    moduleName: 'Gestión Administrativa',
    functions: [
      {
        code: 'ADMIN_DASHBOARD',
        name: 'Dashboard / Inicio',
        actions: [
          { action: 'VIEW', label: 'Ver', granted: true },
          { action: 'EXPORT', label: 'Exportar', granted: false }
        ]
      },
      {
        code: 'ROLES_MANAGEMENT',
        name: 'Gestión de Roles',
        actions: [
          { action: 'VIEW', label: 'Ver', granted: true },
          { action: 'CREATE', label: 'Crear', granted: true },
          { action: 'EDIT', label: 'Editar', granted: true },
          { action: 'DELETE', label: 'Eliminar', granted: false }
        ]
      },
      {
        code: 'LEADERS_VOTERS',
        name: 'Líderes y Votantes',
        actions: [
          { action: 'VIEW', label: 'Ver', granted: true },
          { action: 'CREATE', label: 'Crear', granted: true },
          { action: 'EDIT', label: 'Editar', granted: true },
          { action: 'DELETE', label: 'Eliminar', granted: false },
          { action: 'EXPORT', label: 'Exportar', granted: true }
        ]
      },
      {
        code: 'BUDGET_CNE',
        name: 'Presupuesto / CNE',
        actions: [
          { action: 'VIEW', label: 'Ver', granted: true },
          { action: 'CREATE', label: 'Registrar', granted: true },
          { action: 'EDIT', label: 'Editar', granted: false },
          { action: 'EXPORT', label: 'Exportar', granted: true }
        ]
      },
      {
        code: 'CAMPAIGN_MANAGEMENT',
        name: 'Gestión de Campaña',
        actions: [
          { action: 'VIEW', label: 'Ver', granted: true },
          { action: 'CREATE', label: 'Crear', granted: true },
          { action: 'EDIT', label: 'Editar', granted: true }
        ]
      },
      {
        code: 'WITNESSES_MANAGEMENT',
        name: 'Gestión de Testigos',
        actions: [
          { action: 'VIEW', label: 'Ver', granted: true },
          { action: 'CREATE', label: 'Crear', granted: true },
          { action: 'EDIT', label: 'Editar', granted: true },
          { action: 'EXPORT', label: 'Exportar', granted: true }
        ]
      },
      {
        code: 'JURORS_MANAGEMENT',
        name: 'Jurados Electorales',
        actions: [
          { action: 'VIEW', label: 'Ver', granted: true },
          { action: 'CREATE', label: 'Registrar', granted: true },
          { action: 'EDIT', label: 'Editar', granted: true },
          { action: 'EXPORT', label: 'Exportar', granted: true }
        ]
      },
      {
        code: 'POLLS_SURVEYS',
        name: 'Encuestas y Sondeos',
        actions: [
          { action: 'VIEW', label: 'Ver', granted: true },
          { action: 'CREATE', label: 'Crear', granted: true },
          { action: 'EXPORT', label: 'Exportar', granted: true }
        ]
      }
    ]
  },
  {
    moduleCode: 'STRATEGY',
    moduleName: 'Gestión Estratégica',
    functions: [
      {
        code: 'STRATEGY_DAFO',
        name: 'Matriz DAFO de IA',
        actions: [
          { action: 'VIEW', label: 'Ver', granted: true },
          { action: 'EDIT', label: 'Modificar', granted: true }
        ]
      },
      {
        code: 'STRATEGY_BUDGET',
        name: 'Control Presupuestario & OCR',
        actions: [
          { action: 'VIEW', label: 'Ver', granted: true },
          { action: 'CREATE', label: 'Subir Factura', granted: true }
        ]
      },
      {
        code: 'STRATEGY_AGENDA',
        name: 'Agenda del Candidato',
        actions: [
          { action: 'VIEW', label: 'Ver', granted: true },
          { action: 'EDIT', label: 'Editar Eventos', granted: true }
        ]
      }
    ]
  },
  {
    moduleCode: 'TERRITORY',
    moduleName: 'Gestión Territorial',
    functions: [
      {
        code: 'TERRITORY_VOTERS',
        name: 'Registro de Votantes',
        actions: [
          { action: 'VIEW', label: 'Ver', granted: true },
          { action: 'CREATE', label: 'Registrar', granted: true }
        ]
      },
      {
        code: 'TERRITORY_MESSAGING',
        name: 'Mensajería Masiva WhatsApp/SMS',
        actions: [
          { action: 'VIEW', label: 'Ver', granted: true },
          { action: 'CREATE', label: 'Enviar Campaña', granted: true }
        ]
      },
      {
        code: 'TERRITORY_DAY_E',
        name: 'Coordinación Testigos & Jurados',
        actions: [
          { action: 'VIEW', label: 'Ver', granted: true },
          { action: 'EDIT', label: 'Asignar Mesas', granted: true }
        ]
      }
    ]
  }
];

export default function AdminRolesPage() {
  const { user: currentUser, client } = useAuth();
  const { subusers, refresh, loading } = useAdministrativeData();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Registration Modal State
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('COORDINADOR');
  const [selectedModule, setSelectedModule] = useState<string>('ADMINISTRATIVE');
  const [isActiveStatus, setIsActiveStatus] = useState<boolean>(true);
  const [savingUser, setSavingUser] = useState<boolean>(false);
  const [modalMessage, setModalMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Permission Matrix Modal State
  const [isPermModalOpen, setIsPermModalOpen] = useState(false);
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [permissionMatrix, setPermissionMatrix] = useState<RolePermissionMatrix[]>(DEFAULT_MODULE_PERMISSIONS);
  const [savingPerms, setSavingPerms] = useState(false);

  // Calculate dynamic users per module for the 3 top cards
  const adminUsers = subusers.filter(u => 
    u.role === UserRole.SUPERADMIN || 
    u.role === UserRole.ADMIN_CLIENTE || 
    (u.allowedModules && u.allowedModules.includes('ADMINISTRATIVE')) ||
    (!u.allowedModules || u.allowedModules.length === 0)
  );

  const strategyUsers = subusers.filter(u => 
    u.role === UserRole.SUPERADMIN || 
    u.role === UserRole.DIRECTOR || 
    (u.allowedModules && u.allowedModules.includes('STRATEGY'))
  );

  const territoryUsers = subusers.filter(u => 
    u.role === UserRole.SUPERADMIN || 
    u.role === UserRole.COORDINADOR || 
    (u.allowedModules && u.allowedModules.includes('TERRITORY'))
  );

  // Display summary strings
  const formatUserNames = (userList: User[], max = 2) => {
    if (userList.length === 0) return 'Sin usuarios asignados';
    const names = userList.map(u => u.displayName || u.email.split('@')[0]);
    if (names.length <= max) return `${userList.length} Usuarios: ${names.join(', ')}`;
    return `${userList.length} Usuarios: ${names.slice(0, max).join(', ')} (+${names.length - max})`;
  };

  // Filtered subusers list
  const filteredUsers = subusers.filter(u => 
    (u.displayName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.role || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Quick module change for a user
  const handleModuleChange = async (userId: string, newModule: string) => {
    try {
      const modules = newModule === 'ALL' 
        ? ['ADMINISTRATIVE', 'STRATEGY', 'TERRITORY', 'CRM', 'ELECTORAL'] 
        : [newModule];

      const { error } = await supabase
        .from('profiles')
        .update({ allowed_modules: modules })
        .eq('id', userId);

      if (error) throw error;
      await refresh();
    } catch (err: any) {
      console.error('Error actualizando módulo asignado:', err);
    }
  };

  // Quick status toggle
  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      const { error } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', userId);

      if (error) throw error;
      await refresh();
    } catch (err: any) {
      console.error('Error actualizando estado de usuario:', err);
    }
  };

  // Delete/Deactivate user
  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (!window.confirm(`¿Está seguro de revocar el acceso de ${userEmail}?`)) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'INACTIVE' })
        .eq('id', userId);

      if (error) throw error;
      await refresh();
    } catch (err: any) {
      console.error('Error revocando acceso:', err);
    }
  };

  // Open Permissions matrix modal
  const openPermissionsModal = (target: User) => {
    setTargetUser(target);
    // Clone default permissions
    const matrixClone = JSON.parse(JSON.stringify(DEFAULT_MODULE_PERMISSIONS));
    setPermissionMatrix(matrixClone);
    setIsPermModalOpen(true);
  };

  const handleToggleMatrixAction = (mIndex: number, fIndex: number, aIndex: number) => {
    const updated = [...permissionMatrix];
    updated[mIndex].functions[fIndex].actions[aIndex].granted = 
      !updated[mIndex].functions[fIndex].actions[aIndex].granted;
    setPermissionMatrix(updated);
  };

  const handleSaveUserPermissions = async () => {
    if (!targetUser) return;
    setSavingPerms(true);
    try {
      // Save granted permissions configuration
      const { error } = await supabase
        .from('profiles')
        .update({
          permissions: permissionMatrix,
          updated_at: new Date().toISOString()
        })
        .eq('id', targetUser.id);

      if (error) throw error;
      setIsPermModalOpen(false);
      await refresh();
    } catch (err: any) {
      console.error('Error guardando permisos:', err);
    } finally {
      setSavingPerms(false);
    }
  };

  // Save new subuser
  const handleRegisterSubuser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !email.trim()) {
      setModalMessage({ text: 'El nombre y correo electrónico son obligatorios.', type: 'error' });
      return;
    }

    if (password && password !== confirmPassword) {
      setModalMessage({ text: 'Las contraseñas no coinciden.', type: 'error' });
      return;
    }

    setSavingUser(true);
    setModalMessage(null);

    try {
      const clientId = currentUser?.tenantId || client?.id;
      const fullName = `${nombre.trim()} ${apellido.trim()}`.trim();
      const modules = selectedModule === 'ALL'
        ? ['ADMINISTRATIVE', 'STRATEGY', 'TERRITORY', 'CRM', 'ELECTORAL']
        : [selectedModule];

      // Insert profile in Supabase profiles
      const { data, error } = await supabase.from('profiles').insert([
        {
          client_id: clientId,
          display_name: fullName,
          email: email.trim().toLowerCase(),
          role: selectedRole,
          status: isActiveStatus ? 'ACTIVE' : 'INACTIVE',
          allowed_modules: modules
        }
      ]).select().single();

      if (error) throw error;

      setModalMessage({ text: 'Usuario registrado exitosamente con roles asignados.', type: 'success' });
      await refresh();
      setTimeout(() => {
        setIsRegisterOpen(false);
        setModalMessage(null);
        setNombre('');
        setApellido('');
        setEmail('');
        setTelefono('');
        setPassword('');
        setConfirmPassword('');
      }, 1000);
    } catch (err: any) {
      console.error('Error registrando usuario:', err);
      setModalMessage({ 
        text: err.message || 'No fue posible completar el registro en este momento.', 
        type: 'error' 
      });
    } finally {
      setSavingUser(false);
    }
  };

  // Helper for pill badge color based on primary module/role
  const getModuleBadge = (userItem: User) => {
    const mods = userItem.allowedModules || [];
    if (userItem.role === UserRole.SUPERADMIN || userItem.role === UserRole.ADMIN_CLIENTE || mods.includes('ADMINISTRATIVE')) {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-950/80 text-cyan-400 border border-cyan-500/30 tracking-wider">
          ADMINISTRATIVA
        </span>
      );
    }
    if (userItem.role === UserRole.DIRECTOR || mods.includes('STRATEGY')) {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-950/80 text-amber-400 border border-amber-500/30 tracking-wider">
          ESTRATÉGICA
        </span>
      );
    }
    return (
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 tracking-wider">
        TERRITORIAL
      </span>
    );
  };

  const getPrimaryModuleValue = (userItem: User) => {
    const mods = userItem.allowedModules || [];
    if (mods.length > 2 || userItem.role === UserRole.SUPERADMIN) return 'ALL';
    if (mods.includes('STRATEGY') || userItem.role === UserRole.DIRECTOR) return 'STRATEGY';
    if (mods.includes('TERRITORY') || userItem.role === UserRole.COORDINADOR) return 'TERRITORY';
    return 'ADMINISTRATIVE';
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Top 3 Module Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5">
        {/* Card 1: GESTIÓN ADMINISTRATIVA */}
        <div className="rounded-3xl bg-[#051824]/90 border border-cyan-900/40 p-5 shadow-xl flex flex-col justify-between space-y-4 hover:border-cyan-500/30 transition-all">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-extrabold text-xs tracking-wider">
              <Users className="w-4 h-4 text-cyan-400" />
              <span>GESTIÓN ADMINISTRATIVA</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Control de acceso RBAC, llaves API, logs de auditoría e infraestructura general.
            </p>
          </div>
          <div className="pt-3 border-t border-cyan-900/30 text-[11px] text-slate-400 font-medium truncate">
            {formatUserNames(adminUsers)}
          </div>
        </div>

        {/* Card 2: GESTIÓN ESTRATÉGICA */}
        <div className="rounded-3xl bg-[#051824]/90 border border-cyan-900/40 p-5 shadow-xl flex flex-col justify-between space-y-4 hover:border-amber-500/30 transition-all">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs tracking-wider">
              <Briefcase className="w-4 h-4 text-amber-400" />
              <span>GESTIÓN ESTRATÉGICA</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Matriz DAFO de IA, control presupuestario, escáner OCR y agenda del candidato.
            </p>
          </div>
          <div className="pt-3 border-t border-cyan-900/30 text-[11px] text-slate-400 font-medium truncate">
            {formatUserNames(strategyUsers)}
          </div>
        </div>

        {/* Card 3: GESTIÓN TERRITORIAL */}
        <div className="rounded-3xl bg-[#051824]/90 border border-cyan-900/40 p-5 shadow-xl flex flex-col justify-between space-y-4 hover:border-emerald-500/30 transition-all">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-xs tracking-wider">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>GESTIÓN TERRITORIAL</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Registro de votantes, mensajería masiva y coordinación de testigos/jurados.
            </p>
          </div>
          <div className="pt-3 border-t border-cyan-900/30 text-[11px] text-slate-400 font-medium truncate">
            {formatUserNames(territoryUsers)}
          </div>
        </div>
      </div>

      {/* 2. Main Users Table Section */}
      <div className="space-y-4">
        {/* Section Header with Search and + Registrar Button */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-white font-extrabold text-base tracking-tight">
              <Users className="w-5 h-5 text-cyan-400" />
              <span>Asignación de Roles a Usuarios de Campaña</span>
            </div>
            <p className="text-xs text-slate-400">
              Asigne perfiles de seguridad y niveles de aislamiento de forma directa a cada miembro de la organización.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative min-w-[260px] sm:min-w-[320px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nombre o correo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#051824] border border-cyan-900/50 rounded-2xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            <button
              onClick={() => setIsRegisterOpen(true)}
              className="px-5 py-2.5 rounded-full bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 transition-all transform active:scale-95 flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar</span>
            </button>
          </div>
        </div>

        {/* Column Headers (Desktop) */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-2 text-[11px] font-bold text-slate-400 tracking-wider uppercase">
          <div className="col-span-5">DATOS DE USUARIO Y FUNCIONES HABILITADAS</div>
          <div className="col-span-3 text-center">MÓDULO ASIGNADO</div>
          <div className="col-span-2 text-center">ESTADO ACCESO</div>
          <div className="col-span-2 text-right">AJUSTE ACCESOS</div>
        </div>

        {/* Users Rows List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-2xl bg-[#051824]/60 animate-pulse border border-cyan-900/30" />
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="rounded-3xl bg-[#051824]/60 border border-dashed border-cyan-900/50 p-12 text-center space-y-3">
            <Users className="w-10 h-10 text-slate-500 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">No se encontraron usuarios registrados</p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Utilice el botón «+ Registrar» para agregar el primer miembro del equipo electoral y asignar sus credenciales.
            </p>
            <button
              onClick={() => setIsRegisterOpen(true)}
              className="mt-2 px-4 py-2 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold hover:bg-cyan-500/30 transition-colors inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Registrar Primer Usuario
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredUsers.map((usr) => (
              <div
                key={usr.id}
                className="rounded-2xl bg-[#051824]/90 hover:bg-[#061e2f] border border-cyan-900/40 hover:border-cyan-500/40 p-4 transition-all duration-200 shadow-xl flex flex-col md:grid md:grid-cols-12 gap-4 items-center justify-between"
              >
                {/* 1. User Info & Badge */}
                <div className="w-full md:col-span-5 flex flex-col items-start min-w-0 space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-sm font-extrabold text-white truncate">
                      {usr.displayName || usr.email.split('@')[0]}
                    </span>
                    {getModuleBadge(usr)}
                  </div>
                  <span className="text-xs text-slate-400 font-mono truncate">
                    {usr.email}
                  </span>
                </div>

                {/* 2. Módulo Asignado Select */}
                <div className="w-full md:col-span-3 flex justify-center">
                  <select
                    value={getPrimaryModuleValue(usr)}
                    onChange={(e) => handleModuleChange(usr.id, e.target.value)}
                    className="w-full sm:w-44 bg-[#020b12] border border-cyan-900/60 hover:border-cyan-500/50 rounded-xl px-3.5 py-1.5 text-xs text-slate-200 font-medium focus:outline-none focus:border-cyan-400 transition-colors"
                  >
                    <option value="ADMINISTRATIVE">Administrativa</option>
                    <option value="STRATEGY">Estratégica</option>
                    <option value="TERRITORY">Territorial</option>
                    <option value="ALL">Acceso Total</option>
                  </select>
                </div>

                {/* 3. Estado Acceso Pill */}
                <div className="w-full md:col-span-2 flex justify-center">
                  <button
                    onClick={() => handleToggleStatus(usr.id, usr.status)}
                    title="Clic para cambiar estado"
                    className="px-3 py-1.5 rounded-xl bg-[#020b12] border border-cyan-900/60 hover:border-cyan-500/40 text-xs font-semibold flex items-center gap-2 transition-all"
                  >
                    <span className={`w-2 h-2 rounded-full ${usr.status === 'ACTIVE' ? 'bg-emerald-400 shadow-sm shadow-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
                    <span className={usr.status === 'ACTIVE' ? 'text-emerald-400' : 'text-rose-400'}>
                      {usr.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                    </span>
                  </button>
                </div>

                {/* 4. Ajuste Accesos: Permisos & Delete */}
                <div className="w-full md:col-span-2 flex items-center justify-end gap-2">
                  <button
                    onClick={() => openPermissionsModal(usr)}
                    className="px-3 py-1.5 rounded-xl bg-[#020b12] hover:bg-cyan-950/80 border border-cyan-700/40 hover:border-cyan-400 text-cyan-400 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Permisos</span>
                  </button>

                  <button
                    onClick={() => handleDeleteUser(usr.id, usr.email)}
                    title="Eliminar / Inactivar acceso"
                    className="p-2 rounded-xl bg-[#14060b] hover:bg-rose-950/80 border border-rose-900/40 text-rose-400 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Modal de Registro de Subusuarios (Section 11) */}
      {isRegisterOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#041420] border border-cyan-900/50 rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-cyan-900/40 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Users className="w-4 h-4" />
                </div>
                <h3 className="text-base font-extrabold text-white">
                  Registrar Miembro de Campaña
                </h3>
              </div>
              <button 
                onClick={() => setIsRegisterOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalMessage && (
              <div className={`p-3 rounded-2xl text-xs flex items-center gap-2 ${
                modalMessage.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}>
                {modalMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                <span>{modalMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubuser} className="space-y-4">
              {/* Bloque 1: DATOS PERSONALES */}
              <div className="space-y-3">
                <div className="text-[11px] font-bold tracking-wider text-cyan-400 uppercase">
                  1. DATOS PERSONALES
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Juan"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      className="w-full bg-[#020b12] border border-cyan-900/60 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Apellido</label>
                    <input
                      type="text"
                      placeholder="Ej. Pérez"
                      value={apellido}
                      onChange={(e) => setApellido(e.target.value)}
                      className="w-full bg-[#020b12] border border-cyan-900/60 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Correo Electrónico *</label>
                    <input
                      type="email"
                      required
                      placeholder="usuario@campana.ai"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#020b12] border border-cyan-900/60 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Teléfono</label>
                    <input
                      type="tel"
                      placeholder="3001234567"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      className="w-full bg-[#020b12] border border-cyan-900/60 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>
              </div>

              {/* Bloque 2: CREDENCIALES */}
              <div className="space-y-3 pt-2">
                <div className="text-[11px] font-bold tracking-wider text-cyan-400 uppercase">
                  2. CREDENCIALES DE ACCESO
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Contraseña</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#020b12] border border-cyan-900/60 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Confirmar Contraseña</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-[#020b12] border border-cyan-900/60 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>
              </div>

              {/* Bloque 3: AUTORIZACIÓN Y ROL */}
              <div className="space-y-3 pt-2">
                <div className="text-[11px] font-bold tracking-wider text-cyan-400 uppercase">
                  3. AUTORIZACIÓN Y MÓDULO
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Perfil / Rol</label>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="w-full bg-[#020b12] border border-cyan-900/60 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                    >
                      <option value="ADMIN_CLIENTE">Administrador de Campaña</option>
                      <option value="DIRECTOR">Director Estratégico</option>
                      <option value="COORDINADOR">Coordinador Territorial</option>
                      <option value="AUDITOR">Auditor de Finanzas / CNE</option>
                      <option value="USUARIO">Digitador / Operador</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Módulo Primario</label>
                    <select
                      value={selectedModule}
                      onChange={(e) => setSelectedModule(e.target.value)}
                      className="w-full bg-[#020b12] border border-cyan-900/60 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                    >
                      <option value="ADMINISTRATIVE">Gestión Administrativa</option>
                      <option value="STRATEGY">Gestión Estratégica</option>
                      <option value="TERRITORY">Gestión Territorial</option>
                      <option value="ALL">Todos los Módulos (Acceso Completo)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActiveStatus}
                      onChange={(e) => setIsActiveStatus(e.target.checked)}
                      className="rounded border-cyan-900 text-cyan-500 focus:ring-cyan-400 bg-[#020b12]"
                    />
                    <span className="text-xs text-slate-300">Habilitar acceso inmediatamente (Usuario Activo)</span>
                  </label>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-cyan-900/40">
                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(false)}
                  className="px-4 py-2 rounded-2xl bg-[#020b12] hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-cyan-900/40"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingUser}
                  className="px-5 py-2 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold shadow-lg shadow-cyan-500/20 flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  {savingUser ? 'Registrando...' : 'Confirmar Registro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Granular Permission Matrix Modal */}
      {isPermModalOpen && targetUser && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#041420] border border-cyan-900/50 rounded-3xl max-w-3xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-cyan-900/40 pb-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-base font-extrabold text-white">
                    Matriz de Permisos: {targetUser.displayName}
                  </h3>
                </div>
                <p className="text-xs text-slate-400">
                  {targetUser.email} • Rol: {targetUser.role}
                </p>
              </div>
              <button 
                onClick={() => setIsPermModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {permissionMatrix.map((mod, mIndex) => (
                <div key={mod.moduleCode} className="rounded-2xl bg-[#020b12] border border-cyan-900/40 p-4 space-y-3">
                  <div className="text-xs font-extrabold text-cyan-400 tracking-wide uppercase flex items-center gap-1.5">
                    <Layers className="w-4 h-4" />
                    <span>{mod.moduleName}</span>
                  </div>

                  <div className="divide-y divide-cyan-900/30">
                    {mod.functions.map((fn, fIndex) => (
                      <div key={fn.code} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <p className="text-xs font-bold text-white">{fn.name}</p>
                          <span className="text-[10px] text-slate-500 font-mono">{fn.code}</span>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          {fn.actions.map((act, aIndex) => (
                            <button
                              key={act.action}
                              type="button"
                              onClick={() => handleToggleMatrixAction(mIndex, fIndex, aIndex)}
                              className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold border flex items-center gap-1 transition-all ${
                                act.granted
                                  ? 'bg-teal-950/90 text-teal-300 border-teal-500/40 shadow-sm'
                                  : 'bg-[#031019] text-slate-500 border-cyan-900/30 hover:border-cyan-800'
                              }`}
                            >
                              {act.granted ? <Check className="w-3 h-3 text-teal-400" /> : <X className="w-3 h-3 text-slate-600" />}
                              <span>{act.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-cyan-900/40">
              <button
                type="button"
                onClick={() => setIsPermModalOpen(false)}
                className="px-4 py-2 rounded-2xl bg-[#020b12] text-slate-300 text-xs font-semibold border border-cyan-900/40"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={handleSaveUserPermissions}
                disabled={savingPerms}
                className="px-5 py-2 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
              >
                <Save className="w-3.5 h-3.5" />
                {savingPerms ? 'Guardando...' : 'Guardar Permisos'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
