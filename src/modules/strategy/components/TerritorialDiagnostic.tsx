import React from 'react';
import { motion } from 'motion/react';
import { AlertCircle, RefreshCw, Layers } from 'lucide-react';
import { useTerritorialDiagnostic } from '@/src/hooks/useTerritorialDiagnostic';
import { SurveySyncBanner } from './SurveySyncBanner';
import { SectorSection } from './SectorSection';
import { SectorVariablesTable } from './SectorVariablesTable';
import { MicroLocalFichesSection } from './MicroLocalFichesSection';

export function TerritorialDiagnostic() {
  const {
    sectors,
    selectedSectorId,
    setSelectedSectorId,
    selectedSector,
    variables,
    currentSectorVariables,
    fiches,
    loading,
    error,
    surveySyncState,
    syncSurveys,
    createSector,
    updateSector,
    deleteSector,
    createVariable,
    updateVariable,
    deleteVariable,
    createFiche,
    updateFiche,
    deleteFiche,
    toggleLinkGovProgram,
    refresh
  } = useTerritorialDiagnostic();

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-4 text-center">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-sm font-semibold text-slate-400">Cargando diagnóstico territorial...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="space-y-6"
    >
      {/* Global Error Banner if any */}
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-between gap-3 text-rose-400 text-xs font-medium">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={refresh}
            className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 rounded-lg text-rose-300 transition-colors"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* BLOQUE 1: Diagnóstico Territorial Sectorial (Insumo Programático) */}
      <div className="space-y-6">
        {/* Banner de Sincronización con Sondeos de Opinión */}
        <SurveySyncBanner
          syncState={surveySyncState}
          onSync={syncSurveys}
        />

        {/* Sectores Temáticos Grid */}
        <SectorSection
          sectors={sectors}
          selectedSectorId={selectedSectorId}
          onSelectSector={setSelectedSectorId}
          variables={variables}
          onCreateSector={createSector}
          onUpdateSector={updateSector}
          onDeleteSector={deleteSector}
        />

        {/* Variables e Indicadores del Sector Seleccionado */}
        <SectorVariablesTable
          sector={selectedSector}
          variables={currentSectorVariables}
          onCreateVariable={createVariable}
          onUpdateVariable={updateVariable}
          onDeleteVariable={deleteVariable}
        />
      </div>

      {/* BLOQUE 2: Fichas de Diagnóstico Territorial Micro-Local (Por Comuna / Corregimiento) */}
      <MicroLocalFichesSection
        fiches={fiches}
        sectors={sectors}
        onCreateFiche={createFiche}
        onUpdateFiche={updateFiche}
        onDeleteFiche={deleteFiche}
        onToggleLinkGovProgram={toggleLinkGovProgram}
      />
    </motion.div>
  );
}
