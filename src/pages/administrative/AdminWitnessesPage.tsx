import React, { useState } from 'react';
import { 
  Eye, 
  Plus, 
  Search, 
  Download, 
  CheckCircle2, 
  X, 
  Save, 
  AlertCircle, 
  MapPin, 
  Award,
  Filter,
  Shield
} from 'lucide-react';
import { supabase } from '@/src/lib/supabase';
import { useAuth } from '@/src/contexts/AuthContext';
import { useAdministrativeData } from '@/src/hooks/useAdministrativeData';
import { Witness } from '@/src/types';

export default function AdminWitnessesPage() {
  const { user, client } = useAuth();
  const { witnesses, refresh, loading } = useAdministrativeData();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form
  const [form, setForm] = useState({
    nombre: '',
    cedula: '',
    telefono: '',
    email: '',
    puestoVotacion: '',
    mesa: '',
    tipoTestigo: 'PRINCIPAL' as 'PRINCIPAL' | 'REMANENTE' | 'GENERAL',
    estadoAcreditacion: 'ACREDITADO' as 'PENDIENTE' | 'ACREDITADO' | 'RECHAZADO'
  });

  const filteredWitnesses = witnesses.filter(w => {
    const matchSearch = w.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.cedula.includes(searchTerm) ||
      (w.puestoVotacion && w.puestoVotacion.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchStatus = statusFilter === 'ALL' || w.estadoAcreditacion === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleSaveWitness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim() || !form.cedula.trim()) {
      setMessage({ text: 'Nombre y Cédula son obligatorios', type: 'error' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const clientId = user?.tenantId || client?.id;
      const { error } = await supabase.from('witnesses').insert([
        {
          client_id: clientId,
          nombre: form.nombre.trim(),
          cedula: form.cedula.trim(),
          telefono: form.telefono.trim(),
          email: form.email.trim(),
          puesto_votacion: form.puestoVotacion.trim(),
          mesa: form.mesa.trim(),
          tipo_testigo: form.tipoTestigo,
          estado_acreditacion: form.estadoAcreditacion
        }
      ]);

      if (error) throw error;

      setMessage({ text: 'Testigo electoral registrado con éxito', type: 'success' });
      await refresh();
      setForm({
        nombre: '',
        cedula: '',
        telefono: '',
        email: '',
        puestoVotacion: '',
        mesa: '',
        tipoTestigo: 'PRINCIPAL',
        estadoAcreditacion: 'ACREDITADO'
      });
      setTimeout(() => {
        setIsModalOpen(false);
        setMessage(null);
      }, 800);
    } catch (err: any) {
      console.error('Error saving witness:', err);
      setMessage({ text: err.message || 'Error al registrar testigo', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const exportWitnessesCSV = () => {
    if (witnesses.length === 0) return;

    const headers = 'Nombre,Cedula,Telefono,Email,PuestoVotacion,Mesa,TipoTestigo,EstadoAcreditacion\n';
    const rows = witnesses.map(w => 
      `"${w.nombre}","${w.cedula}","${w.telefono || ''}","${w.email || ''}","${w.puestoVotacion || ''}","${w.mesa || ''}","${w.tipoTestigo}","${w.estadoAcreditacion}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `testigos_electorales_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Eye className="w-5 h-5 text-amber-400" />
            Gestión de Testigos Electorales
          </h2>
          <p className="text-xs text-slate-400">
            Acreditación oficial, asignación de mesas y control de cobertura de vigilancia electoral.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportWitnessesCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/10 text-xs font-medium flex items-center gap-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            Exportar Padrón
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-lg shadow-amber-600/30"
          >
            <Plus className="w-4 h-4" />
            Registrar Testigo
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-slate-900/60 border border-white/5 p-5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Testigos</span>
          <span className="text-2xl font-black text-white mt-1 block">{witnesses.length}</span>
          <p className="text-[11px] text-slate-500 mt-1">Registrados en plataforma</p>
        </div>
        <div className="rounded-2xl bg-slate-900/60 border border-white/5 p-5">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Acreditados CNE</span>
          <span className="text-2xl font-black text-emerald-400 mt-1 block">
            {witnesses.filter(w => w.estadoAcreditacion === 'ACREDITADO').length}
          </span>
          <p className="text-[11px] text-slate-500 mt-1">Listos para el día de comicios</p>
        </div>
        <div className="rounded-2xl bg-slate-900/60 border border-white/5 p-5">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Pendientes de Validación</span>
          <span className="text-2xl font-black text-amber-400 mt-1 block">
            {witnesses.filter(w => w.estadoAcreditacion === 'PENDIENTE').length}
          </span>
          <p className="text-[11px] text-slate-500 mt-1">En proceso de acreditación</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, cédula o puesto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500 w-full sm:w-auto"
        >
          <option value="ALL">Todos los Estados</option>
          <option value="ACREDITADO">Acreditados</option>
          <option value="PENDIENTE">Pendientes</option>
          <option value="RECHAZADO">Rechazados</option>
        </select>
      </div>

      {/* Witnesses Table */}
      <div className="rounded-2xl bg-slate-900/60 border border-white/5 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-white/10 text-slate-400">
              <tr>
                <th className="py-3 px-4 font-semibold">Testigo</th>
                <th className="py-3 px-4 font-semibold">Cédula</th>
                <th className="py-3 px-4 font-semibold">Contacto</th>
                <th className="py-3 px-4 font-semibold">Puesto Asignado</th>
                <th className="py-3 px-4 font-semibold">Mesa</th>
                <th className="py-3 px-4 font-semibold">Tipo</th>
                <th className="py-3 px-4 font-semibold text-center">Acreditación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredWitnesses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No se encontraron testigos registrados. Haz clic en "Registrar Testigo".
                  </td>
                </tr>
              ) : (
                filteredWitnesses.map((w) => (
                  <tr key={w.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white">{w.nombre}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">{w.cedula}</td>
                    <td className="py-3.5 px-4 text-slate-400">{w.telefono || '-'}</td>
                    <td className="py-3.5 px-4 text-slate-300 font-medium">{w.puestoVotacion || 'Sin puesto'}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">{w.mesa ? `Mesa ${w.mesa}` : 'General'}</td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {w.tipoTestigo}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        w.estadoAcreditacion === 'ACREDITADO'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : w.estadoAcreditacion === 'PENDIENTE'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {w.estadoAcreditacion}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-amber-400" />
                Registrar Testigo Electoral
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
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

            <form onSubmit={handleSaveWitness} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Jorge Ramírez"
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Cédula *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. 1098765432"
                    value={form.cedula}
                    onChange={(e) => setForm({ ...form, cedula: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Teléfono</label>
                  <input
                    type="tel"
                    placeholder="Ej. 3156789012"
                    value={form.telefono}
                    onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tipo de Testigo</label>
                  <select
                    value={form.tipoTestigo}
                    onChange={(e) => setForm({ ...form, tipoTestigo: e.target.value as any })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 outline-none"
                  >
                    <option value="PRINCIPAL">Principal de Mesa</option>
                    <option value="REMANENTE">Remanente</option>
                    <option value="GENERAL">Coordinador General de Puesto</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Puesto de Votación</label>
                  <input
                    type="text"
                    placeholder="Ej. Colegio Nacional"
                    value={form.puestoVotacion}
                    onChange={(e) => setForm({ ...form, puestoVotacion: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Mesa Asignada</label>
                  <input
                    type="text"
                    placeholder="Ej. Mesa 12"
                    value={form.mesa}
                    onChange={(e) => setForm({ ...form, mesa: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Estado de Acreditación CNE</label>
                <select
                  value={form.estadoAcreditacion}
                  onChange={(e) => setForm({ ...form, estadoAcreditacion: e.target.value as any })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 outline-none"
                >
                  <option value="ACREDITADO">Acreditado Oficialmente</option>
                  <option value="PENDIENTE">Pendiente por Enviar a CNE</option>
                  <option value="RECHAZADO">Rechazado</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-amber-600/30"
                >
                  <Save className="w-3.5 h-3.5" />
                  {saving ? 'Guardando...' : 'Guardar Testigo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
