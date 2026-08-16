import React from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Globe, 
  ShieldCheck, 
  Package, 
  Settings, 
  Database, 
  LogOut,
  ChevronRight,
  Menu,
  Activity,
  CreditCard,
  Layers,
  FileText,
  X
} from 'lucide-react';
import { useAuth } from '@/src/contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

export const AdminLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Clientes', path: '/admin/clients', icon: Globe },
    { name: 'Usuarios Globales', path: '/admin/users', icon: Users },
    { name: 'Planes y Licencias', path: '/admin/plans', icon: CreditCard },
    { name: 'Módulos y Funciones', path: '/admin/modules', icon: Layers },
    { name: 'Roles y Permisos', path: '/admin/rbac', icon: ShieldCheck },
    { name: 'Auditoría', path: '/admin/audit', icon: FileText },
    { name: 'Sistema y DB', path: '/admin/system', icon: Database },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex overflow-hidden">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Admin Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen w-72 bg-[#111114] border-r border-white/5 flex flex-col shrink-0 z-50 transition-transform duration-300
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight uppercase">SUPERADMIN</h2>
              <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Global Panel</p>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-500 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 py-8 space-y-1 custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link 
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all group ${
                  isActive 
                  ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' 
                  : 'text-slate-500 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : 'group-hover:text-white'}`} />
                <span className="text-sm font-bold">{item.name}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-rose-500 hover:bg-rose-500/10 transition-all font-bold text-sm"
          >
            <LogOut className="w-5 h-5" /> Cerrar Sesión Privada
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        {/* Top Header */}
        <header className="h-20 bg-[#111114]/50 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 md:px-8 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-white transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-4 text-slate-500 text-sm overflow-hidden">
              <span className="uppercase tracking-widest font-bold text-[10px] hidden sm:block whitespace-nowrap">Infgeneral-Software</span>
              <span className="w-1 h-1 bg-slate-800 rounded-full hidden sm:block" />
              <span className="text-white font-medium truncate">{user?.displayName || 'SuperAdmin'}</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Servidor Online</span>
            </div>
          </div>
        </header>

        {/* Content Section */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
};
