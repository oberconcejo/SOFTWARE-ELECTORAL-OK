-- POLÍTICAS DE SEGURIDAD (RLS) PARA SOFTWARE ELECTORAL

-- Habilitar RLS en todas las tablas
ALTER TABLE voters ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE e14_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE zones ENABLE ROW LEVEL SECURITY;

------------------------------------------------------------
-- TABLA: VOTERS (Censo Electoral)
------------------------------------------------------------

-- Política: Los usuarios solo pueden ver votantes de su propio cliente
CREATE POLICY "Users can only view voters of their client" 
ON voters FOR SELECT 
USING (
  client_id IN (
    SELECT client_id FROM profiles WHERE id = auth.uid()
  )
);

-- Política: Los usuarios pueden insertar votantes para su cliente
CREATE POLICY "Users can only insert voters for their client" 
ON voters FOR INSERT 
WITH CHECK (
  client_id IN (
    SELECT client_id FROM profiles WHERE id = auth.uid()
  )
);

-- Política: Los usuarios pueden actualizar votantes de su cliente
CREATE POLICY "Users can only update voters of their client" 
ON voters FOR UPDATE 
USING (
  client_id IN (
    SELECT client_id FROM profiles WHERE id = auth.uid()
  )
)
WITH CHECK (
  client_id IN (
    SELECT client_id FROM profiles WHERE id = auth.uid()
  )
);

-- Política: Los usuarios pueden eliminar votantes de su cliente
CREATE POLICY "Users can only delete voters of their client" 
ON voters FOR DELETE 
USING (
  client_id IN (
    SELECT client_id FROM profiles WHERE id = auth.uid()
  )
);

------------------------------------------------------------
-- TABLA: E14_RECORDS (Control Electoral)
------------------------------------------------------------

CREATE POLICY "Users can view E14 records of their client" 
ON e14_records FOR SELECT 
USING (
  client_id IN (
    SELECT client_id FROM profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can insert E14 records for their client" 
ON e14_records FOR INSERT 
WITH CHECK (
  client_id IN (
    SELECT client_id FROM profiles WHERE id = auth.uid()
  )
);

------------------------------------------------------------
-- TABLA: CLIENTS (Tenant Management)
------------------------------------------------------------

-- Solo el SUPERADMIN puede gestionar clientes
CREATE POLICY "Only SuperAdmin can manage clients" 
ON clients FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'SUPERADMIN'
  )
);

-- Los usuarios normales pueden ver solo su propio registro de cliente
CREATE POLICY "Users can view their own client data" 
ON clients FOR SELECT 
USING (
  id IN (
    SELECT client_id FROM profiles WHERE id = auth.uid()
  )
);

------------------------------------------------------------
-- TABLA: USER_PERMISSIONS (Matriz de Control)
------------------------------------------------------------

ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own permissions" 
ON user_permissions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage permissions of their team" 
ON user_permissions FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() 
    AND p.role IN ('SUPERADMIN', 'ADMIN_CLIENTE')
  )
);

------------------------------------------------------------
-- TABLA: AUDIT_LOGS
------------------------------------------------------------

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view audit logs of their client" 
ON audit_logs FOR SELECT 
USING (
  client_id IN (
    SELECT client_id FROM profiles WHERE id = auth.uid()
  )
);

------------------------------------------------------------
-- VALIDACIONES ADICIONALES (Triggers)
------------------------------------------------------------

-- Forzar que el client_id sea siempre el del usuario autenticado en cada inserción
CREATE OR REPLACE FUNCTION public.handle_client_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Buscamos el client_id directamente en el perfil del usuario que realiza la acción
  SELECT client_id INTO NEW.client_id 
  FROM profiles 
  WHERE id = auth.uid();
  
  -- Si no tiene client_id (ej. SuperAdmin sin cliente), dejamos que se asigne manualmente o falle si es NOT NULL
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER voters_client_id_force
BEFORE INSERT ON voters
FOR EACH ROW EXECUTE FUNCTION handle_client_id();
