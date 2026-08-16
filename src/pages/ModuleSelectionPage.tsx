import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '@/src/contexts/AuthContext';
import { 
  ShieldCheck, 
  MapIcon, 
  Target, 
  ArrowRight,
  Hexagon,
  AlertCircle
} from 'lucide-react';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';

export default function ModuleSelectionPage() {
  const navigate = useNavigate();
  const { isDatabaseConfigured, isSystemReady, user, loading } = useAuth();

  if (!isSystemReady || loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isDatabaseConfigured) {
    // Only SuperAdmin should see the technical details/setup option
    const isSuperAdmin = user?.role === 'SUPERADMIN';

    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-3xl p-8 text-center space-y-6">
          <div className="inline-flex p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20">
            <AlertCircle className="w-8 h-8 text-amber-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">
              {isSuperAdmin ? 'Configuración Requerida' : 'Servicio no disponible'}
            </h2>
            <p className="text-slate-400 text-sm">
              {isSuperAdmin 
                ? 'El esquema de la base de datos no está completo. Por favor, revisa la configuración del sistema.' 
                : 'Estamos experimentando dificultades técnicas. Por favor, intenta ingresar más tarde o contacta al administrador.'}
            </p>
          </div>
          <div className="flex flex-col gap-3">
            {isSuperAdmin && (
              <Button 
                onClick={() => navigate('/admin/system/database')}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all"
              >
                Ir a Configuración
              </Button>
            )}
            <Button 
              variant="ghost"
              onClick={() => navigate('/')}
              className="w-full py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all"
            >
              Volver al Inicio
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const modules = [
    {
      id: 'ADMINISTRATIVE',
      title: 'GESTIÓN ADMINISTRATIVA',
      description: 'Control de recursos, presupuesto CNE y contabilidad electoral.',
      icon: ShieldCheck,
      color: 'indigo',
      path: '/login?module=ADMINISTRATIVE'
    },
    {
      id: 'STRATEGY',
      title: 'GESTIÓN ESTRATÉGICA',
      description: 'Planeación de campaña, análisis FODA y metas electorales.',
      icon: Target,
      color: 'purple',
      path: '/login?module=STRATEGY'
    },
    {
      id: 'TERRITORY',
      title: 'GESTIÓN TERRITORIAL',
      description: 'Control geográfico, georreferenciación y censo en tiempo real.',
      icon: MapIcon,
      color: 'emerald',
      path: '/login?module=TERRITORY'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl relative z-10"
      >
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
              <Hexagon className="w-8 h-8 text-indigo-500" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">INICIAR SESIÓN</h1>
          <p className="text-slate-400 text-lg">¿A qué módulo desea ingresar?</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {modules.map((mod, i) => (
            <motion.div
              key={mod.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card 
                className="group h-full flex flex-col hover:border-white/20 transition-all cursor-pointer bg-white/5 border-white/10"
                onClick={() => navigate(mod.path)}
              >
                <div className="p-6 space-y-4 flex flex-col h-full">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                    mod.color === 'indigo' ? 'bg-indigo-500/10 text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white' :
                    mod.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white' :
                    'bg-purple-500/10 text-purple-500 group-hover:bg-purple-500 group-hover:text-white'
                  }`}>
                    <mod.icon className="w-6 h-6" />
                  </div>
                  
                  <div className="space-y-2 flex-1">
                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
                      {mod.title}
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      {mod.description}
                    </p>
                  </div>

                  <div className="pt-4 flex items-center gap-2 text-indigo-400 font-bold text-sm">
                    Ingresar <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button 
            variant="ghost" 
            className="text-slate-500 hover:text-white"
            onClick={() => navigate('/')}
          >
            Volver a la página principal
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
