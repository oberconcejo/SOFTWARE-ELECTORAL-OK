-- Definitive Supabase Schema for SOFTWARE ELECTORAL
-- Multi-Tenancy, Normalized Modules, Granular Access Control and Administrative Module

-- 1. Helper Security Functions (Prevents RLS Recursion)
CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'SUPERADMIN'
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_client_id()
RETURNS UUID
LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT client_id FROM profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- 2. Clientes (Tenants / Campañas Organizacionales)
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    nit TEXT UNIQUE,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    address TEXT,
    city TEXT,
    department TEXT,
    country TEXT DEFAULT 'Colombia',
    logo_url TEXT,
    plan TEXT DEFAULT 'BASIC' CHECK (plan IN ('BASIC', 'PRO', 'ENTERPRISE')),
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'INACTIVE')),
    max_users INTEGER DEFAULT 10,
    allowed_modules TEXT[] DEFAULT '{ADMINISTRATIVE,TERRITORY,STRATEGY,CRM}',
    start_date TIMESTAMPTZ DEFAULT NOW(),
    expiry_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Planes de Suscripción
CREATE TABLE IF NOT EXISTS plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    max_users INTEGER DEFAULT 10,
    max_campaigns INTEGER DEFAULT 1,
    allowed_module_codes TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Módulos del Sistema
CREATE TABLE IF NOT EXISTS modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Funciones de Módulos (Permisos Granulares)
CREATE TABLE IF NOT EXISTS module_functions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_code TEXT REFERENCES modules(code) ON DELETE CASCADE,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    UNIQUE(module_code, code)
);

-- 6. Perfiles (Extensión de Auth.Users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    email TEXT NOT NULL,
    display_name TEXT,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'USUARIO' CHECK (role IN ('SUPERADMIN', 'ADMIN_CLIENTE', 'DIRECTOR', 'COORDINADOR', 'USUARIO', 'USUARIO_LIMITADO')),
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
    allowed_modules TEXT[] DEFAULT '{ADMINISTRATIVE}',
    custom_role_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Roles Personalizados por Cliente / Organización
CREATE TABLE IF NOT EXISTS custom_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    is_system BOOLEAN DEFAULT false,
    allowed_modules TEXT[] DEFAULT '{ADMINISTRATIVE}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Permisos Granulares de Roles Personalizados
CREATE TABLE IF NOT EXISTS custom_role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID REFERENCES custom_roles(id) ON DELETE CASCADE,
    module_code TEXT NOT NULL,
    function_code TEXT NOT NULL,
    actions TEXT[] DEFAULT '{VIEW}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(role_id, module_code, function_code)
);

-- 9. Permisos Directos de Usuario (Matriz de Acceso)
CREATE TABLE IF NOT EXISTS user_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    module_code TEXT NOT NULL,
    function_code TEXT NOT NULL,
    actions TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, module_code, function_code)
);

-- 10. Campañas Electorales
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    candidato_nombre TEXT,
    cargo_postulacion TEXT,
    departamento TEXT,
    municipio TEXT,
    circunscripcion TEXT,
    fecha_inicio DATE DEFAULT CURRENT_DATE,
    fecha_eleccion DATE,
    meta_votos INTEGER DEFAULT 0,
    presupuesto_total NUMERIC(15,2) DEFAULT 0,
    estado TEXT DEFAULT 'ACTIVA' CHECK (estado IN ('PLANIFICACION', 'ACTIVA', 'PAUSADA', 'FINALIZADA')),
    descripcion TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Actividades e Hitos de Campaña
CREATE TABLE IF NOT EXISTS campaign_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    descripcion TEXT,
    fecha DATE DEFAULT CURRENT_DATE,
    responsable_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    estado TEXT DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'EN_PROGRESO', 'COMPLETADA', 'CANCELADA')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Líderes Comunitarios y Políticos
CREATE TABLE IF NOT EXISTS leaders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    cedula TEXT NOT NULL,
    telefono TEXT,
    email TEXT,
    comuna TEXT,
    barrio TEXT,
    puesto TEXT,
    mesa TEXT,
    meta_votos INTEGER DEFAULT 50,
    votos_comprometidos INTEGER DEFAULT 0,
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Votantes (Censo Propio y Fidelización)
CREATE TABLE IF NOT EXISTS voters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    cedula TEXT UNIQUE NOT NULL,
    telefono TEXT,
    email TEXT,
    departamento TEXT DEFAULT 'Colombia',
    municipio TEXT,
    comuna TEXT,
    barrio TEXT,
    puesto TEXT,
    mesa TEXT,
    lider_id UUID REFERENCES leaders(id) ON DELETE SET NULL,
    intencion TEXT DEFAULT 'Voto Seguro' CHECK (intencion IN ('Voto Seguro', 'Probable', 'Indeciso', 'En Contra')),
    status TEXT DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Presupuesto e Ingresos/Gastos CNE (Cuentas Claras)
CREATE TABLE IF NOT EXISTS budget_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('INGRESO', 'GASTO')),
    categoria_cne TEXT NOT NULL,
    concepto TEXT NOT NULL,
    monto NUMERIC(15,2) NOT NULL,
    fecha DATE DEFAULT CURRENT_DATE,
    comprobante_numero TEXT,
    soporte_url TEXT,
    beneficiario_nombre TEXT,
    beneficiario_nit TEXT,
    estado TEXT DEFAULT 'REGISTRADO' CHECK (estado IN ('REGISTRADO', 'VERIFICADO', 'OBSERVADO', 'ANULADO')),
    observaciones TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Testigos Electorales (Acreditación y Mesa)
CREATE TABLE IF NOT EXISTS witnesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    cedula TEXT NOT NULL,
    telefono TEXT,
    email TEXT,
    municipio TEXT,
    zona TEXT,
    puesto TEXT NOT NULL,
    mesa TEXT NOT NULL,
    estado TEXT DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'CAPACITADO', 'ACREDITADO', 'EN_MESA', 'INACTIVO')),
    documento_soporte_url TEXT,
    observaciones TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. Jurados Electorales (Identificación y Seguimiento)
CREATE TABLE IF NOT EXISTS jurors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    cedula TEXT NOT NULL,
    telefono TEXT,
    municipio TEXT,
    puesto TEXT NOT NULL,
    mesa TEXT NOT NULL,
    cargo TEXT DEFAULT 'VOCAL' CHECK (cargo IN ('PRESIDENTE', 'VICEPRESIDENTE', 'VOCAL', 'REMANENTE')),
    afinidad TEXT DEFAULT 'NEUTRO' CHECK (afinidad IN ('A_FAVOR', 'NEUTRO', 'EN_CONTRA', 'DESCONOCIDO')),
    observaciones TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. Encuestas y Sondeos de Opinión
CREATE TABLE IF NOT EXISTS surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    descripcion TEXT,
    fecha_inicio DATE DEFAULT CURRENT_DATE,
    fecha_fin DATE,
    muestra_objetivo INTEGER DEFAULT 200,
    estado TEXT DEFAULT 'ACTIVA' CHECK (estado IN ('BORRADOR', 'ACTIVA', 'CERRADA')),
    preguntas JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. Respuestas de Encuestas
CREATE TABLE IF NOT EXISTS survey_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    encuestador_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    comuna TEXT,
    barrio TEXT,
    respuestas JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. Registros E14 (Control Electoral y Escrutinio)
CREATE TABLE IF NOT EXISTS e14_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    puesto TEXT NOT NULL,
    mesa TEXT NOT NULL,
    votos_candidato INTEGER DEFAULT 0,
    votos_total_mesa INTEGER DEFAULT 0,
    foto_url TEXT,
    testigo_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. Logs de Auditoría Global
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource TEXT NOT NULL,
    details JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 21. Licencias Activas
CREATE TABLE IF NOT EXISTS licenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES plans(id) ON DELETE SET NULL,
    start_date TIMESTAMPTZ DEFAULT NOW(),
    expiry_date TIMESTAMPTZ,
    status TEXT DEFAULT 'ACTIVA',
    allowed_modules TEXT[] DEFAULT '{ADMINISTRATIVE,TERRITORY,STRATEGY,CRM}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 22. Control de Uso de API (Consultas de Lugar de Votación)
CREATE TABLE IF NOT EXISTS client_api_usage (
    client_id UUID PRIMARY KEY REFERENCES clients(id) ON DELETE CASCADE,
    total_assigned INTEGER DEFAULT 0,
    total_consumed INTEGER DEFAULT 0,
    last_query_at TIMESTAMPTZ,
    status TEXT DEFAULT 'ACTIVE',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 23. Historial de Consultas de Lugar de Votación
CREATE TABLE IF NOT EXISTS polling_station_queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_name TEXT,
    user_email TEXT,
    user_role TEXT,
    module_source TEXT,
    query_type TEXT,
    documento_consultado TEXT,
    puesto_encontrado TEXT,
    mesa_encontrada TEXT,
    municipio_encontrado TEXT,
    departamento_encontrado TEXT,
    found_count INTEGER DEFAULT 0,
    not_found_count INTEGER DEFAULT 0,
    request_id TEXT,
    results_summary JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 24. Transacciones de Saldo de API
CREATE TABLE IF NOT EXISTS api_usage_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    amount INTEGER NOT NULL,
    transaction_type TEXT NOT NULL,
    previous_balance INTEGER,
    new_balance INTEGER,
    query_id UUID REFERENCES polling_station_queries(id) ON DELETE SET NULL,
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --- ÍNDICES DE RENDIMIENTO ---
CREATE INDEX IF NOT EXISTS idx_profiles_client ON profiles(client_id);
CREATE INDEX IF NOT EXISTS idx_voters_client ON voters(client_id);
CREATE INDEX IF NOT EXISTS idx_voters_lider ON voters(lider_id);
CREATE INDEX IF NOT EXISTS idx_leaders_client ON leaders(client_id);
CREATE INDEX IF NOT EXISTS idx_budget_client ON budget_items(client_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_client ON campaigns(client_id);
CREATE INDEX IF NOT EXISTS idx_witnesses_client ON witnesses(client_id);
CREATE INDEX IF NOT EXISTS idx_jurors_client ON jurors(client_id);
CREATE INDEX IF NOT EXISTS idx_surveys_client ON surveys(client_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_client ON client_api_usage(client_id);
CREATE INDEX IF NOT EXISTS idx_api_queries_client ON polling_station_queries(client_id);
CREATE INDEX IF NOT EXISTS idx_api_trans_client ON api_usage_transactions(client_id);

-- --- ROW LEVEL SECURITY (RLS) ---

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaders ENABLE ROW LEVEL SECURITY;
ALTER TABLE voters ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE witnesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE jurors ENABLE ROW LEVEL SECURITY;
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE e14_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_api_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE polling_station_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_functions ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

-- 1. Modules, Functions & Plans: Public read for authenticated users
DROP POLICY IF EXISTS modules_read ON modules;
CREATE POLICY modules_read ON modules FOR SELECT USING (true);

DROP POLICY IF EXISTS functions_read ON module_functions;
CREATE POLICY functions_read ON module_functions FOR SELECT USING (true);

DROP POLICY IF EXISTS plans_read ON plans;
CREATE POLICY plans_read ON plans FOR SELECT USING (true);

-- 2. Profiles Isolation
DROP POLICY IF EXISTS profile_select ON profiles;
CREATE POLICY profile_select ON profiles FOR SELECT USING (
    id = auth.uid() OR 
    is_superadmin() OR 
    (client_id = get_user_client_id() AND get_user_client_id() IS NOT NULL)
);

DROP POLICY IF EXISTS profile_insert ON profiles;
CREATE POLICY profile_insert ON profiles FOR INSERT WITH CHECK (
    id = auth.uid() OR is_superadmin()
);

DROP POLICY IF EXISTS profile_update ON profiles;
CREATE POLICY profile_update ON profiles FOR UPDATE USING (
    id = auth.uid() OR is_superadmin()
);

-- 3. Clients Isolation
DROP POLICY IF EXISTS client_isolation ON clients;
CREATE POLICY client_isolation ON clients FOR ALL USING (
    id = get_user_client_id() OR is_superadmin()
) WITH CHECK (true);

-- 4. Custom Roles & Permissions Isolation
DROP POLICY IF EXISTS custom_roles_isolation ON custom_roles;
CREATE POLICY custom_roles_isolation ON custom_roles FOR ALL USING (
    client_id = get_user_client_id() OR is_superadmin()
);

DROP POLICY IF EXISTS custom_role_permissions_isolation ON custom_role_permissions;
CREATE POLICY custom_role_permissions_isolation ON custom_role_permissions FOR ALL USING (
    EXISTS (SELECT 1 FROM custom_roles WHERE custom_roles.id = custom_role_permissions.role_id AND (custom_roles.client_id = get_user_client_id() OR is_superadmin()))
);

-- 5. User Permissions Isolation
DROP POLICY IF EXISTS permission_isolation ON user_permissions;
CREATE POLICY permission_isolation ON user_permissions FOR ALL USING (
    user_id = auth.uid() OR is_superadmin() OR (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN_CLIENTE') 
      AND user_id IN (SELECT id FROM profiles WHERE client_id = get_user_client_id())
    )
);

-- 6. Campaigns & Activities Isolation
DROP POLICY IF EXISTS campaigns_isolation ON campaigns;
CREATE POLICY campaigns_isolation ON campaigns FOR ALL USING (
    client_id = get_user_client_id() OR is_superadmin()
);

DROP POLICY IF EXISTS campaign_activities_isolation ON campaign_activities;
CREATE POLICY campaign_activities_isolation ON campaign_activities FOR ALL USING (
    client_id = get_user_client_id() OR is_superadmin()
);

-- 7. Leaders Isolation
DROP POLICY IF EXISTS leaders_isolation ON leaders;
CREATE POLICY leaders_isolation ON leaders FOR ALL USING (
    client_id = get_user_client_id() OR is_superadmin()
);

-- 8. Voters Isolation
DROP POLICY IF EXISTS voters_isolation ON voters;
CREATE POLICY voters_isolation ON voters FOR ALL USING (
    client_id = get_user_client_id() OR is_superadmin()
);

-- 9. Budget Items Isolation
DROP POLICY IF EXISTS budget_isolation ON budget_items;
CREATE POLICY budget_isolation ON budget_items FOR ALL USING (
    client_id = get_user_client_id() OR is_superadmin()
);

-- 10. Witnesses Isolation
DROP POLICY IF EXISTS witnesses_isolation ON witnesses;
CREATE POLICY witnesses_isolation ON witnesses FOR ALL USING (
    client_id = get_user_client_id() OR is_superadmin()
);

-- 11. Jurors Isolation
DROP POLICY IF EXISTS jurors_isolation ON jurors;
CREATE POLICY jurors_isolation ON jurors FOR ALL USING (
    client_id = get_user_client_id() OR is_superadmin()
);

-- 12. Surveys Isolation
DROP POLICY IF EXISTS surveys_isolation ON surveys;
CREATE POLICY surveys_isolation ON surveys FOR ALL USING (
    client_id = get_user_client_id() OR is_superadmin()
);

DROP POLICY IF EXISTS survey_responses_isolation ON survey_responses;
CREATE POLICY survey_responses_isolation ON survey_responses FOR ALL USING (
    client_id = get_user_client_id() OR is_superadmin()
);

-- 13. Audit & Licenses
DROP POLICY IF EXISTS audit_isolation ON audit_logs;
CREATE POLICY audit_isolation ON audit_logs FOR SELECT USING (
    client_id = get_user_client_id() OR is_superadmin()
);

DROP POLICY IF EXISTS license_isolation ON licenses;
CREATE POLICY license_isolation ON licenses FOR ALL USING (
    client_id = get_user_client_id() OR is_superadmin()
);

-- 14. API Usage Isolation
DROP POLICY IF EXISTS api_usage_isolation ON client_api_usage;
CREATE POLICY api_usage_isolation ON client_api_usage FOR ALL USING (
    client_id = get_user_client_id() OR is_superadmin()
);

DROP POLICY IF EXISTS api_queries_isolation ON polling_station_queries;
CREATE POLICY api_queries_isolation ON polling_station_queries FOR ALL USING (
    client_id = get_user_client_id() OR is_superadmin()
);

DROP POLICY IF EXISTS api_transactions_isolation ON api_usage_transactions;
CREATE POLICY api_transactions_isolation ON api_usage_transactions FOR ALL USING (
    client_id = get_user_client_id() OR is_superadmin()
);

-- --- SEED DATA INICIAL ---

INSERT INTO modules (code, name, description, icon) VALUES
('ADMINISTRATIVE', 'Gestión Administrativa', 'Control de recursos, presupuesto CNE, roles, votantes y gestión de campaña', 'Shield'),
('TERRITORY', 'Gestión Territorial', 'Control geográfico, georreferenciación y censo en tiempo real', 'MapPin'),
('STRATEGY', 'Gestión Estratégica', 'Planeación de campaña, análisis FODA y metas electorales', 'Target'),
('CRM', 'CRM Electoral', 'Gestión de simpatizantes, votantes y árbol de referidos', 'Users'),
('ELECTORAL', 'Electoral (E14)', 'Digitalización, validación de actas E-14 y control de escrutinio', 'Vote'),
('ANALYSIS', 'Análisis de Datos', 'Sondeos, tendencias y proyecciones estadísticas', 'BarChart3'),
('COMMUNICATIONS', 'Comunicaciones', 'Prensa, redes sociales y difusión multicanal', 'MessageSquare')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

-- Funciones del Módulo Administrativo
INSERT INTO module_functions (module_code, code, name, description) VALUES
('ADMINISTRATIVE', 'ADMIN_DASHBOARD', 'Inicio / Dashboard', 'Visualización de métricas generales y estadísticas'),
('ADMINISTRATIVE', 'ROLES_MANAGEMENT', 'Gestión de Roles', 'Creación y administración de roles y permisos'),
('ADMINISTRATIVE', 'LEADERS_VOTERS', 'Líderes y Votantes', 'Administración de líderes territoriales y censo de votantes'),
('ADMINISTRATIVE', 'BUDGET_CNE', 'Presupuesto / CNE', 'Ingresos, gastos y reportes para CNE / Cuentas Claras'),
('ADMINISTRATIVE', 'CAMPAIGN_MANAGEMENT', 'Gestión de Campaña', 'Objetivos, hitos y actividades de campaña'),
('ADMINISTRATIVE', 'WITNESSES_MANAGEMENT', 'Gestión de Testigos', 'Acreditación y monitoreo de testigos electorales'),
('ADMINISTRATIVE', 'JURORS_MANAGEMENT', 'Jurados Electorales', 'Monitoreo de jurados de votación en mesas'),
('ADMINISTRATIVE', 'POLLS_SURVEYS', 'Encuestas y Sondeos', 'Creación y análisis de encuestas de opinión'),
('ADMINISTRATIVE', 'SYSTEM_SETTINGS', 'Configuración', 'Ajustes del sistema, usuarios y seguridad')
ON CONFLICT (module_code, code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;
