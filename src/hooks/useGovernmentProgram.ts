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
    setLoading(true);
    setError(null);

    try {
      let loadedProgram: GovProgramInfo | null = null;
      let loadedAxes: GovStrategicAxis[] = [];
      let loadedProposals: GovProposal[] = [];
      let loadedLegal: GovLegalRequirement[] = [];

      // 1. Attempt Supabase fetch
      if (supabase && tenantId) {
        try {
          const [progRes, axesRes, propRes, legalRes] = await Promise.allSettled([
            supabase.from('government_programs').select('*').eq('client_id', tenantId).maybeSingle(),
            supabase.from('gov_strategic_axes').select('*').eq('client_id', tenantId).order('order_index', { ascending: true }),
            supabase.from('gov_proposals').select('*').eq('client_id', tenantId).order('created_at', { ascending: true }),
            supabase.from('gov_legal_requirements').select('*').eq('client_id', tenantId)
          ]);

          if (progRes.status === 'fulfilled' && progRes.value.data) {
            const p = progRes.value.data;
            loadedProgram = {
              id: p.id,
              clientId: p.client_id,
              title: p.title || '',
              period: p.period || '',
              territory: p.territory || '',
              candidateName: p.candidate_name || '',
              partyCoalition: p.party_coalition || '',
              slogan: p.slogan || '',
              status: p.status || 'BORRADOR',
              legalDeadline: p.legal_deadline || '',
              historicalContext: p.historical_context || '',
              diagnosticSummary: p.diagnostic_summary || '',
              lastSyncDate: p.last_sync_date || null,
              createdAt: p.created_at,
              updatedAt: p.updated_at
            };
          }

          if (axesRes.status === 'fulfilled' && axesRes.value.data && Array.isArray(axesRes.value.data)) {
            loadedAxes = axesRes.value.data.map((a: any) => ({
              id: a.id,
              programId: a.program_id,
              clientId: a.client_id,
              axisNumber: a.axis_number || 1,
              name: a.name,
              description: a.description || '',
              generalObjective: a.general_objective || '',
              diagnosedProblem: a.diagnosed_problem || '',
              category: a.category || '',
              iconName: a.icon_name || 'Target',
              color: a.color || '#6366f1',
              orderIndex: a.order_index ?? 0,
              status: a.status || 'ACTIVO',
              createdAt: a.created_at,
              updatedAt: a.updated_at
            }));
          }

          if (propRes.status === 'fulfilled' && propRes.value.data && Array.isArray(propRes.value.data)) {
            loadedProposals = propRes.value.data.map((pr: any) => ({
              id: pr.id,
              axisId: pr.axis_id,
              programId: pr.program_id,
              clientId: pr.client_id,
              code: pr.code,
              title: pr.title,
              description: pr.description || '',
              relatedProblem: pr.related_problem || '',
              objective: pr.objective || '',
              indicatorName: pr.indicator_name || '',
              indicatorUnit: pr.indicator_unit || '',
              baselineValue: pr.baseline_value,
              targetValue: pr.target_value,
              timeframe: pr.timeframe || 'CUATRIENAL',
              estimatedBudget: pr.estimated_budget != null ? Number(pr.estimated_budget) : null,
              currency: pr.currency || 'COP',
              priority: pr.priority || 'ALTA',
              territoryScope: pr.territory_scope || '',
              fundingSource: pr.funding_source || '',
              sourceDiagnosticFicheId: pr.source_diagnostic_fiche_id,
              createdAt: pr.created_at,
              updatedAt: pr.updated_at
            }));
          }

          if (legalRes.status === 'fulfilled' && legalRes.value.data && Array.isArray(legalRes.value.data) && legalRes.value.data.length > 0) {
            loadedLegal = legalRes.value.data.map((l: any) => ({
              id: l.id,
              code: l.code,
              requirement: l.requirement,
              description: l.description,
              legalBasis: l.legal_basis,
              status: l.status,
              missingItems: l.missing_items,
              observations: l.observations
            }));
          }
        } catch (e) {
          console.warn('Database fetch bypassed, using local tenant storage:', e);
        }
      }

      // 2. Fallback to LocalStorage
      if (!loadedProgram) {
        const storedProg = localStorage.getItem(PROGRAM_KEY);
        if (storedProg) {
          try {
            loadedProgram = JSON.parse(storedProg);
          } catch (e) {
            console.error('Error parsing stored program info', e);
          }
        }
      }

      if (loadedAxes.length === 0) {
        const storedAxes = localStorage.getItem(AXES_KEY);
        if (storedAxes) {
          try {
            loadedAxes = JSON.parse(storedAxes);
          } catch (e) {
            console.error('Error parsing stored axes', e);
          }
        }
      }

      if (loadedProposals.length === 0) {
        const storedProps = localStorage.getItem(PROPOSALS_KEY);
        if (storedProps) {
          try {
            loadedProposals = JSON.parse(storedProps);
          } catch (e) {
            console.error('Error parsing stored proposals', e);
          }
        }
      }

      if (loadedLegal.length === 0) {
        const storedLegal = localStorage.getItem(LEGAL_KEY);
        if (storedLegal) {
          try {
            loadedLegal = JSON.parse(storedLegal);
          } catch (e) {
            console.error('Error parsing stored legal matrix', e);
          }
        }
      }

      // If still no program, check if we can initialize from Client or CampaignData without inventing fake data
      if (loadedProgram) {
        setProgramInfo(loadedProgram);
      } else {
        const initialProg: GovProgramInfo = {
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
        };
        setProgramInfo(initialProg);
      }

      setAxes(loadedAxes);
      if (loadedAxes.length > 0) {
        setSelectedAxisId(loadedAxes[0].id);
      } else {
        setSelectedAxisId(null);
      }

      setProposals(loadedProposals);
      setLegalRequirements(loadedLegal.length > 0 ? loadedLegal : DEFAULT_LEGAL_REQUIREMENTS);

    } catch (err: any) {
      console.error('Error loading government program:', err);
      setError('No fue posible cargar el Programa de Gobierno. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  }, [tenantId, PROGRAM_KEY, AXES_KEY, PROPOSALS_KEY, LEGAL_KEY]);

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

  // Sincronización real con módulos existentes (Gestión Estratégica, Candidato, Diagnóstico Territorial)
  const resyncAllData = useCallback(async () => {
    setIsSyncing(true);
    setSyncStatus('IDLE');
    setSyncMessage(null);

    try {
      let syncedCandidate = '';
      let syncedTerritory = '';
      let syncedSlogan = '';
      let syncedParty = '';
      let syncedDiagnosticNotes = '';
      let linkedFichesCount = 0;

      // Check campaigns table or administrative data
      if (supabase && tenantId) {
        try {
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
        } catch (e) {
          console.warn('Could not sync from campaigns table:', e);
        }
      }

      // Check territorial diagnostic from local storage if available
      const fichesKey = `territorial_fiches_${tenantId}`;
      const storedFiches = localStorage.getItem(fichesKey);
      if (storedFiches) {
        try {
          const parsedFiches: MicroLocalFiche[] = JSON.parse(storedFiches);
          const govLinked = parsedFiches.filter(f => f.isLinkedToGovProgram);
          linkedFichesCount = govLinked.length;

          if (govLinked.length > 0) {
            syncedDiagnosticNotes = `Insumos territoriales priorizados: ${govLinked.length} problemática(s) y propuesta(s) registradas desde Diagnóstico Territorial.`;
          }
        } catch (e) {
          console.warn('Could not read territorial fiches for sync:', e);
        }
      }

      const syncTimestamp = new Date().toISOString();

      setProgramInfo(prev => {
        const updated: GovProgramInfo = {
          ...prev,
          candidateName: prev.candidateName || syncedCandidate,
          territory: prev.territory || syncedTerritory,
          partyCoalition: prev.partyCoalition || syncedParty,
          slogan: prev.slogan || syncedSlogan,
          diagnosticSummary: prev.diagnosticSummary || (syncedDiagnosticNotes || prev.diagnosticSummary),
          lastSyncDate: syncTimestamp,
          updatedAt: syncTimestamp
        };
        localStorage.setItem(PROGRAM_KEY, JSON.stringify(updated));
        return updated;
      });

      setSyncStatus('SYNCED');
      setSyncMessage(
        linkedFichesCount > 0 
          ? `Sincronización completada con éxito. ${linkedFichesCount} insumo(s) del Diagnóstico Territorial disponibles.`
          : 'Sincronización de datos completada con el perfil de campaña y diagnóstico territorial.'
      );

      // Persist to Supabase if connected
      if (supabase && tenantId) {
        try {
          await supabase.from('government_programs').upsert({
            id: programInfo.id,
            client_id: tenantId,
            title: programInfo.title,
            period: programInfo.period,
            territory: programInfo.territory || syncedTerritory,
            candidate_name: programInfo.candidateName || syncedCandidate,
            party_coalition: programInfo.partyCoalition || syncedParty,
            slogan: programInfo.slogan || syncedSlogan,
            status: programInfo.status,
            last_sync_date: syncTimestamp,
            updated_at: syncTimestamp
          });
        } catch (e) {
          console.warn('Could not upsert synced program to DB:', e);
        }
      }

    } catch (err: any) {
      console.error('Error during resync:', err);
      setSyncStatus('ERROR');
      setSyncMessage('No fue posible sincronizar los datos. Intenta nuevamente.');
    } finally {
      setIsSyncing(false);
    }
  }, [tenantId, PROGRAM_KEY, programInfo]);

  // Update General Info
  const updateGeneralInfo = useCallback(async (data: Partial<GovProgramInfo>) => {
    try {
      const updated: GovProgramInfo = {
        ...programInfo,
        ...data,
        updatedAt: new Date().toISOString()
      };

      setProgramInfo(updated);
      localStorage.setItem(PROGRAM_KEY, JSON.stringify(updated));

      if (supabase && tenantId) {
        try {
          await supabase.from('government_programs').upsert({
            id: updated.id,
            client_id: tenantId,
            title: updated.title,
            period: updated.period,
            territory: updated.territory,
            candidate_name: updated.candidateName,
            party_coalition: updated.partyCoalition,
            slogan: updated.slogan,
            status: updated.status,
            legal_deadline: updated.legalDeadline,
            historical_context: updated.historicalContext,
            diagnostic_summary: updated.diagnosticSummary,
            last_sync_date: updated.lastSyncDate,
            updated_at: updated.updatedAt
          });
        } catch (e) {
          console.warn('Could not update general info in DB:', e);
        }
      }
      return true;
    } catch (err) {
      console.error('Error updating program general info:', err);
      throw new Error('No fue posible guardar los datos generales.');
    }
  }, [programInfo, tenantId, PROGRAM_KEY]);

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
      const newAxisNumber = axes.length + 1;
      const newAxis: GovStrategicAxis = {
        id: `axis_${Date.now()}`,
        programId: programInfo.id,
        clientId: tenantId,
        axisNumber: newAxisNumber,
        name: data.name.trim(),
        description: data.description?.trim() || '',
        generalObjective: data.generalObjective?.trim() || '',
        diagnosedProblem: data.diagnosedProblem?.trim() || '',
        category: data.category?.trim() || 'Eje Estratégico',
        iconName: data.iconName || 'Target',
        color: data.color || '#6366f1',
        orderIndex: axes.length,
        status: data.status || 'ACTIVO',
        createdAt: new Date().toISOString()
      };

      const updatedAxes = [...axes, newAxis];
      setAxes(updatedAxes);
      setSelectedAxisId(newAxis.id);
      localStorage.setItem(AXES_KEY, JSON.stringify(updatedAxes));

      if (supabase && tenantId) {
        try {
          await supabase.from('gov_strategic_axes').insert([{
            id: newAxis.id,
            program_id: newAxis.programId,
            client_id: newAxis.clientId,
            axis_number: newAxis.axisNumber,
            name: newAxis.name,
            description: newAxis.description,
            general_objective: newAxis.generalObjective,
            diagnosed_problem: newAxis.diagnosedProblem,
            category: newAxis.category,
            icon_name: newAxis.iconName,
            color: newAxis.color,
            order_index: newAxis.orderIndex,
            status: newAxis.status,
            created_at: newAxis.createdAt
          }]);
        } catch (e) {
          console.warn('Could not insert axis to DB:', e);
        }
      }

      return newAxis;
    } catch (err: any) {
      console.error('Error creating axis:', err);
      throw new Error(err.message || 'No fue posible crear la línea estratégica.');
    }
  }, [axes, programInfo.id, tenantId, AXES_KEY]);

  const updateAxis = useCallback(async (id: string, data: Partial<GovStrategicAxis>) => {
    try {
      const updatedAxes = axes.map(a => {
        if (a.id === id) {
          return {
            ...a,
            ...data,
            updatedAt: new Date().toISOString()
          };
        }
        return a;
      });

      setAxes(updatedAxes);
      localStorage.setItem(AXES_KEY, JSON.stringify(updatedAxes));

      if (supabase && tenantId) {
        try {
          await supabase.from('gov_strategic_axes').update({
            name: data.name,
            description: data.description,
            general_objective: data.generalObjective,
            diagnosed_problem: data.diagnosedProblem,
            category: data.category,
            icon_name: data.iconName,
            color: data.color,
            status: data.status,
            order_index: data.orderIndex,
            updated_at: new Date().toISOString()
          }).eq('id', id);
        } catch (e) {
          console.warn('Could not update axis in DB:', e);
        }
      }
    } catch (err: any) {
      console.error('Error updating axis:', err);
      throw new Error('No fue posible actualizar la línea estratégica.');
    }
  }, [axes, tenantId, AXES_KEY]);

  const deleteAxis = useCallback(async (id: string, deleteRelatedProposals = false) => {
    try {
      const associatedProposals = proposals.filter(p => p.axisId === id);
      if (associatedProposals.length > 0 && !deleteRelatedProposals) {
        throw new Error(`Esta línea estratégica tiene ${associatedProposals.length} propuesta(s) asociada(s). Confirme si desea eliminarlas.`);
      }

      const updatedAxes = axes.filter(a => a.id !== id);
      setAxes(updatedAxes);
      localStorage.setItem(AXES_KEY, JSON.stringify(updatedAxes));

      let updatedProposals = proposals;
      if (deleteRelatedProposals) {
        updatedProposals = proposals.filter(p => p.axisId !== id);
        setProposals(updatedProposals);
        localStorage.setItem(PROPOSALS_KEY, JSON.stringify(updatedProposals));
      }

      if (selectedAxisId === id) {
        setSelectedAxisId(updatedAxes.length > 0 ? updatedAxes[0].id : null);
      }

      if (supabase && tenantId) {
        try {
          if (deleteRelatedProposals) {
            await supabase.from('gov_proposals').delete().eq('axis_id', id);
          }
          await supabase.from('gov_strategic_axes').delete().eq('id', id);
        } catch (e) {
          console.warn('Could not delete axis from DB:', e);
        }
      }
    } catch (err: any) {
      console.error('Error deleting axis:', err);
      throw new Error(err.message || 'No fue posible eliminar la línea estratégica.');
    }
  }, [axes, proposals, selectedAxisId, tenantId, AXES_KEY, PROPOSALS_KEY]);

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
      const axisProps = proposals.filter(p => p.axisId === data.axisId);
      const generatedCode = data.code || `PROP-${axisProps.length + 1}`;

      const newProposal: GovProposal = {
        id: `prop_${Date.now()}`,
        axisId: data.axisId,
        programId: programInfo.id,
        clientId: tenantId,
        code: generatedCode,
        title: data.title.trim(),
        description: data.description?.trim() || '',
        relatedProblem: data.relatedProblem?.trim() || '',
        objective: data.objective?.trim() || '',
        indicatorName: data.indicatorName?.trim() || '',
        indicatorUnit: data.indicatorUnit?.trim() || '',
        baselineValue: data.baselineValue ?? null,
        targetValue: data.targetValue ?? null,
        timeframe: data.timeframe || 'CUATRIENAL',
        estimatedBudget: data.estimatedBudget != null ? Number(data.estimatedBudget) : null,
        currency: data.currency || 'COP',
        priority: data.priority || 'ALTA',
        territoryScope: data.territoryScope?.trim() || '',
        fundingSource: data.fundingSource?.trim() || '',
        sourceDiagnosticFicheId: data.sourceDiagnosticFicheId,
        createdAt: new Date().toISOString()
      };

      const updatedProposals = [...proposals, newProposal];
      setProposals(updatedProposals);
      localStorage.setItem(PROPOSALS_KEY, JSON.stringify(updatedProposals));

      if (supabase && tenantId) {
        try {
          await supabase.from('gov_proposals').insert([{
            id: newProposal.id,
            axis_id: newProposal.axisId,
            program_id: newProposal.programId,
            client_id: newProposal.clientId,
            code: newProposal.code,
            title: newProposal.title,
            description: newProposal.description,
            related_problem: newProposal.relatedProblem,
            objective: newProposal.objective,
            indicator_name: newProposal.indicatorName,
            indicator_unit: newProposal.indicatorUnit,
            baseline_value: newProposal.baselineValue,
            target_value: newProposal.targetValue,
            timeframe: newProposal.timeframe,
            estimated_budget: newProposal.estimatedBudget,
            currency: newProposal.currency,
            priority: newProposal.priority,
            territory_scope: newProposal.territoryScope,
            funding_source: newProposal.fundingSource,
            source_diagnostic_fiche_id: newProposal.sourceDiagnosticFicheId,
            created_at: newProposal.createdAt
          }]);
        } catch (e) {
          console.warn('Could not insert proposal to DB:', e);
        }
      }

      return newProposal;
    } catch (err: any) {
      console.error('Error creating proposal:', err);
      throw new Error(err.message || 'No fue posible registrar la propuesta.');
    }
  }, [proposals, programInfo.id, tenantId, PROPOSALS_KEY]);

  const updateProposal = useCallback(async (id: string, data: Partial<GovProposal>) => {
    try {
      const updatedProposals = proposals.map(p => {
        if (p.id === id) {
          return {
            ...p,
            ...data,
            updatedAt: new Date().toISOString()
          };
        }
        return p;
      });

      setProposals(updatedProposals);
      localStorage.setItem(PROPOSALS_KEY, JSON.stringify(updatedProposals));

      if (supabase && tenantId) {
        try {
          await supabase.from('gov_proposals').update({
            title: data.title,
            description: data.description,
            code: data.code,
            related_problem: data.relatedProblem,
            objective: data.objective,
            indicator_name: data.indicatorName,
            indicator_unit: data.indicatorUnit,
            baseline_value: data.baselineValue,
            target_value: data.targetValue,
            timeframe: data.timeframe,
            estimated_budget: data.estimatedBudget,
            currency: data.currency,
            priority: data.priority,
            territory_scope: data.territoryScope,
            funding_source: data.fundingSource,
            updated_at: new Date().toISOString()
          }).eq('id', id);
        } catch (e) {
          console.warn('Could not update proposal in DB:', e);
        }
      }
    } catch (err: any) {
      console.error('Error updating proposal:', err);
      throw new Error('No fue posible actualizar la propuesta.');
    }
  }, [proposals, tenantId, PROPOSALS_KEY]);

  const deleteProposal = useCallback(async (id: string) => {
    try {
      const updatedProposals = proposals.filter(p => p.id !== id);
      setProposals(updatedProposals);
      localStorage.setItem(PROPOSALS_KEY, JSON.stringify(updatedProposals));

      if (supabase && tenantId) {
        try {
          await supabase.from('gov_proposals').delete().eq('id', id);
        } catch (e) {
          console.warn('Could not delete proposal from DB:', e);
        }
      }
    } catch (err: any) {
      console.error('Error deleting proposal:', err);
      throw new Error('No fue posible eliminar la propuesta.');
    }
  }, [proposals, tenantId, PROPOSALS_KEY]);

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
