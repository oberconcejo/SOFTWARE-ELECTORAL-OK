import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/src/lib/supabase';
import { useAuth } from '@/src/contexts/AuthContext';
import { 
  ThematicSector, 
  SectorVariable, 
  MicroLocalFiche, 
  SurveySyncState,
  VariableStatus,
  ImpactLevel 
} from '@/src/types/territorialDiagnostic';

export function useTerritorialDiagnostic() {
  const { user, client } = useAuth();
  const tenantId = user?.tenantId || client?.id || 'default_tenant';

  const [sectors, setSectors] = useState<ThematicSector[]>([]);
  const [selectedSectorId, setSelectedSectorId] = useState<string | null>(null);
  const [variables, setVariables] = useState<SectorVariable[]>([]);
  const [fiches, setFiches] = useState<MicroLocalFiche[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [surveySyncState, setSurveySyncState] = useState<SurveySyncState>({
    lastSyncDate: null,
    connectedSurveysCount: 0,
    isSyncing: false,
    status: 'IDLE'
  });

  // Local storage storage keys per tenant
  const SECTORS_KEY = `territorial_sectors_${tenantId}`;
  const VARIABLES_KEY = `territorial_variables_${tenantId}`;
  const FICHES_KEY = `territorial_fiches_${tenantId}`;
  const SYNC_KEY = `territorial_survey_sync_${tenantId}`;

  // Load Initial Data
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let loadedSectors: ThematicSector[] = [];
      let loadedVariables: SectorVariable[] = [];
      let loadedFiches: MicroLocalFiche[] = [];

      // 1. Check Supabase first if connected
      if (supabase && tenantId) {
        try {
          const [secRes, varRes, ficRes] = await Promise.allSettled([
            supabase.from('territorial_sectors').select('*').eq('client_id', tenantId).order('created_at'),
            supabase.from('sector_variables').select('*').eq('client_id', tenantId).order('created_at'),
            supabase.from('territorial_fiches').select('*').eq('client_id', tenantId).order('created_at', { ascending: false })
          ]);

          if (secRes.status === 'fulfilled' && secRes.value.data && !secRes.value.error) {
            loadedSectors = secRes.value.data.map((s: any) => ({
              id: s.id,
              clientId: s.client_id,
              name: s.name,
              description: s.description,
              iconName: s.icon_name || 'Layers',
              color: s.color || '#6366f1',
              createdAt: s.created_at,
              updatedAt: s.updated_at
            }));
          }

          if (varRes.status === 'fulfilled' && varRes.value.data && !varRes.value.error) {
            loadedVariables = varRes.value.data.map((v: any) => ({
              id: v.id,
              sectorId: v.sector_id,
              clientId: v.client_id,
              name: v.name,
              description: v.description,
              indicatorName: v.indicator_name,
              unit: v.unit,
              baselineValue: v.baseline_value,
              targetValue: v.target_value,
              currentValue: v.current_value,
              status: v.status || 'EN_DIAGNOSTICO',
              source: v.source,
              surveyId: v.survey_id,
              surveyTitle: v.survey_title,
              surveyFinding: v.survey_finding,
              createdAt: v.created_at,
              updatedAt: v.updated_at
            }));
          }

          if (ficRes.status === 'fulfilled' && ficRes.value.data && !ficRes.value.error) {
            loadedFiches = ficRes.value.data.map((f: any) => ({
              id: f.id,
              clientId: f.client_id,
              comuna: f.comuna,
              corregimiento: f.corregimiento,
              barrio: f.barrio,
              sectorId: f.sector_id,
              sectorName: f.sector_name,
              category: f.category,
              impact: f.impact || 'ALTO',
              problem: f.problem,
              proposal: f.proposal,
              isLinkedToGovProgram: f.is_linked_to_gov_program || false,
              govProgramPillarId: f.gov_program_pillar_id,
              registeredBy: f.registered_by,
              createdAt: f.created_at,
              updatedAt: f.updated_at
            }));
          }
        } catch (dbErr) {
          console.warn('Supabase query handled with fallback:', dbErr);
        }
      }

      // If nothing from DB or table not created, load from client-isolated local storage
      if (loadedSectors.length === 0) {
        const storedSectors = localStorage.getItem(SECTORS_KEY);
        if (storedSectors) {
          try {
            loadedSectors = JSON.parse(storedSectors);
          } catch (e) {
            console.error('Error parsing stored sectors', e);
          }
        }
      }

      if (loadedVariables.length === 0) {
        const storedVars = localStorage.getItem(VARIABLES_KEY);
        if (storedVars) {
          try {
            loadedVariables = JSON.parse(storedVars);
          } catch (e) {
            console.error('Error parsing stored variables', e);
          }
        }
      }

      if (loadedFiches.length === 0) {
        const storedFiches = localStorage.getItem(FICHES_KEY);
        if (storedFiches) {
          try {
            loadedFiches = JSON.parse(storedFiches);
          } catch (e) {
            console.error('Error parsing stored fiches', e);
          }
        }
      }

      // Check survey sync state from storage
      const storedSync = localStorage.getItem(SYNC_KEY);
      if (storedSync) {
        try {
          const parsed = JSON.parse(storedSync);
          setSurveySyncState(parsed);
        } catch (e) {}
      }

      setSectors(loadedSectors);
      setVariables(loadedVariables);
      setFiches(loadedFiches);

      if (loadedSectors.length > 0 && !selectedSectorId) {
        setSelectedSectorId(loadedSectors[0].id);
      }
    } catch (err: any) {
      console.error('Error loading territorial diagnostic data:', err);
      setError(err.message || 'No fue posible conectar con el servidor. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  }, [tenantId, SECTORS_KEY, VARIABLES_KEY, FICHES_KEY, SYNC_KEY, selectedSectorId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Persist helpers
  const saveSectors = (newSectors: ThematicSector[]) => {
    setSectors(newSectors);
    localStorage.setItem(SECTORS_KEY, JSON.stringify(newSectors));
  };

  const saveVariables = (newVars: SectorVariable[]) => {
    setVariables(newVars);
    localStorage.setItem(VARIABLES_KEY, JSON.stringify(newVars));
  };

  const saveFiches = (newFiches: MicroLocalFiche[]) => {
    setFiches(newFiches);
    localStorage.setItem(FICHES_KEY, JSON.stringify(newFiches));
  };

  // --- SECTOR CRUD ---
  const createSector = async (data: { name: string; description?: string; iconName?: string; color?: string }) => {
    const trimmedName = data.name.trim();
    if (!trimmedName) throw new Error('El nombre del sector es obligatorio.');

    // Check duplicates within client
    if (sectors.some(s => s.name.toLowerCase() === trimmedName.toLowerCase())) {
      throw new Error(`Ya existe un sector registrado con el nombre "${trimmedName}".`);
    }

    const newSector: ThematicSector = {
      id: 'sec_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      clientId: tenantId,
      name: trimmedName,
      description: data.description?.trim() || '',
      iconName: data.iconName || 'Layers',
      color: data.color || '#6366f1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (supabase && tenantId) {
      try {
        await supabase.from('territorial_sectors').insert([{
          id: newSector.id,
          client_id: tenantId,
          name: newSector.name,
          description: newSector.description,
          icon_name: newSector.iconName,
          color: newSector.color,
          created_at: newSector.createdAt
        }]);
      } catch (e) {
        console.warn('Supabase insert fallback to local storage:', e);
      }
    }

    const updated = [...sectors, newSector];
    saveSectors(updated);
    if (!selectedSectorId) {
      setSelectedSectorId(newSector.id);
    }
    return newSector;
  };

  const updateSector = async (id: string, data: { name: string; description?: string; iconName?: string; color?: string }) => {
    const trimmedName = data.name.trim();
    if (!trimmedName) throw new Error('El nombre del sector es obligatorio.');

    if (sectors.some(s => s.id !== id && s.name.toLowerCase() === trimmedName.toLowerCase())) {
      throw new Error(`Ya existe otro sector con el nombre "${trimmedName}".`);
    }

    const updated = sectors.map(s => {
      if (s.id === id) {
        return {
          ...s,
          name: trimmedName,
          description: data.description?.trim() || '',
          iconName: data.iconName || s.iconName,
          color: data.color || s.color,
          updatedAt: new Date().toISOString()
        };
      }
      return s;
    });

    if (supabase && tenantId) {
      try {
        await supabase.from('territorial_sectors').update({
          name: trimmedName,
          description: data.description?.trim() || '',
          icon_name: data.iconName,
          color: data.color,
          updated_at: new Date().toISOString()
        }).eq('id', id);
      } catch (e) {
        console.warn('Supabase update fallback:', e);
      }
    }

    saveSectors(updated);
  };

  const deleteSector = async (id: string) => {
    // Check dependencies
    const hasVariables = variables.some(v => v.sectorId === id);
    const hasFiches = fiches.some(f => f.sectorId === id);

    if (hasVariables || hasFiches) {
      throw new Error(
        `No se puede eliminar el sector porque tiene ${hasVariables ? 'variables asociadas' : ''} ${hasVariables && hasFiches ? 'y ' : ''}${hasFiches ? 'fichas territoriales vinculadas' : ''}. Elimine o reasigne esos elementos primero.`
      );
    }

    if (supabase && tenantId) {
      try {
        await supabase.from('territorial_sectors').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase delete fallback:', e);
      }
    }

    const updated = sectors.filter(s => s.id !== id);
    saveSectors(updated);

    if (selectedSectorId === id) {
      setSelectedSectorId(updated.length > 0 ? updated[0].id : null);
    }
  };

  // --- VARIABLES CRUD ---
  const createVariable = async (data: {
    sectorId: string;
    name: string;
    description?: string;
    indicatorName?: string;
    unit?: string;
    baselineValue?: string | number | null;
    targetValue?: string | number | null;
    currentValue?: string | number | null;
    status?: VariableStatus;
    source?: string;
    surveyId?: string;
    surveyTitle?: string;
    surveyFinding?: string;
  }) => {
    const trimmedName = data.name.trim();
    if (!trimmedName) throw new Error('El nombre de la variable es obligatorio.');
    if (!data.sectorId) throw new Error('El sector asociado es obligatorio.');

    const newVar: SectorVariable = {
      id: 'var_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      sectorId: data.sectorId,
      clientId: tenantId,
      name: trimmedName,
      description: data.description?.trim() || '',
      indicatorName: data.indicatorName?.trim() || '',
      unit: data.unit?.trim() || '%',
      baselineValue: data.baselineValue !== undefined && data.baselineValue !== '' ? data.baselineValue : null,
      targetValue: data.targetValue !== undefined && data.targetValue !== '' ? data.targetValue : null,
      currentValue: data.currentValue !== undefined && data.currentValue !== '' ? data.currentValue : null,
      status: data.status || 'EN_DIAGNOSTICO',
      source: data.source?.trim() || '',
      surveyId: data.surveyId,
      surveyTitle: data.surveyTitle,
      surveyFinding: data.surveyFinding?.trim() || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (supabase && tenantId) {
      try {
        await supabase.from('sector_variables').insert([{
          id: newVar.id,
          sector_id: newVar.sectorId,
          client_id: tenantId,
          name: newVar.name,
          description: newVar.description,
          indicator_name: newVar.indicatorName,
          unit: newVar.unit,
          baseline_value: newVar.baselineValue,
          target_value: newVar.targetValue,
          current_value: newVar.currentValue,
          status: newVar.status,
          source: newVar.source,
          survey_id: newVar.surveyId,
          survey_title: newVar.surveyTitle,
          survey_finding: newVar.surveyFinding,
          created_at: newVar.createdAt
        }]);
      } catch (e) {
        console.warn('Supabase insert variable fallback:', e);
      }
    }

    const updated = [...variables, newVar];
    saveVariables(updated);
    return newVar;
  };

  const updateVariable = async (id: string, data: Partial<SectorVariable>) => {
    const updated = variables.map(v => {
      if (v.id === id) {
        return {
          ...v,
          ...data,
          updatedAt: new Date().toISOString()
        };
      }
      return v;
    });

    if (supabase && tenantId) {
      try {
        await supabase.from('sector_variables').update({
          ...data,
          updated_at: new Date().toISOString()
        }).eq('id', id);
      } catch (e) {
        console.warn('Supabase update variable fallback:', e);
      }
    }

    saveVariables(updated);
  };

  const deleteVariable = async (id: string) => {
    if (supabase && tenantId) {
      try {
        await supabase.from('sector_variables').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase delete variable fallback:', e);
      }
    }

    const updated = variables.filter(v => v.id !== id);
    saveVariables(updated);
  };

  // --- FICHES CRUD ---
  const createFiche = async (data: {
    comuna: string;
    corregimiento?: string;
    barrio?: string;
    sectorId: string;
    category?: string;
    impact: ImpactLevel;
    problem: string;
    proposal: string;
    isLinkedToGovProgram?: boolean;
  }) => {
    if (!data.comuna.trim()) throw new Error('La comuna o corregimiento es obligatoria.');
    if (!data.problem.trim()) throw new Error('El problema diagnosticado es obligatorio.');
    if (!data.proposal.trim()) throw new Error('La propuesta programática es obligatoria.');

    const targetSector = sectors.find(s => s.id === data.sectorId);

    const newFiche: MicroLocalFiche = {
      id: 'fic_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      clientId: tenantId,
      comuna: data.comuna.trim(),
      corregimiento: data.corregimiento?.trim() || '',
      barrio: data.barrio?.trim() || '',
      sectorId: data.sectorId,
      sectorName: targetSector?.name || data.category || 'General',
      category: data.category || targetSector?.name || 'General',
      impact: data.impact || 'ALTO',
      problem: data.problem.trim(),
      proposal: data.proposal.trim(),
      isLinkedToGovProgram: data.isLinkedToGovProgram || false,
      registeredBy: user?.displayName || user?.email || 'Usuario',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (supabase && tenantId) {
      try {
        await supabase.from('territorial_fiches').insert([{
          id: newFiche.id,
          client_id: tenantId,
          comuna: newFiche.comuna,
          corregimiento: newFiche.corregimiento,
          barrio: newFiche.barrio,
          sector_id: newFiche.sectorId,
          sector_name: newFiche.sectorName,
          category: newFiche.category,
          impact: newFiche.impact,
          problem: newFiche.problem,
          proposal: newFiche.proposal,
          is_linked_to_gov_program: newFiche.isLinkedToGovProgram,
          registered_by: newFiche.registeredBy,
          created_at: newFiche.createdAt
        }]);
      } catch (e) {
        console.warn('Supabase insert fiche fallback:', e);
      }
    }

    const updated = [newFiche, ...fiches];
    saveFiches(updated);
    return newFiche;
  };

  const updateFiche = async (id: string, data: Partial<MicroLocalFiche>) => {
    const updated = fiches.map(f => {
      if (f.id === id) {
        return {
          ...f,
          ...data,
          updatedAt: new Date().toISOString()
        };
      }
      return f;
    });

    if (supabase && tenantId) {
      try {
        await supabase.from('territorial_fiches').update({
          ...data,
          updated_at: new Date().toISOString()
        }).eq('id', id);
      } catch (e) {
        console.warn('Supabase update fiche fallback:', e);
      }
    }

    saveFiches(updated);
  };

  const deleteFiche = async (id: string) => {
    if (supabase && tenantId) {
      try {
        await supabase.from('territorial_fiches').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase delete fiche fallback:', e);
      }
    }

    const updated = fiches.filter(f => f.id !== id);
    saveFiches(updated);
  };

  const toggleLinkGovProgram = async (ficheId: string) => {
    const fiche = fiches.find(f => f.id === ficheId);
    if (!fiche) return;

    const nextState = !fiche.isLinkedToGovProgram;
    await updateFiche(ficheId, { isLinkedToGovProgram: nextState });
    return nextState;
  };

  // --- SYNC OPINION POLLS (SONDEOS) ---
  const syncSurveys = async () => {
    setSurveySyncState(prev => ({ ...prev, isSyncing: true }));

    try {
      let realSurveysCount = 0;

      if (supabase && tenantId) {
        try {
          const { data, error: survErr } = await supabase
            .from('surveys')
            .select('id, titulo, descripcion, estado')
            .eq('client_id', tenantId);

          if (!survErr && data) {
            realSurveysCount = data.length;
          }
        } catch (e) {
          console.warn('Surveys table not queried:', e);
        }
      }

      // Check if local administrative surveys exist
      if (realSurveysCount === 0) {
        const localSurveysStr = localStorage.getItem(`admin_surveys_${tenantId}`);
        if (localSurveysStr) {
          try {
            const parsed = JSON.parse(localSurveysStr);
            realSurveysCount = Array.isArray(parsed) ? parsed.length : 0;
          } catch (e) {}
        }
      }

      const syncResult: SurveySyncState = {
        lastSyncDate: new Date().toISOString(),
        connectedSurveysCount: realSurveysCount,
        isSyncing: false,
        status: realSurveysCount > 0 ? 'SYNCED' : 'NO_SURVEYS',
        message: realSurveysCount > 0 
          ? `${realSurveysCount} sondeo(s) de opinión sincronizado(s) con éxito.` 
          : 'Sondeos de opinión no disponibles'
      };

      setSurveySyncState(syncResult);
      localStorage.setItem(SYNC_KEY, JSON.stringify(syncResult));
      return syncResult;
    } catch (err) {
      const errorResult: SurveySyncState = {
        lastSyncDate: surveySyncState.lastSyncDate,
        connectedSurveysCount: surveySyncState.connectedSurveysCount,
        isSyncing: false,
        status: 'ERROR',
        message: 'No fue posible sincronizar los sondeos. Intenta nuevamente.'
      };
      setSurveySyncState(errorResult);
      return errorResult;
    }
  };

  const selectedSector = sectors.find(s => s.id === selectedSectorId) || null;
  const currentSectorVariables = variables.filter(v => v.sectorId === selectedSectorId);

  return {
    sectors,
    selectedSectorId,
    setSelectedSectorId,
    selectedSector,
    variables,
    currentSectorVariables,
    fiches,
    loading,
    error,
    surveySyncState,
    syncSurveys,
    createSector,
    updateSector,
    deleteSector,
    createVariable,
    updateVariable,
    deleteVariable,
    createFiche,
    updateFiche,
    deleteFiche,
    toggleLinkGovProgram,
    refresh: loadData
  };
}
