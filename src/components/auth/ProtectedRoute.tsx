import React from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/src/contexts/AuthContext';
import { UserRole } from '@/src/types';
import { Shield, ArrowLeft } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { normalizeModuleCode, getModuleDisplayName } from '@/src/lib/moduleAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requiredModule?: string;
}

export function ProtectedRoute({ children, allowedRoles, requiredModule }: ProtectedRouteProps) {
  const { user, loading, checkModuleAccess } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 font-medium text-sm">Verificando sesión y permisos...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (location.pathname.startsWith('/admin')) {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    const moduleParam = requiredModule ? `?module=${normalizeModuleCode(requiredModule)}` : '';
    return <Navigate to={`/login${moduleParam}`} state={{ from: location }} replace />;
  }

  // Role validation
  if (allowedRoles) {
    const isRoleAllowed = allowedRoles.some(
      role => role === user.role || role.toUpperCase() === user.role?.toUpperCase()
    );

    if (!isRoleAllowed) {
      if (location.pathname.startsWith('/admin')) {
        return (
          <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center">
            <div className="max-w-md w-full space-y-6 bg-slate-900/90 border border-rose-500/20 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
              <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto border border-rose-500/20 shadow-lg shadow-rose-500/10">
                <Shield className="w-8 h-8 text-rose-400" />
              </div>
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-bold border border-rose-500/20">
                  403 | Acceso Denegado
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Acceso no autorizado</h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Esta sección es de uso exclusivo para SuperAdministradores del sistema. Su usuario actual no cuenta con los privilegios necesarios.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-white/5 text-left text-xs space-y-1.5 text-slate-300">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Usuario:</span>
                  <span className="font-mono text-white">{user.email}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Rol asignado:</span>
                  <span className="font-semibold text-amber-400">{user.role}</span>
                </div>
              </div>
              <Button onClick={() => navigate('/gestion-administrativa/inicio')} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 transition-all">
                Volver a la pantalla principal
              </Button>
            </div>
          </div>
        );
      }
      return <Navigate to="/select-module" replace />;
    }
  }

  // Canonical Module validation
  if (requiredModule && !checkModuleAccess(requiredModule)) {
    const canonical = normalizeModuleCode(requiredModule);
    const moduleName = getModuleDisplayName(canonical);

    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6">
          <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto border border-rose-500/20">
            <Shield className="w-8 h-8 text-rose-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Módulo No Autorizado</h2>
            <p className="text-slate-400 text-sm">
              Tu usuario o suscripción actual no incluye acceso al módulo <strong className="text-white">{moduleName}</strong>.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-3">
            <Button onClick={() => navigate('/select-module')} className="w-full bg-indigo-600 hover:bg-indigo-500">
              Seleccionar Otro Módulo
            </Button>
            <Button variant="ghost" onClick={() => navigate('/')} className="text-slate-400 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" /> Volver al Inicio
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
