import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Layers,
  Sparkles,
  MapPin, 
  FileText, 
  User, 
  UploadCloud, 
  ShieldAlert, 
  MessageSquareQuote, 
  Radio, 
  BarChart3, 
  Calendar,
  Users, 
  BookmarkCheck, 
  PieChart, 
  CheckSquare,
  ShieldCheck,
  Target,
  Map as MapIcon
} from 'lucide-react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { cn } from '@/src/lib/utils';
import { useAuth } from '@/src/contexts/AuthContext';
import { AppLogo } from '@/src/components/common/AppLogo';

interface DashboardSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function DashboardSidebar({ isOpen, onClose }: DashboardSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    if (onClose) onClose();
  };

  // Determine current active module from path
  const isStrategyModule = location.pathname.startsWith('/app/strategy') || location.pathname.startsWith('/gestion-estrategica') || location.pathname.startsWith('/estrategia');
  const isTerritoryModule = location.pathname.startsWith('/app/territory') || location.pathname.startsWith('/gestion-territorial') || location.pathname.startsWith('/territorio');

  // Strategy vertical items
  const strategyItems = [
    { id: 'diagnostic360', label: '1. Diagnóstico 360° AI', icon: Sparkles, tab: 'diagnostic360' },
    { id: 'territorial', label: '2. Diagnóstico Territorial', icon: MapPin, tab: 'territorial' },
    { id: 'govProgram', label: '3. Programa de Gobierno', icon: FileText, tab: 'govProgram' },
    { id: 'candidateProfile', label: '4. Perfil del Candidato', icon: User, tab: 'candidateProfile' },
    { id: 'cvAnalysis', label: '5. Carga & Análisis CV', icon: UploadCloud, tab: 'cvAnalysis' },
    { id: 'swot', label: '6. Matriz DOFA / SWOT AI', icon: ShieldAlert, tab: 'swot' },
    { id: 'narrative', label: '7. Narrativa & Discurso', icon: MessageSquareQuote, tab: 'narrative' },
    { id: 'comms', label: '8. Comunicación & Redes', icon: Radio, tab: 'comms' },
    { id: 'dataAnalysis', label: '9. Análisis de Datos AI', icon: BarChart3, tab: 'dataAnalysis' },
    { id: 'calendar', label: '10. Agenda & Calendario', icon: Calendar, tab: 'calendar' },
  ];

  // Territory vertical items
  const territoryItems = [
    { id: 'voters', label: '1. Registro de Votantes', icon: Users, tab: 'voters' },
    { id: 'witnesses', label: '2. Testigos en Campo', icon: BookmarkCheck, tab: 'witnesses' },
    { id: 'surveys', label: '3. Módulo de Encuestas', icon: PieChart, tab: 'surveys' },
    { id: 'jurors', label: '4. Jurados en Mesa', icon: CheckSquare, tab: 'jurors' },
  ];

  const currentTab = searchParams.get('tab');

  return (
    <>
      <motion.aside
        initial={false}
        animate={{ 
          width: isCollapsed ? 80 : 275,
          x: isOpen ? 0 : (typeof window !== 'undefined' && window.innerWidth < 1024 ? -275 : 0)
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={cn(
          "h-screen fixed lg:sticky top-0 bg-[#090a0f] border-r border-white/5 flex flex-col z-50 transition-transform lg:translate-x-0 select-none shadow-2xl",
          !isOpen && "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Module Header */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between min-h-[68px]">
          {(!isCollapsed || isOpen) ? (
            <div className="flex items-center gap-2.5 min-w-0">
              <AppLogo 
                size="sm" 
                variant={isStrategyModule ? 'purple' : isTerritoryModule ? 'emerald' : 'indigo'} 
                animated={true} 
                floating={true}
                showGlowHalo={true} 
              />
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-xs text-white leading-tight tracking-tight truncate">
                  {isStrategyModule ? 'GESTIÓN ESTRATÉGICA' : isTerritoryModule ? 'GESTIÓN TERRITORIAL' : 'SOFTWARE ELECTORAL'}
                </span>
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-wider",
                  isStrategyModule ? "text-purple-400" : isTerritoryModule ? "text-emerald-400" : "text-indigo-400"
                )}>
                  {isStrategyModule ? '10 Funciones' : isTerritoryModule ? '4 Funciones' : 'Módulo Activo'}
                </span>
              </div>
            </div>
          ) : (
            <div className="mx-auto flex items-center justify-center">
              <AppLogo 
                size="sm" 
                variant={isStrategyModule ? 'purple' : isTerritoryModule ? 'emerald' : 'indigo'} 
                animated={true} 
                floating={true}
                showGlowHalo={true} 
              />
            </div>
          )}

          {isOpen && (
            <button onClick={onClose} className="lg:hidden text-slate-500 hover:text-white p-1">
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Change Module Quick Action */}
        {(!isCollapsed || isOpen) && (
          <div className="px-3 pt-3 pb-1">
            <button
              onClick={() => handleNavigate('/select-module')}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold border border-white/5 transition-all"
            >
              <span className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                Cambiar Módulo
              </span>
              <span className="text-[10px] text-slate-500 font-bold uppercase">Módulos</span>
            </button>
          </div>
        )}

        {/* Vertical Navigation Items */}
        <div className="flex-1 px-3 py-2 space-y-1 overflow-y-auto no-scrollbar">
          {/* Strategy Vertical Items */}
          {isStrategyModule && strategyItems.map((item) => {
            const activeTab = currentTab || 'diagnostic360';
            const isActive = activeTab === item.tab;

            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(`/app/strategy?tab=${item.tab}`)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative text-left',
                  isActive 
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20 font-semibold' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <item.icon className={cn(
                  'w-4 h-4 flex-shrink-0 transition-transform',
                  isActive ? 'text-white' : 'text-slate-400 group-hover:scale-110 group-hover:text-purple-400'
                )} />
                {(!isCollapsed || isOpen) && (
                  <span className="text-xs truncate">{item.label}</span>
                )}
              </button>
            );
          })}

          {/* Territory Vertical Items */}
          {isTerritoryModule && territoryItems.map((item) => {
            const activeTab = currentTab || 'voters';
            const isActive = activeTab === item.tab;

            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(`/app/territory?tab=${item.tab}`)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative text-left',
                  isActive 
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 font-semibold' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <item.icon className={cn(
                  'w-4 h-4 flex-shrink-0 transition-transform',
                  isActive ? 'text-white' : 'text-slate-400 group-hover:scale-110 group-hover:text-emerald-400'
                )} />
                {(!isCollapsed || isOpen) && (
                  <span className="text-xs truncate">{item.label}</span>
                )}
              </button>
            );
          })}

          {/* Fallback for generic / other routes */}
          {!isStrategyModule && !isTerritoryModule && (
            <div className="space-y-1">
              <button
                onClick={() => handleNavigate('/gestion-administrativa/inicio')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 text-xs font-semibold"
              >
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                {(!isCollapsed || isOpen) && <span>Gestión Administrativa</span>}
              </button>
              <button
                onClick={() => handleNavigate('/app/strategy')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 text-xs font-semibold"
              >
                <Target className="w-4 h-4 text-purple-400" />
                {(!isCollapsed || isOpen) && <span>Gestión Estratégica</span>}
              </button>
              <button
                onClick={() => handleNavigate('/app/territory')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 text-xs font-semibold"
              >
                <MapIcon className="w-4 h-4 text-emerald-400" />
                {(!isCollapsed || isOpen) && <span>Gestión Territorial</span>}
              </button>
            </div>
          )}
        </div>

        {/* Footer / User Profile & Logout */}
        <div className="p-3 border-t border-white/5 space-y-1.5">
          {(!isCollapsed || isOpen) && user && (
            <div className="px-3 py-2 rounded-xl bg-white/[0.02] border border-white/5 mb-1.5">
              <p className="text-xs font-bold text-white truncate">{user.name || user.email}</p>
              <p className="text-[10px] text-slate-500 font-medium truncate">{user.email}</p>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all text-xs font-semibold group"
          >
            <LogOut className="w-4 h-4 flex-shrink-0 group-hover:scale-110 transition-transform" />
            {(!isCollapsed || isOpen) && <span>Cerrar Sesión</span>}
          </button>
        </div>

        {/* Collapse toggle button */}
        {!isOpen && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute top-1/2 -right-3 w-6 h-6 bg-slate-900 border border-white/10 rounded-full hidden lg:flex items-center justify-center text-slate-400 hover:text-white shadow-xl transition-colors hover:border-indigo-500/50"
            title={isCollapsed ? "Expandir menú" : "Colapsar menú"}
          >
            {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        )}
      </motion.aside>
    </>
  );
}
