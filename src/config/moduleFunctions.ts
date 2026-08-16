import { ModuleFunction } from '@/src/types';

export const MODULE_FUNCTIONS: ModuleFunction[] = [
  // GESTIÓN TERRITORIAL
  { id: 'tf-1', moduleCode: 'TERRITORY', code: 'DASHBOARD', name: 'Dashboard' },
  { id: 'tf-2', moduleCode: 'TERRITORY', code: 'TERRITORIES', name: 'Territorios' },
  { id: 'tf-3', moduleCode: 'TERRITORY', code: 'MUNICIPALITIES', name: 'Municipios' },
  { id: 'tf-4', moduleCode: 'TERRITORY', code: 'MAPS', name: 'Mapas' },
  { id: 'tf-5', moduleCode: 'TERRITORY', code: 'REPORTS', name: 'Reportes' },
  { id: 'tf-6', moduleCode: 'TERRITORY', code: 'STATS', name: 'Estadísticas' },

  // GESTIÓN ADMINISTRATIVA
  { id: 'af-1', moduleCode: 'ADMINISTRATIVE', code: 'USERS', name: 'Usuarios' },
  { id: 'af-2', moduleCode: 'ADMINISTRATIVE', code: 'BUDGET', name: 'Presupuesto' },
  { id: 'af-3', moduleCode: 'ADMINISTRATIVE', code: 'CNE_REPORTS', name: 'Informes CNE' },
  { id: 'af-4', moduleCode: 'ADMINISTRATIVE', code: 'ACCOUNTING', name: 'Contabilidad' },

  // GESTIÓN ESTRATÉGICA
  { id: 'sf-1', moduleCode: 'STRATEGY', code: 'CAMPAIGN_PLAN', name: 'Plan de Campaña' },
  { id: 'sf-2', moduleCode: 'STRATEGY', code: 'SWOT', name: 'Análisis FODA' },
  { id: 'sf-3', moduleCode: 'STRATEGY', code: 'GOALS', name: 'Metas Electorales' },
  { id: 'sf-4', moduleCode: 'STRATEGY', code: 'POLLS', name: 'Sondeos y Encuestas' },
];
