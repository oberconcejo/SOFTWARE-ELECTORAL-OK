export type ConfidenceType = 'DATO_VERIFICADO' | 'INFERENCIA_ANALITICA' | 'RECOMENDACION_ESTRATEGICA';

export interface SourceReadiness {
  id: string;
  name: string;
  category: 'CANDIDATE' | 'SWOT' | 'TERRITORY' | 'ELECTORAL' | 'GOV_PROGRAM';
  isAvailable: boolean;
  itemCount: number;
  summary: string;
  missingDetails?: string;
}

export interface SourcesStatusReport {
  overallReady: boolean;
  totalSources: number;
  availableSourcesCount: number;
  sources: SourceReadiness[];
  candidateId?: string;
  candidateName?: string;
}

export interface StrategicFinding {
  title: string;
  finding: string;
  evidence: string;
  strategicRelevance: string;
}

export interface PriorityRiskItem {
  id: string;
  risk: string;
  priorityLevel: 'CRITICA' | 'ALTA' | 'MEDIA' | 'MODERADA';
  reason: string;
  supportingEvidence: string;
}

export interface InformationGapItem {
  id: string;
  gap: string;
  missingSource: string;
  impactOnCampaign: string;
  recommendedAction: string;
}

export interface StrategicRecommendationItem {
  id: string;
  title: string;
  horizon: 'CORTO_PLAZO' | 'MEDIANO_PLAZO' | 'LARGO_PLAZO';
  action: string;
  rationale: string;
  expectedOutcome: string;
}

export interface Diagnostic360Result {
  executiveSummary: string;
  currentPositioning: {
    overview: string;
    keyStrengthsSummary: string;
    keyChallengesSummary: string;
    territorialFootprintSummary: string;
  };
  swotAnalysis: {
    fortalezas: StrategicFinding[];
    oportunidades: StrategicFinding[];
    debilidades: StrategicFinding[];
    amenazas: StrategicFinding[];
  };
  priorityRisks: PriorityRiskItem[];
  informationGaps: InformationGapItem[];
  keyFindings: {
    title: string;
    description: string;
    type: 'DATO' | 'INFERENCIA';
    supportingData: string;
  }[];
  strategicRecommendations: StrategicRecommendationItem[];
  metadata: {
    analyzedAt: string;
    aiProvider: string;
    aiModel: string;
    dataConfidenceScore: number; // 0 - 100
  };
}

export interface Diagnostic360Record {
  id: string;
  client_id?: string;
  candidate_id?: string;
  candidate_name: string;
  version: number;
  created_at: string;
  created_by: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  status: 'COMPLETED' | 'DRAFT' | 'ARCHIVED';
  sources_summary: SourceReadiness[];
  result: Diagnostic360Result;
}
