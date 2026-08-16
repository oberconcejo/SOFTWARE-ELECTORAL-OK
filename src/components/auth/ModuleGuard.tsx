import React from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/src/contexts/AuthContext';
import { normalizeModuleCode, getModuleDisplayName } from '@/src/lib/moduleAuth';
import { Shield } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';

interface ModuleGuardProps {
  children: React.ReactNode;
  moduleCode: string;
}

export const ModuleGuard: React.FC<ModuleGuardProps> = ({ children, moduleCode }) => {
  const { user, loading, checkModuleAccess } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    const canonical = normalizeModuleCode(moduleCode);
    return <Navigate to={`/login?module=${canonical}`} state={{ from: location }} replace />;
  }

  const hasAccess = checkModuleAccess(moduleCode);

  if (!hasAccess) {
    const canonical = normalizeModuleCode(moduleCode);
    const moduleName = getModuleDisplayName(canonical);

    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-3xl p-8 text-center space-y-6">
          <div className="inline-flex p-3 bg-red-500/10 rounded-2xl border border-red-500/20">
            <Shield className="w-8 h-8 text-red-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">Acceso Denegado</h2>
            <p className="text-slate-400 text-sm">
              No tienes permisos asignados para acceder a <span className="text-white font-semibold">{moduleName}</span>.
            </p>
          </div>
          <Button 
            onClick={() => navigate('/select-module')}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all"
          >
            Volver a Selección de Módulos
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
