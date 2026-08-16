import { Bell, Search, User, Menu } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { useAuth } from '@/src/contexts/AuthContext';

interface DashboardHeaderProps {
  onMenuClick?: () => void;
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const { user } = useAuth();
  
  return (
    <header className="h-16 sticky top-0 bg-slate-950/80 backdrop-blur-md border-b border-white/5 px-4 md:px-6 flex items-center justify-between z-20">
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={onMenuClick}
          className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors lg:hidden"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="relative w-full max-w-md hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar en el software..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-slate-950" />
        </button>
        
        <div className="h-8 w-[1px] bg-white/5 mx-1 md:mx-2" />

        <div className="flex items-center gap-2 md:gap-3 pl-1 md:pl-2 group cursor-pointer">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-white group-hover:text-indigo-400 transition-colors">
              {user?.displayName || 'Usuario'}
            </p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
              {user?.role?.replace('_', ' ') || 'Sin Rol'}
            </p>
          </div>
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/10 uppercase text-sm md:text-base">
            {user?.displayName?.charAt(0) || 'U'}
          </div>
        </div>
      </div>
    </header>
  );
}
