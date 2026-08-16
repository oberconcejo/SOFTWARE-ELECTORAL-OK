import React, { useState } from 'react';
import { 
  BarChart3, 
  Plus, 
  Search, 
  CheckCircle2, 
  X, 
  Save, 
  AlertCircle, 
  Calendar, 
  Users, 
  FileText,
  PieChart,
  TrendingUp,
  Activity
} from 'lucide-react';
import { supabase } from '@/src/lib/supabase';
import { useAuth } from '@/src/contexts/AuthContext';
import { useAdministrativeData } from '@/src/hooks/useAdministrativeData';
import { Survey } from '@/src/types';

export default function AdminSurveysPage() {
  const { user, client } = useAuth();
  const { surveys, refresh, loading } = useAdministrativeData();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form State
  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    tamanoMuestra: 500,
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaFin: '2026-09-30',
    estado: 'ACTIVA' as 'BORRADOR' | 'ACTIVA' | 'CERRADA'
  });

  const filteredSurveys = surveys.filter(s => 
    s.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.descripcion && s.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSaveSurvey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titulo.trim()) {
      setMessage({ text: 'El título del sondeo es obligatorio', type: 'error' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const clientId = user?.tenantId || client?.id;
      const { error } = await supabase.from('surveys').insert([
        {
          client_id: clientId,
          titulo: form.titulo.trim(),
          descripcion: form.descripcion.trim(),
          tamano_muestra: Number(form.tamanoMuestra) || 500,
          respuestas_obtenidas: 0,
          fecha_inicio: form.fechaInicio,
          fecha_fin: form.fechaFin,
          estado: form.estado
        }
      ]);

      if (error) throw error;

      setMessage({ text: 'Encuesta creada con éxito', type: 'success' });
      await refresh();
      setForm({
        titulo: '',
        descripcion: '',
        tamanoMuestra: 500,
        fechaInicio: new Date().toISOString().split('T')[0],
        fechaFin: '2026-09-30',
        estado: 'ACTIVA'
      });
      setTimeout(() => {
        setIsModalOpen(false);
        setMessage(null);
      }, 800);
    } catch (err: any) {
      console.error('Error saving survey:', err);
      setMessage({ text: err.message || 'Error al guardar encuesta', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-violet-400" />
            Encuestas y Sondeos de Opinión
          </h2>
          <p className="text-xs text-slate-400">
            Diseño de sondeos cuantitativos, monitoreo de intención de voto y tabulación estadística.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-lg shadow-violet-600/30"
        >
          <Plus className="w-4 h-4" />
          Nueva Encuesta
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por título de sondeo o palabra clave..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
          />
        </div>
      </div>

      {/* Surveys Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSurveys.length === 0 ? (
          <div className="lg:col-span-3 py-12 text-center rounded-2xl bg-slate-900/40 border border-dashed border-white/10 p-8">
            <BarChart3 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-300">No hay encuestas o sondeos activos</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Diseña encuestas para medir la percepción de los votantes, temas de interés y evaluación de candidatos.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold"
            >
              Crear Primer Sondeo
            </button>
          </div>
        ) : (
          filteredSurveys.map((survey) => {
            const progress = survey.tamanoMuestra > 0 
              ? Math.min(100, Math.round((survey.respuestasObtenidas / survey.tamanoMuestra) * 100))
              : 0;

            return (
              <div
                key={survey.id}
                className="rounded-2xl bg-slate-900/70 border border-white/10 p-5 flex flex-col justify-between space-y-4 hover:border-violet-500/30 transition-all shadow-xl"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      survey.estado === 'ACTIVA' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : survey.estado === 'CERRADA'
                        ? 'bg-slate-800 text-slate-400'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {survey.estado}
                    </span>

                    <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {survey.fechaFin || 'Vigente'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mt-3">{survey.titulo}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {survey.descripcion || 'Sin descripción detallada.'}
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2 pt-3 border-t border-white/5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Progreso Muestral</span>
                    <span className="font-bold text-white">{survey.respuestasObtenidas} / {survey.tamanoMuestra}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>{progress}% Completado</span>
                    <span>Meta: {survey.tamanoMuestra} encuestados</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-violet-400" />
                Crear Nuevo Sondeo de Opinión
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

            <form onSubmit={handleSaveSurvey} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Título del Sondeo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Sondeo de Intención de Voto - Septiembre"
                  value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-violet-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Descripción / Ficha Técnica</label>
                <textarea
                  rows={2}
                  placeholder="Universo, metodología de recolección y margen de error..."
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-violet-500 outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tamaño Muestra</label>
                  <input
                    type="number"
                    min={10}
                    value={form.tamanoMuestra}
                    onChange={(e) => setForm({ ...form, tamanoMuestra: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-violet-500 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Fecha Inicio</label>
                  <input
                    type="date"
                    value={form.fechaInicio}
                    onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-violet-500 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Fecha Límite</label>
                  <input
                    type="date"
                    value={form.fechaFin}
                    onChange={(e) => setForm({ ...form, fechaFin: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-violet-500 outline-none font-mono"
                  />
                </div>
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
                  className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-violet-600/30"
                >
                  <Save className="w-3.5 h-3.5" />
                  {saving ? 'Guardando...' : 'Crear Sondeo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
