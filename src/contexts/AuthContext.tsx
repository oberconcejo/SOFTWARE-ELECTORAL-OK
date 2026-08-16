import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/src/lib/supabase';
import { User, UserRole, AuthState, Client, License, UserPermission, Permission } from '@/src/types';
import { 
  evaluateModuleAccess, 
  normalizeModuleCode, 
  ModuleAuthorizationResult,
  CANONICAL_MODULES,
  getModuleDefaultPath
} from '@/src/lib/moduleAuth';

export interface FetchedUserData {
  user: User;
  client: Client | null;
  apiUsage: any | null;
  license: License | null;
  permissions: UserPermission[];
  allowedModules: string[];
}

interface AuthContextType extends AuthState {
  apiUsage: any | null;
  login: (
    email: string, 
    password: string, 
    options?: { requiredRole?: UserRole; requiredModule?: string }
  ) => Promise<ModuleAuthorizationResult>;
  logout: () => Promise<void>;
  checkModuleAccess: (moduleCode: string) => boolean;
  checkPermission: (moduleCode: string, functionCode: string, action: Permission) => boolean;
  refreshUserData: () => Promise<FetchedUserData | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState & { apiUsage: any | null }>({
    user: null,
    client: null,
    apiUsage: null,
    license: null,
    permissions: [],
    loading: true,
    error: null,
    isDatabaseConfigured: true,
    isSystemReady: false,
  });

  useEffect(() => {
    if (!supabase) {
      console.warn('Supabase client not initialized. Check your environment variables.');
      setState(prev => ({ ...prev, loading: false, isSystemReady: true }));
      return;
    }

    // Perform a silent health check on startup
    const checkHealth = async () => {
      try {
        const { error } = await supabase.from('modules').select('code').limit(1);
        if (error && (error.code === '42P01' || error.message?.includes('does not exist'))) {
          setState(prev => ({ ...prev, isDatabaseConfigured: false, isSystemReady: true }));
        } else {
          setState(prev => ({ ...prev, isDatabaseConfigured: true, isSystemReady: true }));
        }
      } catch (err) {
        console.error('Health check failed:', err);
        setState(prev => ({ ...prev, isSystemReady: true }));
      }
    };

    checkHealth();

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchUserData(session.user.id);
      } else {
        setState(prev => ({ ...prev, loading: false }));
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchUserData(session.user.id);
      } else {
        setState(prev => ({
          ...prev,
          user: null,
          client: null,
          license: null,
          permissions: [],
          loading: false,
          error: null,
        }));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (userId: string): Promise<FetchedUserData | null> => {
    if (!supabase) return null;
    try {
      setState(prev => ({ ...prev, loading: true }));

      // 1. Fetch Profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileError && (profileError.code === '42P01' || profileError.code === 'PGRST205' || profileError.message?.includes('does not exist'))) {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          const fallbackUser: User = {
            id: authUser.id,
            email: authUser.email!,
            displayName: authUser.user_metadata?.display_name || authUser.email?.split('@')[0],
            role: (authUser.email === 'oberosorio1@gmail.com' || authUser.email?.includes('admin')) ? UserRole.SUPERADMIN : UserRole.ADMIN_CLIENTE,
            status: 'ACTIVE',
            allowedModules: ['ADMINISTRATIVE', 'TERRITORY', 'STRATEGY', 'CRM']
          };
          setState(prev => ({
            ...prev,
            user: fallbackUser,
            loading: false,
            isDatabaseConfigured: false,
            error: null
          }));
          return {
            user: fallbackUser,
            client: null,
            apiUsage: null,
            license: null,
            permissions: [],
            allowedModules: fallbackUser.allowedModules
          };
        }
      }

      let activeProfile = profile;

      // Ensure oberosorio1@gmail.com or superadmin emails always have full root SUPERADMIN role and all modules
      if (activeProfile) {
        const isSuperUser = activeProfile.email === 'oberosorio1@gmail.com' || 
                            activeProfile.role === 'SUPERADMIN' || 
                            activeProfile.email?.includes('superadmin');
        if (isSuperUser) {
          activeProfile.role = 'SUPERADMIN';
          activeProfile.allowed_modules = Object.values(CANONICAL_MODULES);
          
          // Persist to database silently
          supabase
            .from('profiles')
            .update({
              role: 'SUPERADMIN',
              allowed_modules: Object.values(CANONICAL_MODULES),
              status: 'ACTIVE'
            })
            .eq('id', userId)
            .then(() => {});
        }
      }

      // Auto-heal missing profile for authenticated user
      if (!activeProfile) {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          const isSuperUser = authUser.email === 'oberosorio1@gmail.com' || authUser.email?.includes('superadmin');
          const defaultRole = isSuperUser ? 'SUPERADMIN' : 'ADMIN_CLIENTE';
          const defaultModules = Object.values(CANONICAL_MODULES);

          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .upsert({
              id: userId,
              email: authUser.email!,
              display_name: authUser.user_metadata?.display_name || authUser.email?.split('@')[0],
              role: defaultRole,
              status: 'ACTIVE',
              allowed_modules: defaultModules,
              created_at: new Date().toISOString()
            })
            .select()
            .single();

          if (!createError && newProfile) {
            activeProfile = newProfile;
          } else {
            // Temporary in-memory profile if database insert blocked by RLS
            activeProfile = {
              id: userId,
              email: authUser.email!,
              display_name: authUser.user_metadata?.display_name || authUser.email?.split('@')[0],
              role: defaultRole,
              status: 'ACTIVE',
              allowed_modules: defaultModules
            };
          }
        }
      }

      if (!activeProfile) {
        throw new Error('No se pudo encontrar el perfil de usuario.');
      }

      // 2. Fetch Client if associated
      let client: Client | null = null;
      if (activeProfile.client_id) {
        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .select('*')
          .eq('id', activeProfile.client_id)
          .maybeSingle();

        if (!clientError && clientData) {
          client = clientData;
        }
      }

      // 3. Fetch API Usage if associated
      let apiUsage: any | null = null;
      if (activeProfile.client_id) {
        try {
          const { data: usageData, error: usageError } = await supabase
            .from('client_api_usage')
            .select('*')
            .eq('client_id', activeProfile.client_id)
            .maybeSingle();
          
          if (!usageError) {
            apiUsage = usageData;
          }
        } catch (e) {
          console.warn('Error fetching api usage:', e);
        }
      }

      // 4. Fetch License if applicable
      let license: License | null = null;
      if (activeProfile.client_id) {
        const { data: licenseData, error: licenseError } = await supabase
          .from('licenses')
          .select('*')
          .eq('client_id', activeProfile.client_id)
          .eq('status', 'ACTIVA')
          .maybeSingle();

        if (!licenseError && licenseData) {
          license = licenseData;
        }
      }

      // 4. Fetch Permissions
      const { data: permissions } = await supabase
        .from('user_permissions')
        .select('*')
        .eq('user_id', userId);

      const mappedPermissions: UserPermission[] = (permissions || []).map(p => ({
        id: p.id,
        userId: p.user_id,
        moduleCode: normalizeModuleCode(p.module_code),
        functionCode: p.function_code,
        actions: p.actions as Permission[]
      }));

      // Normalize raw profile modules
      let rawModules: string[] = activeProfile.allowed_modules || [];
      if (activeProfile.role === 'SUPERADMIN') {
        rawModules = Object.values(CANONICAL_MODULES);
      } else if (rawModules.length === 0 && activeProfile.role === 'ADMIN_CLIENTE') {
        rawModules = (client as any)?.allowed_modules || ['ADMINISTRATIVE', 'TERRITORY', 'STRATEGY', 'CRM'];
      }

      const normalizedModules = rawModules.map(m => normalizeModuleCode(m));

      const finalUser: User = {
        id: activeProfile.id,
        email: activeProfile.email,
        displayName: activeProfile.display_name || activeProfile.email.split('@')[0],
        role: activeProfile.role as UserRole,
        status: activeProfile.status || 'ACTIVE',
        tenantId: activeProfile.client_id,
        allowedModules: normalizedModules
      };

      const result: FetchedUserData = {
        user: finalUser,
        client,
        apiUsage,
        license,
        permissions: mappedPermissions,
        allowedModules: normalizedModules
      };

      setState(prev => ({
        ...prev,
        user: finalUser,
        client,
        apiUsage,
        license,
        permissions: mappedPermissions,
        loading: false,
        error: null,
        isDatabaseConfigured: true
      }));

      return result;
    } catch (err: any) {
      console.error('Error fetching user data:', err);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: err.message 
      }));
      return null;
    }
  };

  const login = async (
    email: string, 
    password: string, 
    options?: { requiredRole?: UserRole; requiredModule?: string }
  ): Promise<ModuleAuthorizationResult> => {
    if (!supabase) {
      throw new Error('Supabase no está configurado. Por favor, revisa las variables de entorno.');
    }
    setState(prev => ({ ...prev, loading: true, error: null }));

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setState(prev => ({ ...prev, loading: false, error: error.message }));
      throw error;
    }

    try {
      // 1. Fetch fresh authoritative user data
      const userData = await fetchUserData(data.user.id);
      if (!userData) {
        throw new Error('No se pudo recuperar la información de perfil.');
      }

      // 2. Validate role if required (e.g. SuperAdmin dashboard)
      if (options?.requiredRole && userData.user.role !== options.requiredRole) {
        await supabase.auth.signOut();
        const errorMsg = 'No autorizado. Se requiere nivel de acceso superior.';
        setState(prev => ({ ...prev, user: null, loading: false, error: errorMsg }));
        throw new Error(errorMsg);
      }

      // 3. Centralized Module Access Evaluation
      const authResult = evaluateModuleAccess(
        userData.user,
        userData.client,
        userData.license,
        options?.requiredModule || 'ADMINISTRATIVE'
      );

      if (!authResult.authorized) {
        // If a specific module was strictly requested and user lacks authorization:
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: authResult.reason || 'Tu cuenta no tiene habilitado este módulo.' 
        }));
        return authResult;
      }

      setState(prev => ({
        ...prev,
        user: userData.user,
        client: userData.client,
        license: userData.license,
        permissions: userData.permissions,
        loading: false,
        error: null
      }));

      return authResult;
    } catch (err: any) {
      setState(prev => ({ ...prev, loading: false, error: err.message }));
      throw err;
    }
  };

  const logout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
  };

  const checkModuleAccess = (moduleCode: string): boolean => {
    if (!state.user) return false;
    if (state.user.role === UserRole.SUPERADMIN || state.user.email === 'oberosorio1@gmail.com') return true;
    const authResult = evaluateModuleAccess(state.user, state.client, state.license, moduleCode);
    return authResult.authorized;
  };

  const checkPermission = (moduleCode: string, functionCode: string, action: Permission): boolean => {
    if (!state.user) return false;

    // SuperAdmin has all permissions
    if (state.user.role === UserRole.SUPERADMIN || state.user.email === 'oberosorio1@gmail.com') return true;

    const normalizedMod = normalizeModuleCode(moduleCode);

    // Client Admins have full access within their authorized modules
    if (state.user.role === UserRole.ADMIN_CLIENTE) {
      return checkModuleAccess(normalizedMod);
    }

    // Sub-users check specific granular permissions
    const perm = state.permissions.find(
      p => normalizeModuleCode(p.moduleCode) === normalizedMod && p.functionCode === functionCode
    );
    if (!perm) return false;

    return perm.actions.includes(action) || (perm.actions as string[]).includes('MANAGE');
  };

  const refreshUserData = async () => {
    if (!supabase) return null;
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.id) {
      return await fetchUserData(session.user.id);
    }
    return null;
  };

  return (
    <AuthContext.Provider value={{ 
      ...state, 
      login, 
      logout, 
      checkModuleAccess, 
      checkPermission,
      refreshUserData
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
