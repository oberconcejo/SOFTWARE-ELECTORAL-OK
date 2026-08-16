import React, { useState } from 'react';
import { 
  Plus, 
  Layers, 
  Edit3, 
  Trash2, 
  Target, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { ThematicSector, SectorVariable } from '@/src/types/territorialDiagnostic';
import { SECTOR_ICONS, SectorModal, DeleteConfirmModal } from './DiagnosticModals';

interface SectorSectionProps {
  sectors: ThematicSector[];
  selectedSectorId: string | null;
  onSelectSector: (sectorId: string) => void;
  variables: SectorVariable[];
  onCreateSector: (data: { name: string; description?: string; iconName?: string; color?: string }) => Promise<any>;
  onUpdateSector: (id: string, data: { name: string; description?: string; iconName?: string; color?: string }) => Promise<void>;
  onDeleteSector: (id: string) => Promise<void>;
}

export function SectorSection({
  sectors,
  selectedSectorId,
  onSelectSector,
  variables,
  onCreateSector,
  onUpdateSector,
  onDeleteSector
}: SectorSectionProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSector, setEditingSector] = useState<ThematicSector | null>(null);
  const [deletingSector, setDeletingSector] = useState<ThematicSector | null>(null);

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            1. Sectores Temáticos y Evaluación por Variables Sugeridas
          </h3>
          <p className="text-xs text-slate-400 font-medium">
            Selecciona un sector temático para consultar o registrar sus variables e indicadores programáticos.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setIsCreateOpen(true)}
          className="gap-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md shadow-indigo-600/20 shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Crear Sector
        </Button>
      </div>

      {/* Sectors Grid or Controlled Empty State */}
      {sectors.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sectors.map((sector) => {
            const isSelected = sector.id === selectedSectorId;
            const IconComponent = SECTOR_ICONS[sector.iconName || 'Layers'] || Layers;
            const sectorVarsCount = variables.filter(v => v.sectorId === sector.id).length;

            return (
              <div
                key={sector.id}
                onClick={() => onSelectSector(sector.id)}
                className={`relative group text-left p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-gradient-to-br from-indigo-950/60 to-[#161622] border-indigo-500 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/50'
                    : 'bg-[#111114] border-white/5 hover:border-white/20 hover:bg-white/[0.03]'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                      style={{
                        backgroundColor: isSelected ? `${sector.color || '#6366f1'}33` : 'rgba(255,255,255,0.05)',
                        borderColor: isSelected ? (sector.color || '#6366f1') : 'rgba(255,255,255,0.1)',
                        color: sector.color || '#6366f1'
                      }}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingSector(sector);
                        }}
                        className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/15 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                        title="Editar Sector"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingSector(sector);
                        }}
                        className="w-7 h-7 rounded-lg bg-white/5 hover:bg-rose-500/20 flex items-center justify-center text-slate-400 hover:text-rose-400 transition-colors"
                        title="Eliminar Sector"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-white text-sm tracking-tight group-hover:text-indigo-300 transition-colors">
                      {sector.name}
                    </h4>
                    {sector.description && (
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {sector.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">
                    {sectorVarsCount} {sectorVarsCount === 1 ? 'variable' : 'variables'}
                  </span>
                  {isSelected && (
                    <Badge variant="primary" className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 text-[10px] py-0 px-2">
                      Activo
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-8 text-center bg-white/[0.01] rounded-2xl border border-dashed border-white/10 space-y-3">
          <Layers className="w-10 h-10 text-slate-600 mx-auto" />
          <h4 className="text-sm font-bold text-slate-300">No hay sectores registrados todavía</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Configura los sectores temáticos de tu territorio (ej. Seguridad, Salud, Educación, Infraestructura) para iniciar la evaluación multidimensional.
          </p>
          <Button
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="gap-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" /> Crear Primer Sector
          </Button>
        </div>
      )}

      {/* Modal: Crear Sector */}
      <SectorModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSave={onCreateSector}
      />

      {/* Modal: Editar Sector */}
      <SectorModal
        isOpen={!!editingSector}
        onClose={() => setEditingSector(null)}
        onSave={async (data) => {
          if (editingSector) {
            await onUpdateSector(editingSector.id, data);
          }
        }}
        initialData={editingSector}
      />

      {/* Modal: Confirmar Eliminación */}
      <DeleteConfirmModal
        isOpen={!!deletingSector}
        onClose={() => setDeletingSector(null)}
        onConfirm={async () => {
          if (deletingSector) {
            await onDeleteSector(deletingSector.id);
          }
        }}
        title="¿Eliminar Sector Temático?"
        message={`Estás a punto de eliminar el sector "${deletingSector?.name}". Esta acción no se puede deshacer.`}
      />
    </div>
  );
}
