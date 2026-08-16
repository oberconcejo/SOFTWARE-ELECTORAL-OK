import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Search, 
  Filter, 
  Plus, 
  Globe, 
  MoreVertical, 
  CheckCircle2, 
  XCircle,
  Clock,
  ChevronRight,
  ExternalLink,
  Shield,
  CreditCard,
  Mail,
  Phone,
  Users,
  Loader2,
  Trash2,
  Edit2,
  RotateCcw,
  RefreshCw
} from 'lucide-react';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { useClients, Client } from '@/src/hooks/useClients';
import { supabase } from '@/src/lib/supabase';

export default function AdminClientsPage() {
  const { clients, loading, deleteClient, updateClient, refresh } = useClients();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [usageClient, setUsageClient] = useState<Client | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [usageAmount, setUsageAmount] = useState<number>(0);
  const [usageDetails, setUsageDetails] = useState('');
  const [usageHistory, setUsageHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (usageClient) {
      fetchUsageHistory(usageClient.id);
    } else {
      setUsageHistory([]);
    }
  }, [usageClient]);

  const fetchUsageHistory = async (clientId: string) => {
    setLoadingHistory(true);
    try {
      const response = await fetch(`/api/admin/client-usage/${clientId}/transactions`, {
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUsageHistory(data);
      }
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleAdjustUsage = async (type: 'ASIGNACION' | 'AJUSTE' | 'DEVOLUCION') => {
    if (!usageClient || usageAmount === 0) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/client-usage/${usageClient.id}/adjust`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          amount: type === 'DEVOLUCION' ? -Math.abs(usageAmount) : Math.abs(usageAmount),
          type,
          details: usageDetails
        })
      });

      if (!response.ok) throw new Error('Error al ajustar consumo');
      
      setUsageClient(null);
      setUsageAmount(0);
      setUsageDetails('');
      refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newClient, setNewClient] = useState({
    name: '',
    nit: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    department: '',
    plan: 'BASIC',
    maxUsers: 10,
    allowedModules: ['ADMINISTRATIVE'],
    expiryDate: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    confirmPassword: ''
  });

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newClient.adminPassword !== newClient.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch('/api/admin/clients/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          clientData: {
            name: newClient.name,
            nit: newClient.nit,
            email: newClient.email,
            phone: newClient.phone,
            address: newClient.address,
            city: newClient.city,
            department: newClient.department,
            plan: newClient.plan,
            maxUsers: newClient.maxUsers,
            allowedModules: newClient.allowedModules,
            expiryDate: newClient.expiryDate
          },
          adminData: {
            name: newClient.adminName,
            email: newClient.adminEmail,
            password: newClient.adminPassword
          }
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al crear cliente');
      }

      setIsCreateModalOpen(false);
      window.location.reload(); // Refresh to see new client
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleModuleToggle = (moduleCode: string) => {
    setNewClient(prev => ({
      ...prev,
      allowedModules: prev.allowedModules.includes(moduleCode)
        ? prev.allowedModules.filter(m => m !== moduleCode)
        : [...prev.allowedModules, moduleCode]
    }));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;

    setIsUpdating(true);
    try {
      await updateClient(editingClient.id, {
        name: editingClient.name,
        plan: editingClient.plan,
        status: editingClient.status,
        max_users: editingClient.max_users
      });
      setEditingClient(null);
    } catch (err) {
      alert('Error al actualizar cliente');
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-sm font-bold uppercase tracking-widest text-white">Sincronizando Base de Datos de Clientes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Gestión de Clientes</h1>
          <p className="text-slate-400">Control maestro de organizaciones, licencias y acceso global.</p>
        </div>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="gap-2 bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" /> Registrar Nuevo Cliente
        </Button>
      </div>

      {/* Create Client Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#111114] border border-white/10 rounded-[32px] w-full max-w-4xl my-8 overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div>
                <h3 className="text-xl font-bold text-white">Registrar Nueva Organización</h3>
                <p className="text-xs text-slate-500 font-medium">Configura el acceso inicial y los parámetros de la licencia.</p>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {/* Seccion 1: Datos Legales */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-indigo-400">
                  <Globe className="w-4 h-4" />
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em]">Datos de la Organización</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nombre / Razón Social</label>
                    <input 
                      type="text" required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-all"
                      value={newClient.name} onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Documento / NIT</label>
                    <input 
                      type="text" required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-all"
                      value={newClient.nit} onChange={(e) => setNewClient({...newClient, nit: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ciudad</label>
                    <input 
                      type="text" required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-all"
                      value={newClient.city} onChange={(e) => setNewClient({...newClient, city: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Departamento</label>
                    <input 
                      type="text" required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-all"
                      value={newClient.department} onChange={(e) => setNewClient({...newClient, department: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Seccion 2: Configuración de Licencia */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-indigo-400">
                  <CreditCard className="w-4 h-4" />
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em]">Configuración de Licencia</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Plan</label>
                    <select 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-all"
                      value={newClient.plan} onChange={(e) => setNewClient({...newClient, plan: e.target.value})}
                    >
                      <option value="BASIC">Básico</option>
                      <option value="PRO">Profesional</option>
                      <option value="ENTERPRISE">Enterprise</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Límite de Usuarios</label>
                    <input 
                      type="number" required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-all"
                      value={newClient.maxUsers} onChange={(e) => setNewClient({...newClient, maxUsers: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Fecha Vencimiento</label>
                    <input 
                      type="date" required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-all"
                      value={newClient.expiryDate} onChange={(e) => setNewClient({...newClient, expiryDate: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Módulos Autorizados</label>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { code: 'ADMINISTRATIVE', name: 'Gestión Administrativa' },
                      { code: 'STRATEGY', name: 'Gestión Estratégica' },
                      { code: 'TERRITORY', name: 'Gestión Territorial' },
                      { code: 'CRM', 'name': 'CRM Electoral' }
                    ].map(mod => (
                      <button
                        key={mod.code}
                        type="button"
                        onClick={() => handleModuleToggle(mod.code)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border ${
                          newClient.allowedModules.includes(mod.code)
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                            : 'bg-white/5 border-white/5 text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        {mod.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Seccion 3: Administrador Principal */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-indigo-400">
                  <Shield className="w-4 h-4" />
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em]">Credenciales de Acceso Principal</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nombre Completo</label>
                    <input 
                      type="text" required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-all"
                      value={newClient.adminName} onChange={(e) => setNewClient({...newClient, adminName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Correo Electrónico</label>
                    <input 
                      type="email" required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-all"
                      value={newClient.adminEmail} onChange={(e) => setNewClient({...newClient, adminEmail: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Contraseña</label>
                    <input 
                      type="password" required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-all"
                      value={newClient.adminPassword} onChange={(e) => setNewClient({...newClient, adminPassword: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Confirmar Contraseña</label>
                    <input 
                      type="password" required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-all"
                      value={newClient.confirmPassword} onChange={(e) => setNewClient({...newClient, confirmPassword: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1 py-4 text-slate-400"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancelar Registro
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-600/20"
                  disabled={isUpdating}
                >
                  {isUpdating ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Crear Organización y Administrador'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative md:col-span-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Buscar por nombre, correo o NIT..." 
            className="w-full bg-[#111114] border border-white/5 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all shadow-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="h-full bg-[#111114] border-white/5 gap-2 hover:bg-white/5">
          <Filter className="w-4 h-4" /> Filtros Avanzados
        </Button>
      </div>

      {/* Clients Table */}
      <div className="bg-[#111114] border border-white/5 rounded-[32px] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5">
                <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Organización</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Plan & Módulos</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Consumo API</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Estado</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredClients.map((client) => {
                const usage = client.client_api_usage?.[0];
                const assigned = usage?.total_assigned || 0;
                const consumed = usage?.total_consumed || 0;
                const percentage = assigned > 0 ? Math.min(100, Math.round((consumed / assigned) * 100)) : 0;
                
                return (
                  <tr key={client.id} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center font-bold text-lg group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                          {client.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white mb-1">{client.name}</p>
                          <div className="flex items-center gap-3 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                            <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {client.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="primary" className="bg-indigo-600 text-white text-[10px] py-0.5 uppercase">{client.plan}</Badge>
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Usuarios: {client.max_users}</span>
                        </div>
                        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest flex items-center gap-1">
                          <Users className="w-3 h-3" /> Registrado: {new Date(client.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="w-full max-w-[140px] space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                          <span className={percentage > 90 ? 'text-rose-500' : percentage > 75 ? 'text-amber-500' : 'text-slate-400'}>
                            {consumed} / {assigned}
                          </span>
                          <span className="text-slate-500">{percentage}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-500 ${
                              percentage > 90 ? 'bg-rose-500' : 
                              percentage > 75 ? 'bg-amber-500' : 
                              'bg-indigo-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        {usage?.last_query_at && (
                          <p className="text-[9px] text-slate-600 font-medium">
                            U.C: {new Date(usage.last_query_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      {client.status === 'ACTIVE' ? (
                        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full w-fit">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Activo</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-3 py-1 bg-rose-500/10 border border-rose-500/20 rounded-full w-fit">
                          <div className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                          <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Suspendido</span>
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => setUsageClient(client)}
                          className="p-2.5 bg-white/5 border border-white/5 rounded-xl text-indigo-400 hover:text-white hover:bg-indigo-600 transition-all"
                          title="Gestionar Consumo"
                        >
                          <CreditCard className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setEditingClient(client)}
                          className="p-2.5 bg-white/5 border border-white/5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="p-6 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Mostrando {filteredClients.length} de {clients.length} clientes totales</p>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" disabled className="text-slate-500">Anterior</Button>
            <Button variant="ghost" size="sm" className="text-indigo-400">Siguiente</Button>
          </div>
        </div>
      </div>

      {/* Edit Client Modal */}
      {editingClient && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#111114] border border-white/10 rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Editar Licencia de Cliente</h3>
              <button onClick={() => setEditingClient(null)} className="text-slate-500 hover:text-white">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nombre de la Organización</label>
                <input 
                  type="text" 
                  value={editingClient.name}
                  onChange={(e) => setEditingClient({ ...editingClient, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Plan</label>
                  <select 
                    value={editingClient.plan}
                    onChange={(e) => setEditingClient({ ...editingClient, plan: e.target.value as any })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all"
                  >
                    <option value="BASIC">Plan Básico</option>
                    <option value="PRO">Plan Profesional</option>
                    <option value="ENTERPRISE">Plan Enterprise</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Estado</label>
                  <select 
                    value={editingClient.status}
                    onChange={(e) => setEditingClient({ ...editingClient, status: e.target.value as any })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all"
                  >
                    <option value="ACTIVE">Activo</option>
                    <option value="SUSPENDED">Suspendido</option>
                    <option value="EXPIRED">Expirado</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Máximo de Usuarios</label>
                <input 
                  type="number" 
                  value={editingClient.max_users}
                  onChange={(e) => setEditingClient({ ...editingClient, max_users: parseInt(e.target.value) })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all"
                  required
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setEditingClient(null)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500"
                  disabled={isUpdating}
                >
                  {isUpdating ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Guardar Cambios'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      
      {/* API Usage Management Modal */}
      {usageClient && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#111114] border border-white/10 rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div>
                <h3 className="text-xl font-bold text-white">Gestionar Consumo de API</h3>
                <p className="text-xs text-slate-500 font-medium">Cliente: {usageClient.name}</p>
              </div>
              <button onClick={() => setUsageClient(null)} className="text-slate-500 hover:text-white transition-colors">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Asignado</p>
                  <p className="text-xl font-bold text-white">{usageClient.client_api_usage?.[0]?.total_assigned || 0}</p>
                </div>
                <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Consumido</p>
                  <p className="text-xl font-bold text-white">{usageClient.client_api_usage?.[0]?.total_consumed || 0}</p>
                </div>
              </div>

              {/* Transactions History Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Historial Reciente</h4>
                  <button 
                    onClick={() => fetchUsageHistory(usageClient.id)}
                    className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold uppercase tracking-widest flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3 h-3 ${loadingHistory ? 'animate-spin' : ''}`} /> Actualizar
                  </button>
                </div>
                
                <div className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden max-h-48 overflow-y-auto custom-scrollbar">
                  {loadingHistory ? (
                    <div className="p-8 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-indigo-500" /></div>
                  ) : usageHistory.length > 0 ? (
                    <table className="w-full text-left text-[10px]">
                      <thead className="bg-white/[0.02] border-b border-white/5 sticky top-0">
                        <tr>
                          <th className="px-4 py-2 font-bold text-slate-500 uppercase tracking-widest">Fecha</th>
                          <th className="px-4 py-2 font-bold text-slate-500 uppercase tracking-widest">Tipo</th>
                          <th className="px-4 py-2 font-bold text-slate-500 uppercase tracking-widest text-right">Cant.</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {usageHistory.map((tx) => (
                          <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-4 py-2 text-slate-400 font-medium">
                              {new Date(tx.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-2">
                              <span className={`font-bold uppercase tracking-widest ${
                                tx.transaction_type === 'CONSUMO' ? 'text-amber-500' : 
                                tx.transaction_type === 'ASIGNACION' ? 'text-emerald-500' : 
                                'text-indigo-400'
                              }`}>
                                {tx.transaction_type}
                              </span>
                            </td>
                            <td className={`px-4 py-2 text-right font-bold ${
                              tx.amount > 0 ? 'text-emerald-500' : 'text-rose-500'
                            }`}>
                              {tx.amount > 0 ? '+' : ''}{tx.amount}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-8 text-center text-slate-500 font-bold uppercase tracking-widest text-[10px]">Sin transacciones registradas</div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Cantidad de Consultas (Ajuste)</label>
                  <input 
                    type="number"
                    value={usageAmount}
                    onChange={(e) => setUsageAmount(parseInt(e.target.value) || 0)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-all"
                    placeholder="Ej. 1000"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Detalles / Motivo</label>
                  <textarea 
                    value={usageDetails}
                    onChange={(e) => setUsageDetails(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-all h-20 resize-none"
                    placeholder="Opcional: Motivo del ajuste..."
                  />
                </div>

                <div className="flex gap-3">
                  <Button 
                    onClick={() => handleAdjustUsage('ASIGNACION')}
                    disabled={isUpdating || usageAmount <= 0}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 gap-2"
                  >
                    <Plus className="w-4 h-4" /> Asignar
                  </Button>
                  <Button 
                    onClick={() => handleAdjustUsage('DEVOLUCION')}
                    disabled={isUpdating || usageAmount <= 0}
                    variant="outline"
                    className="flex-1 border-rose-500/30 text-rose-400 hover:bg-rose-500/10 gap-2"
                  >
                    <RotateCcw className="w-4 h-4" /> Devolución
                  </Button>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5">
                <Button 
                  onClick={() => setUsageClient(null)}
                  variant="ghost" 
                  className="w-full text-slate-500 hover:text-white"
                >
                  Cerrar Gestión
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
