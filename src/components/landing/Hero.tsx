import { motion } from 'motion/react';
import { Button } from '@/src/components/ui/Button';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export function LandingHero() {
  return (
    <section className="relative pt-32 pb-20 px-6 overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 blur-[120px] rounded-full animate-pulse" />
      </div>

      <div className="max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-sm font-medium mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
          Nueva versión disponible
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-8"
        >
          Controla cada detalle de tu <br />
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
            Campaña con Inteligencia
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-slate-400 text-lg md:text-xl max-w-3xl mx-auto mb-10 leading-relaxed"
        >
          La plataforma todo-en-uno diseñada para gestionar proyectos, equipos, tareas y estrategia electoral. Aumenta tu eficiencia y toma decisiones basadas en datos reales.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button size="lg" className="w-full sm:w-auto gap-2">
            Solicitar Demo <ArrowRight className="w-5 h-5" />
          </Button>
          <Button variant="outline" size="lg" className="w-full sm:w-auto">
            Ver Funcionalidades
          </Button>
        </motion.div>

        {/* Dashboard Mockup Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-20 relative"
        >
          <div className="relative rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-sm p-4 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10 rounded-2xl" />
            <img
              src="https://images.unsplash.com/photo-1551288049-bbbda536639a?auto=format&fit=crop&q=80&w=2000"
              alt="Dashboard Preview"
              className="rounded-xl w-full h-auto shadow-2xl"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
