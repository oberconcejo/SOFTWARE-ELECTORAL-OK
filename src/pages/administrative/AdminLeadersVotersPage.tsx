import React, { useState } from 'react';
import { 
  Users, 
  UserCheck, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Phone, 
  Mail, 
  MapPin, 
  Vote, 
  CheckCircle2, 
  X, 
  Save, 
  AlertCircle,
  FileSpreadsheet,
  Trash2,
  Edit2,
  Loader2
} from 'lucide-react';
import { supabase } from '@/src/lib/supabase';
import { useAuth } from '@/src/contexts/AuthContext';
import { useAdministrativeData } from '@/src/hooks/useAdministrativeData';
import { useTerritory } from '@/src/hooks/useTerritory';
import { Leader, Voter } from '@/src/types';

export default function AdminLeadersVotersPage() {
  const { user, client } = useAuth();
  const { leaders, voters, refresh, loading: loadingData } = useAdministrativeData();
  const { zones, subdivisions, loading: loadingTerritory, loadingSubdivisions, refreshSubdivisions } = useTerritory();
  
  const [activeTab, setActiveTab] = useState<'leaders' | 'voters'>('leaders');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedComuna, setSelectedComuna] = useState<string>('ALL');
  const [selectedIntention, setSelectedIntention] = useState<string>('ALL');
  
  // Modals state
  const [isLeaderModalOpen, setIsLeaderModalOpen] = useState(false);
  const [isVoterModalOpen, setIsVoterModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Leader Form
  const [leaderForm, setLeaderForm] = useState({
    nombre: '',
    cedula: '',
    telefono: '',
    email: '',
    zoneId: '',
    subdivisionId: '',
    puesto: '',
    mesa: '',
    metaVotos: 50
  });

  // Voter Form
  const [voterForm, setVoterForm] = useState({
    nombre: '',
    cedula: '',
    telefono: '',
    email: '',
    zoneId: '',
    subdivisionId: '',
    puesto: '',
    mesa: '',
    liderId: '',
    intencion: 'Voto Seguro' as 'Voto Seguro' | 'Probable' | 'Indeciso' | 'En Contra'
  });

  // Handle Zone Change for Forms
  const handleZoneChange = (type: 'leader' | 'voter', zoneId: string) => {
    if (type === 'leader') {
      setLeaderForm({ ...leaderForm, zoneId, subdivisionId: '' });
    } else {
      setVoterForm({ ...voterForm, zoneId, subdivisionId: '' });
    }
    
    if (zoneId) {
      refreshSubdivisions(zoneId);
    }
  };

  // Filtered Leaders
  const filteredLeaders = leaders.filter(l => {
    const matchSearch = l.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.cedula.includes(searchTerm) ||
      (l.barrio && l.barrio.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchComuna = selectedComuna === 'ALL' || l.comuna === selectedComuna;
    return matchSearch && matchComuna;
  });

  // Filtered Voters
  const filteredVoters = voters.filter(v => {
    const matchSearch = v.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.cedula.includes(searchTerm) ||
      (v.barrio && v.barrio.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchComuna = selectedComuna === 'ALL' || v.comuna === selectedComuna;
    const matchIntention = selectedIntention === 'ALL' || v.intencion === selectedIntention;
    return matchSearch && matchComuna && matchIntention;
  });

  const handleSaveLeader = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaderForm.nombre.trim() || !leaderForm.cedula.trim()) {
      setMessage({ text: 'Nombre y Cédula son obligatorios', type: 'error' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const clientId = user?.tenantId || client?.id;
      const selectedZone = zones.find(z => z.id === leaderForm.zoneId);
      const selectedSub = subdivisions.find(s => s.id === leaderForm.subdivisionId);

      const { error } = await supabase.from('leaders').insert([
        {
          client_id: clientId,
          nombre: leaderForm.nombre.trim(),
          cedula: leaderForm.cedula.trim(),
          telefono: leaderForm.telefono.trim(),
          email: leaderForm.email.trim(),
          zone_id: leaderForm.zoneId || null,
          subdivision_id: leaderForm.subdivisionId || null,
          comuna: selectedZone?.nombre || '',
          barrio: selectedSub?.nombre || '',
          puesto: leaderForm.puesto.trim(),
          mesa: leaderForm.mesa.trim(),
          meta_votos: Number(leaderForm.metaVotos) || 50,
          status: 'ACTIVE'
        }
      ]);

      if (error) throw error;

      setMessage({ text: 'Líder registrado con éxito', type: 'success' });
      await refresh();
      setLeaderForm({
        nombre: '',
        cedula: '',
        telefono: '',
        email: '',
        zoneId: '',
        subdivisionId: '',
        puesto: '',
        mesa: '',
        metaVotos: 50
      });
      setTimeout(() => {
        setIsLeaderModalOpen(false);
        setMessage(null);
      }, 800);
    } catch (err: any) {
      console.error('Error saving leader:', err);
      setMessage({ text: err.message || 'Error al guardar líder', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveVoter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voterForm.nombre.trim() || !voterForm.cedula.trim()) {
      setMessage({ text: 'Nombre y Cédula son obligatorios', type: 'error' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const clientId = user?.tenantId || client?.id;
      const selectedZone = zones.find(z => z.id === voterForm.zoneId);
      const selectedSub = subdivisions.find(s => s.id === voterForm.subdivisionId);

      const { error } = await supabase.from('voters').insert([
        {
          client_id: clientId,
          nombre: voterForm.nombre.trim(),
          cedula: voterForm.cedula.trim(),
          telefono: voterForm.telefono.trim(),
          email: voterForm.email.trim(),
          zone_id: voterForm.zoneId || null,
          subdivision_id: voterForm.subdivisionId || null,
          comuna: selectedZone?.nombre || '',
          barrio: selectedSub?.nombre || '',
          puesto: voterForm.puesto.trim(),
          mesa: voterForm.mesa.trim(),
          lider_id: voterForm.liderId ? voterForm.liderId : null,
          intencion: voterForm.intencion,
          status: 'ACTIVE'
        }
      ]);

      if (error) throw error;

      setMessage({ text: 'Votante registrado con éxito', type: 'success' });
      await refresh();
      setVoterForm({
        nombre: '',
        cedula: '',
        telefono: '',
        email: '',
        zoneId: '',
        subdivisionId: '',
        puesto: '',
        mesa: '',
        liderId: '',
        intencion: 'Voto Seguro'
      });
      setTimeout(() => {
        setIsVoterModalOpen(false);
        setMessage(null);
      }, 800);
    } catch (err: any) {
      console.error('Error saving voter:', err);
      setMessage({ text: err.message || 'Error al guardar votante', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const exportToCSV = (type: 'leaders' | 'voters') => {
    const items = type === 'leaders' ? filteredLeaders : filteredVoters;
    if (items.length === 0) return;

    let headers = '';
    let rows = '';

    if (type === 'leaders') {
      headers = 'Nombre,Cedula,Telefono,Email,Comuna,Barrio,Puesto,Mesa,MetaVotos\n';
      rows = filteredLeaders.map(l => 
        `"${l.nombre}","${l.cedula}","${l.telefono || ''}","${l.email || ''}","${l.comuna || ''}","${l.barrio || ''}","${l.puesto || ''}","${l.mesa || ''}",${l.metaVotos}`
      ).join('\n');
    } else {
      headers = 'Nombre,Cedula,Telefono,Email,Comuna,Barrio,Puesto,Mesa,IntencionVoto\n';
      rows = filteredVoters.map(v => 
        `"${v.nombre}","${v.cedula}","${v.telefono || ''}","${v.email || ''}","${v.comuna || ''}","${v.barrio || ''}","${v.puesto || ''}","${v.mesa || ''}","${v.intencion}"`
      ).join('\n');
    }

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${type}_electoral_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            Líderes y Censo de Votantes
          </h2>
          <p className="text-xs text-slate-400">
            Control de coordinadores comunitarios, asignación territorial y registro de fidelización electoral.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportToCSV(activeTab)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/10 text-xs font-medium flex items-center gap-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            Exportar CSV
          </button>
          {activeTab === 'leaders' ? (
            <button
              onClick={() => setIsLeaderModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-lg shadow-indigo-600/30"
            >
              <Plus className="w-4 h-4" />
              Nuevo Líder
            </button>
          ) : (
            <button
              onClick={() => setIsVoterModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-lg shadow-indigo-600/30"
            >
              <Plus className="w-4 h-4" />
              Nuevo Votante
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('leaders')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'leaders' 
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' 
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          Líderes Barriales ({leaders.length})
        </button>
        <button
          onClick={() => setActiveTab('voters')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'voters' 
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' 
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Vote className="w-4 h-4" />
          Censo de Votantes ({voters.length})
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, cédula o barrio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {activeTab === 'voters' && (
          <select
            value={selectedIntention}
            onChange={(e) => setSelectedIntention(e.target.value)}
            className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 w-full sm:w-auto"
          >
            <option value="ALL">Todas las Intenciones</option>
            <option value="Voto Seguro">Voto Seguro</option>
            <option value="Probable">Probable</option>
            <option value="Indeciso">Indeciso</option>
            <option value="En Contra">En Contra</option>
          </select>
        )}
      </div>

      {/* Main Table View */}
      {activeTab === 'leaders' ? (
        <div className="rounded-2xl bg-slate-900/60 border border-white/5 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-white/10 text-slate-400">
                <tr>
                  <th className="py-3 px-4 font-semibold">Líder</th>
                  <th className="py-3 px-4 font-semibold">Cédula</th>
                  <th className="py-3 px-4 font-semibold">Contacto</th>
                  <th className="py-3 px-4 font-semibold">Ubicación</th>
                  <th className="py-3 px-4 font-semibold">Puesto / Mesa</th>
                  <th className="py-3 px-4 font-semibold text-center">Meta Votos</th>
                  <th className="py-3 px-4 font-semibold text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredLeaders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      No se encontraron líderes registrados. Haz clic en "Nuevo Líder" para agregar uno.
                    </td>
                  </tr>
                ) : (
                  filteredLeaders.map((leader) => (
                    <tr key={leader.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white">
                        {leader.nombre}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">{leader.cedula}</td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {leader.telefono && <span className="block">{leader.telefono}</span>}
                        {leader.email && <span className="block text-[11px] text-slate-500">{leader.email}</span>}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {leader.comuna && <span className="font-semibold">{leader.comuna} - </span>}
                        {leader.barrio || 'Sin barrio'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {leader.puesto ? `${leader.puesto} (M: ${leader.mesa || 'General'})` : 'Por asignar'}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-indigo-400">
                        {leader.metaVotos}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {leader.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-slate-900/60 border border-white/5 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-white/10 text-slate-400">
                <tr>
                  <th className="py-3 px-4 font-semibold">Votante</th>
                  <th className="py-3 px-4 font-semibold">Cédula</th>
                  <th className="py-3 px-4 font-semibold">Teléfono</th>
                  <th className="py-3 px-4 font-semibold">Ubicación</th>
                  <th className="py-3 px-4 font-semibold">Puesto / Mesa</th>
                  <th className="py-3 px-4 font-semibold text-center">Intención</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredVoters.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      No se encontraron votantes registrados en el censo.
                    </td>
                  </tr>
                ) : (
                  filteredVoters.map((voter) => (
                    <tr key={voter.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white">
                        {voter.nombre}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">{voter.cedula}</td>
                      <td className="py-3.5 px-4 text-slate-400">{voter.telefono || 'Sin teléfono'}</td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {voter.comuna && <span className="font-semibold">{voter.comuna} - </span>}
                        {voter.barrio || 'Sin barrio'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {voter.puesto ? `${voter.puesto} (M: ${voter.mesa || 'Todas'})` : 'Por verificar'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          voter.intencion === 'Voto Seguro' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : voter.intencion === 'Probable'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : voter.intencion === 'Indeciso'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {voter.intencion}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Leader Modal */}
      {isLeaderModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-indigo-400" />
                Registrar Nuevo Líder
              </h3>
              <button onClick={() => setIsLeaderModalOpen(false)} className="text-slate-400 hover:text-white">
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

            <form onSubmit={handleSaveLeader} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Carlos Mendoza"
                    value={leaderForm.nombre}
                    onChange={(e) => setLeaderForm({ ...leaderForm, nombre: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Cédula de Ciudadanía *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. 1098234567"
                    value={leaderForm.cedula}
                    onChange={(e) => setLeaderForm({ ...leaderForm, cedula: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Teléfono</label>
                  <input
                    type="tel"
                    placeholder="Ej. 3124567890"
                    value={leaderForm.telefono}
                    onChange={(e) => setLeaderForm({ ...leaderForm, telefono: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={leaderForm.email}
                    onChange={(e) => setLeaderForm({ ...leaderForm, email: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Circunscripción / Municipio *</label>
                  <select
                    required
                    value={leaderForm.zoneId}
                    onChange={(e) => handleZoneChange('leader', e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                  >
                    <option value="">Seleccione circunscripción</option>
                    {zones.map(z => (
                      <option key={z.id} value={z.id}>{z.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Corregimiento / Vereda *</label>
                  <select
                    required
                    disabled={!leaderForm.zoneId || loadingSubdivisions}
                    value={leaderForm.subdivisionId}
                    onChange={(e) => setLeaderForm({ ...leaderForm, subdivisionId: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {!leaderForm.zoneId ? (
                      <option value="">Seleccione primero la circunscripción</option>
                    ) : loadingSubdivisions ? (
                      <option value="">Cargando corregimientos y veredas...</option>
                    ) : subdivisions.length === 0 ? (
                      <option value="">No hay corregimientos o veredas disponibles</option>
                    ) : (
                      <>
                        <option value="">Seleccione corregimiento o vereda</option>
                        {/* Grouping by type if available */}
                        <optgroup label="Corregimientos">
                          {subdivisions.filter(s => s.tipo === 'CORREGIMIENTO').map(s => (
                            <option key={s.id} value={s.id}>{s.nombre}</option>
                          ))}
                        </optgroup>
                        <optgroup label="Veredas">
                          {subdivisions.filter(s => s.tipo === 'VEREDA').map(s => (
                            <option key={s.id} value={s.id}>{s.nombre}</option>
                          ))}
                        </optgroup>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Puesto de Votación</label>
                  <input
                    type="text"
                    placeholder="Ej. Colegio Santander"
                    value={leaderForm.puesto}
                    onChange={(e) => setLeaderForm({ ...leaderForm, puesto: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Meta de Votos Comprometida</label>
                  <input
                    type="number"
                    min={1}
                    value={leaderForm.metaVotos}
                    onChange={(e) => setLeaderForm({ ...leaderForm, metaVotos: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsLeaderModalOpen(false)}
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
                  {saving ? 'Guardando...' : 'Guardar Líder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Voter Modal */}
      {isVoterModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Vote className="w-4 h-4 text-indigo-400" />
                Registrar Nuevo Votante
              </h3>
              <button onClick={() => setIsVoterModalOpen(false)} className="text-slate-400 hover:text-white">
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

            <form onSubmit={handleSaveVoter} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Ana Lucía Gómez"
                    value={voterForm.nombre}
                    onChange={(e) => setVoterForm({ ...voterForm, nombre: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Cédula de Ciudadanía *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. 1098456123"
                    value={voterForm.cedula}
                    onChange={(e) => setVoterForm({ ...voterForm, cedula: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Teléfono</label>
                  <input
                    type="tel"
                    placeholder="Ej. 3109876543"
                    value={voterForm.telefono}
                    onChange={(e) => setVoterForm({ ...voterForm, telefono: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Intención de Voto</label>
                  <select
                    value={voterForm.intencion}
                    onChange={(e) => setVoterForm({ ...voterForm, intencion: e.target.value as any })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                  >
                    <option value="Voto Seguro">Voto Seguro</option>
                    <option value="Probable">Probable</option>
                    <option value="Indeciso">Indeciso</option>
                    <option value="En Contra">En Contra</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Circunscripción / Municipio *</label>
                  <select
                    required
                    value={voterForm.zoneId}
                    onChange={(e) => handleZoneChange('voter', e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                  >
                    <option value="">Seleccione circunscripción</option>
                    {zones.map(z => (
                      <option key={z.id} value={z.id}>{z.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Corregimiento / Vereda *</label>
                  <select
                    required
                    disabled={!voterForm.zoneId || loadingSubdivisions}
                    value={voterForm.subdivisionId}
                    onChange={(e) => setVoterForm({ ...voterForm, subdivisionId: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {!voterForm.zoneId ? (
                      <option value="">Seleccione primero la circunscripción</option>
                    ) : loadingSubdivisions ? (
                      <option value="">Cargando corregimientos y veredas...</option>
                    ) : subdivisions.length === 0 ? (
                      <option value="">No hay corregimientos o veredas disponibles</option>
                    ) : (
                      <>
                        <option value="">Seleccione corregimiento o vereda</option>
                        <optgroup label="Corregimientos">
                          {subdivisions.filter(s => s.tipo === 'CORREGIMIENTO').map(s => (
                            <option key={s.id} value={s.id}>{s.nombre}</option>
                          ))}
                        </optgroup>
                        <optgroup label="Veredas">
                          {subdivisions.filter(s => s.tipo === 'VEREDA').map(s => (
                            <option key={s.id} value={s.id}>{s.nombre}</option>
                          ))}
                        </optgroup>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Puesto de Votación</label>
                  <input
                    type="text"
                    placeholder="Ej. Escuela República de Colombia"
                    value={voterForm.puesto}
                    onChange={(e) => setVoterForm({ ...voterForm, puesto: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Mesa</label>
                  <input
                    type="text"
                    placeholder="Ej. Mesa 4"
                    value={voterForm.mesa}
                    onChange={(e) => setVoterForm({ ...voterForm, mesa: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Líder Asignado</label>
                <select
                  value={voterForm.liderId}
                  onChange={(e) => setVoterForm({ ...voterForm, liderId: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                >
                  <option value="">Sin líder asignado (Registro Directo)</option>
                  {leaders.map(l => (
                    <option key={l.id} value={l.id}>{l.nombre} ({l.comuna || 'General'})</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsVoterModalOpen(false)}
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
                  {saving ? 'Guardando...' : 'Guardar Votante'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
