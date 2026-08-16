import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, UserPlus, Phone, MapPin, ShieldCheck, AlertTriangle, Loader2 } from 'lucide-react';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { useVoters } from '@/src/hooks/useVoters';
import { supabase } from '@/src/lib/supabase';

export function AddVoterForm() {
  const { addVoter } = useVoters();
  const [cedula, setCedula] = useState('');
  const [isConsulting, setIsConsulting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voterData, setVoterData] = useState<any>(null);
  const [phone, setPhone] = useState('');
  const [intencion, setIntencion] = useState<'Voto Seguro' | 'Simpatizante' | 'Indeciso' | 'Opositor'>('Indeciso');

  const handleConsult = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cedula.trim()) return;
    
    setIsConsulting(true);
    // Simulating CNE consultation - in a real app this would be an API call to a census database
    setTimeout(() => {
      setIsConsulting(false);
      setVoterData({
        nombre: 'JUAN PABLO MONTOYA',
        puesto: 'I.E. MARCO FIDEL SUÁREZ',
        mesa: 12,
        comuna: 'Comuna 11 - Laureles',
        municipio: 'MEDELLÍN',
        departamento: 'ANTIOQUIA'
      });
    }, 800);
  };

  const handleSubmit = async () => {
    if (!voterData || !phone.trim()) {
      alert('Por favor ingrese el teléfono del votante');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Check for duplicates
      const { data: existing } = await supabase
        .from('voters')
        .select('id')
        .eq('cedula', cedula)
        .single();

      if (existing) {
        alert('Este ciudadano ya se encuentra registrado en el censo.');
        return;
      }

      await addVoter({
        nombre: voterData.nombre,
        cedula: cedula,
        telefono: phone,
        comuna: voterData.comuna,
        puesto: voterData.puesto,
        mesa: voterData.mesa,
        intencion: intencion,
        lider_nombre: 'Administrador' // Default for now
      });
      
      // Reset form
      setCedula('');
      setVoterData(null);
      setPhone('');
      alert('Votante registrado exitosamente');
    } catch (err: any) {
      alert('Error al registrar votante: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-indigo-500/20 bg-indigo-500/5 p-6 rounded-[32px] shadow-2xl">
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <UserPlus className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">Vincular Nuevo Votante</h3>
            <p className="text-slate-400 text-sm">Validación en tiempo real con el Censo Electoral Nacional</p>
          </div>
        </div>

        <form onSubmit={handleConsult} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
              placeholder="Ingrese Cédula del Ciudadano..."
              className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-white focus:outline-none focus:border-indigo-500 transition-all font-medium"
            />
          </div>
          <Button 
            type="submit" 
            disabled={isConsulting || !cedula} 
            className="px-8 rounded-2xl h-[52px] bg-indigo-600 hover:bg-indigo-500 font-bold uppercase tracking-widest text-[10px]"
          >
            {isConsulting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verificar Identidad'}
          </Button>
        </form>

        <AnimatePresence mode="wait">
          {voterData && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="space-y-6 p-6 rounded-[28px] bg-white/[0.03] border border-white/5 mt-4">
                <div className="flex items-center justify-between">
                  <Badge variant="success" className="gap-2 py-1.5 px-4 bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                    <ShieldCheck className="w-3.5 h-3.5" /> Identidad Validada CNE
                  </Badge>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{voterData.municipio}, {voterData.departamento}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Nombre Completo Registrado</span>
                    <p className="text-white font-bold text-lg leading-tight">{voterData.nombre}</p>
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Lugar de Votación Actual</span>
                    <p className="text-indigo-400 text-sm font-bold flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> {voterData.puesto} - Mesa {voterData.mesa}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/5">
                  <div className="space-y-2.5">
                    <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-widest">Teléfono de Contacto (WhatsApp)</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input 
                        type="text" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:border-indigo-500 transition-all" 
                        placeholder="Ej: 310 123 4567" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-widest">Intención de Voto</label>
                    <select 
                      value={intencion}
                      onChange={(e) => setIntencion(e.target.value as any)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white appearance-none focus:border-indigo-500 transition-all"
                    >
                      <option value="Voto Seguro">Voto Seguro (100% Comprometido)</option>
                      <option value="Simpatizante">Simpatizante (Posible)</option>
                      <option value="Indeciso">Indeciso (Por convencer)</option>
                      <option value="Opositor">Opositor (En contra)</option>
                    </select>
                  </div>
                </div>

                <Button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 rounded-2xl font-bold uppercase tracking-widest shadow-xl shadow-emerald-600/20 transition-all hover:scale-[1.01]"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Confirmar y Vincular al Territorio'}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
}
