import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/src/lib/supabase';
import { useAuth } from '@/src/contexts/AuthContext';
import { 
  GovProgramInfo, 
  GovStrategicAxis, 
  GovProposal, 
  GovLegalRequirement,
  GovProgramStats,
  GovProgramStatus
} from '@/src/types/governmentProgram';
import { MicroLocalFiche } from '@/src/types/territorialDiagnostic';

const DEFAULT_LEGAL_REQUIREMENTS: GovLegalRequirement[] = [
  {
    id: 'req_1',
    code: 'CNE-01',
    requirement: 'Identificación y Vinculación Legal del Candidato',
    description: 'Inclusión explícita del nombre del candidato, filiación partidista o coalición, entidad territorial y período constitucional correspondiente.',
    legalBasis: 'Ley 131 de 1994 (Art. 3) y Ley 1475 de 2011',
    status: 'PENDIENTE',
    missingItems: 'Registrar datos generales del candidato y período'
  },
  {
    id: 'req_2',
    code: 'CNE-02',
    requirement: 'Diagnóstico Territorial Fundamentado',
    description: 'Diagnóstico integral de la situación actual del municipio o departamento, identificación de problemáticas y líneas base sectoriales.',
    legalBasis: 'Ley 152 de 1994 (Ley Orgánica del Plan de Desarrollo, Art. 31)',
    status: 'PENDIENTE',
    missingItems: 'Completar diagnóstico territorial y reseña contextual'
  },
  {
    id: 'req_3',
    code: 'CNE-03',
    requirement: 'Estructuración en Ejes / Líneas Estratégicas',
    description: 'Definición de pilares temáticos de desarrollo que orienten las acciones prioritarias de la administración.',
    legalBasis: 'Ley 131 de 1994 (Art. 3)',
    status: 'PENDIENTE',
    missingItems: 'Registrar al menos un eje estratégico estructurado'
  },
  {
    id: 'req_4',
    code: 'CNE-04',
    requirement: 'Proyectos y Metas Concretas Cuantificables',
    description: 'Relación de propuestas específicas con indicadores de impacto, metas verificables y plazos de ejecución.',
    legalBasis: 'Ley 152 de 1994 y directrices del Consejo Nacional Electoral (CNE)',
    status: 'PENDIENTE',
    missingItems: 'Formular proyectos con indicadores y metas definidas'
  },
  {
    id: 'req_5',
    code: 'CNE-05',
    requirement: 'Factibilidad Financiera y Fuentes de Recursos',
    description: 'Estimación de costos programáticos y fuentes proyectadas de financiación (SGP, recursos propios, regalías, cofinanciación).',
    legalBasis: 'Ley 1475 de 2011 y Ley 819 de 2003 (Marco Fiscal)',
    status: 'PENDIENTE',
    missingItems: 'Registrar estimación presupuestal y fuentes de financiación'
  },
  {
    id: 'req_6',
    code: 'CNE-06',
    requirement: 'Compromiso de Rendición de Cuentas y Voto Programático',
    description: 'Cláusula formal de cumplimiento del voto programático ante la ciudadanía y su posterior articulación al Plan de Desarrollo.',
    legalBasis: 'Ley 131 de 1994 (Art. 5) y Constitución Política (Art. 259)',
    status: 'PENDIENTE',
    missingItems: 'Verificar inclusión de compromisos de rendición de cuentas'
  }
];

export function useGovernmentProgram() {
  const { user, client } = useAuth();
  const tenantId = user?.tenantId || client?.id || 'default_tenant';

  const [programInfo, setProgramInfo] = useState<GovProgramInfo>({
    id: `gov_prog_${tenantId}`,
    clientId: tenantId,
    title: '',
    period: '',
    territory: '',
    candidateName: '',
    partyCoalition: '',
    slogan: '',
    status: 'BORRADOR',
    legalDeadline: '',
    historicalContext: '',
    diagnosticSummary: '',
    lastSyncDate: null,
    createdAt: new Date().toISOString()
  });

  const [axes, setAxes] = useState<GovStrategicAxis[]>([]);
  const [selectedAxisId, setSelectedAxisId] = useState<string | null>(null);
  const [proposals, setProposals] = useState<GovProposal[]>([]);
  const [legalRequirements, setLegalRequirements] = useState<GovLegalRequirement[]>(DEFAULT_LEGAL_REQUIREMENTS);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'IDLE' | 'SYNCED' | 'ERROR'>('IDLE');
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Storage keys for local tenant storage
  const PROGRAM_KEY = `gov_program_info_${tenantId}`;
  const AXES_KEY = `gov_program_axes_${tenantId}`;
  const PROPOSALS_KEY = `gov_program_proposals_${tenantId}`;
  const LEGAL_KEY = `gov_program_legal_${tenantId}`;

  // Load all initial program data
  const loadData = useCallback(async () => {
    if (!supabase || !tenantId || tenantId === 'default_tenant') {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Authoritative Supabase fetch
      const [progRes, axesRes, propRes] = await Promise.all([
        supabase.from('government_programs').select('*').eq('client_id', tenantId).maybeSingle(),
        supabase.from('strategic_axes').select('*').order('prioridad', { ascending: true }),
        supabase.from('proposals').select('*').order('created_at', { ascending: true })
      ]);

      if (progRes.data) {
        const p = progRes.data;
        setProgramInfo({
          id: p.id,
          clientId: p.client_id,
          title: p.nombre || '',
          period: p.periodo || '',
          territory: p.territorio || '',
          candidateName: '', // Link to candidates table if needed
          partyCoalition: '',
          slogan: '',
          status: p.estado || 'BORRADOR',
          legalDeadline: '',
          historicalContext: p.vision_general || '',
          diagnosticSummary: '',
          lastSyncDate: p.updated_at || null,
          createdAt: p.created_at,
          updatedAt: p.updated_at
        });
      }

      if (axesRes.data) {
        setAxes(axesRes.data.map((a: any) => ({
          id: a.id,
          programId: a.program_id,
          clientId: tenantId,
          axisNumber: a.prioridad || 1,
          name: a.nombre,
          description: a.descripcion || '',
          generalObjective: a.objetivo_principal || '',
          status: 'ACTIVO',
          createdAt: a.created_at
        })));
        
        if (axesRes.data.length > 0 && !selectedAxisId) {
          setSelectedAxisId(axesRes.data[0].id);
        }
      }

      if (propRes.data) {
        setProposals(propRes.data.map((pr: any) => ({
          id: pr.id,
          axisId: pr.axis_id,
          programId: '', 
          clientId: tenantId,
          code: pr.id.slice(0, 5),
          title: pr.nombre,
          description: pr.descripcion || '',
          relatedProblem: pr.problema_identificado || '',
          objective: pr.objetivo_especifico || '',
          indicatorName: pr.indicador_cumplimiento || '',
          targetValue: pr.meta_cuantitativa,
          estimatedBudget: pr.presupuesto_estimado != null ? Number(pr.presupuesto_estimado) : null,
          priority: pr.prioridad || 'ALTA',
          createdAt: pr.created_at
        })));
      }

    } catch (err: any) {
      console.error('Error loading government program:', err);
      setError('No fue posible cargar el Programa de Gobierno real.');
    } finally {
      setLoading(false);
    }
  }, [tenantId, selectedAxisId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Selected Axis
  const selectedAxis = useMemo(() => {
    if (!selectedAxisId) return axes[0] || null;
    return axes.find(a => a.id === selectedAxisId) || axes[0] || null;
  }, [axes, selectedAxisId]);

  // Proposals for selected Axis
  const currentAxisProposals = useMemo(() => {
    if (!selectedAxis) return [];
    return proposals.filter(p => p.axisId === selectedAxis.id);
  }, [proposals, selectedAxis]);

  // Dynamically compute legal compliance requirements based on real data
  const computedLegalRequirements = useMemo(() => {
    return legalRequirements.map(req => {
      let isFulfilled = false;
      let missing = '';

      switch (req.code) {
        case 'CNE-01':
          if (programInfo.candidateName && programInfo.territory && programInfo.period) {
            isFulfilled = true;
          } else {
            missing = 'Requiere candidato, territorio y período de gobierno registrados';
          }
          break;

        case 'CNE-02':
          if ((programInfo.diagnosticSummary && programInfo.diagnosticSummary.trim().length > 20) || (programInfo.historicalContext && programInfo.historicalContext.trim().length > 20)) {
            isFulfilled = true;
          } else {
            missing = 'Requiere resumen del diagnóstico territorial o reseña histórica registrada';
          }
          break;

        case 'CNE-03':
          if (axes.length > 0 && axes.some(a => a.generalObjective && a.generalObjective.trim().length > 5)) {
            isFulfilled = true;
          } else {
            missing = 'Requiere al menos una línea o eje estratégico con objetivo general registrado';
          }
          break;

        case 'CNE-04':
          if (proposals.length > 0 && proposals.some(p => p.indicatorName && p.targetValue != null)) {
            isFulfilled = true;
          } else {
            missing = 'Requiere proyectos con indicadores y metas definidas';
          }
          break;

        case 'CNE-05':
          if (proposals.some(p => p.estimatedBudget != null && p.estimatedBudget > 0)) {
            isFulfilled = true;
          } else {
            missing = 'Requiere al menos un proyecto con estimación presupuestal registrada';
          }
          break;

        case 'CNE-06':
          if (programInfo.title && axes.length > 0 && proposals.length > 0) {
            isFulfilled = true;
          } else {
            missing = 'Estructurar el documento con ejes y propuestas concretas para rendición de cuentas';
          }
          break;

        default:
          isFulfilled = req.status === 'CUMPLIDO';
          missing = req.missingItems || '';
      }

      return {
        ...req,
        status: isFulfilled ? ('CUMPLIDO' as const) : ('PENDIENTE' as const),
        missingItems: isFulfilled ? 'Requisito validado satisfactoriamente' : missing
      };
    });
  }, [legalRequirements, programInfo, axes, proposals]);

  // General Statistics & Indicators
  const stats: GovProgramStats = useMemo(() => {
    const strategicAxesCount = axes.length;
    const proposalsCount = proposals.length;
    
    // Count proposals with real indicators
    const indicatorsCount = proposals.filter(p => p.indicatorName && p.indicatorName.trim() !== '').length;

    // Sum estimated budget
    const totalEstimatedBudget = proposals.reduce((acc, p) => acc + (p.estimatedBudget || 0), 0);

    // Calculate legal compliance
    const fulfilledReqs = computedLegalRequirements.filter(r => r.status === 'CUMPLIDO').length;
    const legalCompliancePercentage = computedLegalRequirements.length > 0 
      ? Math.round((fulfilledReqs / computedLegalRequirements.length) * 100)
      : 0;

    // Calculate drafting progress (0-100%) based on real completeness
    let progressScore = 0;
    const maxScore = 7;

    if (programInfo.title && programInfo.territory && programInfo.candidateName) progressScore += 1;
    if (programInfo.historicalContext && programInfo.historicalContext.trim().length > 10) progressScore += 1;
    if (programInfo.diagnosticSummary && programInfo.diagnosticSummary.trim().length > 10) progressScore += 1;
    if (axes.length > 0) progressScore += 1;
    if (proposals.length > 0) progressScore += 1;
    if (indicatorsCount > 0) progressScore += 1;
    if (totalEstimatedBudget > 0) progressScore += 1;

    const draftingProgressPercentage = Math.round((progressScore / maxScore) * 100);

    return {
      strategicAxesCount,
      proposalsCount,
      legalCompliancePercentage,
      draftingProgressPercentage,
      totalEstimatedBudget,
      indicatorsCount
    };
  }, [axes, proposals, programInfo, computedLegalRequirements]);

  // Sincronización real con módulos existentes
  const resyncAllData = useCallback(async () => {
    setIsSyncing(true);
    setSyncStatus('IDLE');
    setSyncMessage(null);

    try {
      let syncedCandidate = '';
      let syncedTerritory = '';

      if (supabase && tenantId) {
        const { data: campaignData } = await supabase
          .from('campaigns')
          .select('*')
          .eq('client_id', tenantId)
          .maybeSingle();

        if (campaignData) {
          if (campaignData.candidato_nombre) syncedCandidate = campaignData.candidato_nombre;
          if (campaignData.municipio || campaignData.departamento) {
            syncedTerritory = [campaignData.municipio, campaignData.departamento].filter(Boolean).join(', ');
          }
        }

        const syncTimestamp = new Date().toISOString();

        await supabase.from('government_programs').upsert({
          client_id: tenantId,
          nombre: programInfo.title || 'Plan de Gobierno',
          territorio: programInfo.territory || syncedTerritory,
          estado: programInfo.status,
          updated_at: syncTimestamp
        });

        await loadData();
      }

      setSyncStatus('SYNCED');
      setSyncMessage('Sincronización de datos completada con el perfil de campaña y base de datos.');

    } catch (err: any) {
      console.error('Error during resync:', err);
      setSyncStatus('ERROR');
      setSyncMessage('No fue posible sincronizar los datos.');
    } finally {
      setIsSyncing(false);
    }
  }, [tenantId, programInfo, loadData]);

  // Update General Info
  const updateGeneralInfo = useCallback(async (data: Partial<GovProgramInfo>) => {
    try {
      if (supabase && tenantId) {
        const syncTimestamp = new Date().toISOString();
        const { error: upsertError } = await supabase.from('government_programs').upsert({
          client_id: tenantId,
          nombre: data.title || programInfo.title,
          periodo: data.period || programInfo.period,
          territorio: data.territory || programInfo.territory,
          estado: data.status || programInfo.status,
          vision_general: data.historicalContext || programInfo.historicalContext,
          updated_at: syncTimestamp
        });

        if (upsertError) throw upsertError;
        await loadData();
      }
      return true;
    } catch (err) {
      console.error('Error updating program general info:', err);
      throw new Error('No fue posible guardar los datos generales.');
    }
  }, [programInfo, tenantId, loadData]);

  // Update Historical Context
  const updateHistoricalContext = useCallback(async (text: string) => {
    return updateGeneralInfo({ historicalContext: text });
  }, [updateGeneralInfo]);

  // Update Diagnostic Summary
  const updateDiagnosticSummary = useCallback(async (text: string) => {
    return updateGeneralInfo({ diagnosticSummary: text });
  }, [updateGeneralInfo]);

  // --- CRUD EJES ESTRATÉGICOS ---

  const createAxis = useCallback(async (data: {
    name: string;
    description?: string;
    generalObjective: string;
    diagnosedProblem?: string;
    category?: string;
    iconName?: string;
    color?: string;
    status?: 'ACTIVO' | 'EN_REVISION' | 'COMPLETADO';
  }) => {
    if (!data.name.trim()) {
      throw new Error('El nombre de la línea estratégica es obligatorio.');
    }

    try {
      if (supabase && tenantId) {
        const { error } = await supabase.from('strategic_axes').insert([{
          program_id: programInfo.id,
          nombre: data.name.trim(),
          descripcion: data.description?.trim() || '',
          objetivo_principal: data.generalObjective?.trim() || '',
          prioridad: axes.length + 1
        }]);

        if (error) throw error;
        await loadData();
      }
    } catch (err: any) {
      console.error('Error creating axis:', err);
      throw new Error(err.message || 'No fue posible crear la línea estratégica.');
    }
  }, [axes.length, programInfo.id, tenantId, loadData]);

  const updateAxis = useCallback(async (id: string, data: Partial<GovStrategicAxis>) => {
    try {
      if (supabase && tenantId) {
        const { error } = await supabase.from('strategic_axes').update({
          nombre: data.name,
          descripcion: data.description,
          objetivo_principal: data.generalObjective,
          prioridad: data.axisNumber,
          updated_at: new Date().toISOString()
        }).eq('id', id);

        if (error) throw error;
        await loadData();
      }
    } catch (err: any) {
      console.error('Error updating axis:', err);
      throw new Error('No fue posible actualizar la línea estratégica.');
    }
  }, [tenantId, loadData]);

  const deleteAxis = useCallback(async (id: string, deleteRelatedProposals = false) => {
    try {
      if (supabase && tenantId) {
        if (deleteRelatedProposals) {
          await supabase.from('proposals').delete().eq('axis_id', id);
        }
        const { error } = await supabase.from('strategic_axes').delete().eq('id', id);
        if (error) throw error;
        await loadData();
      }
    } catch (err: any) {
      console.error('Error deleting axis:', err);
      throw new Error(err.message || 'No fue posible eliminar la línea estratégica.');
    }
  }, [tenantId, loadData]);

  // --- CRUD PROYECTOS Y PROPUESTAS ---

  const createProposal = useCallback(async (data: {
    axisId: string;
    title: string;
    description: string;
    code?: string;
    relatedProblem?: string;
    objective?: string;
    indicatorName?: string;
    indicatorUnit?: string;
    baselineValue?: string | number | null;
    targetValue?: string | number | null;
    timeframe?: string;
    estimatedBudget?: number | null;
    currency?: string;
    priority?: 'CRITICA' | 'ALTA' | 'MEDIA' | 'BAJA';
    territoryScope?: string;
    fundingSource?: string;
    sourceDiagnosticFicheId?: string;
  }) => {
    if (!data.title.trim()) {
      throw new Error('El título del programa o proyecto es obligatorio.');
    }
    if (!data.axisId) {
      throw new Error('Debe asociar la propuesta a una línea estratégica válida.');
    }

    try {
      if (supabase && tenantId) {
        const { error } = await supabase.from('proposals').insert([{
          axis_id: data.axisId,
          nombre: data.title.trim(),
          descripcion: data.description?.trim() || '',
          problema_identificado: data.relatedProblem?.trim() || '',
          objetivo_especifico: data.objective?.trim() || '',
          indicador_cumplimiento: data.indicatorName?.trim() || '',
          meta_cuantitativa: data.targetValue?.toString() || '',
          presupuesto_estimado: data.estimatedBudget,
          prioridad: data.priority || 'ALTA'
        }]);

        if (error) throw error;
        await loadData();
      }
    } catch (err: any) {
      console.error('Error creating proposal:', err);
      throw new Error(err.message || 'No fue posible registrar la propuesta.');
    }
  }, [tenantId, loadData]);

  const updateProposal = useCallback(async (id: string, data: Partial<GovProposal>) => {
    try {
      if (supabase && tenantId) {
        const { error } = await supabase.from('proposals').update({
          nombre: data.title,
          descripcion: data.description,
          problema_identificado: data.relatedProblem,
          objetivo_especifico: data.objective,
          indicador_cumplimiento: data.indicatorName,
          meta_cuantitativa: data.targetValue?.toString(),
          presupuesto_estimado: data.estimatedBudget,
          prioridad: data.priority,
          updated_at: new Date().toISOString()
        }).eq('id', id);

        if (error) throw error;
        await loadData();
      }
    } catch (err: any) {
      console.error('Error updating proposal:', err);
      throw new Error('No fue posible actualizar la propuesta.');
    }
  }, [tenantId, loadData]);

  const deleteProposal = useCallback(async (id: string) => {
    try {
      if (supabase && tenantId) {
        const { error } = await supabase.from('proposals').delete().eq('id', id);
        if (error) throw error;
        await loadData();
      }
    } catch (err: any) {
      console.error('Error deleting proposal:', err);
      throw new Error('No fue posible eliminar la propuesta.');
    }
  }, [tenantId, loadData]);

  // Import directly from Territorial Diagnostic MicroLocalFiche
  const importFicheAsProposal = useCallback(async (fiche: MicroLocalFiche, targetAxisId: string) => {
    const territoryScope = [fiche.comuna, fiche.barrio].filter(Boolean).join(' - ');
    return createProposal({
      axisId: targetAxisId,
      title: fiche.proposal || `Proyecto: ${fiche.problem.slice(0, 50)}...`,
      description: `Propuesta derivada del diagnóstico territorial micro-local en ${territoryScope}. Problemática identificada: ${fiche.problem}`,
      relatedProblem: fiche.problem,
      territoryScope,
      priority: fiche.impact === 'CRITICO' ? 'CRITICA' : fiche.impact === 'ALTO' ? 'ALTA' : 'MEDIA',
      sourceDiagnosticFicheId: fiche.id
    });
  }, [createProposal]);

  return {
    programInfo,
    axes,
    selectedAxis,
    selectedAxisId,
    setSelectedAxisId,
    proposals,
    currentAxisProposals,
    legalRequirements: computedLegalRequirements,
    stats,
    loading,
    error,
    isSyncing,
    syncStatus,
    syncMessage,
    resyncAllData,
    updateGeneralInfo,
    updateHistoricalContext,
    updateDiagnosticSummary,
    createAxis,
    updateAxis,
    deleteAxis,
    createProposal,
    updateProposal,
    deleteProposal,
    importFicheAsProposal,
    refresh: loadData
  };
}
