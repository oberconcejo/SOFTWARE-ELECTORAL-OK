import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  AtSign, 
  FileText, 
  Lock, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Send,
  Info
} from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';

interface AdminRequestAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminRequestAccessModal: React.FC<AdminRequestAccessModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    requestedUsername: '',
    reason: '',
    password: '',
    confirmPassword: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      requestedUsername: '',
      reason: '',
      password: '',
      confirmPassword: ''
    });
    setError(null);
    setSuccess(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validate = (): string | null => {
    if (!formData.fullName.trim()) return 'El nombre completo es obligatorio.';
    if (formData.fullName.trim().length < 3) return 'El nombre completo debe tener al menos 3 caracteres.';
    
    if (!formData.email.trim()) return 'El correo electrónico es obligatorio.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) return 'El correo electrónico no tiene un formato válido.';

    if (!formData.phone.trim()) return 'El número de teléfono es obligatorio.';

    if (!formData.requestedUsername.trim()) {
      return 'El usuario de acceso (cédula o correo electrónico) es obligatorio.';
    }
    const cleanUsername = formData.requestedUsername.trim();
    if (cleanUsername.length < 3) {
      return 'El usuario de acceso debe tener al menos 3 caracteres o dígitos.';
    }
    if (!/^[a-zA-Z0-9._%+-@]+$/.test(cleanUsername)) {
      return 'El usuario de acceso solo puede contener números de cédula, correo electrónico, letras, puntos y guiones.';
    }

    if (!formData.reason.trim()) return 'El motivo de la solicitud es obligatorio.';
    if (formData.reason.trim().length < 10) return 'Por favor describa el motivo de la solicitud con mayor detalle (mínimo 10 caracteres).';

    if (!formData.password) return 'La contraseña propuesta es obligatoria.';
    if (formData.password.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
    
    if (formData.password !== formData.confirmPassword) {
      return 'Las contraseñas no coinciden.';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/access-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ocurrió un error al procesar la solicitud.');
      }

      setSuccess(data.message || 'Solicitud enviada correctamente. Su solicitud está pendiente de revisión y autorización por el administrador principal.');
    } catch (err: any) {
      setError(err.message || 'No fue posible enviar la solicitud. Inténtalo nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-xl bg-[#111114] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl my-8 text-left"
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Solicitar acceso de administrador
              </h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Complete sus datos. Su solicitud será enviada al administrador principal para revisión y autorización. No podrá acceder al panel hasta que su solicitud sea aprobada.
              </p>
            </div>
          </div>

          {/* Success State View */}
          {success ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6 py-4 text-center"
            >
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">Solicitud enviada correctamente</h3>
                <div className="inline-block px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
                  Estado: PENDIENTE DE APROBACIÓN
                </div>
                <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto pt-2">
                  El administrador principal ha sido notificado por correo electrónico. Cuando su solicitud sea autorizada, recibirá una confirmación en <strong className="text-white">{formData.email}</strong>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-xs text-slate-400 text-left flex items-start gap-3">
                <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <span>
                  Por motivos de seguridad, ninguna credencial se activa hasta que el administrador verifique su identidad y autorice el acceso.
                </span>
              </div>

              <Button
                onClick={handleClose}
                className="w-full h-12 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl transition-all"
              >
                Volver al Inicio de Sesión
              </Button>
            </motion.div>
          ) : (
            /* Form View */
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-medium flex items-center gap-2.5"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Full Name & Username */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Nombre Completo *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                      type="text"
                      placeholder="Ej: Carlos Gómez"
                      className="pl-10 h-10 bg-white/5 border-white/10 text-xs text-white"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Usuario de Acceso (Cédula o Correo) *
                  </label>
                  <div className="relative">
                    <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                      type="text"
                      placeholder="Ej: 1020304050 o admin@correo.com"
                      className="pl-10 h-10 bg-white/5 border-white/10 text-xs text-white"
                      value={formData.requestedUsername}
                      onChange={(e) => setFormData({ ...formData, requestedUsername: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Correo Electrónico *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                      type="email"
                      placeholder="carlos@empresa.com"
                      className="pl-10 h-10 bg-white/5 border-white/10 text-xs text-white"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Teléfono *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                      type="tel"
                      placeholder="+57 300 123 4567"
                      className="pl-10 h-10 bg-white/5 border-white/10 text-xs text-white"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Reason */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Motivo de la Solicitud *
                </label>
                <div className="relative">
                  <FileText className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <textarea
                    rows={2}
                    placeholder="Indique el rol, campaña u objetivo por el cual requiere acceso de administrador..."
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500/50 resize-none"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Password & Confirm */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Contraseña Propuesta *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                      type="password"
                      placeholder="Mínimo 8 caracteres"
                      className="pl-10 h-10 bg-white/5 border-white/10 text-xs text-white"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Confirmar Contraseña *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                      type="password"
                      placeholder="Repetir contraseña"
                      className="pl-10 h-10 bg-white/5 border-white/10 text-xs text-white"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-all"
                >
                  Cancelar
                </button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-10 px-6 bg-red-600 hover:bg-red-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-red-600/20 text-xs"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Enviando solicitud...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      Enviar Solicitud
                    </span>
                  )}
                </Button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
