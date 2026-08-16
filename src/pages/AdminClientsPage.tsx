import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, Filter, MoreVertical, Edit2, Trash2, Shield, Users, Loader2, AlertCircle } from 'lucide-react';
import { Table, TableRow, TableCell } from '@/src/components/ui/Table';
import { Badge } from '@/src/components/ui/Badge';
import { Button } from '@/src/components/ui/Button';
import { formatDate } from '@/src/lib/utils';
import { useClients, Client } from '@/src/hooks/useClients';

export default function AdminClientsPage() {
  const { clients, loading, error, addClient, updateClient } = useClients();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = useMemo(() => {
    return clients.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.includes(searchTerm)
    );
  }, [clients, searchTerm]);

  const handleCreateTestClient = async () => {
    const name = prompt('Nombre de la organización:');
    if (!name) return;
    
    try {
      await addClient({
        name,
        email: `admin@${name.toLowerCase().replace(/\s+/g, '')}.com`,
        status: 'ACTIVE',
        plan: 'BASIC',
        modules: ['CRM', 'STRATEGY', 'TERRITORY', 'ELECTORAL'],
        max_users: 10
      });
      alert('Cliente creado exitosamente');
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleToggleStatus = async (client: Client) => {
    const newStatus = client.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await updateClient(client.id, { status: newStatus });
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-sm font-bold uppercase tracking-widest text-white">Cargando Clientes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-rose-500/10 border border-rose-500/20 rounded-[32px] text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <div>
          <h3 className="text-lg font-bold text-white">Error de Red</h3>
          <p className="text-slate-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Gestión de Clientes</h1>
          <p className="text-slate-400">Administra los tenants, licencias y accesos de la plataforma.</p>
        </div>
        <Button onClick={handleCreateTestClient} className="gap-2 bg-indigo-600 hover:bg-indigo-500">
          <Plus className="w-5 h-5" /> Nuevo Cliente
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por nombre, email o ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[#111114] border border-white/5 rounded-2xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          />
        </div>
        <Button variant="outline" className="gap-2 bg-[#111114] border-white/5">
          <Filter className="w-4 h-4" /> Filtros
        </Button>
      </div>

      <div className="bg-[#111114] border border-white/5 rounded-[32px] overflow-hidden">
        <Table headers={['Cliente', 'Estado', 'Plan', 'Usuarios', 'Registro', 'Acciones']}>
          <AnimatePresence mode="popLayout">
            {filteredClients.map((client) => (
              <TableRow key={client.id} className="hover:bg-white/[0.01] transition-colors">
                <TableCell>
                  <div>
                    <p className="font-semibold text-white group-hover:text-indigo-400 transition-colors">{client.name}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{client.email}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={
                      client.status === 'ACTIVE' ? 'success' : 
                      client.status === 'SUSPENDED' ? 'warning' : 'neutral'
                    }
                    className="py-1 px-3 text-[10px] font-bold"
                  >
                    {client.status === 'ACTIVE' ? 'Activo' : 
                     client.status === 'SUSPENDED' ? 'Suspendido' : 'Inactivo'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="font-bold text-[10px] uppercase tracking-widest text-indigo-400">{client.plan}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-500" />
                    <span className="text-white font-bold">{client.max_users}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-slate-500 text-xs font-medium">{formatDate(client.created_at)}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleToggleStatus(client)}
                      className="p-2 text-slate-500 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-xl transition-all"
                    >
                      <Shield className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </AnimatePresence>
        </Table>
        {filteredClients.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-slate-500 italic">No se encontraron clientes que coincidan con la búsqueda.</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-slate-500 px-4">
        <p>Total: {filteredClients.length} organizaciones</p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled className="bg-transparent border-white/5">Anterior</Button>
          <Button variant="outline" size="sm" disabled className="bg-transparent border-white/5">Siguiente</Button>
        </div>
      </div>
    </div>
  );
}

