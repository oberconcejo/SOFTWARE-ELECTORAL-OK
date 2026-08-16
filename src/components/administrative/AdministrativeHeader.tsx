import React from 'react';
import { Menu, Sparkles, RefreshCw } from 'lucide-react';
import { useAuth } from '@/src/contexts/AuthContext';
import { UserRole } from '@/src/types';

interface AdministrativeHeaderProps {
  onMenuClick: () => void;
  title?: string;
  subtitle?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function AdministrativeHeader({
  onMenuClick,
  title = 'Gestión Administrativa',
  subtitle = 'Panel de control institucional y electoral',
  onRefresh,
  isRefreshing = false
}: AdministrativeHeaderProps) {
  const { user } = useAuth();

  return (
    <header className="h-16 border-b border-cyan-900/30 bg-[#04101b]/90 backdrop-blur-md sticky top-0 z-30 px-4 md:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-400 hover:text-cyan-400 rounded-xl hover:bg-white/5 transition-colors"
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base md:text-lg font-bold text-white tracking-tight">{title}</h1>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-teal-950/80 text-teal-400 border border-teal-500/30">
              <Sparkles className="w-3 h-3" /> CNE 2026
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Sincronizar datos con Supabase"
            className="p-2 text-slate-400 hover:text-cyan-400 rounded-xl hover:bg-white/5 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        )}

        <div className="h-4 w-px bg-cyan-900/40 mx-1 hidden sm:block" />

        {/* User Identity Pill */}
        <div className="flex items-center gap-2.5 pl-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-600 to-cyan-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-teal-500/20 shadow-md">
            {user?.displayName ? user.displayName.substring(0, 2).toUpperCase() : (user?.email?.substring(0, 2).toUpperCase() || 'AD')}
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-medium text-slate-200 truncate max-w-[140px]">
              {user?.displayName || user?.email}
            </span>
            <span className="text-[10px] text-teal-400 font-semibold uppercase">
              {user?.role === UserRole.SUPERADMIN ? 'SuperAdmin' : (user?.role || 'Administrador')}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
