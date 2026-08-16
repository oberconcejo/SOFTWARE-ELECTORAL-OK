export type ImpactLevel = 'CRITICO' | 'ALTO' | 'MEDIO' | 'BAJO';

export type VariableStatus = 'EN_DIAGNOSTICO' | 'LINEA_BASE_DEFINIDA' | 'EN_META' | 'CRITICO' | 'SIN_INFORMACION';

export interface ThematicSector {
  id: string;
  clientId: string;
  name: string;
  description?: string;
  iconName?: string;
  color?: string;
  orderIndex?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface SectorIndicator {
  id: string;
  variableId: string;
  sectorId: string;
  clientId: string;
  name: string;
  unit: string; // '%', 'Tasa x 100k hab', 'Cantidad', 'Minutos', 'Índice (0-100)', etc.
  baselineValue?: string | number | null; // Línea base
  targetValue?: string | number | null; // Meta
  currentValue?: string | number | null;
  source?: string; // Fuente oficial
  surveyId?: string; // Relación con sondeo si existe
  surveyTitle?: string;
  surveyResultNote?: string;
  lastUpdated?: string;
  status: VariableStatus;
}

export interface SectorVariable {
  id: string;
  sectorId: string;
  clientId: string;
  name: string;
  description?: string;
  indicatorName?: string;
  unit?: string;
  baselineValue?: string | number | null;
  targetValue?: string | number | null;
  currentValue?: string | number | null;
  status: VariableStatus;
  source?: string;
  surveyId?: string;
  surveyTitle?: string;
  surveyFinding?: string;
  indicators?: SectorIndicator[];
  createdAt: string;
  updatedAt?: string;
}

export interface MicroLocalFiche {
  id: string;
  clientId: string;
  comuna: string; // Comuna / Corregimiento
  corregimiento?: string;
  barrio?: string; // Sector geográfico específico
  sectorId: string; // Relación con Sector Temático
  sectorName?: string;
  category: string; // Categoría temática
  impact: ImpactLevel;
  problem: string; // Problema diagnosticado
  proposal: string; // Propuesta programática
  isLinkedToGovProgram: boolean; // Insumo para Programa de Gobierno
  govProgramPillarId?: string;
  registeredBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SurveySyncState {
  lastSyncDate: string | null;
  connectedSurveysCount: number;
  isSyncing: boolean;
  status: 'IDLE' | 'SYNCED' | 'NO_SURVEYS' | 'ERROR';
  message?: string;
}
