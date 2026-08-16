import React, { useState } from 'react';
import { 
  Award, 
  Plus, 
  Search, 
  Download, 
  CheckCircle2, 
  X, 
  Save, 
  AlertCircle, 
  UserCheck,
  HeartHandshake
} from 'lucide-react';
import { supabase } from '@/src/lib/supabase';
import { useAuth } from '@/src/contexts/AuthContext';
import { useAdministrativeData } from '@/src/hooks/useAdministrativeData';
import { Juror } from '@/src/types';

export default function AdminJurorsPage() {
  const { user, client } = useAuth();
  const { jurors, refresh, loading } = useAdministrativeData();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [affinityFilter, setAffinityFilter] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form
  const [form, setForm] = useState({
    nombre: '',
    cedula: '',
    telefono: '',
    puestoVotacion: '',
    mesa: '',
    rolJurado: 'PRESIDENTE' as 'PRESIDENTE' | 'VICEPRESIDENTE' | 'VOCAL' | 'REMANENTE',
    afinidad: 'A FAVOR' as 'A FAVOR' | 'NEUTRAL' | 'EN CONTRA' | 'DESCONOCIDA'
  });

  const filteredJurors = jurors.filter(j => {
    const matchSearch = j.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.cedula.includes(searchTerm) ||
      (j.puestoVotacion && j.puestoVotacion.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchAffinity = affinityFilter === 'ALL' || j.afinidad === affinityFilter;
    return matchSearch && matchAffinity;
  });

  const handleSaveJuror = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim() || !form.cedula.trim()) {
      setMessage({ text: 'Nombre y Cédula son obligatorios', type: 'error' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const clientId = user?.tenantId || client?.id;
      const { error } = await supabase.from('jurors').insert([
        {
          client_id: clientId,
          nombre: form.nombre.trim(),
          cedula: form.cedula.trim(),
          telefono: form.telefono.trim(),
          puesto_votacion: form.puestoVotacion.trim(),
          mesa: form.mesa.trim(),
          rol_jurado: form.rolJurado,
          afinidad: form.afinidad
        }
      ]);

      if (error) throw error;

      setMessage({ text: 'Jurado electoral registrado con éxito', type: 'success' });
      await refresh();
      setForm({
        nombre: '',
        cedula: '',
        telefono: '',
        puestoVotacion: '',
        mesa: '',
        rolJurado: 'PRESIDENTE',
        afinidad: 'A FAVOR'
      });
      setTimeout(() => {
        setIsModalOpen(false);
        setMessage(null);
      }, 800);
    } catch (err: any) {
      console.error('Error saving juror:', err);
      setMessage({ text: err.message || 'Error al registrar jurado', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const exportJurorsCSV = () => {
    if (jurors.length === 0) return;

    const headers = 'Nombre,Cedula,Telefono,PuestoVotacion,Mesa,RolJurado,Afinidad\n';
    const rows = jurors.map(j => 
      `"${j.nombre}","${j.cedula}","${j.telefono || ''}","${j.puestoVotacion || ''}","${j.mesa || ''}","${j.rolJurado}","${j.afinidad}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `jurados_electorales_${new Date().toISOString().split('T')[0]}.csv`);
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
            <Award className="w-5 h-5 text-cyan-400" />
            Jurados Electorales
          </h2>
          <p className="text-xs text-slate-400">
            Identificación de jurados de votación en mesas, asignación de roles y afinidad política.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportJurorsCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/10 text-xs font-medium flex items-center gap-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            Exportar Padrón
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-lg shadow-cyan-600/30"
          >
            <Plus className="w-4 h-4" />
            Registrar Jurado
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-slate-900/60 border border-white/5 p-5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Jurados Identificados</span>
          <span className="text-2xl font-black text-white mt-1 block">{jurors.length}</span>
          <p className="text-[11px] text-slate-500 mt-1">Registrados en la circunscripción</p>
        </div>
        <div className="rounded-2xl bg-slate-900/60 border border-white/5 p-5">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Afinidad A Favor</span>
          <span className="text-2xl font-black text-emerald-400 mt-1 block">
            {jurors.filter(j => j.afinidad === 'A FAVOR').length}
          </span>
          <p className="text-[11px] text-slate-500 mt-1">Jurados afines o simpatizantes</p>
        </div>
        <div className="rounded-2xl bg-slate-900/60 border border-white/5 p-5">
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Presidentes de Mesa</span>
          <span className="text-2xl font-black text-cyan-400 mt-1 block">
            {jurors.filter(j => j.rolJurado === 'PRESIDENTE').length}
          </span>
          <p className="text-[11px] text-slate-500 mt-1">Líderes de mesa electoral</p>
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
            className="w-full bg-slate-900 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <select
          value={affinityFilter}
          onChange={(e) => setAffinityFilter(e.target.value)}
          className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 w-full sm:w-auto"
        >
          <option value="ALL">Todas las Afinidades</option>
          <option value="A FAVOR">A Favor</option>
          <option value="NEUTRAL">Neutral</option>
          <option value="EN CONTRA">En Contra</option>
          <option value="DESCONOCIDA">Desconocida</option>
        </select>
      </div>

      {/* Jurors Table */}
      <div className="rounded-2xl bg-slate-900/60 border border-white/5 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-white/10 text-slate-400">
              <tr>
                <th className="py-3 px-4 font-semibold">Jurado</th>
                <th className="py-3 px-4 font-semibold">Cédula</th>
                <th className="py-3 px-4 font-semibold">Contacto</th>
                <th className="py-3 px-4 font-semibold">Puesto de Votación</th>
                <th className="py-3 px-4 font-semibold">Mesa</th>
                <th className="py-3 px-4 font-semibold">Rol</th>
                <th className="py-3 px-4 font-semibold text-center">Afinidad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredJurors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No se encontraron jurados registrados. Haz clic en "Registrar Jurado".
                  </td>
                </tr>
              ) : (
                filteredJurors.map((j) => (
                  <tr key={j.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white">{j.nombre}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">{j.cedula}</td>
                    <td className="py-3.5 px-4 text-slate-400">{j.telefono || '-'}</td>
                    <td className="py-3.5 px-4 text-slate-300 font-medium">{j.puestoVotacion || 'Sin puesto'}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">{j.mesa ? `Mesa ${j.mesa}` : 'General'}</td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {j.rolJurado}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        j.afinidad === 'A FAVOR'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : j.afinidad === 'NEUTRAL'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : j.afinidad === 'EN CONTRA'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {j.afinidad}
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
                <Award className="w-4 h-4 text-cyan-400" />
                Registrar Jurado Electoral
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

            <form onSubmit={handleSaveJuror} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Martha Suárez"
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Cédula *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. 63456789"
                    value={form.cedula}
                    onChange={(e) => setForm({ ...form, cedula: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Teléfono</label>
                  <input
                    type="tel"
                    placeholder="Ej. 3187654321"
                    value={form.telefono}
                    onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Rol de Jurado</label>
                  <select
                    value={form.rolJurado}
                    onChange={(e) => setForm({ ...form, rolJurado: e.target.value as any })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 outline-none"
                  >
                    <option value="PRESIDENTE">Presidente de Mesa</option>
                    <option value="VICEPRESIDENTE">Vicepresidente</option>
                    <option value="VOCAL">Vocal</option>
                    <option value="REMANENTE">Remanente</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Puesto de Votación</label>
                  <input
                    type="text"
                    placeholder="Ej. Concentración Escolar Sur"
                    value={form.puestoVotacion}
                    onChange={(e) => setForm({ ...form, puestoVotacion: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Mesa Asignada</label>
                  <input
                    type="text"
                    placeholder="Ej. Mesa 8"
                    value={form.mesa}
                    onChange={(e) => setForm({ ...form, mesa: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Afinidad Política Estimada</label>
                <select
                  value={form.afinidad}
                  onChange={(e) => setForm({ ...form, afinidad: e.target.value as any })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 outline-none"
                >
                  <option value="A FAVOR">A Favor de la Campaña</option>
                  <option value="NEUTRAL">Neutral / Institucional</option>
                  <option value="EN CONTRA">Oposición / En Contra</option>
                  <option value="DESCONOCIDA">Desconocida / Por verificar</option>
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
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-cyan-600/30"
                >
                  <Save className="w-3.5 h-3.5" />
                  {saving ? 'Guardando...' : 'Guardar Jurado'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
