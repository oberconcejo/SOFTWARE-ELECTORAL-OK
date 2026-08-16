import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Database, Copy, Check, Terminal, Shield, ArrowRight } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';

export default function DatabaseSetupPage() {
  const [copied, setCopied] = useState(false);

  const sqlCode = `-- Definitive Supabase Schema for SOFTWARE ELECTORAL
-- FASE 2: Arquitectura de Datos Relacional y Multi-Tenencia

-- 1. Clientes (Tenants)
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    address TEXT,
    logo_url TEXT,
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'INACTIVE')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Planes de Suscripción
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

-- 3. Módulos del Sistema
CREATE TABLE IF NOT EXISTS modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Funciones de Módulos (Permisos Granulares)
CREATE TABLE IF NOT EXISTS module_functions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_code TEXT REFERENCES modules(code) ON DELETE CASCADE,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    UNIQUE(module_code, code)
);

-- 5. Perfiles (Extensión de Auth.Users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    email TEXT NOT NULL,
    display_name TEXT,
    role TEXT NOT NULL DEFAULT 'USUARIO' CHECK (role IN ('SUPERADMIN', 'ADMIN_CLIENTE', 'DIRECTOR', 'COORDINADOR', 'USUARIO', 'USUARIO_LIMITADO')),
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    allowed_modules TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Permisos de Usuario (Matriz de Acceso)
CREATE TABLE IF NOT EXISTS user_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    module_code TEXT NOT NULL,
    function_code TEXT NOT NULL,
    actions TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, module_code, function_code)
);

-- 7. Logs de Auditoría
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource TEXT NOT NULL,
    details JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Licencias Activas
CREATE TABLE IF NOT EXISTS licenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES plans(id) ON DELETE SET NULL,
    start_date TIMESTAMPTZ DEFAULT NOW(),
    expiry_date TIMESTAMPTZ,
    status TEXT DEFAULT 'ACTIVA',
    allowed_modules TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Historial de Consultas de Lugar de Votación (Individuales y Masivas)
CREATE TABLE IF NOT EXISTS polling_station_queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_name TEXT NOT NULL,
    user_email TEXT NOT NULL,
    user_role TEXT NOT NULL,
    module_source TEXT NOT NULL,
    query_type TEXT NOT NULL CHECK (query_type IN ('INDIVIDUAL', 'MASIVA')),
    documento_consultado TEXT,
    nombre_consultado TEXT,
    puesto_encontrado TEXT,
    mesa_encontrada TEXT,
    municipio_encontrado TEXT,
    departamento_encontrado TEXT,
    total_records INTEGER NOT NULL DEFAULT 1,
    found_count INTEGER NOT NULL DEFAULT 0,
    not_found_count INTEGER NOT NULL DEFAULT 0,
    error_count INTEGER NOT NULL DEFAULT 0,
    duplicate_count INTEGER NOT NULL DEFAULT 0,
    file_name TEXT,
    results_summary JSONB,
    request_id TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --- SEGURIDAD Y RLS ---

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE polling_station_queries ENABLE ROW LEVEL SECURITY;

-- Políticas básicas de acceso
DROP POLICY IF EXISTS client_isolation ON clients;
CREATE POLICY client_isolation ON clients FOR ALL 
    USING (id IN (SELECT client_id FROM profiles WHERE id = auth.uid()))
    WITH CHECK (true);

DROP POLICY IF EXISTS profile_self_view ON profiles;
CREATE POLICY profile_self_view ON profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS profile_self_insert ON profiles;
CREATE POLICY profile_self_insert ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS profile_self_update ON profiles;
CREATE POLICY profile_self_update ON profiles FOR UPDATE USING (auth.uid() = id);

-- --- SEED DATA ---
INSERT INTO modules (code, name, description, icon) VALUES
('STRATEGY', 'Planificación Estratégica', 'Gestión de hitos y objetivos', 'Target'),
('TERRITORY', 'Gestión Territorial', 'Control de zonas y líderes', 'MapPin'),
('CRM', 'CRM Electoral', 'Gestión de votantes y simpatizantes', 'Users'),
('ADMINISTRATIVE', 'Administrativo', 'Gestión de usuarios y licencias', 'Shield')
ON CONFLICT (code) DO NOTHING;

INSERT INTO plans (name, code, description, max_users, max_campaigns, allowed_module_codes) VALUES
('Plan Pro', 'PRO', 'Control total', 50, 5, '{ADMINISTRATIVE,STRATEGY,TERRITORY,CRM}')
ON CONFLICT (code) DO NOTHING;

-- 10. Gestión Territorial y Electoral
CREATE TABLE IF NOT EXISTS territorial_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    lideres_count INTEGER DEFAULT 0,
    votantes_count INTEGER DEFAULT 0,
    meta_votos INTEGER DEFAULT 0,
    cobertura FLOAT DEFAULT 0,
    coordenadas_x FLOAT DEFAULT 0,
    coordenadas_y FLOAT DEFAULT 0,
    status TEXT DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS territorial_subdivisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zone_id UUID REFERENCES territorial_zones(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('CORREGIMIENTO', 'VEREDA')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS leaders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    cedula TEXT NOT NULL,
    telefono TEXT,
    email TEXT,
    comuna TEXT,
    barrio TEXT,
    zone_id UUID REFERENCES territorial_zones(id),
    subdivision_id UUID REFERENCES territorial_subdivisions(id),
    puesto TEXT,
    mesa TEXT,
    meta_votos INTEGER DEFAULT 50,
    votos_comprometidos INTEGER DEFAULT 0,
    status TEXT DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Control de Consumo de API
CREATE TABLE IF NOT EXISTS client_api_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE UNIQUE,
    total_assigned INTEGER NOT NULL DEFAULT 0,
    total_consumed INTEGER NOT NULL DEFAULT 0,
    last_query_at TIMESTAMPTZ,
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'LIMIT_REACHED', 'SUSPENDED')),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS api_usage_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    amount INTEGER NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('CONSUMO', 'ASIGNACION', 'AJUSTE', 'DEVOLUCION')),
    previous_balance INTEGER NOT NULL,
    new_balance INTEGER NOT NULL,
    query_id UUID REFERENCES polling_station_queries(id),
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS voters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    cedula TEXT NOT NULL,
    telefono TEXT,
    email TEXT,
    departamento TEXT DEFAULT 'Antioquia',
    municipio TEXT DEFAULT 'Medellín',
    comuna TEXT,
    barrio TEXT,
    zone_id UUID REFERENCES territorial_zones(id),
    subdivision_id UUID REFERENCES territorial_subdivisions(id),
    puesto TEXT,
    mesa TEXT,
    lider_id UUID REFERENCES leaders(id) ON DELETE SET NULL,
    intencion TEXT DEFAULT 'Voto Seguro',
    status TEXT DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW()
);`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 sm:p-12 overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-5xl z-10"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-indigo-500/20">
              <Database className="w-8 h-8 text-white" />
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6 tracking-tight">
              Configuración de <span className="text-indigo-400">Base de Datos</span> Requerida
            </h1>
            
            <p className="text-slate-400 text-lg mb-10 leading-relaxed max-w-lg">
              La aplicación se ha conectado correctamente a Supabase, pero las tablas del sistema aún no han sido creadas. Sigue estos pasos para activar la plataforma.
            </p>

            <div className="space-y-6">
              {[
                { icon: ArrowRight, text: "Abre tu panel de Supabase" },
                { icon: Terminal, text: "Entra en el 'SQL Editor'" },
                { icon: Shield, text: "Pega y ejecuta el script de la derecha" }
              ].map((step, idx) => (
                <div key={idx} className="flex items-center gap-4 group">
                  <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/10 group-hover:border-indigo-500/30 transition-all">
                    <step.icon className="w-5 h-5" />
                  </div>
                  <span className="text-white font-medium">{step.text}</span>
                </div>
              ))}
            </div>

            <Button 
              onClick={() => window.location.reload()}
              className="mt-12 h-14 px-8 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl shadow-lg shadow-indigo-600/20 text-lg font-bold"
            >
              Ya ejecuté el script, refrescar app
            </Button>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-indigo-500/20 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative bg-[#020617] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/30" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/30" />
                    <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/30" />
                  </div>
                  <span className="text-slate-500 text-sm font-mono ml-2">supabase_schema.sql</span>
                </div>
                <button 
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600/10 border border-indigo-500/20 rounded-xl text-indigo-400 hover:bg-indigo-600/20 transition-all text-sm font-bold"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? '¡Copiado!' : 'Copiar Script'}
                </button>
              </div>
              
              <div className="p-8 h-[500px] overflow-y-auto scrollbar-hide font-mono text-sm leading-relaxed">
                <pre className="text-indigo-200/70">
                  {sqlCode}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
