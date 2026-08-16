export enum UserRole {
  SUPERADMIN = 'SUPERADMIN',
  ADMIN_CLIENTE = 'ADMIN_CLIENTE',
  DIRECTOR = 'DIRECTOR',
  COORDINADOR = 'COORDINADOR',
  USUARIO = 'USUARIO',
  USUARIO_LIMITADO = 'USUARIO_LIMITADO'
}

export interface SystemPermission {
  code: string;
  name: string;
  group: string;
  description: string;
}

export type Permission = 'VIEW' | 'CREATE' | 'EDIT' | 'DELETE' | 'EXPORT' | 'APPROVE' | 'MANAGE' | 'CONFIGURE';

export type ModuleName = 'ADMINISTRATIVE' | 'STRATEGY' | 'TERRITORY' | 'CAMPAIGN' | 'CRM' | 'ELECTORAL' | 'COMMUNICATIONS' | 'AI' | 'DOCUMENTS' | 'SETTINGS' | 'ADMIN_PANEL';

export type LicenseStatus = 'PENDIENTE' | 'ACTIVA' | 'SUSPENDIDA' | 'VENCIDA' | 'CANCELADA';

export interface GeofenceAlert {
  id: string;
  type?: 'alert' | 'confirmation' | string;
  title?: string;
  message: string;
  mesa?: string;
  zone?: string;
  timestamp: string | number;
}

export interface TweetPost {
  id: string;
  user: string;
  handle?: string;
  text?: string;
  content?: string;
  hashtags?: string[];
  sentiment?: 'positive' | 'negative' | 'neutral';
  avatar?: string;
  timestamp?: number | string;
}

export interface ModuleDefinition {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  isRequiredForBasic: boolean;
  defaultEnabled: boolean;
}

export interface Plan {
  id: string;
  name: string;
  code: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  maxUsers: number;
  maxCampaigns: number;
  maxStorageGB: number;
  allowedModuleCodes: string[];
  supportLevel: string;
  hasAiFeatures: boolean;
  activeUsersCount: number;
  features: string[];
  isPopular?: boolean;
}

export interface Role {
  id: string;
  name: string;
  code: string;
  description: string;
  isSystemRole: boolean;
  permissionCodes: string[];
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  logo?: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
  createdAt: number;
}

export interface License {
  id: string;
  clientId: string;
  code: string;
  planId: string;
  startDate: number;
  expiryDate: number;
  status: LicenseStatus;
  maxUsers: number;
  allowedModules: string[];
}

export interface Subscription {
  id: string;
  clientId: string;
  planId: string;
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED';
  billingCycle: 'MONTHLY' | 'ANNUAL';
  nextBillingDate: number;
}

export interface Campaign {
  id: string;
  clientId: string;
  name: string;
  description: string;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED';
}

export interface Invoice {
  id: string;
  clientId: string;
  amount: number;
  date: number;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  timestamp: number;
  details?: any;
}

export interface Session {
  id: string;
  userId: string;
  startTime: number;
  endTime?: number;
  ipAddress?: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  timestamp: number;
  isRead: boolean;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  tenantId?: string; // Corresponds to Client.id
  status: 'ACTIVE' | 'INACTIVE';
  lastLogin?: number;
  allowedModules: string[];
}

export interface ModuleFunction {
  id: string;
  moduleCode: string;
  code: string;
  name: string;
  description?: string;
}

export interface UserPermission {
  id: string;
  userId: string;
  moduleCode: string;
  functionCode: string;
  actions: Permission[];
}

export interface AuthState {
  user: User | null;
  client: Client | null;
  license: License | null;
  permissions: UserPermission[];
  loading: boolean;
  error: string | null;
  isDatabaseConfigured: boolean;
  isSystemReady: boolean;
}

export interface Module {
  id: string;
  name: string;
  path: string;
  icon: string;
  category: 'STRATEGY' | 'TERRITORY' | 'CAMPAIGN' | 'CRM' | 'ELECTORAL' | 'COMMUNICATIONS' | 'AI' | 'DOCUMENTS' | 'SETTINGS';
  description: string;
}

// --- Electoral & CRM Specific Types ---

export interface ChatMessage {
  id: string;
  sender: string;
  avatar?: string;
  role: 'user' | 'assistant' | 'team';
  text: string;
  actions?: { label: string; action: string }[];
  timestamp: string;
}

export interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  type: string;
}

export interface E14Record {
  id: string;
  mesa: string;
  ocrStatus: 'Completado' | 'Error OCR' | 'Procesando';
  validation: 'Reviewed (Verde)' | 'Error (Rojo)' | 'Pendiente';
  puesto: string;
  votosRegistrados?: number;
  timestamp: string;
}

export interface BankTransaction {
  id: string;
  fecha: string;
  descripcion: string;
  categoria: 'Ingresos' | 'Operaciones' | 'Personal' | 'Eventos' | 'Publicidad';
  monto: number;
  estado: 'Completado' | 'Procesando' | 'Pendiente';
}

export interface TerritorialZone {
  id: string;
  clientId: string;
  nombre: string;
  lideresCount: number;
  votantesCount: number;
  metaVotos: number;
  cobertura: number;
  coordenadasX: number;
  coordenadasY: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface TerritorialSubdivision {
  id: string;
  zoneId: string;
  clientId: string;
  nombre: string;
  tipo: 'CORREGIMIENTO' | 'VEREDA';
  createdAt?: string;
}

// --- Administrative Module Types ---

export interface CustomRole {
  id: string;
  clientId: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  isSystem: boolean;
  allowedModules: string[];
  createdAt?: string;
  userCount?: number;
}

export interface CustomRolePermission {
  id: string;
  roleId: string;
  moduleCode: string;
  functionCode: string;
  actions: Permission[];
}

export interface Leader {
  id: string;
  clientId: string;
  nombre: string;
  cedula: string;
  telefono?: string;
  email?: string;
  comuna?: string;
  barrio?: string;
  zoneId?: string;
  subdivisionId?: string;
  puesto?: string;
  mesa?: string;
  metaVotos: number;
  votosComprometidos: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
}

export interface Voter {
  id: string;
  clientId: string;
  nombre: string;
  cedula: string;
  telefono?: string;
  email?: string;
  departamento?: string;
  municipio?: string;
  comuna?: string;
  barrio?: string;
  zoneId?: string;
  subdivisionId?: string;
  puesto?: string;
  mesa?: string;
  liderId?: string;
  liderNombre?: string;
  intencion: 'Voto Seguro' | 'Probable' | 'Indeciso' | 'En Contra';
  status: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
}

export interface BudgetItem {
  id: string;
  clientId: string;
  campaignId?: string;
  tipo: 'INGRESO' | 'GASTO';
  categoriaCNE: string;
  concepto: string;
  monto: number;
  fecha: string;
  comprobanteNumero?: string;
  soporteUrl?: string;
  beneficiarioNombre?: string;
  beneficiarioNit?: string;
  estado: 'REGISTRADO' | 'VERIFICADO' | 'OBSERVADO' | 'ANULADO';
  observaciones?: string;
  createdAt?: string;
}

export interface CampaignData {
  id: string;
  clientId: string;
  nombre: string;
  candidatoNombre?: string;
  cargoPostulacion?: string;
  departamento?: string;
  municipio?: string;
  circunscripcion?: string;
  fechaInicio?: string;
  fechaEleccion?: string;
  metaVotos: number;
  presupuestoTotal: number;
  estado: 'PLANIFICACION' | 'ACTIVA' | 'PAUSADA' | 'FINALIZADA';
  descripcion?: string;
  createdAt?: string;
}

export interface CampaignActivity {
  id: string;
  clientId: string;
  campaignId: string;
  titulo: string;
  descripcion?: string;
  fecha: string;
  responsableId?: string;
  responsableNombre?: string;
  estado: 'PENDIENTE' | 'EN_PROGRESO' | 'COMPLETADA' | 'CANCELADA';
  createdAt?: string;
}

export interface Witness {
  id: string;
  clientId: string;
  nombre: string;
  cedula: string;
  telefono?: string;
  email?: string;
  municipio?: string;
  zona?: string;
  puesto: string;
  mesa: string;
  estado: 'PENDIENTE' | 'CAPACITADO' | 'ACREDITADO' | 'EN_MESA' | 'INACTIVO';
  documentoSoporteUrl?: string;
  observaciones?: string;
  createdAt?: string;
}

export interface Juror {
  id: string;
  clientId: string;
  nombre: string;
  cedula: string;
  telefono?: string;
  municipio?: string;
  puesto: string;
  mesa: string;
  cargo: 'PRESIDENTE' | 'VICEPRESIDENTE' | 'VOCAL' | 'REMANENTE';
  afinidad: 'A_FAVOR' | 'NEUTRO' | 'EN_CONTRA' | 'DESCONOCIDO';
  observaciones?: string;
  createdAt?: string;
}

export interface SurveyQuestion {
  id: string;
  pregunta: string;
  tipo: 'OPCION_MULTIPLE' | 'UNICA_OPCION' | 'CALIFICACION' | 'TEXTO';
  opciones?: string[];
}

export interface Survey {
  id: string;
  clientId: string;
  titulo: string;
  descripcion?: string;
  fechaInicio: string;
  fechaFin?: string;
  muestraObjetivo: number;
  respuestasCount?: number;
  estado: 'BORRADOR' | 'ACTIVA' | 'CERRADA';
  preguntas: SurveyQuestion[];
  createdAt?: string;
}

// --- CONSULTA LUGAR DE VOTACIÓN & AUDITORÍA ---
export type ElectoralPresentationStatus = 
  | 'ACTIVO PARA VOTAR'
  | 'SUSPENDIDO POR MUERTE'
  | 'EN PROCESO'
  | 'NO HABILITADO'
  | 'ESTADO NO DISPONIBLE';

export interface NormalizedElectoralStatus {
  statusText: ElectoralPresentationStatus;
  rawStatus?: string;
  badgeVariant: 'active' | 'deceased' | 'in_process' | 'not_eligible' | 'unavailable';
  isVerified: boolean;
  verificationDate?: string;
}

export type QueryExecutionState = 
  | 'IDLE'
  | 'CARGANDO'
  | 'ENCONTRADO'
  | 'NO_ENCONTRADO'
  | 'SERVICIO_NO_CONFIGURADO'
  | 'ERROR_CONEXION'
  | 'ERROR_AUTENTICACION'
  | 'LIMITE_CONSULTAS'
  | 'ERROR_PROVEEDOR';

export interface VotingLocationApiResponse {
  status: QueryExecutionState;
  message?: string;
  apiQueryId?: string;
  cedula: string;
  nombreCompleto?: string;
  fechaNacimiento?: string;
  departamento?: string;
  municipio?: string;
  comuna?: string;
  barrio?: string;
  puestoVotacion?: string;
  direccionPuesto?: string;
  mesa?: string;
  estadoConsultaTexto?: string;
  electoralStatus?: NormalizedElectoralStatus;
  rawElectoralStatus?: string;
  queryTimestamp: string;
  verificationDate?: string;
}

export interface CitizenPollingPlace {
  documento: string;
  nombreCompleto: string;
  departamento: string;
  municipio: string;
  zona?: string;
  puestoVotacion: string;
  direccionPuesto?: string;
  mesa: string;
  comuna?: string;
  barrio?: string;
  liderAsignado?: string;
  infoAdicional?: string;
  estadoConsulta: 'ENCONTRADO' | 'NO_ENCONTRADO' | 'ERROR' | 'DUPLICADO';
  mensajeError?: string;
}

export interface PollingStationQueryRecord {
  id: string;
  clientId?: string;
  userId?: string;
  userName: string;
  userEmail: string;
  userRole: string;
  moduleSource: 'ADMINISTRATIVE' | 'STRATEGY' | 'TERRITORY';
  queryType: 'INDIVIDUAL' | 'MASIVA';
  documentoConsultado?: string;
  nombreConsultado?: string;
  puestoEncontrado?: string;
  mesaEncontrada?: string;
  municipioEncontrado?: string;
  departamentoEncontrado?: string;
  totalRecords: number;
  foundCount: number;
  notFoundCount: number;
  errorCount: number;
  duplicateCount?: number;
  fileName?: string;
  resultsSummary?: CitizenPollingPlace[];
  createdAt: string;
}

export * from './territorialDiagnostic';


