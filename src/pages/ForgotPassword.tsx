import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, ArrowLeft, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/src/components/ui/Button';
import { AppLogo } from '@/src/components/common/AppLogo';
import { supabase } from '@/src/lib/supabase';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error al enviar el correo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 flex items-center justify-between">
          <AppLogo 
            size="md" 
            variant="brand" 
            withText={true} 
            title="SOFTWARE" 
            onClick={() => navigate('/')} 
          />
        </div>

        <div className="bg-[#111114] border border-white/10 rounded-[32px] p-8 md:p-10 shadow-2xl">
          {!success ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">¿Olvidaste tu contraseña?</h2>
                <p className="text-slate-400">Ingresa tu correo electrónico y te enviaremos instrucciones para restablecerla.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Correo Electrónico</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nombre@ejemplo.com"
                      className="w-full bg-[#16161a] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-sm"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </motion.div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-600/20"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Enviar Instrucciones <Send className="w-5 h-5" />
                    </>
                  )}
                </Button>
              </form>

              <button
                onClick={() => navigate('/login')}
                className="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-white transition-colors text-sm font-medium"
              >
                <ArrowLeft className="w-4 h-4" /> Volver al inicio de sesión
              </button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6 py-4"
            >
              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">¡Correo enviado!</h2>
                <p className="text-slate-400">Hemos enviado las instrucciones a <span className="text-indigo-400 font-bold">{email}</span>. Revisa tu bandeja de entrada y spam.</p>
              </div>
              <Button
                onClick={() => navigate('/login')}
                variant="outline"
                className="w-full py-4 rounded-2xl"
              >
                Volver al inicio de sesión
              </Button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
