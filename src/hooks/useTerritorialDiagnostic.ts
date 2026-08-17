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
    if (!supabase || !tenantId || tenantId === 'default_tenant') {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [secRes, varRes, ficRes] = await Promise.all([
        supabase.from('sectors').select('*').order('created_at'),
        supabase.from('sector_variables').select('*').order('created_at'),
        supabase.from('territorial_fiches').select('*').order('created_at', { ascending: false })
      ]);

      if (secRes.data) {
        setSectors(secRes.data.map((s: any) => ({
          id: s.id,
          clientId: tenantId,
          name: s.nombre,
          description: s.descripcion,
          iconName: s.icon_name || 'Layers',
          color: s.color || '#6366f1',
          createdAt: s.created_at,
          updatedAt: s.updated_at
        })));
        
        if (secRes.data.length > 0 && !selectedSectorId) {
          setSelectedSectorId(secRes.data[0].id);
        }
      }

      if (varRes.data) {
        setVariables(varRes.data.map((v: any) => ({
          id: v.id,
          sectorId: v.sector_id,
          clientId: tenantId,
          name: v.nombre,
          description: v.descripcion,
          indicatorName: v.indicador_nombre,
          unit: v.unidad_medida,
          baselineValue: v.linea_base,
          targetValue: v.meta,
          currentValue: v.valor_actual,
          status: v.estado || 'EN_DIAGNOSTICO',
          createdAt: v.created_at,
          updatedAt: v.updated_at
        })));
      }

      if (ficRes.data) {
        setFiches(ficRes.data.map((f: any) => ({
          id: f.id,
          clientId: tenantId,
          comuna: f.comuna,
          corregimiento: f.corregimiento,
          barrio: f.barrio,
          sectorId: f.sector_id,
          sectorName: f.sector_name,
          category: f.categoria,
          impact: f.impacto || 'ALTO',
          problem: f.problematica,
          proposal: f.propuesta_solucion,
          isLinkedToGovProgram: f.viculado_programa || false,
          registeredBy: f.registrado_por,
          createdAt: f.created_at,
          updatedAt: f.updated_at
        })));
      }
    } catch (err: any) {
      console.error('Error loading territorial diagnostic data:', err);
      setError('No fue posible cargar los datos territoriales reales.');
    } finally {
      setLoading(false);
    }
  }, [tenantId, selectedSectorId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // --- SECTOR CRUD ---
  const createSector = async (data: { name: string; description?: string; iconName?: string; color?: string }) => {
    const trimmedName = data.name.trim();
    if (!trimmedName) throw new Error('El nombre del sector es obligatorio.');

    try {
      if (supabase && tenantId) {
        const { error } = await supabase.from('sectors').insert([{
          nombre: trimmedName,
          descripcion: data.description?.trim() || '',
          icon_name: data.iconName || 'Layers',
          color: data.color || '#6366f1'
        }]);

        if (error) throw error;
        await loadData();
      }
    } catch (err: any) {
      console.error('Error creating sector:', err);
      throw new Error(err.message || 'Error al guardar el sector.');
    }
  };

  const updateSector = async (id: string, data: { name: string; description?: string; iconName?: string; color?: string }) => {
    try {
      if (supabase && tenantId) {
        const { error } = await supabase.from('sectors').update({
          nombre: data.name.trim(),
          descripcion: data.description?.trim(),
          icon_name: data.iconName,
          color: data.color,
          updated_at: new Date().toISOString()
        }).eq('id', id);

        if (error) throw error;
        await loadData();
      }
    } catch (err: any) {
      console.error('Error updating sector:', err);
      throw new Error('Error al actualizar el sector.');
    }
  };

  const deleteSector = async (id: string) => {
    try {
      if (supabase && tenantId) {
        const { error } = await supabase.from('sectors').delete().eq('id', id);
        if (error) throw error;
        await loadData();
      }
    } catch (err: any) {
      console.error('Error deleting sector:', err);
      throw new Error('Error al eliminar el sector.');
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

    try {
      if (supabase && tenantId) {
        const { error } = await supabase.from('sector_variables').insert([{
          sector_id: data.sectorId,
          nombre: trimmedName,
          descripcion: data.description?.trim() || '',
          indicador_nombre: data.indicatorName?.trim() || '',
          unidad_medida: data.unit?.trim() || '%',
          linea_base: data.baselineValue?.toString(),
          meta: data.targetValue?.toString(),
          valor_actual: data.currentValue?.toString(),
          estado: data.status || 'EN_DIAGNOSTICO'
        }]);

        if (error) throw error;
        await loadData();
      }
    } catch (err: any) {
      console.error('Error creating variable:', err);
      throw new Error('Error al guardar la variable.');
    }
  };

  const updateVariable = async (id: string, data: Partial<SectorVariable>) => {
    try {
      if (supabase && tenantId) {
        const { error } = await supabase.from('sector_variables').update({
          nombre: data.name,
          descripcion: data.description,
          indicador_nombre: data.indicatorName,
          unidad_medida: data.unit,
          linea_base: data.baselineValue?.toString(),
          meta: data.targetValue?.toString(),
          valor_actual: data.currentValue?.toString(),
          estado: data.status,
          updated_at: new Date().toISOString()
        }).eq('id', id);

        if (error) throw error;
        await loadData();
      }
    } catch (err: any) {
      console.error('Error updating variable:', err);
      throw new Error('Error al actualizar la variable.');
    }
  };

  const deleteVariable = async (id: string) => {
    try {
      if (supabase && tenantId) {
        const { error } = await supabase.from('sector_variables').delete().eq('id', id);
        if (error) throw error;
        await loadData();
      }
    } catch (err: any) {
      console.error('Error deleting variable:', err);
      throw new Error('Error al eliminar la variable.');
    }
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

    try {
      if (supabase && tenantId) {
        const targetSector = sectors.find(s => s.id === data.sectorId);
        const { error } = await supabase.from('territorial_fiches').insert([{
          comuna: data.comuna.trim(),
          corregimiento: data.corregimiento?.trim() || '',
          barrio: data.barrio?.trim() || '',
          sector_id: data.sectorId,
          sector_name: targetSector?.name || data.category || 'General',
          categoria: data.category || targetSector?.name || 'General',
          impacto: data.impact || 'ALTO',
          problematica: data.problem.trim(),
          propuesta_solucion: data.proposal.trim(),
          viculado_programa: data.isLinkedToGovProgram || false,
          registrado_por: user?.displayName || user?.email || 'Usuario'
        }]);

        if (error) throw error;
        await loadData();
      }
    } catch (err: any) {
      console.error('Error creating fiche:', err);
      throw new Error('Error al guardar la ficha territorial.');
    }
  };

  const updateFiche = async (id: string, data: Partial<MicroLocalFiche>) => {
    try {
      if (supabase && tenantId) {
        const { error } = await supabase.from('territorial_fiches').update({
          comuna: data.comuna,
          corregimiento: data.corregimiento,
          barrio: data.barrio,
          sector_id: data.sectorId,
          sector_name: data.sectorName,
          categoria: data.category,
          impacto: data.impact,
          problematica: data.problem,
          propuesta_solucion: data.proposal,
          viculado_programa: data.isLinkedToGovProgram,
          updated_at: new Date().toISOString()
        }).eq('id', id);

        if (error) throw error;
        await loadData();
      }
    } catch (err: any) {
      console.error('Error updating fiche:', err);
      throw new Error('Error al actualizar la ficha territorial.');
    }
  };

  const deleteFiche = async (id: string) => {
    try {
      if (supabase && tenantId) {
        const { error } = await supabase.from('territorial_fiches').delete().eq('id', id);
        if (error) throw error;
        await loadData();
      }
    } catch (err: any) {
      console.error('Error deleting fiche:', err);
      throw new Error('Error al eliminar la ficha territorial.');
    }
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
