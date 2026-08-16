import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { Eye, EyeOff, Lock, Mail, ArrowLeft, Loader2, User } from 'lucide-react';
import { supabase } from '@/src/lib/supabase';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setError('Configuración de Supabase no encontrada.');
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      // 1. Create User in Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: fullName,
          },
        },
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        // 2. Create a default client for this new registration (Self-service registration)
        const { data: newClient, error: clientError } = await supabase
          .from('clients')
          .insert([
            {
              name: `Organización de ${fullName}`,
              email: email,
              status: 'ACTIVE'
            }
          ])
          .select()
          .single();

        if (clientError) {
          console.error('Error creating client:', clientError);
          // We continue, the user will have a user but maybe no client yet
        }

        // 3. Create profile record linked to the client
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert([
            {
              id: data.user.id,
              client_id: newClient?.id || null,
              email,
              display_name: fullName,
              role: 'ADMIN_CLIENTE', // First user of a client is their Admin
              status: 'ACTIVE',
              allowed_modules: ['ADMINISTRATIVE', 'STRATEGY', 'TERRITORY', 'CRM'], // Grant all modules to the owner
              created_at: new Date().toISOString(),
            },
          ]);

        if (profileError) {
          console.error('Error creating profile:', profileError);
          throw new Error('Error al crear el perfil de usuario');
        }

        // 4. Create an initial "Pro" license for the new client
        if (newClient?.id) {
          const { error: licenseError } = await supabase
            .from('licenses')
            .insert([
              {
                client_id: newClient.id,
                plan_id: null, // Custom initial plan
                status: 'ACTIVA',
                allowed_modules: ['ADMINISTRATIVE', 'STRATEGY', 'TERRITORY', 'CRM'],
                expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days trial
              }
            ]);
          
          if (licenseError) console.error('Error creating initial license:', licenseError);
        }
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Error al registrarse');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/5 border border-white/10 p-12 rounded-[3rem] max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 text-emerald-500">
            <User className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">¡Registro Exitoso!</h2>
          <p className="text-slate-400 mb-8">
            Tu cuenta ha sido creada. Por favor, verifica tu correo electrónico para activar tu acceso.
          </p>
          <Button onClick={() => navigate('/select-module')} className="w-full h-12 bg-indigo-600">
            Ir al Inicio
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row">
      <div className="hidden md:flex flex-1 relative bg-gradient-to-br from-indigo-900 via-slate-950 to-purple-950 items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center opacity-20 mix-blend-overlay" />
        <div className="relative z-10 text-center px-12">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 bg-indigo-600 rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-2xl shadow-indigo-500/40"
          >
            <span className="text-white text-4xl font-bold">S</span>
          </motion.div>
          <h2 className="text-4xl font-bold text-white mb-4">Crea tu cuenta</h2>
          <p className="text-indigo-200/60 text-lg max-w-md mx-auto">
            Únete a la plataforma líder en gestión electoral y territorial.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-slate-950">
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-full max-w-md"
        >
          <Button
            variant="ghost"
            size="sm"
            className="mb-8 gap-2 -ml-2 text-slate-400 hover:text-white hover:bg-white/5"
            onClick={() => navigate('/select-module')}
          >
            <ArrowLeft className="w-4 h-4" /> Volver
          </Button>

          <div className="mb-10">
            <h1 className="text-3xl font-bold text-white mb-2">Regístrate</h1>
            <p className="text-slate-400">Completa tus datos para empezar.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Nombre Completo</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <Input 
                    placeholder="Tu nombre"
                    className="pl-12 h-12"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <Input 
                    type="email"
                    placeholder="usuario@empresa.com"
                    className="pl-12 h-12"
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
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="pl-12 h-12"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
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
                className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-medium"
              >
                {error}
              </motion.div>
            )}

            <Button
              type="submit"
              className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-600/20"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
              ) : (
                'Crear cuenta'
              )}
            </Button>
          </form>

          <div className="mt-10 pt-10 border-t border-slate-900 text-center">
            <p className="text-slate-500 text-sm">
              ¿Ya tienes una cuenta?{' '}
              <button 
                onClick={() => navigate('/login')}
                className="text-indigo-400 font-semibold hover:text-indigo-300"
              >
                Inicia Sesión
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
