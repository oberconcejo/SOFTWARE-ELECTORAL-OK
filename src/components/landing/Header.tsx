import { motion } from 'motion/react';
import { Button } from '@/src/components/ui/Button';
import { useNavigate } from 'react-router-dom';

export function LandingHeader() {
  const navigate = useNavigate();

  const navItems = [
    { label: 'Inicio', href: '#' },
    { label: 'Características', href: '#features' },
    { label: 'Módulos', href: '#modules' },
    { label: 'Planes', href: '#plans' },
    { label: 'Contacto', href: '#contact' },
  ];

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-lg border-b border-white/5"
    >
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <span className="text-white font-bold text-xl">S</span>
        </div>
        <span className="text-white font-bold text-lg tracking-tight hidden sm:block">
          SOFTWARE <span className="text-indigo-400">ELECTORAL</span>
        </span>
      </div>

      <nav className="hidden md:flex items-center gap-8">
        {navItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="text-slate-400 hover:text-white text-sm font-medium transition-colors"
          >
            {item.label}
          </a>
        ))}
      </nav>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/login')} className="hidden sm:inline-flex">
          Iniciar Sesión
        </Button>
        <Button variant="primary" size="sm" onClick={() => navigate('/login')}>
          Demo Gratis
        </Button>
      </div>
    </motion.header>
  );
}
