import React, { useState, useMemo } from 'react';
import { 
  MapPin, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  Check, 
  Layers,
  ArrowRight,
  ShieldAlert,
  FileCheck
} from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { 
  MicroLocalFiche, 
  ThematicSector, 
  ImpactLevel 
} from '@/src/types/territorialDiagnostic';
import { FicheModal, DeleteConfirmModal } from './DiagnosticModals';

interface MicroLocalFichesSectionProps {
  fiches: MicroLocalFiche[];
  sectors: ThematicSector[];
  onCreateFiche: (data: any) => Promise<any>;
  onUpdateFiche: (id: string, data: any) => Promise<void>;
  onDeleteFiche: (id: string) => Promise<void>;
  onToggleLinkGovProgram: (id: string) => Promise<any>;
}

export function MicroLocalFichesSection({
  fiches,
  sectors,
  onCreateFiche,
  onUpdateFiche,
  onDeleteFiche,
  onToggleLinkGovProgram
}: MicroLocalFichesSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedComuna, setSelectedComuna] = useState<string>('ALL');
  const [selectedImpact, setSelectedImpact] = useState<string>('ALL');
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [editingFiche, setEditingFiche] = useState<MicroLocalFiche | null>(null);
  const [deletingFiche, setDeletingFiche] = useState<MicroLocalFiche | null>(null);

  // Extract unique comunas from registered fiches
  const availableComunas = useMemo(() => {
    const set = new Set<string>();
    fiches.forEach(f => {
      if (f.comuna && f.comuna.trim()) {
        set.add(f.comuna.trim());
      }
    });
    return Array.from(set).sort();
  }, [fiches]);

  // Filter fiches
  const filteredFiches = useMemo(() => {
    return fiches.filter((fiche) => {
      // Search text
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesComuna = fiche.comuna?.toLowerCase().includes(query);
        const matchesBarrio = fiche.barrio?.toLowerCase().includes(query);
        const matchesProblem = fiche.problem?.toLowerCase().includes(query);
        const matchesProposal = fiche.proposal?.toLowerCase().includes(query);
        const matchesCat = fiche.category?.toLowerCase().includes(query);
        if (!matchesComuna && !matchesBarrio && !matchesProblem && !matchesProposal && !matchesCat) {
          return false;
        }
      }

      // Filter by Comuna
      if (selectedComuna !== 'ALL' && fiche.comuna !== selectedComuna) {
        return false;
      }

      // Filter by Impact
      if (selectedImpact !== 'ALL' && fiche.impact !== selectedImpact) {
        return false;
      }

      return true;
    });
  }, [fiches, searchTerm, selectedComuna, selectedImpact]);

  const getImpactBadge = (impact: ImpactLevel) => {
    switch (impact) {
      case 'CRITICO':
        return (
          <Badge variant="error" className="bg-rose-500/15 text-rose-300 border-rose-500/30 text-[10px] uppercase font-bold py-0.5 px-2.5">
            Impacto Crítico
          </Badge>
        );
      case 'ALTO':
        return (
          <Badge variant="warning" className="bg-amber-500/15 text-amber-300 border-amber-500/30 text-[10px] uppercase font-bold py-0.5 px-2.5">
            Impacto Alto
          </Badge>
        );
      case 'MEDIO':
        return (
          <Badge variant="primary" className="bg-blue-500/15 text-blue-300 border-blue-500/30 text-[10px] uppercase font-bold py-0.5 px-2.5">
            Impacto Medio
          </Badge>
        );
      case 'BAJO':
      default:
        return (
          <Badge variant="neutral" className="bg-slate-500/15 text-slate-300 border-slate-500/30 text-[10px] uppercase font-bold py-0.5 px-2.5">
            Impacto Bajo
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6 pt-6 border-t border-white/5">
      {/* Block Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 bg-gradient-to-r from-[#141829] via-[#121320] to-[#111114] rounded-3xl border border-indigo-500/20 shadow-lg">
        <div className="space-y-1 max-w-2xl">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-widest">
            <MapPin className="w-4 h-4" />
            <span>Bloque 2 • Diagnóstico Territorial Micro-Local</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            2. Fichas de Diagnóstico Territorial Micro-Local (Por Comuna / Corregimiento)
          </h3>
          <p className="text-slate-300 text-sm leading-relaxed">
            Mapeo detallado de problemas comunitarios por sector geográfico específico.
          </p>
        </div>

        <Button
          onClick={() => setIsRegisterOpen(true)}
          className="gap-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 shrink-0 self-start lg:self-auto"
        >
          <Plus className="w-4 h-4" /> Registrar Ficha Comunal
        </Button>
      </div>

      {/* Filters Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-[#111114] p-4 rounded-2xl border border-white/5">
        {/* Search */}
        <div className="relative lg:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filtrar por comuna, barrio, problema, propuesta..."
            className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Filter by Comuna */}
        <div>
          <select
            value={selectedComuna}
            onChange={(e) => setSelectedComuna(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
          >
            <option value="ALL">Todas las Comunas / Sectores</option>
            {availableComunas.map((com) => (
              <option key={com} value={com}>{com}</option>
            ))}
          </select>
        </div>

        {/* Filter by Impact */}
        <div>
          <select
            value={selectedImpact}
            onChange={(e) => setSelectedImpact(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
          >
            <option value="ALL">Todos los Niveles de Impacto</option>
            <option value="CRITICO">Impacto Crítico</option>
            <option value="ALTO">Impacto Alto</option>
            <option value="MEDIO">Impacto Medio</option>
            <option value="BAJO">Impacto Bajo</option>
          </select>
        </div>
      </div>

      {/* Fiches Cards Grid */}
      {filteredFiches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFiches.map((fiche) => {
            return (
              <div
                key={fiche.id}
                className="group p-5 rounded-2xl bg-[#111114] border border-white/5 hover:border-white/20 transition-all flex flex-col justify-between space-y-4 shadow-md"
              >
                <div className="space-y-3.5">
                  {/* Top Bar: Location + Badges + Actions */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-indigo-400 text-xs font-bold">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="line-clamp-1">{fiche.comuna}</span>
                      </div>
                      {fiche.barrio && (
                        <p className="text-slate-400 text-xs font-medium pl-5">
                          Barrio/Sector: <span className="text-slate-200">{fiche.barrio}</span>
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => setEditingFiche(fiche)}
                        className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/15 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                        title="Editar Ficha"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingFiche(fiche)}
                        className="w-7 h-7 rounded-lg bg-white/5 hover:bg-rose-500/20 flex items-center justify-center text-slate-400 hover:text-rose-400 transition-colors"
                        title="Eliminar Ficha"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Badges: Sector Category + Impact */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="primary" className="bg-indigo-500/10 text-indigo-300 border-indigo-500/20 text-[10px] py-0.5 px-2">
                      <Layers className="w-3 h-3 mr-1" />
                      {fiche.category || 'Sector General'}
                    </Badge>
                    {getImpactBadge(fiche.impact)}
                  </div>

                  {/* Problema Diagnosticado */}
                  <div className="p-3 bg-amber-500/[0.04] border border-amber-500/20 rounded-xl space-y-1">
                    <span className="block text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                      Problema Diagnosticado
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed font-medium">
                      {fiche.problem}
                    </p>
                  </div>

                  {/* Propuesta Programática */}
                  <div className="p-3 bg-emerald-500/[0.04] border border-emerald-500/20 rounded-xl space-y-1">
                    <span className="block text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                      Propuesta Programática (Insumo)
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {fiche.proposal}
                    </p>
                  </div>
                </div>

                {/* Bottom Bar: Link to Gov Program */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onToggleLinkGovProgram(fiche.id)}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-xl transition-all flex items-center gap-1.5 ${
                      fiche.isLinkedToGovProgram
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 border border-white/5'
                    }`}
                    title="Alternar estado de vinculación al Programa de Gobierno"
                  >
                    {fiche.isLinkedToGovProgram ? (
                      <>
                        <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Vinculado a Programa</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Vincular a Programa</span>
                      </>
                    )}
                  </button>

                  <span className="text-[10px] text-slate-500">
                    {new Date(fiche.createdAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center bg-white/[0.01] rounded-2xl border border-dashed border-white/10 space-y-3">
          <MapPin className="w-10 h-10 text-slate-600 mx-auto" />
          <h4 className="text-sm font-bold text-slate-300">
            {fiches.length === 0 
              ? 'No hay fichas territoriales registradas todavía' 
              : 'No se encontraron fichas con los filtros aplicados'}
          </h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {fiches.length === 0
              ? 'Registra las problemáticas y propuestas programáticas de cada comuna, corregimiento o barrio para consolidar el diagnóstico de tu territorio.'
              : 'Prueba modificando los términos de búsqueda o los filtros de comuna e impacto.'}
          </p>
          {fiches.length === 0 && (
            <Button
              size="sm"
              onClick={() => setIsRegisterOpen(true)}
              className="gap-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md shadow-indigo-600/20"
            >
              <Plus className="w-4 h-4" /> Registrar Primera Ficha Comunal
            </Button>
          )}
        </div>
      )}

      {/* Modal: Registrar Ficha */}
      <FicheModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSave={onCreateFiche}
        sectors={sectors}
      />

      {/* Modal: Editar Ficha */}
      <FicheModal
        isOpen={!!editingFiche}
        onClose={() => setEditingFiche(null)}
        onSave={async (data) => {
          if (editingFiche) {
            await onUpdateFiche(editingFiche.id, data);
          }
        }}
        sectors={sectors}
        initialData={editingFiche}
      />

      {/* Modal: Confirmar Eliminación */}
      <DeleteConfirmModal
        isOpen={!!deletingFiche}
        onClose={() => setDeletingFiche(null)}
        onConfirm={async () => {
          if (deletingFiche) {
            await onDeleteFiche(deletingFiche.id);
          }
        }}
        title="¿Eliminar Ficha Comunal?"
        message={`Estás a punto de eliminar la ficha territorial de "${deletingFiche?.comuna}". Esta acción no se puede deshacer.`}
      />
    </div>
  );
}
