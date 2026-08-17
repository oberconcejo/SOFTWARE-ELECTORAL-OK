import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/src/lib/supabase';
import { useAuth } from '@/src/contexts/AuthContext';

export interface CandidateProfile {
  id?: string;
  client_id?: string;
  nombre: string;
  nombre_politico: string;
  cargo: string;
  partido: string;
  territorio: string;
  departamento?: string;
  municipio?: string;
  identificacion: string;
  eslogan: string;
  resumen_profesional: string;
  resena: string;
  foto_url: string;
  sello_inhabilidades: string;
}

export type SWOTCategoryKey = 'fortalezas' | 'oportunidades' | 'debilidades' | 'amenazas';

export interface SWOTCategoryData {
  description: string;
  availableVariables: string[];
  selectedVariables: string[];
}

export interface SWOTState {
  id?: string;
  fortalezas: SWOTCategoryData;
  oportunidades: SWOTCategoryData;
  debilidades: SWOTCategoryData;
  amenazas: SWOTCategoryData;
}

const DEFAULT_SWOT: SWOTState = {
  fortalezas: {
    description: 'Ventajas competitivas internas, solvencia ética y capacidades técnicas del candidato.',
    availableVariables: [
      'Trayectoria ética intachable (0 antecedentes judicial/fiscal)',
      'Experiencia técnica comprobada en gestión pública o privada',
      'Alto nivel de reconocimiento y carisma territorial',
      'Sólido respaldo de sectores académicos, juveniles e independientes',
      'Capacidad de oratoria y debate político de alto nivel',
      'Equipo técnico interdisciplinario altamente calificado'
    ],
    selectedVariables: []
  },
  oportunidades: {
    description: 'Variables del entorno exterior favorables para el crecimiento de la campaña electoral.',
    availableVariables: [
      'Alto descontento ciudadano con la administración o maquinaria saliente',
      'Crecimiento del voto de opinión e independiente en la zona',
      'Alianzas estratégicas con JAC, líderes comunales y gremios locales',
      'Coyuntura favorable para propuestas de tecnología e innovación',
      'Cobertura mediática abierta a propuestas disruptivas'
    ],
    selectedVariables: []
  },
  debilidades: {
    description: 'Factores internos a reforzar o estructurar en la campaña y su despliegue.',
    availableVariables: [
      'Reconocimiento territorial bajo en comunas/veredas periféricas',
      'Estructura de logística y movilización en proceso de consolidación',
      'Presupuesto inicial ajustado frente a candidaturas de maquinarias',
      'Bajo posicionamiento en sectores gremiales tradicionales',
      'Red de testigos electorales en fase temprana de reclutamiento'
    ],
    selectedVariables: []
  },
  amenazas: {
    description: 'Riesgos del entorno, oposición y factores externos adversos.',
    availableVariables: [
      'Ataques sistemáticos de desinformación y guerra sucia de opositores',
      'Uso indebido de recursos públicos y maquinarias clientelares por rivales',
      'Riesgo de alto abstencionismo en puestos de votación clave',
      'Prácticas clientelares y compra de votos en el territorio',
      'Polarización política extrema impulsada por medios tradicionales'
    ],
    selectedVariables: []
  }
};

export function useCandidateProfile() {
  const { user } = useAuth();
  const [candidate, setCandidate] = useState<CandidateProfile | null>(null);
  const [swot, setSwot] = useState<SWOTState>(DEFAULT_SWOT);
  const [loading, setLoading] = useState(true);
  const [savingCandidate, setSavingCandidate] = useState(false);
  const [savingSwot, setSavingSwot] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const canEdit = user?.role === 'SUPERADMIN' || user?.role === 'ADMIN_CLIENTE' || user?.role === 'ESTRATEGA';

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { session } } = supabase ? await supabase.auth.getSession() : { data: { session: null } };
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      // 1. Fetch Candidate
      try {
        const res = await fetch('/api/strategy/candidate', { headers });
        if (res.ok) {
          const json = await res.json();
          if (json.candidate && (json.candidate.nombre || json.candidate.identificacion || json.candidate.cargo)) {
            const raw = json.candidate;
            const meta = raw.redes_sociales || {};
            setCandidate({
              id: raw.id,
              client_id: raw.client_id,
              nombre: raw.nombre || '',
              nombre_politico: meta.nombre_politico || '',
              cargo: raw.cargo || '',
              partido: raw.partido || '',
              territorio: raw.territorio || (meta.municipio && meta.departamento ? `${meta.municipio}, ${meta.departamento}` : meta.departamento || ''),
              departamento: meta.departamento || raw.departamento || '',
              municipio: meta.municipio || raw.municipio || '',
              identificacion: raw.identificacion || '',
              eslogan: meta.eslogan || raw.propuesta_valor || '',
              resumen_profesional: meta.resumen_profesional || raw.perfil_profesional || '',
              resena: meta.resena || '',
              foto_url: raw.foto_url || '',
              sello_inhabilidades: meta.sello_inhabilidades || '100% Verificado'
            });
          } else {
            setCandidate(null);
          }
        } else {
          setCandidate(null);
        }
      } catch (err) {
        console.warn('Could not fetch candidate from API:', err);
        setCandidate(null);
      }

      // 2. Fetch SWOT
      try {
        const res = await fetch('/api/strategy/swot', { headers });
        if (res.ok) {
          const json = await res.json();
          if (json.swot) {
            const raw = json.swot;
            let meta: any = {};
            try {
              if (raw.conclusiones_ai) {
                meta = JSON.parse(raw.conclusiones_ai);
              }
            } catch (e) {
              // fallback
            }

            const parseCategory = (key: SWOTCategoryKey): SWOTCategoryData => {
              const selected = Array.isArray(raw[key]) ? raw[key] : DEFAULT_SWOT[key].selectedVariables;
              const available = meta?.availableVariables?.[key] || DEFAULT_SWOT[key].availableVariables;
              // Ensure all selected are also in available
              const mergedAvailable = Array.from(new Set([...available, ...selected]));
              const desc = meta?.descriptions?.[key] || DEFAULT_SWOT[key].description;
              return {
                description: desc,
                availableVariables: mergedAvailable,
                selectedVariables: selected
              };
            };

            setSwot({
              id: raw.id,
              fortalezas: parseCategory('fortalezas'),
              oportunidades: parseCategory('oportunidades'),
              debilidades: parseCategory('debilidades'),
              amenazas: parseCategory('amenazas')
            });
          }
        }
      } catch (err) {
        console.warn('Could not fetch SWOT from API:', err);
      }

    } catch (error) {
      console.error('Error fetching candidate/SWOT data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const saveCandidate = async (customCandidate?: CandidateProfile): Promise<boolean> => {
    if (!canEdit) {
      setMessage({ text: 'No tienes permisos para realizar esta acción.', type: 'error' });
      return false;
    }

    const toSave = customCandidate || candidate;
    setSavingCandidate(true);
    setMessage(null);

    try {
      const { data: { session } } = supabase ? await supabase.auth.getSession() : { data: { session: null } };
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const res = await fetch('/api/strategy/candidate', {
        method: 'POST',
        headers,
        body: JSON.stringify(toSave)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'No fue posible guardar los cambios. Intenta nuevamente.');
      }

      if (data.candidate?.id) {
        setCandidate(prev => ({ ...prev, id: data.candidate.id }));
      }

      setMessage({ text: 'Información del candidato guardada con éxito.', type: 'success' });
      return true;
    } catch (err: any) {
      console.error('Error saving candidate:', err);
      setMessage({ text: err.message || 'No fue posible guardar los cambios. Intenta nuevamente.', type: 'error' });
      return false;
    } finally {
      setSavingCandidate(false);
    }
  };

  const saveSWOT = async (customSwot?: SWOTState): Promise<boolean> => {
    if (!canEdit) {
      setMessage({ text: 'No tienes permisos para realizar esta acción.', type: 'error' });
      return false;
    }

    const toSave = customSwot || swot;
    setSavingSwot(true);

    try {
      const { data: { session } } = supabase ? await supabase.auth.getSession() : { data: { session: null } };
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const payload = {
        id: toSave.id,
        fortalezas: toSave.fortalezas.selectedVariables,
        oportunidades: toSave.oportunidades.selectedVariables,
        debilidades: toSave.debilidades.selectedVariables,
        amenazas: toSave.amenazas.selectedVariables,
        metadata: {
          descriptions: {
            fortalezas: toSave.fortalezas.description,
            oportunidades: toSave.oportunidades.description,
            debilidades: toSave.debilidades.description,
            amenazas: toSave.amenazas.description
          },
          availableVariables: {
            fortalezas: toSave.fortalezas.availableVariables,
            oportunidades: toSave.oportunidades.availableVariables,
            debilidades: toSave.debilidades.availableVariables,
            amenazas: toSave.amenazas.availableVariables
          }
        }
      };

      const res = await fetch('/api/strategy/swot', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'No fue posible guardar la matriz DOFA.');
      }

      if (data.swot?.id) {
        setSwot(prev => ({ ...prev, id: data.swot.id }));
      }
      return true;
    } catch (err: any) {
      console.error('Error saving SWOT:', err);
      setMessage({ text: 'No fue posible guardar la matriz DOFA.', type: 'error' });
      return false;
    } finally {
      setSavingSwot(false);
    }
  };

  const toggleVariable = (category: SWOTCategoryKey, variable: string) => {
    if (!canEdit) {
      setMessage({ text: 'No tienes permisos para realizar esta acción.', type: 'error' });
      return;
    }

    setSwot(prev => {
      const catData = prev[category];
      const isSelected = catData.selectedVariables.includes(variable);
      const newSelected = isSelected
        ? catData.selectedVariables.filter(v => v !== variable)
        : [...catData.selectedVariables, variable];

      const updatedCategory: SWOTCategoryData = {
        ...catData,
        selectedVariables: newSelected
      };

      const nextState: SWOTState = {
        ...prev,
        [category]: updatedCategory
      };

      // Auto-save in background
      saveSWOT(nextState);

      return nextState;
    });
  };

  const addVariable = (category: SWOTCategoryKey, newVarText: string) => {
    if (!canEdit) {
      setMessage({ text: 'No tienes permisos para realizar esta acción.', type: 'error' });
      return false;
    }

    const trimmed = newVarText.trim();
    if (!trimmed) {
      setMessage({ text: 'Ingresa una descripción para la nueva variable.', type: 'error' });
      return false;
    }

    let added = false;
    setSwot(prev => {
      const catData = prev[category];
      if (catData.availableVariables.includes(trimmed)) {
        // Just select it if already available
        if (!catData.selectedVariables.includes(trimmed)) {
          const nextState = {
            ...prev,
            [category]: {
              ...catData,
              selectedVariables: [...catData.selectedVariables, trimmed]
            }
          };
          saveSWOT(nextState);
          added = true;
          return nextState;
        }
        return prev;
      }

      const nextState: SWOTState = {
        ...prev,
        [category]: {
          ...catData,
          availableVariables: [...catData.availableVariables, trimmed],
          selectedVariables: [...catData.selectedVariables, trimmed]
        }
      };

      saveSWOT(nextState);
      added = true;
      return nextState;
    });

    if (added) {
      setMessage({ text: 'Variable agregada exitosamente.', type: 'success' });
    }
    return added;
  };

  const removeVariable = (category: SWOTCategoryKey, variable: string) => {
    if (!canEdit) {
      setMessage({ text: 'No tienes permisos para realizar esta acción.', type: 'error' });
      return;
    }

    setSwot(prev => {
      const catData = prev[category];
      const nextState: SWOTState = {
        ...prev,
        [category]: {
          ...catData,
          availableVariables: catData.availableVariables.filter(v => v !== variable),
          selectedVariables: catData.selectedVariables.filter(v => v !== variable)
        }
      };
      saveSWOT(nextState);
      return nextState;
    });
  };

  const updateVariable = (category: SWOTCategoryKey, oldVar: string, newVar: string): boolean => {
    if (!canEdit) {
      setMessage({ text: 'No tienes permisos para realizar esta acción.', type: 'error' });
      return false;
    }

    const trimmed = newVar.trim();
    if (!trimmed) {
      setMessage({ text: 'El texto de la variable no puede estar vacío.', type: 'error' });
      return false;
    }

    if (oldVar === trimmed) {
      return true;
    }

    let updated = false;
    setSwot(prev => {
      const catData = prev[category];
      const newAvailable = catData.availableVariables.map(v => v === oldVar ? trimmed : v);
      const newSelected = catData.selectedVariables.map(v => v === oldVar ? trimmed : v);

      const nextState: SWOTState = {
        ...prev,
        [category]: {
          ...catData,
          availableVariables: newAvailable,
          selectedVariables: newSelected
        }
      };
      saveSWOT(nextState);
      updated = true;
      return nextState;
    });

    if (updated) {
      setMessage({ text: 'Variable actualizada exitosamente.', type: 'success' });
    }
    return updated;
  };

  const updateCategoryDescription = (category: SWOTCategoryKey, description: string) => {
    if (!canEdit) return;
    setSwot(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        description
      }
    }));
  };

  const deleteCandidate = async (): Promise<boolean> => {
    if (!canEdit) {
      setMessage({ text: 'No tienes permisos para realizar esta acción.', type: 'error' });
      return false;
    }

    setSavingCandidate(true);
    try {
      const { data: { session } } = supabase ? await supabase.auth.getSession() : { data: { session: null } };
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const res = await fetch('/api/strategy/candidate', {
        method: 'DELETE',
        headers
      });

      if (!res.ok) {
        throw new Error('Error al eliminar el perfil del candidato');
      }

      setCandidate(null);
      setMessage({ text: 'Perfil del candidato eliminado con éxito.', type: 'success' });
      return true;
    } catch (err: any) {
      console.error('Error deleting candidate:', err);
      setMessage({ text: err.message || 'Error al eliminar el candidato', type: 'error' });
      return false;
    } finally {
      setSavingCandidate(false);
    }
  };

  return {
    candidate,
    setCandidate,
    swot,
    setSwot,
    loading,
    savingCandidate,
    savingSwot,
    canEdit,
    message,
    setMessage,
    saveCandidate,
    deleteCandidate,
    saveSWOT,
    toggleVariable,
    addVariable,
    removeVariable,
    updateVariable,
    updateCategoryDescription,
    refresh: fetchData
  };
}
