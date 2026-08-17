import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles,
  MapPin, 
  FileText, 
  User, 
  UploadCloud, 
  ShieldAlert, 
  MessageSquareQuote, 
  Radio, 
  BarChart3, 
  Calendar,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Award,
  BookOpen,
  Briefcase,
  Share2,
  Trash2,
  Clock
} from 'lucide-react';
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { cn } from '@/src/lib/utils';
import { SWOTSection } from '@/src/modules/strategy/components/SWOTSection';
import { CandidateProfileSection } from '@/src/modules/strategy/components/CandidateProfileSection';
import { TerritorialDiagnostic } from '@/src/modules/strategy/components/TerritorialDiagnostic';
import { GovProgramSection } from '@/src/modules/strategy/components/GovProgramSection';
import { Diagnostic360Section } from '@/src/modules/strategy/components/Diagnostic360Section';
import { CommunicationsSection } from '@/src/modules/strategy/components/CommunicationsSection';
import { DataAnalysisSection } from '@/src/modules/strategy/components/DataAnalysisSection';
import { AgendaCalendarSection } from '@/src/modules/strategy/components/AgendaCalendarSection';

type StrategyTab = 
  | 'diagnostic360'
  | 'territorial'
  | 'govProgram'
  | 'candidateProfile'
  | 'cvAnalysis'
  | 'swot'
  | 'narrative'
  | 'comms'
  | 'dataAnalysis'
  | 'calendar';

export default function StrategyPage() {
  const [searchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as StrategyTab) || 'diagnostic360';

  // Interactive local states for Strategy functions (Fases progresivas)
  const [programPillars, setProgramPillars] = useState<Array<{ id: string; title: string; desc: string }>>([]);
  const [newPillarTitle, setNewPillarTitle] = useState('');
  const [newPillarDesc, setNewPillarDesc] = useState('');
  const [showAddPillar, setShowAddPillar] = useState(false);

  const [narrativeItems, setNarrativeItems] = useState<Array<{ id: string; topic: string; message: string }>>([]);
  const [newTopic, setNewTopic] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [showAddNarrative, setShowAddNarrative] = useState(false);

  const [candidateData, setCandidateData] = useState<{
    name: string;
    tagline: string;
    profession: string;
    experience: string;
    strengths: string;
  }>({
    name: '',
    tagline: '',
    profession: '',
    experience: '',
    strengths: ''
  });

  const [uploadedCv, setUploadedCv] = useState<string | null>(null);

  const handleAddPillar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPillarTitle.trim()) return;
    setProgramPillars(prev => [
      ...prev,
      { id: Date.now().toString(), title: newPillarTitle.trim(), desc: newPillarDesc.trim() }
    ]);
    setNewPillarTitle('');
    setNewPillarDesc('');
    setShowAddPillar(false);
  };

  const handleAddNarrative = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.trim() || !newMessage.trim()) return;
    setNarrativeItems(prev => [
      ...prev,
      { id: Date.now().toString(), topic: newTopic.trim(), message: newMessage.trim() }
    ]);
    setNewTopic('');
    setNewMessage('');
    setShowAddNarrative(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Tab Content Driven from Vertical Sidebar */}
      <AnimatePresence mode="wait">
        {/* 1. Diagnóstico 360° AI */}
        {activeTab === 'diagnostic360' && (
          <motion.div
            key="diagnostic360"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <Diagnostic360Section />
          </motion.div>
        )}

        {/* 2. Diagnóstico Territorial */}
        {activeTab === 'territorial' && (
          <motion.div
            key="territorial"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <TerritorialDiagnostic />
          </motion.div>
        )}

        {/* 3. Programa de Gobierno */}
        {activeTab === 'govProgram' && (
          <motion.div
            key="govProgram"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <GovProgramSection />
          </motion.div>
        )}

        {/* 4. Perfil del Candidato */}
        {activeTab === 'candidateProfile' && (
          <motion.div
            key="candidateProfile"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <CandidateProfileSection />
          </motion.div>
        )}

        {/* 5. Carga & Análisis CV */}
        {activeTab === 'cvAnalysis' && (
          <motion.div
            key="cvAnalysis"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <Card className="rounded-[32px] bg-[#111114] border-white/5 p-8 shadow-xl">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Carga & Análisis CV</h3>
                    <p className="text-xs text-slate-500 font-medium">Extracción de trayectoria, habilidades y validación de perfil</p>
                  </div>
                </div>
              </div>

              <div className="border-2 border-dashed border-white/10 rounded-3xl p-10 text-center space-y-4 hover:border-indigo-500/50 transition-colors">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mx-auto">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-white">Cargar Hoja de Vida (PDF o DOCX)</h4>
                  <p className="text-xs text-slate-500">Arrastre su documento o seleccione desde su dispositivo</p>
                </div>
                <input 
                  type="file" 
                  accept=".pdf,.docx,.doc" 
                  className="hidden" 
                  id="cv-upload-input"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setUploadedCv(e.target.files[0].name);
                    }
                  }}
                />
                <label 
                  htmlFor="cv-upload-input"
                  className="inline-block px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl cursor-pointer transition-all shadow-lg shadow-indigo-600/20"
                >
                  Seleccionar Archivo
                </label>

                {uploadedCv && (
                  <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center gap-2 text-emerald-400 text-sm font-medium">
                    <FileCheck className="w-4 h-4" />
                    Documento cargado: {uploadedCv}
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}

        {/* 6. Matriz DOFA / SWOT AI */}
        {activeTab === 'swot' && (
          <motion.div
            key="swot"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <Card className="rounded-[32px] bg-[#111114] border-white/5 p-8 shadow-xl">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Matriz DOFA / SWOT AI</h3>
                    <p className="text-xs text-slate-500 font-medium">Fortalezas, Oportunidades, Debilidades y Amenazas electorales</p>
                  </div>
                </div>
              </div>

              <SWOTSection />
            </Card>
          </motion.div>
        )}

        {/* 7. Narrativa & Discurso */}
        {activeTab === 'narrative' && (
          <motion.div
            key="narrative"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <Card className="rounded-[32px] bg-[#111114] border-white/5 p-8 shadow-xl">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    <MessageSquareQuote className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Narrativa & Discurso</h3>
                    <p className="text-xs text-slate-500 font-medium">Líneas discursivas, mensajes clave y argumentos centrales de campaña</p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => setShowAddNarrative(!showAddNarrative)}
                  className="gap-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold"
                >
                  <Plus className="w-4 h-4" /> Agregar Mensaje Clave
                </Button>
              </div>

              {showAddNarrative && (
                <form onSubmit={handleAddNarrative} className="p-6 bg-white/5 rounded-2xl border border-white/10 mb-6 space-y-4">
                  <h4 className="text-sm font-bold text-white">Nuevo Mensaje o Eje Discursivo</h4>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Eje / Audiencia</label>
                    <input 
                      type="text" 
                      value={newTopic}
                      onChange={(e) => setNewTopic(e.target.value)}
                      placeholder="Ej. Jóvenes y Oportunidades Laborales"
                      className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Mensaje Clave y Argumentos</label>
                    <textarea 
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Redacción del mensaje central y argumentos de apoyo..."
                      rows={3}
                      className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-xs font-bold">Guardar</Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddNarrative(false)} className="text-xs">Cancelar</Button>
                  </div>
                </form>
              )}

              {narrativeItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {narrativeItems.map(item => (
                    <div key={item.id} className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="primary">{item.topic}</Badge>
                      </div>
                      <p className="text-sm text-slate-300 italic">"{item.message}"</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center bg-white/[0.01] rounded-[28px] border border-dashed border-white/5 space-y-3">
                  <MessageSquareQuote className="w-12 h-12 text-slate-700 mx-auto" />
                  <h4 className="text-lg font-bold text-slate-400">No hay información disponible todavía</h4>
                  <p className="text-sm text-slate-500 max-w-md mx-auto">
                    Aún no se han configurado líneas discursivas. Registre un mensaje clave para comenzar la construcción de narrativa.
                  </p>
                </div>
              )}
            </Card>
          </motion.div>
        )}

        {/* 8. Comunicación & Redes */}
        {activeTab === 'comms' && (
          <motion.div
            key="comms"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <CommunicationsSection />
          </motion.div>
        )}

        {/* 9. Análisis de Datos AI */}
        {activeTab === 'dataAnalysis' && (
          <motion.div
            key="dataAnalysis"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <DataAnalysisSection />
          </motion.div>
        )}

        {/* 10. Agenda & Calendario */}
        {activeTab === 'calendar' && (
          <motion.div
            key="calendar"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <AgendaCalendarSection />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
