import { 
  VotingLocationApiResponse, 
  NormalizedElectoralStatus, 
  ElectoralPresentationStatus, 
  QueryExecutionState 
} from '@/src/types';
import { supabase } from '@/src/lib/supabase';

/**
 * Service Layer Configuration for Voting Location API
 * All sensitive keys remain strictly on the server/backend.
 */
export interface VotingServiceConfig {
  baseUrl: string;
  endpoint: string;
  timeoutMs: number;
  isBackendProxy: boolean;
}

export const VOTING_SERVICE_CONFIG: VotingServiceConfig = {
  baseUrl: '/api/voting-location',
  endpoint: '/lookup',
  timeoutMs: 10000,
  isBackendProxy: true
};

/**
 * Converts raw status codes from the official API into normalized presentation states.
 * If the API does not provide a recognized status or it is empty, returns 'ESTADO NO DISPONIBLE'.
 */
export function normalizeElectoralStatus(
  rawStatus?: string | null,
  verifiedAt?: string | null
): NormalizedElectoralStatus {
  if (!rawStatus || !rawStatus.trim()) {
    return {
      statusText: 'ESTADO NO DISPONIBLE',
      rawStatus: undefined,
      badgeVariant: 'unavailable',
      isVerified: false,
      verificationDate: verifiedAt || undefined
    };
  }

  const normalized = rawStatus.trim().toUpperCase();

  if (
    normalized === 'ACTIVO' || 
    normalized === 'ACTIVE' || 
    normalized === 'HABILITADO' || 
    normalized === 'VALIDO' ||
    normalized === 'ACTIVO PARA VOTAR' ||
    normalized === 'VIGENTE'
  ) {
    return {
      statusText: 'ACTIVO PARA VOTAR',
      rawStatus,
      badgeVariant: 'active',
      isVerified: true,
      verificationDate: verifiedAt || undefined
    };
  }

  if (
    normalized === 'FALLECIDO' || 
    normalized === 'DECEASED' || 
    normalized === 'MUERTE' || 
    normalized === 'SUSPENDIDO POR MUERTE' ||
    normalized === 'CANCELACION_MUERTE'
  ) {
    return {
      statusText: 'SUSPENDIDO POR MUERTE',
      rawStatus,
      badgeVariant: 'deceased',
      isVerified: true,
      verificationDate: verifiedAt || undefined
    };
  }

  if (
    normalized === 'EN PROCESO' || 
    normalized === 'PENDING' || 
    normalized === 'TRAMITE' || 
    normalized === 'EN_TRAMITE' ||
    normalized === 'EN_PROCESO'
  ) {
    return {
      statusText: 'EN PROCESO',
      rawStatus,
      badgeVariant: 'in_process',
      isVerified: true,
      verificationDate: verifiedAt || undefined
    };
  }

  if (
    normalized === 'NO HABILITADO' || 
    normalized === 'INACTIVE' || 
    normalized === 'INHABILITADO' || 
    normalized === 'SUSPENDIDO' || 
    normalized === 'CANCELADO' ||
    normalized === 'PERDIDA_DERECHOS_POLITICOS'
  ) {
    return {
      statusText: 'NO HABILITADO',
      rawStatus,
      badgeVariant: 'not_eligible',
      isVerified: true,
      verificationDate: verifiedAt || undefined
    };
  }

  return {
    statusText: 'ESTADO NO DISPONIBLE',
    rawStatus,
    badgeVariant: 'unavailable',
    isVerified: true,
    verificationDate: verifiedAt || undefined
  };
}

/**
 * Standard User-Friendly Messages corresponding to Query States
 */
export const QUERY_STATE_MESSAGES: Record<QueryExecutionState, string> = {
  IDLE: '',
  CARGANDO: 'Verificando información...',
  ENCONTRADO: 'Información electoral verificada exitosamente.',
  NO_ENCONTRADO: 'No encontramos información asociada a esta cédula.',
  SERVICIO_NO_CONFIGURADO: 'Servicio de consulta no configurado',
  ERROR_CONEXION: 'No fue posible conectar con el servicio de consulta.',
  ERROR_AUTENTICACION: 'La autorización de la API no es válida.',
  LIMITE_CONSULTAS: 'Se alcanzó el límite de consultas.',
  ERROR_PROVEEDOR: 'El servicio de consulta no está disponible temporalmente.'
};

/**
 * Validates that the input document contains solely numbers (no letters, symbols or spaces)
 */
export function validateCedulaInput(input: string): { isValid: boolean; cleanCedula: string; errorMessage?: string } {
  const trimmed = input.trim();
  if (!trimmed) {
    return { isValid: false, cleanCedula: '', errorMessage: 'Por favor ingrese el número de cédula.' };
  }

  // Check if string contains any non-digit character
  if (!/^\d+$/.test(trimmed)) {
    return { isValid: false, cleanCedula: trimmed, errorMessage: 'La cédula debe contener únicamente números sin puntos, guiones ni letras.' };
  }

  if (trimmed.length < 4 || trimmed.length > 15) {
    return { isValid: false, cleanCedula: trimmed, errorMessage: 'La cédula debe tener entre 4 y 15 dígitos numéricos.' };
  }

  return { isValid: true, cleanCedula: trimmed };
}

/**
 * Primary Service Method: queryVotingLocation
 * Executes official query via backend proxy with robust error boundary and state mapping.
 */
export async function queryVotingLocation(
  rawCedula: string,
  options?: {
    authToken?: string;
    timeoutMs?: number;
  }
): Promise<VotingLocationApiResponse> {
  const { isValid, cleanCedula, errorMessage } = validateCedulaInput(rawCedula);
  const nowIso = new Date().toISOString();

  if (!isValid) {
    return {
      status: 'NO_ENCONTRADO',
      message: errorMessage || 'Número de documento inválido.',
      cedula: cleanCedula || rawCedula,
      queryTimestamp: nowIso
    };
  }

  const timeoutMs = options?.timeoutMs || VOTING_SERVICE_CONFIG.timeoutMs;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Request-ID': crypto.randomUUID()
    };

    if (options?.authToken) {
      headers['Authorization'] = `Bearer ${options.authToken}`;
    }

    const response = await fetch(`${VOTING_SERVICE_CONFIG.baseUrl}${VOTING_SERVICE_CONFIG.endpoint}?cedula=${encodeURIComponent(cleanCedula)}`, {
      method: 'GET',
      headers,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    // Handle Unconfigured Backend API (503 / 404 on proxy with UNCONFIGURED code)
    if (response.status === 503 || response.status === 501) {
      const errorJson = await response.json().catch(() => ({}));
      if (errorJson?.code === 'API_NOT_CONFIGURED' || errorJson?.status === 'UNCONFIGURED') {
        return {
          status: 'SERVICIO_NO_CONFIGURADO',
          message: QUERY_STATE_MESSAGES.SERVICIO_NO_CONFIGURADO,
          cedula: cleanCedula,
          queryTimestamp: nowIso
        };
      }
    }

    if (response.status === 401 || response.status === 403) {
      return {
        status: 'ERROR_AUTENTICACION',
        message: QUERY_STATE_MESSAGES.ERROR_AUTENTICACION,
        cedula: cleanCedula,
        queryTimestamp: nowIso
      };
    }

    if (response.status === 429) {
      return {
        status: 'LIMITE_CONSULTAS',
        message: QUERY_STATE_MESSAGES.LIMITE_CONSULTAS,
        cedula: cleanCedula,
        queryTimestamp: nowIso
      };
    }

    if (response.status === 404) {
      return {
        status: 'NO_ENCONTRADO',
        message: QUERY_STATE_MESSAGES.NO_ENCONTRADO,
        cedula: cleanCedula,
        queryTimestamp: nowIso
      };
    }

    if (!response.ok) {
      return {
        status: 'ERROR_PROVEEDOR',
        message: QUERY_STATE_MESSAGES.ERROR_PROVEEDOR,
        cedula: cleanCedula,
        queryTimestamp: nowIso
      };
    }

    const data = await response.json();

    // Check if backend returned structured UNCONFIGURED flag
    if (data.status === 'UNCONFIGURED' || data.code === 'API_NOT_CONFIGURED') {
      return {
        status: 'SERVICIO_NO_CONFIGURADO',
        message: QUERY_STATE_MESSAGES.SERVICIO_NO_CONFIGURADO,
        cedula: cleanCedula,
        queryTimestamp: nowIso
      };
    }

    if (data.status === 'NOT_FOUND' || data.encontrado === false) {
      return {
        status: 'NO_ENCONTRADO',
        message: QUERY_STATE_MESSAGES.NO_ENCONTRADO,
        cedula: cleanCedula,
        queryTimestamp: nowIso
      };
    }

    // Success response parsing with "No disponible" fallback for missing fields
    const electoralStatus = normalizeElectoralStatus(
      data.estadoElectoral || data.electoralStatus || data.estado || null,
      data.fechaVerificacion || data.verifiedAt || null
    );

    return {
      status: 'ENCONTRADO',
      message: QUERY_STATE_MESSAGES.ENCONTRADO,
      apiQueryId: data.queryId || data.id || undefined,
      cedula: cleanCedula,
      nombreCompleto: data.nombreCompleto || data.nombre || 'No disponible',
      fechaNacimiento: data.fechaNacimiento || 'No disponible',
      departamento: data.departamento || 'No disponible',
      municipio: data.municipio || 'No disponible',
      comuna: data.comuna || data.zona || 'No disponible',
      barrio: data.barrio || 'No disponible',
      puestoVotacion: data.puestoVotacion || data.puesto || 'No disponible',
      direccionPuesto: data.direccionPuesto || data.direccion || 'No disponible',
      mesa: data.mesa !== undefined && data.mesa !== null ? String(data.mesa) : 'No disponible',
      estadoConsultaTexto: 'Encontrado',
      electoralStatus,
      rawElectoralStatus: data.estadoElectoral || data.electoralStatus || undefined,
      queryTimestamp: data.queryTimestamp || nowIso,
      verificationDate: data.fechaVerificacion || data.verifiedAt || undefined
    };

  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      return {
        status: 'ERROR_CONEXION',
        message: QUERY_STATE_MESSAGES.ERROR_CONEXION,
        cedula: cleanCedula,
        queryTimestamp: nowIso
      };
    }

    // Network / Offline / Unreachable
    return {
      status: 'ERROR_CONEXION',
      message: QUERY_STATE_MESSAGES.ERROR_CONEXION,
      cedula: cleanCedula,
      queryTimestamp: nowIso
    };
  }
}

/**
 * Protect sensitive cedula string for audit logs (e.g. 1098***432)
 */
export function maskCedula(cedula: string): string {
  if (!cedula) return '';
  if (cedula.length <= 4) return '***';
  const start = cedula.slice(0, 3);
  const end = cedula.slice(-3);
  return `${start}***${end}`;
}

/**
 * Logs query traceability to database without saving unneeded raw personal payload
 */
export async function logVotingQueryAudit(params: {
  userId?: string;
  userName: string;
  userEmail: string;
  userRole: string;
  clientId?: string;
  moduleSource: 'ADMINISTRATIVE' | 'STRATEGY' | 'TERRITORY';
  cedula: string;
  resultStatus: QueryExecutionState;
  apiQueryId?: string;
  electoralStatus?: string;
  puestoEncontrado?: string;
  mesaEncontrada?: string;
  municipioEncontrado?: string;
  departamentoEncontrado?: string;
}) {
  try {
    if (!supabase) return;

    await supabase.from('polling_station_queries').insert([{
      client_id: params.clientId || null,
      user_id: params.userId || null,
      user_name: params.userName,
      user_email: params.userEmail,
      user_role: params.userRole,
      module_source: params.moduleSource,
      query_type: 'INDIVIDUAL',
      documento_consultado: maskCedula(params.cedula),
      puesto_encontrado: params.puestoEncontrado || null,
      mesa_encontrada: params.mesaEncontrada || null,
      municipio_encontrado: params.municipioEncontrado || null,
      departamento_encontrado: params.departamentoEncontrado || null,
      total_records: 1,
      found_count: params.resultStatus === 'ENCONTRADO' ? 1 : 0,
      not_found_count: params.resultStatus === 'NO_ENCONTRADO' ? 1 : 0,
      error_count: (params.resultStatus !== 'ENCONTRADO' && params.resultStatus !== 'NO_ENCONTRADO') ? 1 : 0,
      results_summary: {
        status: params.resultStatus,
        apiQueryId: params.apiQueryId || null,
        electoralStatus: params.electoralStatus || null,
        timestamp: new Date().toISOString()
      },
      created_at: new Date().toISOString()
    }]);
  } catch (error) {
    // Non-blocking traceability logging error
    console.warn('Traceability log notice:', error);
  }
}
