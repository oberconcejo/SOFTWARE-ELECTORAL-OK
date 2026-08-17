import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, 
  FileText, 
  Share2, 
  Mic, 
  TrendingUp, 
  Sparkles, 
  RefreshCw,
  PlusCircle,
  Megaphone
} from 'lucide-react';
import { useCommunications } from './hooks/useCommunications';
import { CommunicationsDashboard } from './components/CommunicationsDashboard';
import { MediaPlanSection } from './components/MediaPlanSection';
import { SocialMediaSection } from './components/SocialMediaSection';
import { SpokespersonsSection } from './components/SpokespersonsSection';
import { AnalyticsSection } from './components/AnalyticsSection';
import { AICopyGeneratorModal } from './components/AICopyGeneratorModal';
import { MediaPieceModal } from './components/MediaPieceModal';
import { ContentItemModal } from './components/ContentItemModal';
import { SpokespersonModal, InterventionModal } from './components/SpokespersonModal';
import { TalkingPointModal } from './components/TalkingPointModal';
import { 
  MediaPiece, 
  ContentItem, 
  Spokesperson, 
  TalkingPoint, 
  PublicIntervention 
} from '@/src/types/communications';

export const CommunicationsSection: React.FC = () => {
  const {
    candidateName,
    candidatePoliticalName,
    candidateRole,
    candidateTerritory,
    candidateSlogan,
    syncWithGovernmentProgram,
    mediaPieces,
    socialChannels,
    contentItems,
    spokespersons,
    talkingPoints,
    interventions,
    weeklyTrend,
    topicSentiments,
    kpis,
    activeSubTab,
    setActiveSubTab,
    addMediaPiece,
    updateMediaPiece,
    deleteMediaPiece,
    changeMediaPieceStatus,
    toggleChannelConnection,
    addContentItem,
    updateContentItem,
    deleteContentItem,
    moveContentStage,
    addSpokesperson,
    updateSpokesperson,
    deleteSpokesperson,
    addTalkingPoint,
    updateTalkingPoint,
    deleteTalkingPoint,
    addIntervention,
    updateIntervention,
    deleteIntervention,
    generateAICopy,
    resetToDefaultData
  } = useCommunications();

  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const handleSyncWithProgram = () => {
    const count = syncWithGovernmentProgram();
    if (count > 0) {
      setSyncFeedback(`Sincronizados ${count} ejes temáticos y propuestas del Programa de Gobierno a los Argumentarios oficiales.`);
    } else {
      setSyncFeedback('Datos sincronizados con el perfil y programa de gobierno de la campaña.');
    }
    setTimeout(() => setSyncFeedback(null), 4000);
  };

  // Modals state
  const [isAICopyOpen, setIsAICopyOpen] = useState(false);
  
  const [isMediaPieceModalOpen, setIsMediaPieceModalOpen] = useState(false);
  const [editingMediaPiece, setEditingMediaPiece] = useState<MediaPiece | null>(null);

  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [editingContentItem, setEditingContentItem] = useState<ContentItem | null>(null);

  const [isSpokespersonModalOpen, setIsSpokespersonModalOpen] = useState(false);
  const [editingSpokesperson, setEditingSpokesperson] = useState<Spokesperson | null>(null);

  const [isTalkingPointModalOpen, setIsTalkingPointModalOpen] = useState(false);
  const [editingTalkingPoint, setEditingTalkingPoint] = useState<TalkingPoint | null>(null);

  const [isInterventionModalOpen, setIsInterventionModalOpen] = useState(false);
  const [editingIntervention, setEditingIntervention] = useState<PublicIntervention | null>(null);

  // Handlers for Media Pieces
  const handleOpenNewMediaPiece = () => {
    setEditingMediaPiece(null);
    setIsMediaPieceModalOpen(true);
  };

  const handleEditMediaPiece = (piece: MediaPiece) => {
    setEditingMediaPiece(piece);
    setIsMediaPieceModalOpen(true);
  };

  const handleSaveMediaPiece = (pieceData: any) => {
    if (editingMediaPiece) {
      updateMediaPiece(editingMediaPiece.id, pieceData);
    } else {
      addMediaPiece(pieceData);
    }
  };

  // Handlers for Content Items
  const handleOpenNewContentItem = () => {
    setEditingContentItem(null);
    setIsContentModalOpen(true);
  };

  const handleEditContentItem = (item: ContentItem) => {
    setEditingContentItem(item);
    setIsContentModalOpen(true);
  };

  const handleSaveContentItem = (itemData: any) => {
    if (editingContentItem) {
      updateContentItem(editingContentItem.id, itemData);
    } else {
      addContentItem(itemData);
    }
  };

  // Handlers for Spokespersons
  const handleOpenNewSpokesperson = () => {
    setEditingSpokesperson(null);
    setIsSpokespersonModalOpen(true);
  };

  const handleEditSpokesperson = (spk: Spokesperson) => {
    setEditingSpokesperson(spk);
    setIsSpokespersonModalOpen(true);
  };

  const handleSaveSpokesperson = (spkData: any) => {
    if (editingSpokesperson) {
      updateSpokesperson(editingSpokesperson.id, spkData);
    } else {
      addSpokesperson(spkData);
    }
  };

  // Handlers for Talking Points
  const handleOpenNewTalkingPoint = () => {
    setEditingTalkingPoint(null);
    setIsTalkingPointModalOpen(true);
  };

  const handleEditTalkingPoint = (tp: TalkingPoint) => {
    setEditingTalkingPoint(tp);
    setIsTalkingPointModalOpen(true);
  };

  const handleSaveTalkingPoint = (tpData: any) => {
    if (editingTalkingPoint) {
      updateTalkingPoint(editingTalkingPoint.id, tpData);
    } else {
      addTalkingPoint(tpData);
    }
  };

  // Handlers for Interventions
  const handleOpenNewIntervention = () => {
    setEditingIntervention(null);
    setIsInterventionModalOpen(true);
  };

  const handleEditIntervention = (inv: PublicIntervention) => {
    setEditingIntervention(inv);
    setIsInterventionModalOpen(true);
  };

  const handleSaveIntervention = (invData: any) => {
    if (editingIntervention) {
      updateIntervention(editingIntervention.id, invData);
    } else {
      addIntervention(invData);
    }
  };

  return (
    <div className="space-y-6">
      {/* Campaign Context Banner & Real Data Synchronizer */}
      <div className="bg-gradient-to-r from-violet-950/80 via-[#151528] to-purple-950/60 border border-violet-500/30 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-violet-600/30 border border-violet-500/40 flex items-center justify-center text-violet-300 shrink-0 shadow-inner">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-white tracking-wide uppercase">
                Campaña Activa: {candidatePoliticalName || candidateName}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                Datos Reales Vinculados
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Cargo: <strong className="text-violet-200">{candidateRole}</strong> • Territorio: <strong className="text-violet-200">{candidateTerritory}</strong> {candidateSlogan && `• Eslogan: "${candidateSlogan}"`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={handleSyncWithProgram}
            className="px-3 py-1.5 bg-violet-600/30 hover:bg-violet-600/50 text-violet-200 hover:text-white border border-violet-500/40 font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            title="Sincronizar ejes y propuestas del Programa de Gobierno con los Argumentarios"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Sincronizar Programa
          </button>
          <button
            onClick={resetToDefaultData}
            className="px-3 py-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 hover:text-red-100 border border-red-500/30 font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            title="Limpiar datos de prueba para ingresar datos reales de la campaña"
          >
            Limpiar Datos de Prueba
          </button>
        </div>
      </div>

      {syncFeedback && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 rounded-xl text-xs flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          {syncFeedback}
        </div>
      )}

      {/* Module Navigation Tabs */}
      <div className="bg-[#12121e] border border-white/10 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Sub-tabs List */}
        <div className="flex flex-wrap rounded-xl bg-[#18182a] border border-white/10 p-1 w-full md:w-auto gap-1">
          <button
            onClick={() => setActiveSubTab('resumen')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'resumen'
                ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Resumen & KPIs
          </button>

          <button
            onClick={() => setActiveSubTab('medios')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'medios'
                ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            Plan de Medios ({mediaPieces.length})
          </button>

          <button
            onClick={() => setActiveSubTab('redes')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'redes'
                ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Share2 className="w-4 h-4" />
            Redes & Kanban ({contentItems.length})
          </button>

          <button
            onClick={() => setActiveSubTab('vocerias')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'vocerias'
                ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Mic className="w-4 h-4" />
            Vocerías & Guiones ({spokespersons.length})
          </button>

          <button
            onClick={() => setActiveSubTab('analitica')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'analitica'
                ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Analítica
          </button>
        </div>

        {/* Global Quick Action Controls */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={() => setIsAICopyOpen(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold text-xs rounded-xl shadow-md shadow-violet-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Generador IA
          </button>
          <button
            onClick={resetToDefaultData}
            className="p-2 text-slate-400 hover:text-white bg-[#18182a] hover:bg-white/10 rounded-xl border border-white/5 transition-colors"
            title="Restablecer datos de demostración predeterminados"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tab Panels with Motion Animations */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
        >
          {activeSubTab === 'resumen' && (
            <CommunicationsDashboard
              kpis={kpis}
              mediaPieces={mediaPieces}
              socialChannels={socialChannels}
              contentItems={contentItems}
              interventions={interventions}
              weeklyTrend={weeklyTrend}
              topicSentiments={topicSentiments}
              onOpenAICopyGenerator={() => setIsAICopyOpen(true)}
              onOpenNewMediaPiece={handleOpenNewMediaPiece}
              onOpenNewContentItem={handleOpenNewContentItem}
              onNavigateTab={(tab) => setActiveSubTab(tab)}
            />
          )}

          {activeSubTab === 'medios' && (
            <MediaPlanSection
              mediaPieces={mediaPieces}
              onAddPiece={handleOpenNewMediaPiece}
              onEditPiece={handleEditMediaPiece}
              onDeletePiece={deleteMediaPiece}
              onChangeStatus={changeMediaPieceStatus}
              onOpenAICopy={() => setIsAICopyOpen(true)}
            />
          )}

          {activeSubTab === 'redes' && (
            <SocialMediaSection
              socialChannels={socialChannels}
              contentItems={contentItems}
              onToggleConnection={toggleChannelConnection}
              onAddContent={handleOpenNewContentItem}
              onEditContent={handleEditContentItem}
              onDeleteContent={deleteContentItem}
              onMoveStage={moveContentStage}
              onOpenAICopy={() => setIsAICopyOpen(true)}
            />
          )}

          {activeSubTab === 'vocerias' && (
            <SpokespersonsSection
              spokespersons={spokespersons}
              talkingPoints={talkingPoints}
              interventions={interventions}
              onAddSpokesperson={handleOpenNewSpokesperson}
              onEditSpokesperson={handleEditSpokesperson}
              onDeleteSpokesperson={deleteSpokesperson}
              onAddTalkingPoint={handleOpenNewTalkingPoint}
              onEditTalkingPoint={handleEditTalkingPoint}
              onDeleteTalkingPoint={deleteTalkingPoint}
              onAddIntervention={handleOpenNewIntervention}
              onEditIntervention={handleEditIntervention}
              onDeleteIntervention={deleteIntervention}
            />
          )}

          {activeSubTab === 'analitica' && (
            <AnalyticsSection
              kpis={kpis}
              mediaPieces={mediaPieces}
              socialChannels={socialChannels}
              contentItems={contentItems}
              spokespersons={spokespersons}
              interventions={interventions}
              weeklyTrend={weeklyTrend}
              topicSentiments={topicSentiments}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Modals */}
      <AICopyGeneratorModal
        isOpen={isAICopyOpen}
        onClose={() => setIsAICopyOpen(false)}
        onInsertToCalendar={(itemData) => {
          addContentItem(itemData as any);
        }}
        generateAICopy={generateAICopy}
      />

      <MediaPieceModal
        isOpen={isMediaPieceModalOpen}
        onClose={() => setIsMediaPieceModalOpen(false)}
        onSave={handleSaveMediaPiece}
        initialData={editingMediaPiece}
      />

      <ContentItemModal
        isOpen={isContentModalOpen}
        onClose={() => setIsContentModalOpen(false)}
        onSave={handleSaveContentItem}
        initialData={editingContentItem}
        onOpenAIGenerator={() => setIsAICopyOpen(true)}
      />

      <SpokespersonModal
        isOpen={isSpokespersonModalOpen}
        onClose={() => setIsSpokespersonModalOpen(false)}
        onSave={handleSaveSpokesperson}
        initialData={editingSpokesperson}
      />

      <TalkingPointModal
        isOpen={isTalkingPointModalOpen}
        onClose={() => setIsTalkingPointModalOpen(false)}
        onSave={handleSaveTalkingPoint}
        initialData={editingTalkingPoint}
      />

      <InterventionModal
        isOpen={isInterventionModalOpen}
        onClose={() => setIsInterventionModalOpen(false)}
        onSave={handleSaveIntervention}
        spokespersons={spokespersons}
        initialData={editingIntervention}
      />
    </div>
  );
};
