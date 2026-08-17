import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShieldAlert, Mail, Lock, ArrowRight, Loader2, UserPlus } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { AppLogo } from '@/src/components/common/AppLogo';
import { useAuth } from '@/src/contexts/AuthContext';
import { UserRole } from '@/src/types';
import { AdminRequestAccessModal } from '@/src/components/admin/AdminRequestAccessModal';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Logic for SuperAdmin login via Supabase
      const success = await login(email, password, { requiredRole: UserRole.SUPERADMIN });
      if (success) {
        navigate('/admin/dashboard');
      } else {
        setError('No autorizado. Solo cuentas de SuperAdministrador pueden acceder.');
      }
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Intense Background for Admin Area */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-[100px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <AppLogo 
                size="lg" 
                variant="admin" 
                animated={true} 
                floating={true}
                showGlowHalo={true} 
              />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Acceso Privado</h1>
            <p className="text-slate-400">Panel Central de Administración</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Correo Electrónico o Cédula</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <Input 
                  type="text"
                  placeholder="admin@softwareelectoral.com o Cédula"
                  className="pl-12"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <Input 
                  type="password"
                  placeholder="••••••••"
                  className="pl-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-medium"
              >
                {error}
              </motion.div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 bg-red-600 hover:bg-red-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-red-600/20"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  Iniciar Sesión <ArrowRight className="w-5 h-5" />
                </span>
              )}
            </Button>

            {/* Secondary Option: Request Access */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setIsRequestModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold text-slate-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-white/15 transition-all w-full group"
              >
                <UserPlus className="w-3.5 h-3.5 text-red-400 group-hover:scale-110 transition-transform" />
                <span>¿Primera vez? <span className="text-red-400 font-bold group-hover:underline">Solicitar acceso</span></span>
              </button>
            </div>
          </form>

          <div className="mt-8 text-center border-t border-white/5 pt-6">
            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em] leading-relaxed">
              Esta es una zona restringida.<br />
              Cualquier intento de acceso no autorizado será registrado.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Modal for Admin Access Request */}
      <AdminRequestAccessModal 
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
      />
    </div>
  );
}
