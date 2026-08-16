import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Upload,
  Plus,
  BarChart3,
  AlertTriangle,
  Loader2,
  X,
  Save,
  Trash2
} from 'lucide-react';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { useElectoral } from '@/src/hooks/useElectoral';

export default function ElectoralPage() {
  const { records, loading, error, addRecord, updateRecord, deleteRecord } = useElectoral();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Registration State
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newRecord, setNewRecord] = useState({
    mesa: '',
    puesto: '',
    votos: 0,
    witness_name: ''
  });

  const filteredRecords = records.filter(r => 
    r.mesa.includes(searchTerm) || r.puesto.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalVotes = records.reduce((sum, r) => sum + (r.status === 'VALIDADO' ? r.votos : 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecord.mesa || !newRecord.puesto) return;

    try {
      setIsSubmitting(true);
      await addRecord({
        ...newRecord,
        status: 'PENDIENTE'
      });
      setIsAdding(false);
      setNewRecord({ mesa: '', puesto: '', votos: 0, witness_name: '' });
      alert('Acta registrada para validación');
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-sm font-bold uppercase tracking-widest text-white">Cargando Escrutinio Real...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Modal Registro E14 */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#111114] border border-white/10 rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Registrar Acta E14</h3>
                <button onClick={() => setIsAdding(false)} className="text-slate-500 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Número de Mesa</label>
                    <input 
                      type="text"
                      required
                      value={newRecord.mesa}
                      onChange={e => setNewRecord({...newRecord, mesa: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none"
                      placeholder="Ej: 012"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Votos Mesa</label>
                    <input 
                      type="number"
                      required
                      value={newRecord.votos}
                      onChange={e => setNewRecord({...newRecord, votos: parseInt(e.target.value)})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Puesto de Votación</label>
                  <input 
                    type="text"
                    required
                    value={newRecord.puesto}
                    onChange={e => setNewRecord({...newRecord, puesto: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none"
                    placeholder="Nombre del puesto..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Testigo Responsable</label>
                  <input 
                    type="text"
                    value={newRecord.witness_name}
                    onChange={e => setNewRecord({...newRecord, witness_name: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none"
                    placeholder="Nombre del testigo..."
                  />
                </div>
                <Button type="submit" disabled={isSubmitting} className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 gap-2">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Confirmar Reporte
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Control Electoral (E14)</h1>
          <p className="text-slate-400">Validación de actas, testigos y conteo de votos en tiempo real.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 bg-[#111114] border-white/5">
            <Upload className="w-4 h-4" /> Importar Masivo
          </Button>
          <Button onClick={() => setIsAdding(true)} className="gap-2 bg-indigo-600 hover:bg-indigo-500">
            <Plus className="w-4 h-4" /> Registrar Acta
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-[#111114] border-white/5 p-6">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Votos Validados</p>
          <h3 className="text-3xl font-bold text-emerald-500">{totalVotes.toLocaleString()}</h3>
          <p className="text-[10px] text-slate-600 mt-2 font-bold uppercase">Consolidado Nacional</p>
        </Card>
        <Card className="bg-[#111114] border-white/5 p-6">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Mesas Reportadas</p>
          <h3 className="text-3xl font-bold text-white">{records.length}</h3>
          <p className="text-[10px] text-slate-600 mt-2 font-bold uppercase">De 12,450 proyectadas</p>
        </Card>
        <Card className="bg-[#111114] border-white/5 p-6">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Alertas / Discrepancias</p>
          <h3 className="text-3xl font-bold text-rose-500">{records.filter(r => r.status === 'ERROR').length}</h3>
          <p className="text-[10px] text-rose-500/50 mt-2 font-bold uppercase tracking-widest flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Requiere revisión
          </p>
        </Card>
        <Card className="bg-[#111114] border-white/5 p-6">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Efectividad Testigos</p>
          <h3 className="text-3xl font-bold text-indigo-500">92%</h3>
          <p className="text-[10px] text-indigo-500/50 mt-2 font-bold uppercase">Cobertura en Puestos</p>
        </Card>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Buscar por mesa o puesto de votación..." 
            className="w-full bg-[#111114] border border-white/5 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="bg-[#111114] border-white/5 gap-2">
          <Filter className="w-4 h-4" /> Filtros Electorales
        </Button>
      </div>

      {/* E14 Records Table */}
      <div className="bg-[#111114] border border-white/5 rounded-[32px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5">
                <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Acta / Mesa</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Puesto de Votación</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Votos</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Estado</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <AnimatePresence mode="popLayout">
                {filteredRecords.map((record) => (
                  <motion.tr 
                    key={record.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-white/[0.01] transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600/10 group-hover:text-indigo-400 transition-all">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">Mesa {record.mesa}</p>
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest">ID: {record.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm text-slate-300">
                      {record.puesto}
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-lg font-bold text-white">{record.votos.toLocaleString()}</span>
                    </td>
                    <td className="px-8 py-6">
                      <Badge variant={
                        record.status === 'VALIDADO' ? 'success' : 
                        record.status === 'ERROR' ? 'error' : 'neutral'
                      }>
                        {record.status}
                      </Badge>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        {record.status === 'PENDIENTE' && (
                          <>
                            <button 
                              onClick={() => updateRecord(record.id, { status: 'VALIDADO' })}
                              className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all"
                              title="Validar Acta"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => updateRecord(record.id, { status: 'ERROR' })}
                              className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                              title="Marcar con Error"
                            >
                              <AlertTriangle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button 
                          onClick={() => {
                            if(confirm('¿Eliminar acta?')) deleteRecord(record.id);
                          }}
                          className="p-2 text-slate-500 hover:text-white transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        {filteredRecords.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-slate-500 italic">No se han registrado actas para esta búsqueda.</p>
          </div>
        )}
      </div>
    </div>
  );
}
