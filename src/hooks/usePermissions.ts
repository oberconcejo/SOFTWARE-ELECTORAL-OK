import { useAuth } from '@/src/contexts/AuthContext';
import { UserRole, Permission } from '@/src/types';
import { normalizeModuleCode } from '@/src/lib/moduleAuth';

export function usePermissions() {
  const { user, permissions, checkModuleAccess } = useAuth();

  /**
   * Check if user has a specific permission for a module and function
   */
  const hasPermission = (moduleCode: string, functionCode: string, action: Permission): boolean => {
    if (!user) return false;
    
    // SuperAdmin and primary account have full unrestricted permissions
    if (user.role === UserRole.SUPERADMIN || user.email === 'oberosorio1@gmail.com') return true;

    const normalizedMod = normalizeModuleCode(moduleCode);

    // Client Admin has full permissions within all authorized modules
    if (user.role === UserRole.ADMIN_CLIENTE) {
      return checkModuleAccess(normalizedMod);
    }

    // Check detailed permissions table
    const permission = permissions.find(
      p => normalizeModuleCode(p.moduleCode) === normalizedMod && p.functionCode === functionCode
    );

    if (!permission) return false;

    return permission.actions.includes(action) || (permission.actions as string[]).includes('MANAGE');
  };

  /**
   * Check if user is authorized for an entire module
   */
  const isModuleAuthorized = (moduleCode: string): boolean => {
    return checkModuleAccess(moduleCode);
  };

  /**
   * Check if user has any of the provided roles
   */
  const hasRole = (roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return {
    hasPermission,
    isModuleAuthorized,
    hasRole,
    user,
    role: user?.role
  };
}
