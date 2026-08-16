import React, { useState } from 'react';
import { useGovernmentProgram } from '@/src/hooks/useGovernmentProgram';
import { GovProgramSyncBanner } from './GovProgramSyncBanner';
import { GovProgramGeneralInfo } from './GovProgramGeneralInfo';
import { GovProgramNavigation, GovProgramSubTab } from './GovProgramNavigation';
import { GovProgramContextAndDiagnostic } from './GovProgramContextAndDiagnostic';
import { GovProgramStrategicAxes } from './GovProgramStrategicAxes';
import { GovProgramAiAssistant } from './GovProgramAiAssistant';
import { GovProgramLegalMatrix } from './GovProgramLegalMatrix';
import { GovProgramDocumentPreview } from './GovProgramDocumentPreview';
import { 
  GeneralInfoModal, 
  HistoricalContextModal, 
  DiagnosticSummaryModal, 
  AxisModal, 
  DeleteAxisModal, 
  ProposalModal, 
  DeleteProposalModal, 
  DiagnosticImportModal 
} from './GovProgramModals';
import { GovStrategicAxis, GovProposal } from '@/src/types/governmentProgram';
import { MicroLocalFiche } from '@/src/types/territorialDiagnostic';
import { useAuth } from '@/src/contexts/AuthContext';

interface GovProgramSectionProps {
  tenantId?: string;
}

export function GovProgramSection({ tenantId: propTenantId }: GovProgramSectionProps) {
  const { user, client } = useAuth();
  const tenantId = propTenantId || user?.tenantId || client?.id || 'default_tenant';

  const {
    programInfo,
    axes,
    proposals,
    legalRequirements,
    stats,
    isSyncing,
    syncStatus,
    syncMessage,
    resyncAllData,
    updateGeneralInfo,
    updateHistoricalContext,
    updateDiagnosticSummary,
    createAxis,
    updateAxis,
    deleteAxis,
    createProposal,
    updateProposal,
    deleteProposal,
    importFicheAsProposal
  } = useGovernmentProgram();

  // Sub-navigation state
  const [activeSubTab, setActiveSubTab] = useState<GovProgramSubTab>('ejes');

  // Selected Axis for the 2-column axes view
  const [selectedAxisId, setSelectedAxisId] = useState<string | null>(null);

  // Active axis resolution
  const currentSelectedAxis = axes.find(a => a.id === selectedAxisId) || axes[0] || null;

  // Modals state
  const [isGeneralInfoModalOpen, setIsGeneralInfoModalOpen] = useState(false);
  const [isHistoricalModalOpen, setIsHistoricalModalOpen] = useState(false);
  const [isDiagnosticModalOpen, setIsDiagnosticModalOpen] = useState(false);
  const [isCreateAxisModalOpen, setIsCreateAxisModalOpen] = useState(false);
  const [editingAxis, setEditingAxis] = useState<GovStrategicAxis | null>(null);
  const [deletingAxis, setDeletingAxis] = useState<GovStrategicAxis | null>(null);
  
  const [createProposalForAxisId, setCreateProposalForAxisId] = useState<string | null>(null);
  const [editingProposal, setEditingProposal] = useState<GovProposal | null>(null);
  const [deletingProposal, setDeletingProposal] = useState<GovProposal | null>(null);
  const [isImportDiagnosticModalOpen, setIsImportDiagnosticModalOpen] = useState(false);

  // Handlers
  const handleSelectAxis = (axisId: string) => {
    setSelectedAxisId(axisId);
  };

  const handleOpenCreateProposal = (axisId: string) => {
    setCreateProposalForAxisId(axisId);
  };

  const handleImportFicheFromDiagnostic = async (fiche: MicroLocalFiche, targetAxisId: string) => {
    await importFicheAsProposal(fiche, targetAxisId);
  };

  const handleCreateProposalFromAi = async (axisId: string, title: string, description: string) => {
    await createProposal({
      axisId,
      title,
      description,
      priority: 'ALTA'
    });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Synchronisation Banner */}
      <GovProgramSyncBanner
        programInfo={programInfo}
        isSyncing={isSyncing}
        syncStatus={syncStatus}
        syncMessage={syncMessage}
        onSync={resyncAllData}
      />

      {/* 2. General Info & 4 Summary KPIs */}
      <GovProgramGeneralInfo
        programInfo={programInfo}
        stats={stats}
        onEditGeneralInfo={() => setIsGeneralInfoModalOpen(true)}
        onOpenPreview={() => setActiveSubTab('previewDoc')}
      />

      {/* 3. Sub-Navigation Bar */}
      <GovProgramNavigation
        activeSubTab={activeSubTab}
        onSelectSubTab={setActiveSubTab}
        axesCount={stats.strategicAxesCount}
        proposalsCount={stats.proposalsCount}
        legalCompliancePercentage={stats.legalCompliancePercentage}
      />

      {/* 4. Main Sub-Views */}
      {activeSubTab === 'ejes' && (
        <div className="space-y-8">
          {/* Foldable Context & Territorial Diagnostic summaries */}
          <GovProgramContextAndDiagnostic
            programInfo={programInfo}
            onEditHistoricalContext={() => setIsHistoricalModalOpen(true)}
            onEditDiagnosticSummary={() => setIsDiagnosticModalOpen(true)}
            onOpenDiagnosticImportModal={axes.length > 0 ? () => setIsImportDiagnosticModalOpen(true) : undefined}
          />

          {/* 2-Column Responsive Ejes Estratégicos & Propuestas */}
          <GovProgramStrategicAxes
            axes={axes}
            selectedAxis={currentSelectedAxis}
            proposals={proposals}
            onSelectAxis={handleSelectAxis}
            onOpenCreateAxisModal={() => setIsCreateAxisModalOpen(true)}
            onOpenEditAxisModal={(axis) => setEditingAxis(axis)}
            onOpenDeleteAxisModal={(axis) => setDeletingAxis(axis)}
            onOpenCreateProposalModal={handleOpenCreateProposal}
            onOpenEditProposalModal={(prop) => setEditingProposal(prop)}
            onOpenDeleteProposalModal={(prop) => setDeletingProposal(prop)}
            onOpenImportDiagnosticModal={axes.length > 0 ? () => setIsImportDiagnosticModalOpen(true) : undefined}
          />
        </div>
      )}

      {activeSubTab === 'aiAssistant' && (
        <GovProgramAiAssistant
          programInfo={programInfo}
          axes={axes}
          proposals={proposals}
          onCreateProposalFromAi={handleCreateProposalFromAi}
        />
      )}

      {activeSubTab === 'legalMatrix' && (
        <GovProgramLegalMatrix
          requirements={legalRequirements}
          legalCompliancePercentage={stats.legalCompliancePercentage}
        />
      )}

      {activeSubTab === 'previewDoc' && (
        <GovProgramDocumentPreview
          programInfo={programInfo}
          axes={axes}
          proposals={proposals}
          stats={stats}
        />
      )}

      {/* MODALS */}
      {/* 1. General Info Modal */}
      <GeneralInfoModal
        isOpen={isGeneralInfoModalOpen}
        onClose={() => setIsGeneralInfoModalOpen(false)}
        programInfo={programInfo}
        onSave={updateGeneralInfo}
      />

      {/* 2. Historical Context Modal */}
      <HistoricalContextModal
        isOpen={isHistoricalModalOpen}
        onClose={() => setIsHistoricalModalOpen(false)}
        initialText={programInfo.historicalContext}
        onSave={updateHistoricalContext}
      />

      {/* 3. Diagnostic Summary Modal */}
      <DiagnosticSummaryModal
        isOpen={isDiagnosticModalOpen}
        onClose={() => setIsDiagnosticModalOpen(false)}
        initialText={programInfo.diagnosticSummary}
        onSave={updateDiagnosticSummary}
      />

      {/* 4. Create Axis Modal */}
      <AxisModal
        isOpen={isCreateAxisModalOpen}
        onClose={() => setIsCreateAxisModalOpen(false)}
        onSave={createAxis}
      />

      {/* 5. Edit Axis Modal */}
      <AxisModal
        isOpen={Boolean(editingAxis)}
        onClose={() => setEditingAxis(null)}
        initialData={editingAxis}
        onSave={async (data) => {
          if (editingAxis) {
            await updateAxis(editingAxis.id, data);
          }
        }}
      />

      {/* 6. Delete Axis Modal */}
      <DeleteAxisModal
        isOpen={Boolean(deletingAxis)}
        onClose={() => setDeletingAxis(null)}
        axis={deletingAxis}
        proposalsCount={deletingAxis ? proposals.filter(p => p.axisId === deletingAxis.id).length : 0}
        onConfirm={async (deleteRelated) => {
          if (deletingAxis) {
            await deleteAxis(deletingAxis.id, deleteRelated);
            if (selectedAxisId === deletingAxis.id) {
              setSelectedAxisId(null);
            }
          }
        }}
      />

      {/* 7. Create Proposal Modal */}
      <ProposalModal
        isOpen={Boolean(createProposalForAxisId)}
        onClose={() => setCreateProposalForAxisId(null)}
        axisId={createProposalForAxisId || ''}
        onSave={createProposal}
      />

      {/* 8. Edit Proposal Modal */}
      <ProposalModal
        isOpen={Boolean(editingProposal)}
        onClose={() => setEditingProposal(null)}
        axisId={editingProposal?.axisId || ''}
        initialData={editingProposal}
        onSave={async (data) => {
          if (editingProposal) {
            await updateProposal(editingProposal.id, data);
          }
        }}
      />

      {/* 9. Delete Proposal Modal */}
      <DeleteProposalModal
        isOpen={Boolean(deletingProposal)}
        onClose={() => setDeletingProposal(null)}
        proposal={deletingProposal}
        onConfirm={async () => {
          if (deletingProposal) {
            await deleteProposal(deletingProposal.id);
          }
        }}
      />

      {/* 10. Import Diagnostic Modal */}
      <DiagnosticImportModal
        isOpen={isImportDiagnosticModalOpen}
        onClose={() => setIsImportDiagnosticModalOpen(false)}
        axes={axes}
        tenantId={tenantId}
        onImportFiche={handleImportFicheFromDiagnostic}
      />
    </div>
  );
}
