import { useAuth } from '@/src/contexts/AuthContext';
import { ROLE_PERMISSIONS } from '@/src/lib/permissions';
import { Permission, ModuleName } from '@/src/types';

export function useRBAC() {
  const { user } = useAuth();

  /**
   * Checks if the current user has a specific permission in a specific module.
   */
  const hasPermission = (module: ModuleName, permission: Permission): boolean => {
    if (!user) return false;
    
    const permissions = ROLE_PERMISSIONS[user.role]?.[module];
    if (!permissions) return false;
    
    return permissions.includes(permission);
  };

  /**
   * Checks if the current user has ANY of the specified permissions in a module.
   */
  const hasAnyPermission = (module: ModuleName, permissions: Permission[]): boolean => {
    return permissions.some(p => hasPermission(module, p));
  };

  /**
   * Checks if the current user has ALL of the specified permissions in a module.
   */
  const hasAllPermissions = (module: ModuleName, permissions: Permission[]): boolean => {
    return permissions.every(p => hasPermission(module, p));
  };

  /**
   * Shorthand for common permission checks
   */
  const can = {
    view: (module: ModuleName) => hasPermission(module, 'VIEW'),
    create: (module: ModuleName) => hasPermission(module, 'CREATE'),
    edit: (module: ModuleName) => hasPermission(module, 'EDIT'),
    delete: (module: ModuleName) => hasPermission(module, 'DELETE'),
    manage: (module: ModuleName) => hasPermission(module, 'MANAGE'),
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    can,
    role: user?.role,
    isAdmin: user?.role === 'SUPERADMIN' || user?.role === 'ADMIN_CLIENTE',
  };
}
