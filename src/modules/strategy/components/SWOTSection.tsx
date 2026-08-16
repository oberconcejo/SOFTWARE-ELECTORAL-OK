import React, { useState } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, Lightbulb, AlertTriangle, Plus, Trash2 } from 'lucide-react';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';

interface SWOTData {
  strengths: string[];
  opportunities: string[];
  weaknesses: string[];
  threats: string[];
}

export function SWOTSection() {
  const [data, setData] = useState<SWOTData>({
    strengths: [
      'Trayectoria ética intachable',
      'Experiencia técnica comprobada',
      'Alto nivel de carisma territorial'
    ],
    opportunities: [
      'Descontento con la administración saliente',
      'Crecimiento del voto de opinión',
      'Alianzas con líderes comunales'
    ],
    weaknesses: [
      'Visibilidad baja en comunas periféricas',
      'Estructura logística en consolidación',
      'Presupuesto ajustado frente a maquinarias'
    ],
    threats: [
      'Ataques de desinformación sistemáticos',
      'Uso de recursos públicos por rivales',
      'Abstencionismo en puestos clave'
    ]
  });

  const [inputs, setInputs] = useState({
    strengths: '',
    opportunities: '',
    weaknesses: '',
    threats: ''
  });

  const addItem = (type: keyof SWOTData) => {
    if (!inputs[type].trim()) return;
    setData(prev => ({
      ...prev,
      [type]: [...prev[type], inputs[type].trim()]
    }));
    setInputs(prev => ({ ...prev, [type]: '' }));
  };

  const removeItem = (type: keyof SWOTData, index: number) => {
    setData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const sections = [
    { id: 'strengths', label: 'Fortalezas', icon: TrendingUp, color: 'emerald' },
    { id: 'weaknesses', label: 'Debilidades', icon: TrendingDown, color: 'rose' },
    { id: 'opportunities', label: 'Oportunidades', icon: Lightbulb, color: 'indigo' },
    { id: 'threats', label: 'Amenazas', icon: AlertTriangle, color: 'amber' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {sections.map((section) => (
        <Card 
          key={section.id}
          title={section.label}
          icon={section.icon}
          className="relative overflow-hidden"
        >
          <div className="space-y-4 pt-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputs[section.id as keyof SWOTData]}
                onChange={(e) => setInputs(prev => ({ ...prev, [section.id]: e.target.value }))}
                onKeyPress={(e) => e.key === 'Enter' && addItem(section.id as keyof SWOTData)}
                placeholder={`Añadir ${section.label.toLowerCase()}...`}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500"
              />
              <Button size="sm" onClick={() => addItem(section.id as keyof SWOTData)}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-2">
              {data[section.id as keyof SWOTData].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/5 border border-white/5 group hover:border-white/10 transition-colors"
                >
                  <span className="text-sm text-slate-300">{item}</span>
                  <button 
                    onClick={() => removeItem(section.id as keyof SWOTData, i)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-500 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
