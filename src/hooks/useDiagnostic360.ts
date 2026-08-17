import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/src/lib/supabase';
import { useAuth } from '@/src/contexts/AuthContext';
import { 
  Diagnostic360Record, 
  SourcesStatusReport 
} from '@/src/types/diagnostic360';

export function useDiagnostic360() {
  const { user } = useAuth();
  const [sourcesReport, setSourcesReport] = useState<SourcesStatusReport | null>(null);
  const [activeDiagnostic, setActiveDiagnostic] = useState<Diagnostic360Record | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<Diagnostic360Record | null>(null);
  const [history, setHistory] = useState<Diagnostic360Record[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Helper to fetch auth headers
  const getAuthHeader = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        return { Authorization: `Bearer ${session.access_token}` };
      }
    } catch (e) {
      console.warn('Session check fallback:', e);
    }
    return {};
  }, []);

  // 1. Fetch Sources Readiness Status
  const fetchSourcesStatus = useCallback(async () => {
    try {
      const headers = await getAuthHeader();
      const res = await fetch('/api/strategy/diagnostic-360/sources-status', {
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      });
      if (!res.ok) throw new Error('Error al consultar estado de fuentes de información');
      const data = await res.json();
      if (data.success && data.report) {
        setSourcesReport(data.report);
      }
    } catch (err: any) {
      console.warn('Sources report notice:', err);
    }
  }, [getAuthHeader]);

  // 2. Fetch Latest Diagnostic
  const fetchLatestDiagnostic = useCallback(async () => {
    try {
      const headers = await getAuthHeader();
      const res = await fetch('/api/strategy/diagnostic-360/latest', {
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      });
      if (!res.ok) throw new Error('Error al consultar diagnóstico actual');
      const data = await res.json();
      if (data.success) {
        setActiveDiagnostic(data.diagnostic);
        setSelectedVersion(data.diagnostic);
      }
    } catch (err: any) {
      console.warn('Latest diagnostic fetch notice:', err);
    }
  }, [getAuthHeader]);

  // 3. Fetch Diagnostics History
  const fetchHistory = useCallback(async () => {
    try {
      const headers = await getAuthHeader();
      const res = await fetch('/api/strategy/diagnostic-360/history', {
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      });
      if (!res.ok) throw new Error('Error al consultar historial');
      const data = await res.json();
      if (data.success && Array.isArray(data.history)) {
        setHistory(data.history);
      }
    } catch (err: any) {
      console.warn('History fetch notice:', err);
    }
  }, [getAuthHeader]);

  // Initial Load
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      setError(null);
      await Promise.all([
        fetchSourcesStatus(),
        fetchLatestDiagnostic(),
        fetchHistory()
      ]);
      setLoading(false);
    };

    init();
  }, [fetchSourcesStatus, fetchLatestDiagnostic, fetchHistory]);

  // 4. Generate / Update Diagnostic with Progress Steps
  const generateDiagnostic = async () => {
    setIsGenerating(true);
    setError(null);
    setSuccessMessage(null);

    // Step 1
    setGenerationStep('Recopilando información del perfil, matriz DOFA y datos de campaña...');
    await new Promise(r => setTimeout(r, 600));

    try {
      // Step 2
      setGenerationStep('Procesando diagnóstico 360° con motor de inteligencia estratégica...');
      const headers = await getAuthHeader();
      const res = await fetch('/api/strategy/diagnostic-360/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      });

      // Step 3
      setGenerationStep('Consolidando fortalezas, riesgos prioritarios y recomendaciones de acción...');
      await new Promise(r => setTimeout(r, 500));

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Ocurrió un error al generar el diagnóstico.');
      }

      const data = await res.json();
      if (data.success && data.diagnostic) {
        setActiveDiagnostic(data.diagnostic);
        setSelectedVersion(data.diagnostic);
        setSuccessMessage(data.message || 'Diagnóstico 360° generado y guardado exitosamente.');
        await Promise.all([fetchHistory(), fetchSourcesStatus()]);
      }
    } catch (err: any) {
      console.error('Error generating diagnostic:', err);
      setError(err.message || 'No fue posible generar el diagnóstico. Verifique su conexión y permisos.');
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  // Switch displayed version
  const selectVersion = (versionNumber: number) => {
    const found = history.find(h => h.version === versionNumber);
    if (found) {
      setSelectedVersion(found);
    }
  };

  return {
    sourcesReport,
    activeDiagnostic: selectedVersion || activeDiagnostic,
    latestDiagnostic: activeDiagnostic,
    history,
    loading,
    isGenerating,
    generationStep,
    error,
    successMessage,
    generateDiagnostic,
    selectVersion,
    refreshSources: fetchSourcesStatus,
    clearMessages: () => {
      setError(null);
      setSuccessMessage(null);
    }
  };
}
