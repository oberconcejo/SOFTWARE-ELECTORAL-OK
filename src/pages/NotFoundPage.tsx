import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { AlertCircle, Home, LogIn, ArrowLeft } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex flex-col items-center justify-center p-6 text-center select-none relative overflow-hidden">
      {/* Glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 blur-[140px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full bg-white/[0.03] border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl space-y-6 relative z-10"
      >
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-400 shadow-lg shadow-rose-500/10">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-bold border border-rose-500/20">
            Error 404: Página no encontrada
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Página No Encontrada
          </h1>
          <p className="text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
            La ruta o recurso al que intenta acceder no existe, ha sido movido o no está disponible temporalmente.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            onClick={() => navigate('/')}
            className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 rounded-xl shadow-lg shadow-indigo-600/30"
          >
            <Home className="w-4 h-4" />
            Ir al Inicio
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 rounded-xl border border-white/5"
          >
            <ArrowLeft className="w-4 h-4" />
            Regresar
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
