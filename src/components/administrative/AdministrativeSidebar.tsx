import React from 'react';
import { 
  LogOut, 
  ChevronLeft, 
  Layers, 
  PanelLeftClose,
  PanelLeftOpen,
  Lock,
  Vote
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/src/lib/utils';
import { useAuth } from '@/src/contexts/AuthContext';
import { usePermissions } from '@/src/hooks/usePermissions';
import { administrativeNavSections } from '@/src/config/administrativeNavigation';
import { UserRole } from '@/src/types';

interface AdministrativeSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export function AdministrativeSidebar({ 
  isCollapsed, 
  onToggleCollapse, 
  isMobileOpen, 
  onCloseMobile 
}: AdministrativeSidebarProps) {
  const { user, logout } = useAuth();
  const { hasPermission } = usePermissions();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    if (isMobileOpen) {
      onCloseMobile();
    }
  };

  // Filter sections and items based on permissions
  const filteredSections = administrativeNavSections.map(section => {
    const visibleItems = section.items.filter(item => {
      // SuperAdmin and primary account have full access
      if (user?.role === UserRole.SUPERADMIN || user?.email === 'oberosorio1@gmail.com') return true;
      // Client Admin has full access to all administrative functions
      if (user?.role === UserRole.ADMIN_CLIENTE) return true;
      // Transversal special function: ALWAYS visible for all users regardless of permission matrix
      if (item.id === 'admin-consulta-lugar-votacion' || item.functionCode === 'POLLING_PLACE_LOOKUP') return true;
      // Role-specific check if item specifies allowed roles
      if (item.roles && user && !item.roles.includes(user.role)) return false;
      // Check granular function permission
      return hasPermission('ADMINISTRATIVE', item.functionCode, 'VIEW');
    });

    return {
      ...section,
      items: visibleItems
    };
  }).filter(section => section.items.length > 0);

  const getRoleDisplayText = () => {
    if (!user) return 'Invitado';
    if (user.role === UserRole.SUPERADMIN) return 'Acceso Total (Root)';
    if (user.role === UserRole.ADMIN_CLIENTE) return 'Administrador de Campaña';
    return user.role.replace(/_/g, ' ');
  };

  return (
    <>
      <aside
        id="admin-lateral-menu"
        className={cn(
          "h-screen fixed lg:sticky top-0 z-40 bg-[#04101b]/95 backdrop-blur-xl border-r border-cyan-900/30 flex flex-col transition-all duration-300 ease-in-out select-none shadow-2xl",
          // Mobile responsive drawer positioning
          isMobileOpen 
            ? "translate-x-0 w-72 max-w-[85vw]" 
            : "-translate-x-full lg:translate-x-0",
          // Desktop collapsible width: <= 10% when closed (~72px), ~285px when open
          isCollapsed 
            ? "lg:w-[72px] lg:max-w-[10vw]" 
            : "lg:w-[285px]"
        )}
      >
        {/* Brand Header */}
        <div className="p-3.5 border-b border-cyan-900/30 flex items-center justify-between min-h-[64px]">
          {(!isCollapsed || isMobileOpen) ? (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-teal-950/90 border border-teal-500/40 flex items-center justify-center text-teal-400 shadow-md shadow-teal-950/60 flex-shrink-0">
                <Vote className="w-5 h-5" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-sm text-white leading-tight tracking-tight flex items-center gap-1.5 truncate">
                  Campaña Ganadora IA
                </span>
                <span className="text-[11px] text-cyan-400 font-semibold tracking-wide flex items-center gap-1 truncate">
                  Panel de Control
                </span>
              </div>
            </div>
          ) : (
            <div 
              onClick={onToggleCollapse}
              className="w-10 h-10 rounded-xl bg-teal-950/90 border border-teal-500/40 flex items-center justify-center text-teal-400 mx-auto shadow-md shadow-teal-950/60 cursor-pointer"
              title="Expandir menú"
            >
              <Vote className="w-5 h-5" />
            </div>
          )}

          {/* Desktop Toggle Button in Header */}
          <div className="flex items-center gap-1">
            <button
              onClick={onToggleCollapse}
              title={isCollapsed ? "Expandir menú lateral" : "Colapsar menú lateral"}
              className="hidden lg:flex p-1.5 text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-white/5 transition-colors"
            >
              {isCollapsed ? (
                <PanelLeftOpen className="w-4 h-4 text-cyan-400" />
              ) : (
                <PanelLeftClose className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {/* Mobile Close Button */}
            <button 
              onClick={onCloseMobile} 
              className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 px-2.5 py-4 space-y-6 overflow-y-auto custom-scrollbar overflow-x-hidden">
          {filteredSections.map((section, sIndex) => (
            <div key={sIndex} className="space-y-1.5">
              {/* Section Title */}
              {(!isCollapsed || isMobileOpen) ? (
                <div className="px-2.5 pb-1 text-[11px] font-bold tracking-wider text-cyan-400 uppercase flex items-center justify-between">
                  <span>{section.sectionTitle}</span>
                </div>
              ) : (
                <div className="h-px bg-cyan-900/30 my-2 mx-1" />
              )}
              
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = location.pathname === item.path || 
                    (item.path !== '/gestion-administrativa/inicio' && location.pathname.startsWith(item.path));

                  const Icon = item.icon;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavigate(item.path)}
                      title={isCollapsed && !isMobileOpen ? item.label : undefined}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group relative',
                        isActive 
                          ? 'bg-gradient-to-r from-teal-700 to-emerald-700 text-white shadow-lg shadow-teal-950/60 border border-teal-500/30' 
                          : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
                      )}
                    >
                      {/* Icon */}
                      <Icon className={cn(
                        'w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110',
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-cyan-400'
                      )} />
                      
                      {/* Label (Visible when expanded or on mobile) */}
                      {(!isCollapsed || isMobileOpen) && (
                        <span className="truncate flex-1 text-left font-medium">
                          {item.label}
                        </span>
                      )}

                      {/* Collapsed Tooltip Hover on Desktop */}
                      {isCollapsed && !isMobileOpen && (
                        <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#051824] border border-cyan-900/50 text-white text-xs rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap z-50 flex items-center gap-2">
                          <span className="font-semibold">{item.label}</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Role Access Card & Module Switcher Footer */}
        <div className="p-3 border-t border-cyan-900/30 space-y-2 bg-[#030e17]/95">
          {/* Acceso por Rol Box */}
          {(!isCollapsed || isMobileOpen) ? (
            <div className="p-2.5 rounded-2xl bg-[#051824] border border-cyan-900/40 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-950/80 border border-teal-500/30 flex items-center justify-center text-teal-400 flex-shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">
                  Acceso por Rol
                </p>
                <p className="text-[11px] font-semibold text-teal-400 truncate">
                  {getRoleDisplayText()}
                </p>
              </div>
            </div>
          ) : (
            <div 
              className="w-10 h-10 rounded-xl bg-teal-950/80 border border-teal-500/30 flex items-center justify-center text-teal-400 mx-auto group relative cursor-pointer"
              title={`Acceso por Rol: ${getRoleDisplayText()}`}
            >
              <Lock className="w-4 h-4" />
              <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#051824] border border-cyan-900/50 text-white text-xs rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap z-50">
                <p className="font-bold">Acceso por Rol</p>
                <p className="text-teal-400 text-[11px]">{getRoleDisplayText()}</p>
              </div>
            </div>
          )}

          {/* Module Switcher & Logout */}
          <div className="flex items-center gap-1 pt-1">
            <button
              onClick={() => handleNavigate('/select-module')}
              className="flex-1 flex items-center justify-center gap-2 px-2.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-cyan-300 hover:bg-cyan-950/30 border border-transparent hover:border-cyan-800/30 transition-all group relative"
              title={isCollapsed && !isMobileOpen ? 'Cambiar de Módulo' : undefined}
            >
              <Layers className="w-4 h-4 text-cyan-400 flex-shrink-0 group-hover:rotate-12 transition-transform" />
              {(!isCollapsed || isMobileOpen) && <span className="truncate text-[11px]">Módulos</span>}
            </button>

            <button
              onClick={handleLogout}
              className="flex-1 flex items-center justify-center gap-2 px-2.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 border border-transparent hover:border-rose-800/30 transition-all group relative"
              title={isCollapsed && !isMobileOpen ? 'Cerrar Sesión' : undefined}
            >
              <LogOut className="w-4 h-4 text-rose-400 flex-shrink-0 group-hover:-translate-x-0.5 transition-transform" />
              {(!isCollapsed || isMobileOpen) && <span className="text-[11px]">Salir</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
