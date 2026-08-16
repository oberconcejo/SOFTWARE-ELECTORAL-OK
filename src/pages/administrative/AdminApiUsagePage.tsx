import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { 
  CreditCard, 
  RefreshCw, 
  ArrowUpRight, 
  History, 
  AlertTriangle,
  Loader2,
  Calendar,
  Search,
  Download,
  XCircle,
  Mail,
  User as UserIcon,
  ChevronRight,
  Building2
} from 'lucide-react';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { useAuth } from '@/src/contexts/AuthContext';
import { supabase } from '@/src/lib/supabase';
import { UserRole } from '@/src/types';

export default function AdminApiUsagePage() {
  const { client, user, apiUsage, loading: authLoading, refreshUserData } = useAuth();
  const [usage, setUsage] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [clientsUsage, setClientsUsage] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const isSuperAdmin = user?.role === UserRole.SUPERADMIN;

  const fetchData = useCallback(async () => {
    // Wait for auth to initialize
    if (authLoading) return;

    setRefreshing(true);
    setError(null);
    
    try {
      if (isSuperAdmin) {
        // SuperAdmin: Fetch all clients' usage
        const { data: allUsage, error: allUsageError } = await supabase
          .from('client_api_usage')
          .select(`
            *,
            clients (
              id,
              name,
              email,
              status
            )
          `)
          .order('total_consumed', { ascending: false });

        if (allUsageError) {
          if (allUsageError.code === 'PGRST205' || allUsageError.message?.includes('does not exist')) {
            console.warn('client_api_usage table missing');
            setClientsUsage([]);
          } else {
            throw allUsageError;
          }
        } else {
          setClientsUsage(allUsage || []);
        }
      } else {
        // Regular Client: Sync with Auth Context first
        const freshData = await refreshUserData();
        const currentUsage = freshData?.apiUsage || apiUsage;
        
        if (!client?.id) {
          setUsage(null);
          setLoading(false);
          setRefreshing(false);
          return;
        }

        setUsage(currentUsage);

        // Fetch transactions
        const { data: transData, error: transError } = await supabase
          .from('api_usage_transactions')
          .select('*')
          .eq('client_id', client.id)
          .order('created_at', { ascending: false })
          .limit(50);
        
        if (transError) {
          if (transError.code === 'PGRST205' || transError.message?.includes('does not exist')) {
            console.warn('api_usage_transactions table missing');
            setTransactions([]);
          } else {
            throw transError;
          }
        } else {
          setTransactions(transData || []);
        }
      }
    } catch (err: any) {
      console.error('Error fetching usage data:', err);
      setError(err.message || 'No fue posible cargar el consumo de consultas.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [client?.id, user?.role, authLoading, isSuperAdmin]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading || authLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-sm font-bold uppercase tracking-widest text-white">Cargando datos de consumo...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-6 text-center px-4">
        <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shadow-xl shadow-rose-500/10">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-white">Error de Conexión</h3>
          <p className="text-slate-400 max-w-md mx-auto text-sm leading-relaxed">
            No fue posible cargar el consumo de consultas en este momento. Por favor verifica tu conexión e intenta nuevamente.
          </p>
        </div>
        <Button 
          onClick={fetchData}
          className="bg-indigo-600 hover:bg-indigo-500 px-8 py-6 rounded-2xl font-bold uppercase tracking-widest text-xs gap-2 shadow-xl shadow-indigo-600/20 transition-all active:scale-95"
        >
          <RefreshCw className="w-4 h-4" /> Reintentar
        </Button>
      </div>
    );
  }

  // SuperAdmin Global View
  if (isSuperAdmin) {
    const filteredClients = clientsUsage.filter(item => 
      item.clients?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.clients?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="space-y-8 pb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Panel Global de Consumo API</h1>
            <p className="text-slate-400 text-sm font-medium">Control maestro de créditos y uso por organización.</p>
          </div>
          <Button 
            onClick={fetchData}
            disabled={refreshing}
            className="gap-2 bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> Sincronizar Todo
          </Button>
        </div>

        {/* Filters */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Buscar organización o correo..." 
            className="w-full bg-[#111114] border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all shadow-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Card className="bg-[#111114] border border-white/5 rounded-[32px] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/5">
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Organización</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Asignadas</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Consumidas</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Restantes</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Progreso</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredClients.map((item) => {
                  const percentage = item.total_assigned > 0 ? Math.min(100, Math.round((item.total_consumed / item.total_assigned) * 100)) : 0;
                  const remaining = Math.max(0, item.total_assigned - item.total_consumed);
                  
                  return (
                    <tr key={item.id} className="hover:bg-white/[0.01] transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center font-bold">
                            {item.clients?.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white mb-0.5">{item.clients?.name}</p>
                            <p className="text-[10px] text-slate-500 font-medium">{item.clients?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center text-sm font-bold text-slate-300">{item.total_assigned.toLocaleString()}</td>
                      <td className="px-8 py-6 text-center text-sm font-bold text-indigo-400">{item.total_consumed.toLocaleString()}</td>
                      <td className="px-8 py-6 text-center text-sm font-bold text-emerald-400">{remaining.toLocaleString()}</td>
                      <td className="px-8 py-6">
                        <div className="w-full max-w-[120px] space-y-1.5">
                          <div className="flex justify-between text-[9px] font-bold text-slate-500">
                            <span>{percentage}%</span>
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
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <Badge className={item.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}>
                          {item.status}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
                {filteredClients.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-8 py-20 text-center text-slate-500 font-bold uppercase tracking-widest text-xs">
                      No se encontraron registros de consumo.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  }

  // Regular Client View
  if (!usage && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-6 text-center px-4">
        <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
          <CreditCard className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-white">Sin Registro de Consumo</h3>
          <p className="text-slate-400 max-w-md mx-auto text-sm leading-relaxed">
            No tienes consultas asignadas actualmente en tu cuenta. Por favor contacta al administrador del sistema para habilitar este servicio.
          </p>
        </div>
        <Button 
          onClick={fetchData}
          variant="outline"
          className="border-white/10 text-slate-400 gap-2"
        >
          <RefreshCw className="w-4 h-4" /> Actualizar
        </Button>
      </div>
    );
  }

  const assigned = usage?.total_assigned || 0;
  const consumed = usage?.total_consumed || 0;
  const percentage = assigned > 0 ? Math.min(100, Math.round((consumed / assigned) * 100)) : 0;
  const remaining = Math.max(0, assigned - consumed);

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Client Info */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Consumo de Consultas API</h1>
          <div className="flex flex-wrap items-center gap-4 text-slate-400 text-sm font-medium">
            <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4 text-indigo-400" /> {client?.name}</span>
            <span className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-indigo-400" /> {client?.email || user?.email}</span>
            <Badge className="bg-indigo-600/10 text-indigo-400 border-indigo-500/20">Cliente Activo</Badge>
          </div>
        </div>
        <Button 
          onClick={fetchData}
          disabled={refreshing}
          className="gap-2 bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-600/20"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> Actualizar Consumo
        </Button>
      </div>

      {/* Usage Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 bg-[#0B0B0F] border-white/5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <Badge className={remaining === 0 ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}>
              {remaining > 0 ? 'Saldo Disponible' : 'Saldo Agotado'}
            </Badge>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">Consultas Asignadas</p>
            <p className="text-3xl font-bold text-white tracking-tight">{assigned.toLocaleString()}</p>
          </div>
        </Card>

        <Card className="p-6 bg-[#0B0B0F] border-white/5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{percentage}% Utilizado</span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">Consultas Consumidas</p>
            <p className="text-3xl font-bold text-white tracking-tight">{consumed.toLocaleString()}</p>
          </div>
        </Card>

        <Card className="p-6 bg-[#0B0B0F] border-white/5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <History className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">Consultas Disponibles</p>
            <p className="text-3xl font-bold text-white tracking-tight">{remaining.toLocaleString()}</p>
          </div>
        </Card>

        <Card className="p-6 bg-[#0B0B0F] border-white/5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-slate-500/10 flex items-center justify-center text-slate-400">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">Última Operación</p>
            <p className="text-lg font-bold text-white tracking-tight">
              {usage?.last_query_at ? new Date(usage.last_query_at).toLocaleDateString() : 'N/A'}
            </p>
            <p className="text-[10px] text-slate-500 font-medium">
              {usage?.last_query_at ? new Date(usage.last_query_at).toLocaleTimeString() : 'Sin actividad reciente'}
            </p>
          </div>
        </Card>
      </div>

      {/* Progress & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-8 bg-[#0B0B0F] border-white/5 space-y-6 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Nivel de Utilización</h3>
            <span className="text-sm font-bold text-slate-400">{percentage}%</span>
          </div>
          
          <div className="space-y-2">
            <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden p-1 border border-white/5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                className={`h-full rounded-full transition-all duration-1000 ease-out ${
                  percentage > 90 ? 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]' : 
                  percentage > 75 ? 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 
                  'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]'
                }`}
              />
            </div>
            <div className="flex justify-between text-[10px] font-bold text-slate-600 uppercase tracking-widest px-1">
              <span>0% Inicio</span>
              <span>50% Medio</span>
              <span>100% Límite</span>
            </div>
          </div>

          <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex gap-4">
            <AlertTriangle className={`w-5 h-5 flex-shrink-0 ${
              remaining === 0 ? 'text-rose-600' : 
              percentage >= 90 ? 'text-rose-500' : 
              percentage >= 80 ? 'text-amber-500' : 
              'text-indigo-400'
            }`} />
            <div>
              <p className="text-xs font-bold text-white mb-1">
                {remaining === 0 ? 'ALERTA: Has alcanzado el límite de consultas disponibles.' :
                 percentage >= 90 ? 'ALERTA CRÍTICA: Menos del 10% de saldo restante' :
                 percentage >= 80 ? 'ALERTA: Menos del 20% de saldo restante' :
                 'Estado de Consumo: Operación Normal'}
              </p>
              <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                {remaining === 0 ? 'Su cupo de consultas API se ha agotado completamente. El servicio de consulta de lugar de votación ha sido suspendido temporalmente hasta que se realice una nueva asignación de créditos.' :
                 percentage >= 90 ? 'Su consumo ha superado el 90% de la capacidad contratada. Se recomienda realizar una recarga inmediata para evitar la suspensión del servicio.' :
                 percentage >= 80 ? 'Su consumo ha superado el 80% de la capacidad contratada. Por favor planifique una recarga de créditos en los próximos días.' :
                 'Su nivel de consumo es óptimo para la operación actual. No se requieren acciones adicionales en este momento.'}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-8 bg-indigo-600/5 border border-indigo-500/10 flex flex-col justify-center items-center text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-full bg-indigo-600/10 flex items-center justify-center text-indigo-400 mb-2">
            <Download className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">¿Necesita más créditos?</h3>
          <p className="text-xs text-slate-400 font-medium leading-relaxed px-4">
            Si su operación requiere un aumento en el límite de consultas API, puede solicitar una ampliación de cupo con su asesor de cuenta.
          </p>
          <Button className="w-full bg-indigo-600 hover:bg-indigo-500 font-bold uppercase tracking-widest text-[10px] py-4 rounded-xl shadow-lg shadow-indigo-600/20">
            Solicitar Ampliación
          </Button>
        </Card>
      </div>

      {/* Detailed Transactions History */}
      <Card className="bg-[#111114] border border-white/5 rounded-[32px] overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <History className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Historial de Transacciones</h3>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.01] border-b border-white/5">
                <th className="px-8 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Fecha & Hora</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tipo</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Descripción</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Monto</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Nuevo Saldo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="px-8 py-5">
                    <p className="text-[11px] font-bold text-white mb-0.5">{new Date(tx.created_at).toLocaleDateString()}</p>
                    <p className="text-[9px] text-slate-500 font-medium">{new Date(tx.created_at).toLocaleTimeString()}</p>
                  </td>
                  <td className="px-8 py-5">
                    <Badge className={
                      tx.transaction_type === 'CONSUMO' ? 'bg-amber-500/10 text-amber-500' : 
                      tx.transaction_type === 'ASIGNACION' ? 'bg-emerald-500/10 text-emerald-500' : 
                      'bg-indigo-500/10 text-indigo-500'
                    }>
                      {tx.transaction_type}
                    </Badge>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-[11px] text-slate-400 font-medium line-clamp-1">{tx.details || 'Consulta de lugar de votación'}</p>
                  </td>
                  <td className={`px-8 py-5 text-right font-bold text-[11px] ${
                    tx.amount > 0 ? 'text-emerald-500' : 'text-rose-500'
                  }`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount}
                  </td>
                  <td className="px-8 py-5 text-right font-bold text-[11px] text-slate-300">
                    {tx.new_balance}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                    Aún no existen consultas registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

