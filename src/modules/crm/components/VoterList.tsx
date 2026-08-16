import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Filter, 
  Phone, 
  MapPin, 
  MoreVertical, 
  Trash2, 
  Edit2, 
  UserCheck, 
  MessageSquare, 
  Loader2, 
  AlertCircle,
  X,
  Save,
  CheckCircle2
} from 'lucide-react';
import { Card } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Badge';
import { useVoters, Voter } from '@/src/hooks/useVoters';
import { Button } from '@/src/components/ui/Button';

export function VoterList() {
  const { voters, loading, error, deleteVoter, updateVoter } = useVoters();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterIntencion, setFilterIntencion] = useState<string>('all');
  
  // Edit State
  const [editingVoter, setEditingVoter] = useState<Voter | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const filteredVoters = useMemo(() => {
    return voters.filter(v => {
      const matchesSearch = 
        v.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.cedula.includes(searchTerm) ||
        v.puesto.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterIntencion === 'all' || v.intencion === filterIntencion;
      
      return matchesSearch && matchesFilter;
    });
  }, [voters, searchTerm, filterIntencion]);

  const handleDelete = async (id: string) => {
    if (confirm('¿Está seguro de eliminar este registro?')) {
      try {
        await deleteVoter(id);
      } catch (err: any) {
        alert('Error al eliminar: ' + err.message);
      }
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVoter) return;

    try {
      setIsUpdating(true);
      await updateVoter(editingVoter.id, {
        nombre: editingVoter.nombre,
        telefono: editingVoter.telefono,
        intencion: editingVoter.intencion,
        puesto: editingVoter.puesto,
        mesa: editingVoter.mesa
      });
      setEditingVoter(null);
      alert('Registro actualizado exitosamente');
    } catch (err: any) {
      alert('Error al actualizar: ' + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-sm font-bold uppercase tracking-widest text-white">Sincronizando Base de Datos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-rose-500/10 border border-rose-500/20 rounded-[32px] text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <div>
          <h3 className="text-lg font-bold text-white">Error de Comunicación</h3>
          <p className="text-slate-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Edit Modal */}
      <AnimatePresence>
        {editingVoter && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#111114] border border-white/10 rounded-[32px] w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl custom-scrollbar"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#111114] z-10">
                <h3 className="text-xl font-bold text-white">Editar Votante</h3>
                <button onClick={() => setEditingVoter(null)} className="text-slate-500 hover:text-white p-2">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleUpdate} className="p-6 md:p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nombre Completo</label>
                  <input 
                    type="text"
                    value={editingVoter.nombre}
                    onChange={e => setEditingVoter({...editingVoter, nombre: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Teléfono</label>
                    <input 
                      type="text"
                      value={editingVoter.telefono}
                      onChange={e => setEditingVoter({...editingVoter, telefono: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Intención</label>
                    <select 
                      value={editingVoter.intencion}
                      onChange={e => setEditingVoter({...editingVoter, intencion: e.target.value as any})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none"
                    >
                      <option value="Voto Seguro">Voto Seguro</option>
                      <option value="Simpatizante">Simpatizante</option>
                      <option value="Indeciso">Indeciso</option>
                      <option value="Opositor">Opositor</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Puesto de Votación</label>
                  <input 
                    type="text"
                    value={editingVoter.puesto}
                    onChange={e => setEditingVoter({...editingVoter, puesto: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none"
                  />
                </div>
                <Button type="submit" disabled={isUpdating} className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 gap-2">
                  {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Guardar Cambios
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#111114] p-4 rounded-[24px] border border-white/5 shadow-xl">
        <div className="flex-1 w-full relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Buscar por nombre, cédula o puesto..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/20 border border-white/5 rounded-2xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select 
            value={filterIntencion}
            onChange={(e) => setFilterIntencion(e.target.value)}
            className="bg-[#1a1a1e] border border-white/5 rounded-2xl px-4 py-3 text-xs font-bold text-slate-400 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">Todas las Intenciones</option>
            <option value="Voto Seguro">Voto Seguro</option>
            <option value="Simpatizante">Simpatizante</option>
            <option value="Indeciso">Indeciso</option>
            <option value="Opositor">Opositor</option>
          </select>
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/5 rounded-2xl text-xs font-bold text-slate-400 hover:text-white transition-all">
            <MessageSquare className="w-4 h-4" /> Masivo
          </button>
        </div>
      </div>

      {/* Grid of Voters */}
      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredVoters.length > 0 ? (
            filteredVoters.map((voter) => (
              <motion.div
                key={voter.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group"
              >
                <Card className="bg-[#111114] border-white/5 hover:border-indigo-500/30 transition-all p-6 rounded-[28px] shadow-lg">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-600/20 flex items-center justify-center font-bold text-indigo-400 text-xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                        {voter.nombre.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-lg group-hover:text-indigo-400 transition-colors">{voter.nombre}</h4>
                        <p className="text-slate-500 text-xs font-bold tracking-widest uppercase mt-0.5">CC: {voter.cedula}</p>
                      </div>
                    </div>

                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Contacto Directo</span>
                        <p className="text-slate-300 text-sm flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-500" /> {voter.telefono}
                        </p>
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Puesto & Mesa</span>
                        <p className="text-slate-300 text-sm flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" /> {voter.puesto} <span className="text-indigo-500 font-bold ml-1">Mesa {voter.mesa}</span>
                        </p>
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Líder Asignado</span>
                        <p className="text-indigo-400 text-sm font-bold flex items-center gap-2">
                          <UserCheck className="w-3.5 h-3.5 text-indigo-500/50" /> {voter.lider_nombre || 'Sin líder'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-4 pt-4 md:pt-0 border-t md:border-0 border-white/5">
                      <Badge 
                        variant={voter.intencion === 'Voto Seguro' ? 'success' : voter.intencion === 'Opositor' ? 'error' : 'primary'}
                        className="py-1 px-3 text-[10px] font-bold uppercase tracking-wider"
                      >
                        {voter.intencion}
                      </Badge>
                      <div className="flex gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => setEditingVoter(voter)}
                          className="p-2.5 text-slate-400 hover:text-white transition-colors bg-white/5 md:bg-transparent rounded-xl md:rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(voter.id)}
                          className="p-2.5 text-slate-400 hover:text-rose-500 transition-colors bg-white/5 md:bg-transparent rounded-xl md:rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-20 bg-white/[0.01] rounded-[40px] border border-dashed border-white/5">
              <p className="text-slate-500 font-medium italic">No se encontraron votantes que coincidan con la búsqueda.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
