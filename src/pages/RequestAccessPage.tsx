import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { Mail, ArrowLeft, Loader2, User, Building2, Phone, CheckCircle2, AlertCircle } from 'lucide-react';
import { AppLogo } from '@/src/components/common/AppLogo';

export default function RequestAccessPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [organization, setOrganization] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/access-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName,
          email,
          organization,
          phone,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al enviar la solicitud');
      }

      setSuccess(true);
    } catch (err: any) {
      console.error('Error requesting access:', err);
      setError(err.message || 'No fue posible enviar tu solicitud en este momento.');
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
          className="bg-slate-900/50 border border-white/10 p-12 rounded-[2.5rem] max-w-md w-full text-center shadow-2xl backdrop-blur-xl"
        >
          <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 text-emerald-500">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Solicitud Enviada</h2>
          <p className="text-slate-400 mb-8 leading-relaxed">
            Hemos recibido tu solicitud de acceso. Un administrador revisará tus datos y te contactará por correo electrónico con las instrucciones de acceso.
          </p>
          <Button onClick={() => navigate('/login')} className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 transition-all">
            Volver al Inicio
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
            className="mx-auto mb-8 flex items-center justify-center"
          >
            <AppLogo 
              size="2xl" 
              variant="brand" 
              animated={true} 
              floating={true}
              showGlowHalo={true}
            />
          </motion.div>
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">Únete a la plataforma</h2>
          <p className="text-indigo-200/60 text-lg max-w-md mx-auto leading-relaxed">
            Solicita acceso para tu campaña u organización y comienza a gestionar tu estrategia con datos reales.
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
            onClick={() => navigate('/login')}
          >
            <ArrowLeft className="w-4 h-4" /> Volver al Login
          </Button>

          <div className="mb-10">
            <h1 className="text-3xl font-bold text-white mb-2">Solicitar Acceso</h1>
            <p className="text-slate-400">Completa el formulario para evaluar tu solicitud.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Nombre del Candidato / Responsable</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <Input 
                    placeholder="Ej. Juan Pérez"
                    className="pl-12 h-12 bg-slate-900 border-white/10 text-white"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Campaña / Organización</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <Input 
                    placeholder="Ej. Campaña Alcaldía 2026"
                    className="pl-12 h-12 bg-slate-900 border-white/10 text-white"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Correo Electrónico</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input 
                      type="email"
                      placeholder="email@ejemplo.com"
                      className="pl-10 h-11 bg-slate-900 border-white/10 text-white text-xs"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Teléfono de Contacto</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input 
                      type="tel"
                      placeholder="+57 300..."
                      className="pl-10 h-11 bg-slate-900 border-white/10 text-white text-xs"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs font-medium flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </motion.div>
            )}

            <Button
              type="submit"
              className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-600/20 mt-4"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Enviando...</span>
                </div>
              ) : (
                'Enviar Solicitud'
              )}
            </Button>
          </form>

          <div className="mt-10 pt-10 border-t border-white/5 text-center">
            <p className="text-slate-500 text-sm">
              ¿Ya tienes una cuenta aprobada?{' '}
              <button 
                onClick={() => navigate('/login')}
                className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors"
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
