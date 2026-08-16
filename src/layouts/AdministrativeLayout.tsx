import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ShieldAlert, ArrowLeft, Home, Lock } from 'lucide-react';
import { AdministrativeSidebar } from '@/src/components/administrative/AdministrativeSidebar';
import { AdministrativeHeader } from '@/src/components/administrative/AdministrativeHeader';
import { administrativeNavSections, AdminNavItem } from '@/src/config/administrativeNavigation';
import { useAuth } from '@/src/contexts/AuthContext';
import { usePermissions } from '@/src/hooks/usePermissions';
import { UserRole } from '@/src/types';

export default function AdministrativeLayout() {
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const location = useLocation();
  const navigate = useNavigate();

  // Desktop Collapsed State with LocalStorage Persistence
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('admin_sidebar_collapsed');
      return stored !== null ? JSON.parse(stored) : false;
    } catch {
      return false;
    }
  });

  // Mobile Drawer Open State
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleToggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('admin_sidebar_collapsed', JSON.stringify(next));
      } catch (e) {
        console.error('Error saving sidebar state:', e);
      }
      return next;
    });
  };

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  // Determine current page item from navigation config
  let matchedItem: AdminNavItem | undefined;
  for (const section of administrativeNavSections) {
    const found = section.items.find(item => 
      location.pathname === item.path || 
      (item.path !== '/gestion-administrativa/inicio' && location.pathname.startsWith(item.path))
    );
    if (found) {
      matchedItem = found;
      break;
    }
  }

  const currentPageTitle = matchedItem?.label || 'Gestión Administrativa';
  const currentPageSubtitle = matchedItem?.description || 'Panel de control institucional y electoral';

  // SECURITY GUARD: Check real-time authorization for current administrative route
  let isAuthorized = true;
  let unauthorizedReason = '';

  if (matchedItem && user) {
    // SuperAdmin, Client Admin, and primary account have complete access to administrative functions
    if (user.role === UserRole.SUPERADMIN || user.role === UserRole.ADMIN_CLIENTE || user.email === 'oberosorio1@gmail.com') {
      isAuthorized = true;
    } else if (matchedItem.functionCode === 'POLLING_PLACE_LOOKUP' || location.pathname.includes('consulta-lugar-votacion')) {
      // Transversal special function: ALWAYS authorized for all authenticated users
      isAuthorized = true;
    } else if (matchedItem.roles && !matchedItem.roles.includes(user.role)) {
      isAuthorized = false;
      unauthorizedReason = `El rol ${user.role} no tiene acceso asignado a la sección ${matchedItem.label}.`;
    } else if (!hasPermission('ADMINISTRATIVE', matchedItem.functionCode, 'VIEW')) {
      isAuthorized = false;
      unauthorizedReason = `No cuenta con privilegios de lectura para la función (${matchedItem.functionCode}) en su perfil actual.`;
    }
  }

  return (
    <div className="min-h-screen bg-[#030d16] flex overflow-hidden text-slate-100 font-sans">
      {/* Mobile Drawer Overlay Backdrop */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Redesigned Lateral Collapsible Sidebar */}
      <AdministrativeSidebar 
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />
      
      {/* Main Content Area (Smoothly resizes alongside sidebar) */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden transition-all duration-300 ease-in-out">
        <AdministrativeHeader 
          onMenuClick={() => setIsMobileOpen(true)}
          title={currentPageTitle}
          subtitle={currentPageSubtitle}
        />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-6">
            {isAuthorized ? (
              <Outlet />
            ) : (
              /* Security Access Denied Screen (Blocks unauthorized manual URL navigation) */
              <div className="py-16 px-6 max-w-xl mx-auto text-center rounded-3xl bg-slate-900/80 border border-rose-500/20 shadow-2xl backdrop-blur-xl space-y-5 animate-in fade-in zoom-in-95 duration-300">
                <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-400 shadow-lg shadow-rose-500/10">
                  <ShieldAlert className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-bold border border-rose-500/20">
                    <Lock className="w-3.5 h-3.5" /> Acceso Denegado (403)
                  </div>
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    Permisos Insuficientes
                  </h2>
                  <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                    {unauthorizedReason || `Su usuario no cuenta con la autorización requerida para acceder al módulo de "${matchedItem?.label}".`}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 text-left text-xs space-y-1 text-slate-300">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Usuario autenticado:</span>
                    <span className="font-mono text-white">{user?.email}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Rol del sistema:</span>
                    <span className="font-semibold text-indigo-400">{user?.role}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Función restringida:</span>
                    <span className="font-mono text-rose-400">{matchedItem?.functionCode}</span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => navigate('/gestion-administrativa/inicio')}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
                  >
                    <Home className="w-4 h-4" />
                    Ir al Inicio Administrativo
                  </button>
                  <button
                    onClick={() => navigate(-1)}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Regresar
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
