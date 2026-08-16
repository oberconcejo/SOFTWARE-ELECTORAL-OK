import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  User as UserIcon, 
  Mail, 
  Phone, 
  Shield, 
  Layout, 
  ChevronRight, 
  ChevronLeft,
  Check,
  Lock,
  Loader2,
  AlertTriangle,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { Badge } from '@/src/components/ui/Badge';
import { useAuth } from '@/src/contexts/AuthContext';
import { UserRole, Permission, ModuleFunction } from '@/src/types';
import { MODULE_FUNCTIONS } from '@/src/config/moduleFunctions';
import { supabase } from '@/src/lib/supabase';

interface UserCreationFormProps {
  onClose: () => void;
  onSuccess: () => void;
  allowedModules: string[]; // Modules allowed by client license
}

export const UserCreationForm: React.FC<UserCreationFormProps> = ({ onClose, onSuccess, allowedModules }) => {
  const { user: currentUser } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: UserRole.USUARIO,
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
    selectedModules: [] as string[],
    permissions: {} as Record<string, Record<string, Permission[]>> // { MODULE_CODE: { FUNCTION_CODE: ['VIEW', 'CREATE'] } }
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const passwordRequirements = {
    length: formData.password.length >= 8,
    hasUpper: /[A-Z]/.test(formData.password),
    hasLower: /[a-z]/.test(formData.password),
    hasNumber: /[0-9]/.test(formData.password),
    matches: formData.password === formData.confirmPassword && formData.password !== ''
  };

  const isStep1Valid = formData.firstName && formData.lastName && formData.email && formData.role;
  const isStep2Valid = Object.values(passwordRequirements).every(Boolean);
  const isStep3Valid = formData.selectedModules.length > 0;

  const toggleModule = (moduleCode: string) => {
    setFormData(prev => {
      const isSelected = prev.selectedModules.includes(moduleCode);
      if (isSelected) {
        return {
          ...prev,
          selectedModules: prev.selectedModules.filter(m => m !== moduleCode)
        };
      } else {
        return {
          ...prev,
          selectedModules: [...prev.selectedModules, moduleCode]
        };
      }
    });
  };

  const togglePermission = (moduleCode: string, functionCode: string, permission: Permission) => {
    setFormData(prev => {
      const modulePerms = prev.permissions[moduleCode] || {};
      const funcPerms = modulePerms[functionCode] || [];
      
      const newFuncPerms = funcPerms.includes(permission)
        ? funcPerms.filter(p => p !== permission)
        : [...funcPerms, permission];

      return {
        ...prev,
        permissions: {
          ...prev.permissions,
          [moduleCode]: {
            ...modulePerms,
            [functionCode]: newFuncPerms
          }
        }
      };
    });
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!currentUser?.tenantId) throw new Error('No se pudo identificar el cliente');

      // Prepare permissions in flat array for backend
      const flattenedPermissions: any[] = [];
      Object.entries(formData.permissions).forEach(([modCode, funcs]) => {
        Object.entries(funcs).forEach(([funcCode, actions]) => {
          if (actions.length > 0) {
            flattenedPermissions.push({
              moduleCode: modCode,
              functionCode: funcCode,
              actions
            });
          }
        });
      });

      const { data: { session } } = await supabase!.auth.getSession();
      if (!session) throw new Error('Sesión no válida');

      const response = await fetch('/api/admin/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          actorId: currentUser.id,
          profile: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            clientId: currentUser.tenantId,
            role: formData.role,
            allowedModules: formData.selectedModules
          },
          permissions: flattenedPermissions
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al crear el usuario');
      }
      
      onSuccess();
      onClose();

    } catch (err: any) {
      setError(err.message || 'Error al crear el usuario');
      setIsLoading(false);
    }
  };

  const getModuleLabel = (code: string) => {
    const labels: Record<string, string> = {
      'ADMINISTRATIVE': 'Gestión Administrativa',
      'TERRITORIAL': 'Gestión Territorial',
      'TERRITORY': 'Gestión Territorial',
      'STRATEGIC': 'Gestión Estratégica',
      'STRATEGY': 'Gestión Estratégica',
      'CAMPAIGN': 'Gestión de Campaña',
      'CRM': 'Gestión de Votantes (CRM)',
      'ELECTORAL': 'Control Electoral (E14)',
      'AI': 'Inteligencia Artificial',
      'COMMUNICATIONS': 'Comunicaciones y Redes',
      'DOCUMENTS': 'Gestión Documental',
      'SETTINGS': 'Configuración'
    };
    return labels[code] || code;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-[#111114] border border-white/10 rounded-[32px] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div>
            <h2 className="text-xl font-bold text-white">Nuevo Subusuario</h2>
            <p className="text-sm text-slate-500">Paso {step} de 3: {
              step === 1 ? 'Datos Personales' : step === 2 ? 'Credenciales de Acceso' : 'Permisos y Módulos'
            }</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl text-slate-500 hover:text-white transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-8 mt-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-500 text-sm animate-shake">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Nombre</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input 
                      className="pl-12" 
                      placeholder="Ej. Juan" 
                      value={formData.firstName}
                      onChange={e => setFormData({...formData, firstName: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Apellido</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input 
                      className="pl-12" 
                      placeholder="Ej. Pérez" 
                      value={formData.lastName}
                      onChange={e => setFormData({...formData, lastName: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input 
                    className="pl-12" 
                    type="email" 
                    placeholder="juan.perez@ejemplo.com"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Teléfono</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input 
                      className="pl-12" 
                      placeholder="+57 300 000 0000"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Rol</label>
                  <div className="relative">
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <select 
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 appearance-none"
                      value={formData.role}
                      onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
                    >
                      {/* Only SuperAdmin can create other SuperAdmins or AdminClientes (for now) */}
                      {currentUser?.role === UserRole.SUPERADMIN && (
                        <>
                          <option value={UserRole.SUPERADMIN}>SuperAdministrador Global</option>
                          <option value={UserRole.ADMIN_CLIENTE}>Administrador de Cliente</option>
                        </>
                      )}
                      {/* Client Admin can create standard organization roles */}
                      {(currentUser?.role === UserRole.SUPERADMIN || currentUser?.role === UserRole.ADMIN_CLIENTE) && (
                        <>
                          {currentUser?.role === UserRole.ADMIN_CLIENTE && <option value={UserRole.ADMIN_CLIENTE}>Administrador de Cliente</option>}
                          <option value={UserRole.DIRECTOR}>Director de Campaña / Estrategia</option>
                          <option value={UserRole.COORDINADOR}>Coordinador Territorial / Líder</option>
                          <option value={UserRole.USUARIO}>Supervisor / Operador</option>
                          <option value={UserRole.USUARIO_LIMITADO}>Usuario Consulta (Solo Lectura)</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8 max-w-md mx-auto py-4">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Crear Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input 
                      className="pl-12 pr-12" 
                      type={showPassword ? 'text' : 'password'} 
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                    />
                    <button 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  
                  {/* Password Strength Indicators */}
                  <div className="grid grid-cols-2 gap-2 mt-4 px-1">
                    {[
                      { label: '8+ caracteres', met: passwordRequirements.length },
                      { label: 'Mayúscula', met: passwordRequirements.hasUpper },
                      { label: 'Minúscula', met: passwordRequirements.hasLower },
                      { label: 'Un número', met: passwordRequirements.hasNumber },
                    ].map((req, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${req.met ? 'bg-emerald-500/20 text-emerald-500' : 'bg-white/5 text-slate-600'}`}>
                          <Check className="w-2.5 h-2.5" />
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${req.met ? 'text-emerald-500' : 'text-slate-600'}`}>
                          {req.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Confirmar Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input 
                      className="pl-12 pr-12" 
                      type={showConfirmPassword ? 'text' : 'password'} 
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                    />
                    <button 
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {formData.confirmPassword && (
                    <div className="flex items-center gap-2 px-1 mt-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${passwordRequirements.matches ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'}`}>
                        {passwordRequirements.matches ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />}
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${passwordRequirements.matches ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {passwordRequirements.matches ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Layout className="w-5 h-5 text-indigo-500" /> Módulos Autorizados
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {allowedModules.map(modCode => (
                      <div 
                        key={modCode}
                        onClick={() => toggleModule(modCode)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          formData.selectedModules.includes(modCode)
                          ? 'bg-indigo-600/10 border-indigo-500 shadow-lg shadow-indigo-600/10'
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            formData.selectedModules.includes(modCode) ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-500'
                          }`}>
                            <Layout className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-bold text-white">{getModuleLabel(modCode)}</span>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                          formData.selectedModules.includes(modCode) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-700'
                        }`}>
                          {formData.selectedModules.includes(modCode) && <Check className="w-2.5 h-2.5 text-white" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {formData.selectedModules.length > 0 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Lock className="w-5 h-5 text-indigo-500" /> Configuración de Permisos
                    </h3>
                    
                    <div className="space-y-8">
                      {formData.selectedModules.map(modCode => (
                        <div key={modCode} className="space-y-4">
                          <div className="flex items-center gap-2 px-1">
                            <Badge variant="primary" className="text-[10px] uppercase font-bold">{getModuleLabel(modCode)}</Badge>
                          </div>
                          
                          <div className="overflow-hidden border border-white/5 rounded-2xl bg-white/[0.02]">
                            <table className="w-full text-left">
                              <thead>
                                <tr className="bg-white/5 border-b border-white/5">
                                  <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase">Función</th>
                                  {['VIEW', 'CREATE', 'EDIT', 'DELETE', 'EXPORT'].map(p => (
                                    <th key={p} className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase text-center">{p}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5">
                                {MODULE_FUNCTIONS.filter(f => f.moduleCode === modCode).map(func => (
                                  <tr key={func.code} className="hover:bg-white/5">
                                    <td className="px-6 py-4">
                                      <p className="text-sm font-bold text-white">{func.name}</p>
                                    </td>
                                      {['VIEW', 'CREATE', 'EDIT', 'DELETE', 'EXPORT'].map(p => (
                                        <td key={p} className="px-4 py-4 text-center">
                                          <button 
                                            onClick={() => togglePermission(modCode, func.code, p as Permission)}
                                            className={`w-6 h-6 rounded-md border flex items-center justify-center mx-auto transition-all ${
                                              formData.permissions[modCode]?.[func.code]?.includes(p as Permission)
                                              ? 'bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-600/40'
                                              : 'border-slate-700 hover:border-slate-500'
                                            }`}
                                          >
                                            {formData.permissions[modCode]?.[func.code]?.includes(p as Permission) && <Check className="w-3 h-3 text-white" />}
                                          </button>
                                        </td>
                                      ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 bg-white/[0.02] flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={step === 1 ? onClose : handleBack}
            className="gap-2 text-slate-400 hover:text-white"
          >
            <ChevronLeft className="w-4 h-4" /> {step === 1 ? 'Cancelar' : 'Anterior'}
          </Button>

          {step < 3 ? (
            <Button 
              onClick={handleNext}
              disabled={
                (step === 1 && !isStep1Valid) || 
                (step === 2 && !isStep2Valid)
              }
              className="gap-2 bg-indigo-600 hover:bg-indigo-500"
            >
              Siguiente <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit}
              disabled={isLoading || !isStep3Valid}
              className="gap-2 bg-indigo-600 hover:bg-indigo-500 min-w-[140px]"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>Crear Usuario <Check className="w-4 h-4" /></>
              )}
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
