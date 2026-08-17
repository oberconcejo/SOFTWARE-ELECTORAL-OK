import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { AppLogo } from '@/src/components/common/AppLogo';
import { 
  testSupabaseConnection, 
  registerNewClient 
} from '@/src/lib/supabase';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Users,
  MapPin,
  Vote,
  BarChart3,
  CheckCircle2,
  Lock,
  Bot,
  ChevronDown,
  Star,
  Play,
  X,
  Menu,
  Target,
  Send,
  Check,
  Award,
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTabDemo, setActiveTabDemo] = useState<'ai' | 'crm' | 'territory' | 'e14'>('ai');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [notifications, setNotifications] = useState<Array<{ id: string; message: string; type: 'success' | 'info' }>>([]);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // AI Demo State
  const [aiPromptInput, setAiPromptInput] = useState<string>('Estrategia de comunicación para votantes jóvenes indecisos');
  const [aiResponse, setAiResponse] = useState<string>(
    'Análisis Campaña Ganadora AI: Los jóvenes de 18-28 años en el sector urbano priorizan propuestas de empleo tecnológico y transporte sostenible. Se recomienda una campaña de video corto enfocada en 3 compromisos clave.'
  );
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const addNotification = (message: string, type: 'success' | 'info' = 'info') => {
    const id = Date.now().toString();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  };

  const handleSimulateAiPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPromptInput.trim()) return;
    setIsAiGenerating(true);
    setAiResponse('Procesando consulta estratégica con inteligencia artificial...');
    setTimeout(() => {
      setIsAiGenerating(false);
      setAiResponse(
        `Estrategia Generada para: "${aiPromptInput}":\n• Mensaje Fuerza: "Propuestas concretas con impacto medible".\n• Canal Recomendado: Redes sociales + Volanteo focalizado.\n• Tasa de conversión proyectada: +18.4% sobre electorado neutro.`
      );
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white font-sans selection:bg-indigo-500 selection:text-white relative overflow-x-clip">
      {/* Notifications */}
      <div className="fixed top-24 right-4 z-[100] space-y-2 pointer-events-none max-w-sm w-full">
        {notifications.map((n) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="p-3.5 rounded-2xl shadow-2xl border text-xs font-semibold backdrop-blur-md bg-emerald-950/90 text-emerald-200 border-emerald-500/50 pointer-events-auto flex items-center justify-between gap-2.5"
          >
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="flex-1">{n.message}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Background Blobs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[15%] w-[50vw] h-[50vw] rounded-full bg-indigo-600/10 blur-[100px] opacity-60" />
        <div className="absolute bottom-[5%] right-[-5%] w-[45vw] h-[45vw] rounded-full bg-purple-600/10 blur-[110px] opacity-50" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl bg-[#080808]/90 border-b border-white/5 h-20 flex items-center justify-between px-6 lg:px-12">
        <div className="flex items-center gap-3">
          <AppLogo 
            size="md" 
            variant="brand" 
            withText={true} 
            title="SOFTWARE" 
            subtitle="Plataforma Electoral Inteligente"
            onClick={() => navigate('/')} 
          />
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <a href="#features" className="hover:text-white transition-colors">Producto</a>
          <a href="#demo" className="hover:text-white transition-colors">Demostración</a>
          <a href="#solutions" className="hover:text-white transition-colors">Soluciones</a>
          <a href="#pricing" className="hover:text-white transition-colors">Planes</a>
        </nav>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/select-module')}
            className="px-6 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all"
          >
            Iniciar Sesión
          </button>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[60] bg-[#080808] flex flex-col p-8"
          >
            <div className="flex justify-between items-center mb-12">
              <AppLogo size="sm" variant="brand" withText={true} title="SOFTWARE" />
              <button onClick={() => setMobileMenuOpen(false)}><X className="w-8 h-8" /></button>
            </div>
            <nav className="flex flex-col gap-8 text-2xl font-bold">
              <a href="#features" onClick={() => setMobileMenuOpen(false)}>Producto</a>
              <a href="#demo" onClick={() => setMobileMenuOpen(false)}>Demostración</a>
              <a href="#solutions" onClick={() => setMobileMenuOpen(false)}>Soluciones</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)}>Planes</a>
            </nav>
            <div className="mt-auto pt-8">
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/select-module');
                }}
                className="w-full py-4 rounded-full bg-indigo-600 hover:bg-indigo-500 text-base font-bold shadow-lg shadow-indigo-600/20 transition-all text-center"
              >
                Iniciar Sesión
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="relative z-10">
        {/* Hero */}
        <section className="pt-36 pb-24 px-6 max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-8 flex flex-col items-center"
          >
            <motion.h1 
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.1] md:leading-[0.95]"
            >
              LA ESTRATEGIA <br className="hidden sm:block" /> 
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">PARA GANAR</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="text-slate-400 text-base md:text-xl max-w-2xl mx-auto leading-relaxed px-4 md:px-0"
            >
              Centraliza la gestión de votantes, territorialización de líderes, control financiero y monitoreo del Día D con tecnología de última generación.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 px-6 md:px-0"
            >
              <button onClick={() => navigate('/solicitar-acceso')} className="w-full sm:w-auto px-8 py-4 rounded-full bg-indigo-600 hover:bg-indigo-500 font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-600/20">
                Solicitar Acceso <ArrowRight className="w-5 h-5" />
              </button>
              <button onClick={() => navigate('/select-module')} className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 font-bold text-lg flex items-center justify-center gap-3 transition-all">
                Iniciar Sesión
              </button>
            </motion.div>
          </motion.div>
        </section>

        {/* Marquee Continuous Left-to-Right */}
        <div className="py-12 border-y border-white/5 bg-white/[0.02] overflow-hidden w-full select-none relative">
          <motion.div
            className="flex w-max gap-12 text-slate-500 font-bold uppercase tracking-widest text-xs whitespace-nowrap"
            animate={{ x: ['-50%', '0%'] }}
            transition={{
              repeat: Infinity,
              ease: 'linear',
              duration: 90,
            }}
          >
            {Array(16).fill(null).map((_, i) => (
              <div key={i} className="flex items-center gap-4 flex-shrink-0">
                <Award className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                <span>Alcaldías</span>
                <span>•</span>
                <span>Asambleas Territoriales</span>
                <span>•</span>
                <span>Senado</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Bento Grid Features with Scroll-triggered entrance */}
        <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-16 space-y-4"
          >
            <h2 className="text-4xl md:text-5xl font-bold">Diseñado para ganar en territorio</h2>
            <p className="text-slate-400 text-lg">Módulos integrales para cada aspecto de tu campaña electoral.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="sm:col-span-2 p-8 rounded-[2rem] bg-indigo-600/10 border border-indigo-500/20 space-y-6"
            >
              <Bot className="w-12 h-12 text-indigo-500" />
              <h3 className="text-3xl font-bold">Copiloto IA Político</h3>
              <p className="text-slate-400 text-lg leading-relaxed">
                Genera discursos persuasivos, comunicados de prensa y contenido para redes alineado con tu programa de gobierno usando inteligencia artificial avanzada.
              </p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="p-8 rounded-[2rem] bg-white/5 border border-white/10 space-y-6"
            >
              <Users className="w-12 h-12 text-purple-500" />
              <h3 className="text-2xl font-bold">CRM Votantes</h3>
              <p className="text-slate-400 leading-relaxed">
                Registra simpatizantes y asigna compromisos a líderes de barrio en tiempo real.
              </p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="p-8 rounded-[2rem] bg-white/5 border border-white/10 space-y-6"
            >
              <MapPin className="w-12 h-12 text-pink-500" />
              <h3 className="text-2xl font-bold">Geolocalización</h3>
              <p className="text-slate-400 leading-relaxed">
                Mapas de calor en vivo que muestran el avance de votos objetivo por comuna.
              </p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="sm:col-span-2 p-8 rounded-[2rem] bg-white/5 border border-white/10 space-y-6"
            >
              <Vote className="w-12 h-12 text-emerald-500" />
              <h3 className="text-3xl font-bold">Día D & E-14 OCR</h3>
              <p className="text-slate-400 text-lg leading-relaxed">
                Control total del escrutinio con captura fotográfica de actas E-14 y detección automática de discrepancias.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Demo Section with Scroll-triggered entrance */}
        <section id="demo" className="py-24 px-6 bg-white/[0.02]">
          <div className="max-w-7xl mx-auto space-y-12">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="text-center space-y-4"
            >
              <h2 className="text-4xl font-bold">Explora la plataforma</h2>
              <p className="text-slate-400">Selecciona un módulo para ver cómo funciona.</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-wrap justify-center gap-4"
            >
              {[
                { id: 'ai', label: 'Copiloto IA', icon: Bot },
                { id: 'crm', label: 'CRM & Líderes', icon: Users },
                { id: 'territory', label: 'Control Territorial', icon: MapPin },
                { id: 'e14', label: 'Escrutinio E-14', icon: Vote },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTabDemo(tab.id as any)}
                  className={`px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-3 transition-all ${
                    activeTabDemo === tab.id 
                    ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' 
                    : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="p-8 md:p-12 rounded-[3rem] bg-[#111] border border-white/10 shadow-2xl min-h-[400px]"
            >
              {activeTabDemo === 'ai' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                  <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                    <div className="p-3 rounded-2xl bg-indigo-600/20 text-indigo-400"><Bot className="w-6 h-6" /></div>
                    <div>
                      <h4 className="text-xl font-bold">Generador Estratégico</h4>
                      <p className="text-slate-500 text-sm">Prueba el motor de IA política</p>
                    </div>
                  </div>
                  <form onSubmit={handleSimulateAiPrompt} className="flex flex-col sm:flex-row gap-4">
                    <input 
                      type="text" 
                      value={aiPromptInput}
                      onChange={(e) => setAiPromptInput(e.target.value)}
                      className="flex-1 bg-black/50 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-indigo-500"
                    />
                    <button className="px-8 py-4 rounded-2xl bg-indigo-600 font-bold hover:bg-indigo-500 transition-colors">
                      {isAiGenerating ? 'Generando...' : 'Consultar IA'}
                    </button>
                  </form>
                  <div className="p-6 rounded-2xl bg-black/80 border border-white/5 font-mono text-sm leading-relaxed text-indigo-300">
                    <p className="whitespace-pre-line">{aiResponse}</p>
                  </div>
                </motion.div>
              )}
              {activeTabDemo !== 'ai' && (
                <div className="flex items-center justify-center h-full text-slate-500 italic">
                  Visualización interactiva del módulo de {activeTabDemo.toUpperCase()}
                </div>
              )}
            </motion.div>
          </div>
        </section>

        {/* FAQ with Scroll-triggered entrance */}
        <section className="py-24 px-6 max-w-3xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl font-bold text-center mb-12"
          >
            Preguntas Frecuentes
          </motion.h2>
          <div className="space-y-4">
            {[
              { q: '¿Es compatible con la normativa CNE?', a: 'Sí, incluye módulos específicos de contabilidad y reportes que cumplen con los formatos del Consejo Nacional Electoral.' },
              { q: '¿Cómo protegen la privacidad de los datos?', a: 'Utilizamos encriptación AES-256 y aislamiento total multi-inquilino. Tus datos son 100% privados.' },
              { q: '¿Funciona sin conexión a internet?', a: 'La plataforma está optimizada para la nube, pero el módulo territorial permite captura offline y sincronización posterior.' },
            ].map((item, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-2xl bg-white/5 border border-white/10 p-6"
              >
                <h4 className="font-bold text-lg mb-3">{item.q}</h4>
                <p className="text-slate-400">{item.a}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      <motion.footer 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="py-16 px-6 border-t border-white/5 bg-[#050505] relative z-10"
      >
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10 items-start">
            {/* Bloque 1: Software Electoral */}
            <div className="md:col-span-6 space-y-3">
              <AppLogo 
                size="sm" 
                variant="brand" 
                withText={true} 
                title="SOFTWARE" 
                subtitle="Suite de Inteligencia & Gestión Electoral" 
              />
              <p className="text-slate-400 text-sm leading-relaxed max-w-sm pt-1">
                La suite definitiva para la gestión moderna de campañas electorales de alto nivel.
              </p>
            </div>

            {/* Bloque 2: Producto */}
            <div className="md:col-span-3 space-y-3">
              <div className="h-8 flex items-center">
                <h4 className="font-bold text-sm text-white uppercase tracking-wider">Producto</h4>
              </div>
              <nav className="flex flex-col gap-2.5 text-slate-400 text-sm pt-1">
                <a href="#features" className="hover:text-white transition-colors">Características</a>
                <a href="#demo" className="hover:text-white transition-colors">Demo</a>
                <a href="#" className="hover:text-white transition-colors">Seguridad</a>
              </nav>
            </div>

            {/* Bloque 3: Compañía */}
            <div className="md:col-span-3 space-y-3">
              <div className="h-8 flex items-center">
                <h4 className="font-bold text-sm text-white uppercase tracking-wider">Compañía</h4>
              </div>
              <nav className="flex flex-col gap-2.5 text-slate-400 text-sm pt-1">
                <a href="#" className="hover:text-white transition-colors">Sobre Nosotros</a>
                <a href="#" className="hover:text-white transition-colors">Contacto</a>
                <a href="#" className="hover:text-white transition-colors">Legal</a>
              </nav>
            </div>
          </div>

          {/* Línea divisoria y Derechos Reservados */}
          <div className="mt-14 pt-8 border-t border-white/5 text-center text-slate-500 text-xs font-semibold uppercase tracking-widest">
            © 2026 SOFTWARE ELECTORAL • TODOS LOS DERECHOS RESERVADOS
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
