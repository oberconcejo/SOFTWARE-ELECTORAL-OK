import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { Eye, EyeOff, Lock, Mail, ArrowLeft, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '@/src/contexts/AuthContext';
import { 
  normalizeModuleCode, 
  getModuleDisplayName, 
  MODULE_REGISTRY 
} from '@/src/lib/moduleAuth';

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rawTargetModule = searchParams.get('module') || 'ADMINISTRATIVE';
  const targetModule = normalizeModuleCode(rawTargetModule);
  const moduleMeta = MODULE_REGISTRY[targetModule];
  
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const authResult = await login(email.trim(), password, { requiredModule: targetModule });
      
      if (authResult.authorized) {
        // Redirection to the specific authorized module
        navigate(authResult.redirectPath);
      } else {
        setError(authResult.reason || 'Tu cuenta no tiene habilitado este módulo.');
      }
    } catch (err: any) {
      let errorMessage = err.message || 'Credenciales incorrectas';
      
      // Clear and friendly translation for authentication errors
      if (errorMessage.includes('Invalid login credentials') || errorMessage.includes('invalid_credentials')) {
        errorMessage = 'No se pudieron validar las credenciales. Verifica tu correo y contraseña.';
      } else if (errorMessage.includes('Email not confirmed')) {
        errorMessage = 'Tu correo electrónico aún no ha sido confirmado. Revisa tu bandeja de entrada.';
      } else if (errorMessage.includes('Invalid path specified')) {
        errorMessage = 'Error de conexión: URL de base de datos mal configurada.';
      } else if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
        errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
      } else if (errorMessage.includes('Too many requests')) {
        errorMessage = 'Demasiados intentos fallidos. Por favor, espera unos minutos e intenta de nuevo.';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row">
      {/* Left Side: Branding/Visual */}
      <div className="hidden md:flex flex-1 relative bg-gradient-to-br from-indigo-900 via-slate-950 to-purple-950 items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center opacity-20 mix-blend-overlay" />
        <div className="relative z-10 text-center px-12 max-w-lg">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 bg-indigo-600 rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-2xl shadow-indigo-500/40"
          >
            <span className="text-white text-4xl font-bold">S</span>
          </motion.div>
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-4">
            <ShieldCheck className="w-4 h-4" /> Acceso a Módulo
          </div>

          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-bold text-white mb-4 leading-tight"
          >
            Módulo: {getModuleDisplayName(targetModule)}
          </motion.h2>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-indigo-200/70 text-base leading-relaxed"
          >
            {moduleMeta?.description || 'Accede a tu panel de control electoral y continúa liderando con inteligencia y datos reales.'}
          </motion.p>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-slate-950">
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-full max-w-md"
        >
          {/* Mobile Branding */}
          <div className="md:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <span className="text-white text-xl font-bold">S</span>
            </div>
            <span className="text-xl font-bold text-white tracking-tight">SOFTWARE <span className="text-indigo-400">ELECTORAL</span></span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="mb-6 gap-2 -ml-2 text-slate-400 hover:text-white hover:bg-white/5"
            onClick={() => navigate('/select-module')}
          >
            <ArrowLeft className="w-4 h-4" /> Cambiar Módulo
          </Button>

          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {getModuleDisplayName(targetModule)}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Iniciar Sesión</h1>
            <p className="text-slate-400 text-sm">Ingresa tus credenciales autorizadas para este módulo.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <Input 
                    type="email"
                    placeholder="usuario@empresa.com"
                    className="pl-12 h-12 bg-slate-900 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <Input 
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="pl-12 h-12 bg-slate-900 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 text-red-400 text-sm font-medium"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400 mt-0.5" />
                <div className="flex-1">
                  <p className="leading-snug">{error}</p>
                </div>
              </motion.div>
            )}

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-800 bg-slate-900 text-indigo-600 focus:ring-indigo-500" />
                <span className="text-sm text-slate-400 group-hover:text-slate-300">Recordarme</span>
              </label>
              <button 
                type="button" 
                onClick={() => navigate('/forgot-password')}
                className="text-sm font-medium text-indigo-400 hover:text-indigo-300"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-600/20"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Validando acceso...</span>
                </div>
              ) : (
                'Entrar ahora'
              )}
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <p className="text-slate-400 text-sm">
              ¿No tienes una cuenta?{' '}
              <button 
                onClick={() => navigate('/register')}
                className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors"
              >
                Regístrate aquí
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
