import { User, Client, License, UserRole } from '@/src/types';

export const CANONICAL_MODULES = {
  ADMINISTRATIVE: 'ADMINISTRATIVE',
  TERRITORY: 'TERRITORY',
  STRATEGY: 'STRATEGY',
  CRM: 'CRM',
  ELECTORAL: 'ELECTORAL',
  ANALYSIS: 'ANALYSIS',
  COMMUNICATIONS: 'COMMUNICATIONS'
} as const;

export type CanonicalModuleCode = typeof CANONICAL_MODULES[keyof typeof CANONICAL_MODULES];

export interface ModuleMetadata {
  code: CanonicalModuleCode;
  name: string;
  defaultPath: string;
  description: string;
}

export const MODULE_REGISTRY: Record<CanonicalModuleCode, ModuleMetadata> = {
  ADMINISTRATIVE: {
    code: 'ADMINISTRATIVE',
    name: 'Gestión Administrativa',
    defaultPath: '/gestion-administrativa/inicio',
    description: 'Control de recursos, presupuesto CNE, usuarios y contabilidad electoral.'
  },
  TERRITORY: {
    code: 'TERRITORY',
    name: 'Gestión Territorial',
    defaultPath: '/app/territory',
    description: 'Control geográfico, líderes barriales y censo en tiempo real.'
  },
  STRATEGY: {
    code: 'STRATEGY',
    name: 'Gestión Estratégica',
    defaultPath: '/app/strategy',
    description: 'Planeación de campaña, análisis FODA y metas electorales.'
  },
  CRM: {
    code: 'CRM',
    name: 'CRM Electoral',
    defaultPath: '/app/crm',
    description: 'Gestión de simpatizantes, votantes y árbol de referidos.'
  },
  ELECTORAL: {
    code: 'ELECTORAL',
    name: 'Electoral (E14)',
    defaultPath: '/app/electoral',
    description: 'Digitalización, validación de actas E-14 y control de escrutinio.'
  },
  ANALYSIS: {
    code: 'ANALYSIS',
    name: 'Análisis de Datos',
    defaultPath: '/app/analysis',
    description: 'Sondeos, tendencias y proyecciones estadísticas.'
  },
  COMMUNICATIONS: {
    code: 'COMMUNICATIONS',
    name: 'Comunicaciones',
    defaultPath: '/app/communications',
    description: 'Prensa, redes sociales y difusión multicanal.'
  }
};

/**
 * Normalizes any variation of module name/slug into the canonical uppercase code.
 * E.g., 'gestion_administrativa', 'gestion-administrativa', 'administrativa' -> 'ADMINISTRATIVE'
 */
export function normalizeModuleCode(raw: string | undefined | null): CanonicalModuleCode {
  if (!raw) return 'ADMINISTRATIVE';

  const cleaned = raw.toString().trim().toUpperCase().replace(/[\s\-_]+/g, '_');

  if (cleaned.includes('ADMIN') || cleaned.includes('GESTION_ADMINISTRATIVA') || cleaned.includes('ADMINISTRATIVA')) {
    return 'ADMINISTRATIVE';
  }
  if (cleaned.includes('TERRITOR') || cleaned.includes('GESTION_TERRITORIAL') || cleaned.includes('MAP')) {
    return 'TERRITORY';
  }
  if (cleaned.includes('ESTRATEGI') || cleaned.includes('STRATEG') || cleaned.includes('GESTION_ESTRATEGICA')) {
    return 'STRATEGY';
  }
  if (cleaned.includes('CRM') || cleaned.includes('VOTER') || cleaned.includes('VOTANTE') || cleaned.includes('SIMPATIZANTE')) {
    return 'CRM';
  }
  if (cleaned.includes('ELECTORAL') || cleaned.includes('E14') || cleaned.includes('ESCRUTINIO')) {
    return 'ELECTORAL';
  }
  if (cleaned.includes('ANALIS') || cleaned.includes('ANALYS') || cleaned.includes('SONDEO')) {
    return 'ANALYSIS';
  }
  if (cleaned.includes('COMUNIC') || cleaned.includes('PRENSA') || cleaned.includes('MESSAGE')) {
    return 'COMMUNICATIONS';
  }

  return (cleaned as CanonicalModuleCode) in MODULE_REGISTRY 
    ? (cleaned as CanonicalModuleCode) 
    : 'ADMINISTRATIVE';
}

/**
 * Gets human-readable display name for a module.
 */
export function getModuleDisplayName(codeOrSlug: string | undefined | null): string {
  const code = normalizeModuleCode(codeOrSlug);
  return MODULE_REGISTRY[code]?.name || 'Gestión Administrativa';
}

/**
 * Gets default redirection path for a module.
 */
export function getModuleDefaultPath(codeOrSlug: string | undefined | null): string {
  const code = normalizeModuleCode(codeOrSlug);
  return MODULE_REGISTRY[code]?.defaultPath || '/gestion-administrativa/inicio';
}

export interface ModuleAuthorizationResult {
  authorized: boolean;
  reason?: string;
  normalizedModule: CanonicalModuleCode;
  allowedModules: CanonicalModuleCode[];
  redirectPath: string;
}

/**
 * Centralized authorization engine to verify if a user has access to a specific module.
 */
export function evaluateModuleAccess(
  user: User | null,
  client: Client | null,
  license: License | null,
  requestedModule: string | undefined | null
): ModuleAuthorizationResult {
  const targetCode = normalizeModuleCode(requestedModule);
  const redirectPath = getModuleDefaultPath(targetCode);

  if (!user) {
    return {
      authorized: false,
      reason: 'No se encontró una sesión activa.',
      normalizedModule: targetCode,
      allowedModules: [],
      redirectPath: '/select-module'
    };
  }

  // 1. Account status validation
  if (user.status === 'INACTIVE' || (user as any).status === 'SUSPENDED') {
    return {
      authorized: false,
      reason: 'Tu cuenta de usuario se encuentra suspendida o inactiva.',
      normalizedModule: targetCode,
      allowedModules: [],
      redirectPath: '/select-module'
    };
  }

  // 2. Client status validation (if applicable)
  if (client && client.status !== 'ACTIVE') {
    return {
      authorized: false,
      reason: `La organización '${client.name}' se encuentra ${client.status === 'SUSPENDED' ? 'suspendida' : 'inactiva'}.`,
      normalizedModule: targetCode,
      allowedModules: [],
      redirectPath: '/select-module'
    };
  }

  // 3. SuperAdmin has unrestricted global access to all modules
  if (user.role === UserRole.SUPERADMIN) {
    const allModules = Object.keys(MODULE_REGISTRY) as CanonicalModuleCode[];
    return {
      authorized: true,
      normalizedModule: targetCode,
      allowedModules: allModules,
      redirectPath
    };
  }

  // 4. Extract and normalize assigned modules from user profile
  const userAllowed: CanonicalModuleCode[] = (user.allowedModules || [])
    .map(m => normalizeModuleCode(m))
    .filter(Boolean);

  // 5. Extract and normalize contracted modules from client or license
  const clientAllowed: CanonicalModuleCode[] = [
    ...(client && (client as any).allowed_modules ? (client as any).allowed_modules : []),
    ...(license && license.allowedModules ? license.allowedModules : [])
  ].map(m => normalizeModuleCode(m));

  // Determine effective allowed modules:
  let effectiveModules: CanonicalModuleCode[] = [];

  if (user.role === UserRole.ADMIN_CLIENTE) {
    // Client Admin gets access to all modules contracted by the client + profile modules
    const combined = new Set<CanonicalModuleCode>([
      ...userAllowed,
      ...clientAllowed,
      'ADMINISTRATIVE' // Client Admin always gets Administrative module by default
    ]);
    effectiveModules = Array.from(combined);
  } else {
    // Standard subusers (Director, Coordinador, etc.) get modules assigned to their profile
    // that are also supported by the organization license (if license list is non-empty)
    if (clientAllowed.length > 0) {
      effectiveModules = userAllowed.filter(m => clientAllowed.includes(m));
    } else {
      effectiveModules = userAllowed;
    }
  }

  // If user has zero modules assigned, grant at least ADMINISTRATIVE if they are ADMIN_CLIENTE
  if (effectiveModules.length === 0 && user.role === UserRole.ADMIN_CLIENTE) {
    effectiveModules = ['ADMINISTRATIVE'];
  }

  const isAuthorized = effectiveModules.includes(targetCode);

  return {
    authorized: isAuthorized,
    reason: isAuthorized ? undefined : 'Tu cuenta no tiene habilitado este módulo.',
    normalizedModule: targetCode,
    allowedModules: effectiveModules,
    redirectPath: isAuthorized ? redirectPath : (effectiveModules.length > 0 ? getModuleDefaultPath(effectiveModules[0]) : '/select-module')
  };
}
