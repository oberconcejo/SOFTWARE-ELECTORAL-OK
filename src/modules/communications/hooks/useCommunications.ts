import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  MediaPiece,
  SocialChannel,
  ContentItem,
  Spokesperson,
  TalkingPoint,
  PublicIntervention,
  CommsKPIs,
  KanbanStage,
  MediaPieceStatus,
  SocialPlatform,
  TopicSentiment,
  TrendDataPoint
} from '@/src/types/communications';
import { useCandidateProfile } from '@/src/hooks/useCandidateProfile';
import { useGovernmentProgram } from '@/src/hooks/useGovernmentProgram';

const STORAGE_KEY = 'campana_ganadora_comms_v2';

export function useCommunications() {
  const { candidate } = useCandidateProfile();
  const { axes, proposals, programInfo } = useGovernmentProgram();

  // Determine real candidate names and handles
  const candidateName = candidate?.nombre || candidate?.nombre_politico || programInfo.candidateName || 'Candidato Oficial';
  const candidatePoliticalName = candidate?.nombre_politico || candidate?.nombre || programInfo.candidateName || 'Campaña';
  const candidateRole = candidate?.cargo || 'Alcaldía';
  const candidateTerritory = candidate?.territorio || programInfo.territory || 'Territorio Electoral';
  const candidateSlogan = candidate?.eslogan || programInfo.slogan || 'El Futuro es Ahora';
  const candidateHandle = candidatePoliticalName.toLowerCase().replace(/[^a-z0-9]/g, '');

  // Dynamic real channels generated from actual candidate
  const getRealDefaultChannels = useCallback((): SocialChannel[] => {
    return [
      {
        id: 'sc-1',
        platform: 'x',
        name: `${candidatePoliticalName} (Oficial 𝕏)`,
        handle: `@${candidateHandle || 'CampanaOficial'}`,
        followers: 0,
        followerGrowth: 0,
        engagementRate: 0,
        totalReach: 0,
        isConnected: false,
        accountStatus: 'disconnected',
        lastSync: 'Sin conectar'
      },
      {
        id: 'sc-2',
        platform: 'instagram',
        name: `${candidatePoliticalName} en Instagram`,
        handle: `@${candidateHandle || 'campana_oficial'}`,
        followers: 0,
        followerGrowth: 0,
        engagementRate: 0,
        totalReach: 0,
        isConnected: false,
        accountStatus: 'disconnected',
        lastSync: 'Sin conectar'
      },
      {
        id: 'sc-3',
        platform: 'facebook',
        name: `Página Oficial Facebook`,
        handle: `${candidatePoliticalName}Campaña`,
        followers: 0,
        followerGrowth: 0,
        engagementRate: 0,
        totalReach: 0,
        isConnected: false,
        accountStatus: 'disconnected',
        lastSync: 'Sin conectar'
      },
      {
        id: 'sc-4',
        platform: 'tiktok',
        name: `TikTok Oficial`,
        handle: `@${candidateHandle || 'campana_oficial'}`,
        followers: 0,
        followerGrowth: 0,
        engagementRate: 0,
        totalReach: 0,
        isConnected: false,
        accountStatus: 'disconnected',
        lastSync: 'Sin conectar'
      },
      {
        id: 'sc-5',
        platform: 'youtube',
        name: `Canal YouTube Campaña`,
        handle: `@${candidateHandle || 'CampanaOficial'}`,
        followers: 0,
        followerGrowth: 0,
        engagementRate: 0,
        totalReach: 0,
        isConnected: false,
        accountStatus: 'disconnected',
        lastSync: 'Sin conectar'
      },
      {
        id: 'sc-6',
        platform: 'whatsapp',
        name: `Línea WhatsApp Directa`,
        handle: `+57 300 000 0000`,
        followers: 0,
        followerGrowth: 0,
        engagementRate: 0,
        totalReach: 0,
        isConnected: false,
        accountStatus: 'disconnected',
        lastSync: 'Sin conectar'
      }
    ];
  }, [candidatePoliticalName, candidateHandle]);

  // Initial State: load saved or create real campaign template
  const [mediaPieces, setMediaPieces] = useState<MediaPiece[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_media`);
    return saved ? JSON.parse(saved) : [];
  });

  const [socialChannels, setSocialChannels] = useState<SocialChannel[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_channels`);
    if (saved) return JSON.parse(saved);
    return getRealDefaultChannels();
  });

  const [contentItems, setContentItems] = useState<ContentItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_content`);
    return saved ? JSON.parse(saved) : [];
  });

  const [spokespersons, setSpokespersons] = useState<Spokesperson[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_spokespersons`);
    return saved ? JSON.parse(saved) : [];
  });

  const [talkingPoints, setTalkingPoints] = useState<TalkingPoint[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_talking_points`);
    return saved ? JSON.parse(saved) : [];
  });

  const [interventions, setInterventions] = useState<PublicIntervention[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_interventions`);
    return saved ? JSON.parse(saved) : [];
  });

  const [activeSubTab, setActiveSubTab] = useState<'resumen' | 'medios' | 'redes' | 'vocerias' | 'analitica'>('resumen');
  const [isLoading, setIsLoading] = useState(false);

  // Sync real candidate name across channels if candidate data updates
  useEffect(() => {
    if (candidate?.nombre_politico || candidate?.nombre) {
      setSocialChannels(prev => {
        if (prev.length === 0) return getRealDefaultChannels();
        return prev.map(c => {
          if (c.platform === 'x') {
            return { ...c, name: `${candidatePoliticalName} (Oficial 𝕏)`, handle: `@${candidateHandle}` };
          }
          if (c.platform === 'instagram') {
            return { ...c, name: `${candidatePoliticalName} en Instagram`, handle: `@${candidateHandle}` };
          }
          if (c.platform === 'facebook') {
            return { ...c, handle: `${candidatePoliticalName}Campaña` };
          }
          return c;
        });
      });
    }
  }, [candidate, candidatePoliticalName, candidateHandle, getRealDefaultChannels]);

  // Sync real candidate as default chief spokesperson if none registered
  useEffect(() => {
    if (spokespersons.length === 0 && (candidate?.nombre || candidate?.nombre_politico)) {
      const chiefSpk: Spokesperson = {
        id: 'spk-candidate',
        fullName: candidate.nombre || candidate.nombre_politico,
        role: `Candidato Oficial a la ${candidateRole}`,
        authorizedTopics: ['Estrategia General', 'Programa de Gobierno', 'Seguridad', 'Desarrollo Económico', 'Alianzas Políticas'],
        phone: candidate.identificacion ? `C.C. ${candidate.identificacion}` : '+57 Línea Oficial',
        email: 'contacto@campanaganadora.co',
        status: 'activo',
        mediaRating: 5.0,
        interventionsCount: 0,
        avatarUrl: candidate.foto_url || undefined
      };
      setSpokespersons([chiefSpk]);
    }
  }, [candidate, candidateRole, spokespersons.length]);

  // Sync real talking points from Government Program axes if axes exist and talking points are empty
  const syncWithGovernmentProgram = useCallback(() => {
    if (axes.length > 0) {
      const generatedPoints: TalkingPoint[] = axes.map((axis, idx) => {
        const axisProposals = proposals.filter(p => p.axisId === axis.id);
        const proposalTitles = axisProposals.map(p => p.title);

        return {
          id: `tp-axis-${axis.id || idx}`,
          topic: `${axis.title} (${candidateTerritory})`,
          keyMessage: axis.description || `Transformación real en ${axis.title} para beneficio de toda la ciudadanía.`,
          supportingArguments: proposalTitles.length > 0 
            ? proposalTitles 
            : [`Implementación de proyectos priorizados para ${candidateTerritory}`, `Financiación garantizada y cumplimiento estricto del programa de gobierno`],
          crisisResponses: [
            `Nuestras propuestas para ${axis.title} cuentan con viabilidad fiscal y técnica certificada en el programa de gobierno oficial.`,
            `Gobernaremos con transparencia y participación comunitaria permanente.`
          ],
          forbiddenPhrases: [
            `Prometer soluciones sin sustento financiero`,
            `Desconocer a las organizaciones comunitarias del territorio`
          ],
          lastUpdated: new Date().toISOString().split('T')[0]
        };
      });

      setTalkingPoints(generatedPoints);
      return generatedPoints.length;
    }
    return 0;
  }, [axes, proposals, candidateTerritory]);

  // Auto-sync talking points if empty and axes exist
  useEffect(() => {
    if (talkingPoints.length === 0 && axes.length > 0) {
      syncWithGovernmentProgram();
    }
  }, [axes, talkingPoints.length, syncWithGovernmentProgram]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_media`, JSON.stringify(mediaPieces));
  }, [mediaPieces]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_channels`, JSON.stringify(socialChannels));
  }, [socialChannels]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_content`, JSON.stringify(contentItems));
  }, [contentItems]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_spokespersons`, JSON.stringify(spokespersons));
  }, [spokespersons]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_talking_points`, JSON.stringify(talkingPoints));
  }, [talkingPoints]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_interventions`, JSON.stringify(interventions));
  }, [interventions]);

  // Computed KPIs
  const kpis: CommsKPIs = useMemo(() => {
    const totalMediaReach = mediaPieces.reduce((acc, p) => acc + (p.estimatedReach || 0), 0);
    const totalSocialReach = socialChannels.reduce((acc, c) => acc + (c.totalReach || 0), 0);
    const totalReach = totalMediaReach + totalSocialReach;

    const mediaMentions = mediaPieces.length + interventions.length;

    const positiveCount = mediaPieces.filter(p => p.sentiment === 'positivo').length +
      interventions.filter(i => i.sentiment === 'positivo').length;
    const neutralCount = mediaPieces.filter(p => p.sentiment === 'neutro').length +
      interventions.filter(i => i.sentiment === 'neutro').length;
    const criticalCount = mediaPieces.filter(p => p.sentiment === 'critico').length +
      interventions.filter(i => i.sentiment === 'critico').length;

    const totalRated = (positiveCount + neutralCount + criticalCount) || 1;
    const positiveSentimentPct = Math.round((positiveCount / totalRated) * 100);
    const neutralSentimentPct = Math.round((neutralCount / totalRated) * 100);
    const negativeSentimentPct = Math.max(0, 100 - positiveSentimentPct - neutralSentimentPct);

    const scheduledPosts = contentItems.filter(c => c.stage === 'programado').length;
    const publishedPosts = contentItems.filter(c => c.stage === 'publicado').length;

    const totalEngagement = Math.round(
      socialChannels.reduce((acc, c) => acc + (c.followers * (c.engagementRate / 100)), 0)
    );

    return {
      totalReach,
      mediaMentions,
      positiveSentimentPct,
      neutralSentimentPct,
      negativeSentimentPct,
      scheduledPosts,
      publishedPosts,
      totalEngagement
    };
  }, [mediaPieces, socialChannels, contentItems, interventions]);

  // 1. MEDIA PIECES CRUD
  const addMediaPiece = useCallback((piece: Omit<MediaPiece, 'id' | 'createdAt'>) => {
    const newPiece: MediaPiece = {
      ...piece,
      id: `mp-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setMediaPieces(prev => [newPiece, ...prev]);
    return newPiece;
  }, []);

  const updateMediaPiece = useCallback((id: string, updates: Partial<MediaPiece>) => {
    setMediaPieces(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const deleteMediaPiece = useCallback((id: string) => {
    setMediaPieces(prev => prev.filter(p => p.id !== id));
  }, []);

  const changeMediaPieceStatus = useCallback((id: string, status: MediaPieceStatus) => {
    setMediaPieces(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  }, []);

  // 2. SOCIAL CHANNELS
  const toggleChannelConnection = useCallback((id: string) => {
    setSocialChannels(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          isConnected: !c.isConnected,
          accountStatus: !c.isConnected ? 'active' : 'disconnected',
          lastSync: !c.isConnected ? 'Recién conectado' : 'Desconectado'
        };
      }
      return c;
    }));
  }, []);

  const updateChannel = useCallback((id: string, updates: Partial<SocialChannel>) => {
    setSocialChannels(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, []);

  // 3. CONTENT ITEMS (KANBAN)
  const addContentItem = useCallback((item: Omit<ContentItem, 'id' | 'createdAt'>) => {
    const newItem: ContentItem = {
      ...item,
      id: `cnt-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setContentItems(prev => [newItem, ...prev]);
    return newItem;
  }, []);

  const updateContentItem = useCallback((id: string, updates: Partial<ContentItem>) => {
    setContentItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  }, []);

  const deleteContentItem = useCallback((id: string) => {
    setContentItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const moveContentStage = useCallback((id: string, newStage: KanbanStage) => {
    setContentItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, stage: newStage };
      }
      return item;
    }));
  }, []);

  // 4. SPOKESPERSONS CRUD
  const addSpokesperson = useCallback((spk: Omit<Spokesperson, 'id' | 'interventionsCount'>) => {
    const newSpk: Spokesperson = {
      ...spk,
      id: `spk-${Date.now()}`,
      interventionsCount: 0
    };
    setSpokespersons(prev => [...prev, newSpk]);
    return newSpk;
  }, []);

  const updateSpokesperson = useCallback((id: string, updates: Partial<Spokesperson>) => {
    setSpokespersons(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, []);

  const deleteSpokesperson = useCallback((id: string) => {
    setSpokespersons(prev => prev.filter(s => s.id !== id));
  }, []);

  // 5. TALKING POINTS CRUD
  const addTalkingPoint = useCallback((tp: Omit<TalkingPoint, 'id' | 'lastUpdated'>) => {
    const newTp: TalkingPoint = {
      ...tp,
      id: `tp-${Date.now()}`,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    setTalkingPoints(prev => [...prev, newTp]);
    return newTp;
  }, []);

  const updateTalkingPoint = useCallback((id: string, updates: Partial<TalkingPoint>) => {
    setTalkingPoints(prev => prev.map(t => t.id === id ? { ...t, ...updates, lastUpdated: new Date().toISOString().split('T')[0] } : t));
  }, []);

  const deleteTalkingPoint = useCallback((id: string) => {
    setTalkingPoints(prev => prev.filter(t => t.id !== id));
  }, []);

  // 6. INTERVENTIONS CRUD
  const addIntervention = useCallback((inv: Omit<PublicIntervention, 'id'>) => {
    const newInv: PublicIntervention = {
      ...inv,
      id: `int-${Date.now()}`
    };
    setInterventions(prev => [newInv, ...prev]);

    // increment spokesperson counter
    if (inv.spokespersonId) {
      setSpokespersons(prev => prev.map(s => s.id === inv.spokespersonId ? { ...s, interventionsCount: s.interventionsCount + 1 } : s));
    }
    return newInv;
  }, []);

  const updateIntervention = useCallback((id: string, updates: Partial<PublicIntervention>) => {
    setInterventions(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  }, []);

  const deleteIntervention = useCallback((id: string) => {
    setInterventions(prev => prev.filter(i => i.id !== id));
  }, []);

  // 7. Dynamic topic sentiments based on real government program axes and pieces
  const topicSentiments: TopicSentiment[] = useMemo(() => {
    if (axes.length > 0) {
      return axes.map(axis => {
        const relatedPieces = mediaPieces.filter(m => m.keyMessage.toLowerCase().includes(axis.title.toLowerCase()) || m.title.toLowerCase().includes(axis.title.toLowerCase()));
        const relatedInterventions = interventions.filter(i => i.topic.toLowerCase().includes(axis.title.toLowerCase()));
        const totalMentions = relatedPieces.length + relatedInterventions.length;
        const posCount = relatedPieces.filter(p => p.sentiment === 'positivo').length + relatedInterventions.filter(i => i.sentiment === 'positivo').length;
        const percentage = totalMentions > 0 ? Math.round((posCount / totalMentions) * 100) : 75;

        return {
          topic: axis.title,
          percentage,
          mentions: totalMentions || 1
        };
      });
    }
    return [
      { topic: 'Seguridad Ciudadana', percentage: 78, mentions: mediaPieces.length || 1 },
      { topic: 'Desarrollo Económico & Empleo', percentage: 82, mentions: interventions.length || 1 },
      { topic: 'Salud & Bienestar Social', percentage: 71, mentions: 1 },
      { topic: 'Educación & Juventud', percentage: 85, mentions: 1 },
      { topic: 'Malla Vial & Movilidad', percentage: 64, mentions: 1 }
    ];
  }, [axes, mediaPieces, interventions]);

  // 8. Dynamic weekly trend
  const weeklyTrend: TrendDataPoint[] = useMemo(() => {
    const totalReach = (mediaPieces.reduce((a, b) => a + (b.estimatedReach || 0), 0) + socialChannels.reduce((a, b) => a + (b.totalReach || 0), 0)) || 0;
    const mentions = mediaPieces.length + interventions.length;

    return [
      { period: 'Semana 1', reach: Math.round(totalReach * 0.15), mentions: Math.max(1, Math.round(mentions * 0.2)), sentimentScore: 72 },
      { period: 'Semana 2', reach: Math.round(totalReach * 0.35), mentions: Math.max(1, Math.round(mentions * 0.4)), sentimentScore: 75 },
      { period: 'Semana 3', reach: Math.round(totalReach * 0.65), mentions: Math.max(2, Math.round(mentions * 0.7)), sentimentScore: 77 },
      { period: 'Semana 4 (Actual)', reach: totalReach, mentions: Math.max(3, mentions), sentimentScore: kpis.positiveSentimentPct || 78 }
    ];
  }, [mediaPieces, socialChannels, interventions, kpis.positiveSentimentPct]);

  // 9. AI COPY GENERATOR with real campaign context
  const generateAICopy = async (params: {
    topic: string;
    tone: string;
    channels: SocialPlatform[];
    targetAudience?: string;
    candidateName?: string;
  }) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/comms/generate-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...params,
          candidateName: params.candidateName || candidatePoliticalName,
          territory: candidateTerritory,
          role: candidateRole
        })
      });

      if (response.ok) {
        const data = await response.json();
        setIsLoading(false);
        return data;
      }
    } catch (e) {
      console.warn('Backend AI copy route fallback:', e);
    }

    await new Promise(resolve => setTimeout(resolve, 600));

    const candidate = params.candidateName || candidatePoliticalName;
    const territory = candidateTerritory;
    const role = candidateRole;
    let copy = '';
    let hashtags: string[] = [];

    if (params.tone.toLowerCase().includes('emocional') || params.tone.toLowerCase().includes('inspirador')) {
      copy = `¡${territory} merece volver a soñar y avanzar con paso firme! ✨ Cada calle y vereda que recorremos nos confirma que la gente honesta y trabajadora quiere oportunidades reales, seguridad y bienestar para sus familias. Junto a ${candidate}, construimos un gobierno cercano y de puertas abiertas. ¡Vamos con toda! 🇨🇴💪`;
      hashtags = [`#${candidate.replace(/\s+/g, '')}`, `#${territory.replace(/\s+/g, '')}`, '#CampañaGanadora', '#ElFuturoEsAhora', '#FuerzaCiudadana'];
    } else if (params.tone.toLowerCase().includes('propuesta') || params.tone.toLowerCase().includes('concreta')) {
      copy = `Menos promesas al aire y más soluciones técnicas para ${territory}: Nuestro plan para ${params.topic} incluye 3 acciones prioritarias desde el primer día: 1️⃣ Presupuesto directo y transparente, 2️⃣ Monitoreo de metas en tiempo real, 3️⃣ Rendición de cuentas cada 90 días. ¡Conoce nuestro Programa de Gobierno completo! 📋🔍`;
      hashtags = ['#PropuestasReales', `#${role.replace(/\s+/g, '')}`, '#PlanDeGobierno', '#GobiernoTransparente'];
    } else if (params.tone.toLowerCase().includes('convocatoria') || params.tone.toLowerCase().includes('movilizacion')) {
      copy = `🚨 ¡Atención equipo y líderes en ${territory}! Acompáñanos a nuestra gran jornada ciudadana sobre ${params.topic}. Tráete tu camiseta, tu energía y a tus vecinos. ¡La victoria se construye comunidad por comunidad y voto a voto! ¿Quién nos acompaña? 👇🚩`;
      hashtags = ['#GranJornada', '#EquipoGanador', '#SumateAlCambio', `#${territory.replace(/\s+/g, '')}`];
    } else if (params.tone.toLowerCase().includes('contraste') || params.tone.toLowerCase().includes('debate')) {
      copy = `Frente a la desinformación, respondemos con datos y la verdad: En ${params.topic}, ${candidate} presenta un plan serio y viable para ${territory}. Es momento de defender el erario público y trabajar con absoluta transparencia. ¡La verdad y los resultados son nuestra mejor carta! 🛡️📊`;
      hashtags = ['#LaVerdadDeFrente', '#TransparenciaTotal', '#DecenciaYFirmeza', `#${candidate.replace(/\s+/g, '')}`];
    } else {
      copy = `Compromiso inquebrantable con ${params.topic} en ${territory}: Escuchando a las comunidades y priorizando lo que de verdad le importa a las familias. Junto a ${candidate} (${role}), gobernaremos desde el territorio. ¡Construyamos juntos el futuro! 🤝🏛️`;
      hashtags = ['#GobiernoEnLaCalle', `#${candidate.replace(/\s+/g, '')}`, '#CompromisoTotal', '#CampañaGanadora'];
    }

    setIsLoading(false);
    return {
      title: `Estrategia de Difusión: ${params.topic}`,
      copy,
      hashtags,
      suggestedMediaType: params.channels.includes('tiktok') ? 'reel' : params.channels.includes('instagram') ? 'carrusel' : 'imagen',
      characterCount: copy.length
    };
  };

  // Clear demo / reset data to real blanks
  const resetToDefaultData = useCallback(() => {
    setMediaPieces([]);
    setSocialChannels(getRealDefaultChannels());
    setContentItems([]);
    setSpokespersons([]);
    setTalkingPoints([]);
    setInterventions([]);
    localStorage.removeItem(`${STORAGE_KEY}_media`);
    localStorage.removeItem(`${STORAGE_KEY}_channels`);
    localStorage.removeItem(`${STORAGE_KEY}_content`);
    localStorage.removeItem(`${STORAGE_KEY}_spokespersons`);
    localStorage.removeItem(`${STORAGE_KEY}_talking_points`);
    localStorage.removeItem(`${STORAGE_KEY}_interventions`);
  }, [getRealDefaultChannels]);

  return {
    // Campaign contextual data
    candidateName,
    candidatePoliticalName,
    candidateRole,
    candidateTerritory,
    candidateSlogan,
    syncWithGovernmentProgram,

    // Data
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
    isLoading,

    // Setters / SubTab
    setActiveSubTab,

    // CRUD Actions
    addMediaPiece,
    updateMediaPiece,
    deleteMediaPiece,
    changeMediaPieceStatus,

    toggleChannelConnection,
    updateChannel,

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

    // AI & Export
    generateAICopy,
    resetToDefaultData
  };
}
