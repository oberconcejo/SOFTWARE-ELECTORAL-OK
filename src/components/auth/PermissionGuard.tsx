import React from 'react';
import { usePermissions } from '@/src/hooks/usePermissions';
import { Permission } from '@/src/types';

interface PermissionGuardProps {
  moduleCode: string;
  functionCode: string;
  action?: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Declarative component to protect UI elements based on RBAC
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({ 
  moduleCode, 
  functionCode, 
  action = 'VIEW' as Permission, 
  children, 
  fallback = null 
}) => {
  const { hasPermission } = usePermissions();

  if (hasPermission(moduleCode, functionCode, action)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};

interface ModuleGuardProps {
  moduleCode: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ModuleGuard: React.FC<ModuleGuardProps> = ({ 
  moduleCode, 
  children, 
  fallback = null 
}) => {
  const { isModuleAuthorized } = usePermissions();

  if (isModuleAuthorized(moduleCode)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};
