-- RBAC & Multi-tenancy Security Policies

-- Enable RLS on core tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;

-- 1. CLIENTS Table Policies
CREATE POLICY "Clients: Users can view their own client" 
ON clients FOR SELECT 
USING (id IN (SELECT client_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Clients: SuperAdmin full access" 
ON clients FOR ALL 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'SUPERADMIN'));

-- 2. PROFILES Table Policies
CREATE POLICY "Profiles: Users can view profiles from same client" 
ON profiles FOR SELECT 
USING (client_id IN (SELECT client_id FROM profiles WHERE id = auth.uid()) OR id = auth.uid());

CREATE POLICY "Profiles: Admin can manage profiles from same client" 
ON profiles FOR ALL 
USING (
  (client_id IN (SELECT client_id FROM profiles WHERE id = auth.uid()) AND 
   EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('SUPERADMIN', 'ADMIN_CLIENTE')))
);

-- 3. PERMISSIONS Table Policies
CREATE POLICY "Permissions: Users can view their own permissions" 
ON user_permissions FOR SELECT 
USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('SUPERADMIN', 'ADMIN_CLIENTE')));

CREATE POLICY "Permissions: Admin can manage permissions from same client" 
ON user_permissions FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('SUPERADMIN', 'ADMIN_CLIENTE')
    AND client_id = (SELECT client_id FROM profiles WHERE id = user_id)
  )
);

-- 4. BUSINESS DATA ISOLATION (Conceptual - apply to specific tables)
-- Example: ALTER TABLE territorial_data ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Territory: Client isolation" ON territorial_data FOR ALL 
-- USING (client_id IN (SELECT client_id FROM profiles WHERE id = auth.uid()));

-- Function to check permission in SQL (can be used in policies)
CREATE OR REPLACE FUNCTION check_user_permission(target_module_code text, target_function_code text, required_action text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_permissions 
    WHERE user_id = auth.uid() 
    AND module_code = target_module_code 
    AND function_code = target_function_code 
    AND (actions @> ARRAY[required_action]::text[] OR actions @> ARRAY['MANAGE']::text[])
  ) OR EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('SUPERADMIN', 'ADMIN_CLIENTE')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
