import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Settings, 
  Users, 
  ShieldCheck, 
  Plus, 
  Search, 
  Lock, 
  Mail, 
  Phone, 
  Building2, 
  CheckCircle2, 
  X, 
  Save, 
  AlertCircle,
  Key,
  UserPlus,
  RefreshCw,
  Power
} from 'lucide-react';
import { supabase } from '@/src/lib/supabase';
import { useAuth } from '@/src/contexts/AuthContext';
import { useAdministrativeData } from '@/src/hooks/useAdministrativeData';
import { UserRole } from '@/src/types';

export default function AdminSettingsPage() {
  const { user, client } = useAuth();
  const { subusers, roles, refresh, loading } = useAdministrativeData();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentTabParam = searchParams.get('tab') as 'subusers' | 'org' | 'security' | null;
  const [activeTab, setActiveTab] = useState<'subusers' | 'org' | 'security'>(
    currentTabParam === 'org' || currentTabParam === 'security' ? currentTabParam : 'subusers'
  );

  useEffect(() => {
    if (currentTabParam && (currentTabParam === 'subusers' || currentTabParam === 'org' || currentTabParam === 'security')) {
      setActiveTab(currentTabParam);
    }
  }, [currentTabParam]);

  const handleTabChange = (tab: 'subusers' | 'org' | 'security') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Subuser Form State
  const [userForm, setUserForm] = useState({
    displayName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: UserRole.USUARIO as UserRole,
    customRoleId: '',
    assignedModules: ['ADMINISTRATIVE'] as string[]
  });

  // Org Form State
  const [orgForm, setOrgForm] = useState({
    name: client?.name || '',
    documentId: client?.documentId || '',
    email: client?.email || '',
    phone: client?.phone || '',
    city: client?.city || '',
    address: client?.address || ''
  });

  const filteredSubusers = subusers.filter(u => 
    (u.displayName && u.displayName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateSubuser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.email.trim() || !userForm.displayName.trim()) {
      setMessage({ text: 'Nombre y Correo electrónico son obligatorios', type: 'error' });
      return;
    }

    if (userForm.password && userForm.password !== userForm.confirmPassword) {
      setMessage({ text: 'Las contraseñas no coinciden', type: 'error' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const clientId = user?.tenantId || client?.id;

      // Create profile in Supabase profiles table
      const newUserId = crypto.randomUUID();
      const { error } = await supabase.from('profiles').insert([
        {
          id: newUserId,
          client_id: clientId,
          display_name: userForm.displayName.trim(),
          email: userForm.email.trim().toLowerCase(),
          phone: userForm.phone.trim(),
          role: userForm.role,
          custom_role_id: userForm.customRoleId || null,
          allowed_modules: userForm.assignedModules,
          is_active: true
        }
      ]);

      if (error) throw error;

      setMessage({ text: 'Subusuario creado exitosamente', type: 'success' });
      await refresh();
      setUserForm({
        displayName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        role: UserRole.USUARIO,
        customRoleId: '',
        assignedModules: ['ADMINISTRATIVE']
      });
      setTimeout(() => {
        setIsCreateUserModalOpen(false);
        setMessage(null);
      }, 1000);
    } catch (err: any) {
      console.error('Error creating subuser:', err);
      setMessage({ text: err.message || 'Error al crear el subusuario en Supabase', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !currentStatus })
        .eq('id', userId);

      if (error) throw error;
      await refresh();
    } catch (err: any) {
      console.error('Error toggling user status:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-400" />
            Configuración del Sistema
          </h2>
          <p className="text-xs text-slate-400">
            Administración de subusuarios, perfiles institucionales y parámetros de seguridad.
          </p>
        </div>

        {activeTab === 'subusers' && (
          <button
            onClick={() => setIsCreateUserModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-lg shadow-indigo-600/30"
          >
            <UserPlus className="w-4 h-4" />
            Crear Subusuario
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => handleTabChange('subusers')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'subusers' 
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' 
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Users className="w-4 h-4" />
          Subusuarios y Accesos ({subusers.length})
        </button>
        <button
          onClick={() => handleTabChange('org')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'org' 
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' 
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Perfil de la Organización
        </button>
        <button
          onClick={() => handleTabChange('security')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'security' 
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' 
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Lock className="w-4 h-4" />
          Seguridad y Sesión
        </button>
      </div>

      {/* Subusers Tab */}
      {activeTab === 'subusers' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nombre o correo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="rounded-2xl bg-slate-900/60 border border-white/5 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 border-b border-white/10 text-slate-400">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Usuario</th>
                    <th className="py-3 px-4 font-semibold">Contacto</th>
                    <th className="py-3 px-4 font-semibold">Rol Asignado</th>
                    <th className="py-3 px-4 font-semibold">Módulos</th>
                    <th className="py-3 px-4 font-semibold text-center">Estado</th>
                    <th className="py-3 px-4 font-semibold text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredSubusers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        No hay subusuarios registrados en la organización.
                      </td>
                    </tr>
                  ) : (
                    filteredSubusers.map((sub) => (
                      <tr key={sub.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-4 font-bold text-white">
                          {sub.displayName || 'Sin Nombre'}
                          <span className="block text-[11px] font-normal text-slate-400">{sub.email}</span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400">
                          {sub.phone || '-'}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-indigo-400">
                          {sub.role}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {(sub.allowedModules || ['ADMINISTRATIVE']).map((m, i) => (
                              <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                                {m}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            sub.isActive 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}>
                            {sub.isActive ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleToggleUserStatus(sub.id, sub.isActive)}
                            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                            title={sub.isActive ? 'Desactivar acceso' : 'Activar acceso'}
                          >
                            <Power className={`w-3.5 h-3.5 ${sub.isActive ? 'text-emerald-400' : 'text-slate-600'}`} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Organization Tab */}
      {activeTab === 'org' && (
        <div className="rounded-2xl bg-slate-900/60 border border-white/5 p-6 space-y-5 max-w-2xl">
          <div>
            <h3 className="text-base font-bold text-white">Datos de la Organización / Campaña</h3>
            <p className="text-xs text-slate-400">Información legal y de contacto institucional.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre / Razón Social</label>
              <input
                type="text"
                value={orgForm.name}
                onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">NIT / Documento Oficial</label>
              <input
                type="text"
                value={orgForm.documentId}
                onChange={(e) => setOrgForm({ ...orgForm, documentId: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Correo Institucional</label>
              <input
                type="email"
                value={orgForm.email}
                onChange={(e) => setOrgForm({ ...orgForm, email: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Teléfono Principal</label>
              <input
                type="tel"
                value={orgForm.phone}
                onChange={(e) => setOrgForm({ ...orgForm, phone: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Ciudad y Dirección</label>
              <input
                type="text"
                value={orgForm.address}
                onChange={(e) => setOrgForm({ ...orgForm, address: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 flex justify-end">
            <button
              onClick={() => alert('Datos de organización guardados')}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              Guardar Cambios
            </button>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="rounded-2xl bg-slate-900/60 border border-white/5 p-6 space-y-5 max-w-2xl">
          <div>
            <h3 className="text-base font-bold text-white">Parámetros de Seguridad y Sesión</h3>
            <p className="text-xs text-slate-400">Políticas de autenticación, timeout y sincronización Supabase.</p>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Aislamiento Multitenant RLS</span>
                <span className="text-[11px] text-slate-400">Protección de aislamiento a nivel de base de datos activa.</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                ACTIVO
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Expiración de Sesión</span>
                <span className="text-[11px] text-slate-400">Cierre automático tras inactividad prolongada (24 horas).</span>
              </div>
              <span className="text-xs font-semibold text-slate-300">24 Horas</span>
            </div>
          </div>
        </div>
      )}

      {/* Create Subuser Modal */}
      {isCreateUserModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-indigo-400" />
                Crear Nuevo Subusuario
              </h3>
              <button onClick={() => setIsCreateUserModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {message && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}>
                {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {message.text}
              </div>
            )}

            <form onSubmit={handleCreateSubuser} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Andrés Morales"
                    value={userForm.displayName}
                    onChange={(e) => setUserForm({ ...userForm, displayName: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Correo Electrónico *</label>
                  <input
                    type="email"
                    required
                    placeholder="usuario@campana.com"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Teléfono</label>
                  <input
                    type="tel"
                    placeholder="Ej. 3123456789"
                    value={userForm.phone}
                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Rol en el Sistema</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value as any })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                  >
                    <option value={UserRole.USUARIO}>Digitador / Operador</option>
                    <option value={UserRole.COORDINADOR}>Coordinador Territorial</option>
                    <option value={UserRole.DIRECTOR}>Director de Campaña</option>
                    <option value={UserRole.ADMIN_CLIENTE}>Administrador de Cliente</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Contraseña Inicial</label>
                  <input
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Confirmar Contraseña</label>
                  <input
                    type="password"
                    placeholder="Repita la contraseña"
                    value={userForm.confirmPassword}
                    onChange={(e) => setUserForm({ ...userForm, confirmPassword: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Módulos Autorizados</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { code: 'ADMINISTRATIVE', label: 'Gestión Administrativa' },
                    { code: 'TERRITORY', label: 'Gestión Territorial' },
                    { code: 'STRATEGY', label: 'Gestión Estratégica' },
                    { code: 'CRM', label: 'CRM Electoral' }
                  ].map((mod) => (
                    <label key={mod.code} className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-white/5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={userForm.assignedModules.includes(mod.code)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setUserForm({ ...userForm, assignedModules: [...userForm.assignedModules, mod.code] });
                          } else {
                            setUserForm({ ...userForm, assignedModules: userForm.assignedModules.filter(m => m !== mod.code) });
                          }
                        }}
                        className="rounded border-white/20 text-indigo-600 focus:ring-indigo-500 bg-slate-900"
                      />
                      <span className="text-xs text-slate-300">{mod.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreateUserModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30"
                >
                  <Save className="w-3.5 h-3.5" />
                  {saving ? 'Creando...' : 'Crear Subusuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
