import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  DollarSign, 
  Plus, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  FileText, 
  Search, 
  Filter, 
  Calendar, 
  X, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  Landmark,
  FileSpreadsheet
} from 'lucide-react';
import { supabase } from '@/src/lib/supabase';
import { useAuth } from '@/src/contexts/AuthContext';
import { useAdministrativeData } from '@/src/hooks/useAdministrativeData';
import { BudgetItem } from '@/src/types';

const CNE_EXPENSE_CATEGORIES = [
  'Propaganda Electoral y Publicidad en Medios',
  'Actos Públicos y Eventos de Campaña',
  'Transporte, Combustible y Viáticos',
  'Gastos de Administración y Personal',
  'Material Impreso y Publicitario',
  'Comunicaciones, Telefonía e Internet',
  'Asesorías y Servicios Profesionales',
  'Gastos Judiciales y Rendición de Cuentas',
  'Otros Gastos de Campaña'
];

const CNE_INCOME_CATEGORIES = [
  'Recursos Propios del Candidato',
  'Contribuciones y Donaciones de Particulares',
  'Créditos y Préstamos Financieros',
  'Aportes del Partido o Movimiento Político'
];

export default function AdminBudgetCNEPage() {
  const { user, client } = useAuth();
  const { budgetItems, refresh, loading } = useAdministrativeData();
  const [searchParams, setSearchParams] = useSearchParams();

  const tipoParam = searchParams.get('tipo') as 'ALL' | 'INGRESO' | 'GASTO' | null;
  const [filterType, setFilterType] = useState<'ALL' | 'INGRESO' | 'GASTO'>(
    tipoParam === 'INGRESO' || tipoParam === 'GASTO' ? tipoParam : 'ALL'
  );

  useEffect(() => {
    if (tipoParam && (tipoParam === 'INGRESO' || tipoParam === 'GASTO' || tipoParam === 'ALL')) {
      setFilterType(tipoParam);
    }
  }, [tipoParam]);

  const handleFilterChange = (tipo: 'ALL' | 'INGRESO' | 'GASTO') => {
    setFilterType(tipo);
    if (tipo === 'ALL') {
      searchParams.delete('tipo');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ tipo });
    }
  };
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form State
  const [form, setForm] = useState({
    tipo: 'GASTO' as 'INGRESO' | 'GASTO',
    categoriaCNE: CNE_EXPENSE_CATEGORIES[0],
    concepto: '',
    monto: '',
    fecha: new Date().toISOString().split('T')[0],
    comprobanteNumero: '',
    beneficiarioNombre: '',
    beneficiarioNit: '',
    observaciones: ''
  });

  // Calculate totals
  const totalIngresos = budgetItems
    .filter(b => b.tipo === 'INGRESO' && b.estado !== 'ANULADO')
    .reduce((sum, b) => sum + b.monto, 0);

  const totalGastos = budgetItems
    .filter(b => b.tipo === 'GASTO' && b.estado !== 'ANULADO')
    .reduce((sum, b) => sum + b.monto, 0);

  const saldoDisponible = totalIngresos - totalGastos;
  const topeCNEEstimado = 500000000; // Reference maximum expenditure limit

  // Filtered list
  const filteredItems = budgetItems.filter(item => {
    const matchType = filterType === 'ALL' || item.tipo === filterType;
    const matchSearch = item.concepto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.beneficiarioNombre && item.beneficiarioNombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.comprobanteNumero && item.comprobanteNumero.includes(searchTerm));
    return matchType && matchSearch;
  });

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.concepto.trim() || !form.monto || Number(form.monto) <= 0) {
      setMessage({ text: 'Concepto y Monto válido son obligatorios', type: 'error' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const clientId = user?.tenantId || client?.id;
      const { error } = await supabase.from('budget_items').insert([
        {
          client_id: clientId,
          tipo: form.tipo,
          categoria_cne: form.categoriaCNE,
          concepto: form.concepto.trim(),
          monto: Number(form.monto),
          fecha: form.fecha,
          comprobante_numero: form.comprobanteNumero.trim(),
          beneficiario_nombre: form.beneficiarioNombre.trim(),
          beneficiario_nit: form.beneficiarioNit.trim(),
          observaciones: form.observaciones.trim(),
          estado: 'REGISTRADO'
        }
      ]);

      if (error) throw error;

      setMessage({ text: 'Movimiento registrado correctamente', type: 'success' });
      await refresh();
      setForm({
        tipo: 'GASTO',
        categoriaCNE: CNE_EXPENSE_CATEGORIES[0],
        concepto: '',
        monto: '',
        fecha: new Date().toISOString().split('T')[0],
        comprobanteNumero: '',
        beneficiarioNombre: '',
        beneficiarioNit: '',
        observaciones: ''
      });
      setTimeout(() => {
        setIsModalOpen(false);
        setMessage(null);
      }, 800);
    } catch (err: any) {
      console.error('Error saving budget item:', err);
      setMessage({ text: err.message || 'Error al registrar movimiento', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const exportCuentasClaras = () => {
    if (budgetItems.length === 0) return;

    const headers = 'Fecha,Tipo,Categoria_CNE,Concepto,Monto,Comprobante,Beneficiario,NIT,Estado\n';
    const rows = budgetItems.map(b => 
      `"${b.fecha}","${b.tipo}","${b.categoriaCNE}","${b.concepto}",${b.monto},"${b.comprobanteNumero || ''}","${b.beneficiarioNombre || ''}","${b.beneficiarioNit || ''}","${b.estado}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `cuentas_claras_cne_${new Date().toISOString().split('T')[0]}.csv`);
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
            <DollarSign className="w-5 h-5 text-emerald-400" />
            Presupuesto y Rendición de Cuentas CNE
          </h2>
          <p className="text-xs text-slate-400">
            Contabilidad electoral oficial estructurada bajo el formato y categorías de Cuentas Claras del CNE.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCuentasClaras}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/10 text-xs font-medium flex items-center gap-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            Reporte Cuentas Claras
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-600/30"
          >
            <Plus className="w-4 h-4" />
            Registrar Movimiento
          </button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-slate-900/60 border border-white/5 p-5">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-bold uppercase tracking-wider">Ingresos Totales</span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <span className="text-2xl font-extrabold text-white mt-2 block">
            ${totalIngresos.toLocaleString('es-CO')}
          </span>
          <p className="text-[11px] text-slate-500 mt-1">Aportes, donaciones y recursos</p>
        </div>

        <div className="rounded-2xl bg-slate-900/60 border border-white/5 p-5">
          <div className="flex items-center justify-between text-rose-400">
            <span className="text-xs font-bold uppercase tracking-wider">Gastos Ejecutados</span>
            <TrendingDown className="w-4 h-4" />
          </div>
          <span className="text-2xl font-extrabold text-white mt-2 block">
            ${totalGastos.toLocaleString('es-CO')}
          </span>
          <p className="text-[11px] text-slate-500 mt-1">Soportados para CNE</p>
        </div>

        <div className="rounded-2xl bg-slate-900/60 border border-white/5 p-5">
          <div className="flex items-center justify-between text-indigo-400">
            <span className="text-xs font-bold uppercase tracking-wider">Saldo Disponible</span>
            <DollarSign className="w-4 h-4" />
          </div>
          <span className={`text-2xl font-extrabold mt-2 block ${saldoDisponible >= 0 ? 'text-white' : 'text-rose-400'}`}>
            ${saldoDisponible.toLocaleString('es-CO')}
          </span>
          <p className="text-[11px] text-slate-500 mt-1">Fondos líquidos en cuenta</p>
        </div>

        <div className="rounded-2xl bg-slate-900/60 border border-white/5 p-5">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-bold uppercase tracking-wider">Control Tope CNE</span>
            <Landmark className="w-4 h-4" />
          </div>
          <span className="text-2xl font-extrabold text-white mt-2 block">
            {((totalGastos / topeCNEEstimado) * 100).toFixed(1)}%
          </span>
          <p className="text-[11px] text-slate-500 mt-1">
            Tope estimado: ${(topeCNEEstimado / 1000000).toFixed(0)}M COP
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por concepto, beneficiario o comprobante..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => handleFilterChange('ALL')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              filterType === 'ALL' ? 'bg-slate-800 text-white border border-white/10' : 'text-slate-400 hover:text-white'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => handleFilterChange('INGRESO')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              filterType === 'INGRESO' ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            Ingresos
          </button>
          <button
            onClick={() => handleFilterChange('GASTO')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              filterType === 'GASTO' ? 'bg-rose-600/20 text-rose-400 border border-rose-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            Gastos
          </button>
        </div>
      </div>

      {/* Budget Table */}
      <div className="rounded-2xl bg-slate-900/60 border border-white/5 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-white/10 text-slate-400">
              <tr>
                <th className="py-3 px-4 font-semibold">Fecha</th>
                <th className="py-3 px-4 font-semibold">Tipo</th>
                <th className="py-3 px-4 font-semibold">Categoría CNE</th>
                <th className="py-3 px-4 font-semibold">Concepto</th>
                <th className="py-3 px-4 font-semibold">Beneficiario / NIT</th>
                <th className="py-3 px-4 font-semibold">Comprobante</th>
                <th className="py-3 px-4 font-semibold text-right">Monto (COP)</th>
                <th className="py-3 px-4 font-semibold text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No se han registrado movimientos presupuestales. Haz clic en "Registrar Movimiento".
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-mono text-slate-400">{item.fecha}</td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.tipo === 'INGRESO' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {item.tipo}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-medium max-w-[200px] truncate" title={item.categoriaCNE}>
                      {item.categoriaCNE}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white max-w-[220px] truncate" title={item.concepto}>
                      {item.concepto}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {item.beneficiarioNombre ? (
                        <>
                          <span className="block text-slate-300">{item.beneficiarioNombre}</span>
                          {item.beneficiarioNit && <span className="block text-[10px] text-slate-500 font-mono">NIT: {item.beneficiarioNit}</span>}
                        </>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      {item.comprobanteNumero || 'S/C'}
                    </td>
                    <td className={`py-3.5 px-4 text-right font-extrabold ${
                      item.tipo === 'INGRESO' ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {item.tipo === 'INGRESO' ? '+' : '-'}${item.monto.toLocaleString('es-CO')}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {item.estado}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Movement Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                Registrar Movimiento Presupuestal CNE
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

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, tipo: 'GASTO', categoriaCNE: CNE_EXPENSE_CATEGORIES[0] })}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    form.tipo === 'GASTO' 
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30' 
                      : 'bg-slate-950 text-slate-400 border border-white/5'
                  }`}
                >
                  Registrar Gasto
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, tipo: 'INGRESO', categoriaCNE: CNE_INCOME_CATEGORIES[0] })}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    form.tipo === 'INGRESO' 
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' 
                      : 'bg-slate-950 text-slate-400 border border-white/5'
                  }`}
                >
                  Registrar Ingreso
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Categoría Oficial CNE *</label>
                <select
                  value={form.categoriaCNE}
                  onChange={(e) => setForm({ ...form, categoriaCNE: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
                >
                  {(form.tipo === 'GASTO' ? CNE_EXPENSE_CATEGORIES : CNE_INCOME_CATEGORIES).map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Monto en Pesos (COP) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    placeholder="Ej. 1500000"
                    value={form.monto}
                    onChange={(e) => setForm({ ...form, monto: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Fecha del Movimiento *</label>
                  <input
                    type="date"
                    required
                    value={form.fecha}
                    onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Concepto Detallado *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Impresión de 5,000 volantes publicitarios"
                  value={form.concepto}
                  onChange={(e) => setForm({ ...form, concepto: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">N° Comprobante / Factura</label>
                  <input
                    type="text"
                    placeholder="Ej. FACT-0982"
                    value={form.comprobanteNumero}
                    onChange={(e) => setForm({ ...form, comprobanteNumero: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Beneficiario / Proveedor</label>
                  <input
                    type="text"
                    placeholder="Ej. Impresos del Norte SAS"
                    value={form.beneficiarioNombre}
                    onChange={(e) => setForm({ ...form, beneficiarioNombre: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">NIT / Cédula</label>
                  <input
                    type="text"
                    placeholder="Ej. 900.123.456-7"
                    value={form.beneficiarioNit}
                    onChange={(e) => setForm({ ...form, beneficiarioNit: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none font-mono"
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
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-emerald-600/30"
                >
                  <Save className="w-3.5 h-3.5" />
                  {saving ? 'Registrando...' : 'Registrar Movimiento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
