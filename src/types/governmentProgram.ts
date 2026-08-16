export type GovProgramStatus = 'BORRADOR' | 'EN_ELABORACION' | 'REVISADO' | 'FINALIZADO';

export type GovProposalPriority = 'CRITICA' | 'ALTA' | 'MEDIA' | 'BAJA';

export type GovProposalTimeframe = 'CORTO_PLAZO' | 'MEDIANO_PLAZO' | 'LARGO_PLAZO' | 'PLURIANUAL';

export interface GovProgramInfo {
  id: string;
  clientId: string;
  title: string;
  period: string;
  territory: string;
  candidateName: string;
  partyCoalition: string;
  slogan: string;
  status: GovProgramStatus;
  legalDeadline?: string;
  historicalContext?: string;
  diagnosticSummary?: string;
  lastSyncDate: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface GovStrategicAxis {
  id: string;
  programId: string;
  clientId: string;
  axisNumber: number;
  name: string;
  description: string;
  generalObjective: string;
  diagnosedProblem?: string;
  category?: string;
  iconName?: string;
  color?: string;
  orderIndex?: number;
  status: 'ACTIVO' | 'EN_REVISION' | 'COMPLETADO';
  createdAt: string;
  updatedAt?: string;
}

export interface GovProposal {
  id: string;
  axisId: string;
  programId: string;
  clientId: string;
  code: string;
  title: string;
  description: string;
  relatedProblem?: string;
  objective?: string;
  indicatorName?: string;
  indicatorUnit?: string;
  baselineValue?: string | number | null;
  targetValue?: string | number | null;
  timeframe?: GovProposalTimeframe | string;
  estimatedBudget?: number | null;
  currency?: string;
  priority: GovProposalPriority;
  territoryScope?: string;
  fundingSource?: string;
  sourceDiagnosticFicheId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface GovLegalRequirement {
  id: string;
  code: string;
  requirement: string;
  description: string;
  legalBasis: string;
  status: 'CUMPLIDO' | 'EN_PROGRESO' | 'PENDIENTE';
  missingItems?: string;
  observations?: string;
}

export interface GovProgramStats {
  strategicAxesCount: number;
  proposalsCount: number;
  legalCompliancePercentage: number;
  draftingProgressPercentage: number;
  totalEstimatedBudget: number;
  indicatorsCount: number;
}
