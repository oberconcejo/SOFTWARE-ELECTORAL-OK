import { useState, useEffect } from 'react';
import { supabase } from '@/src/lib/supabase';
import { useAuth } from '@/src/contexts/AuthContext';

export interface TerritorialZone {
  id: string;
  clientId: string;
  nombre: string;
  lideresCount: number;
  votantesCount: number;
  metaVotos: number;
  cobertura: number;
  coordenadasX: number;
  coordenadasY: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface TerritorialSubdivision {
  id: string;
  zoneId: string;
  clientId: string;
  nombre: string;
  tipo: 'CORREGIMIENTO' | 'VEREDA';
  createdAt?: string;
}

export function useTerritory() {
  const { user } = useAuth();
  const [zones, setZones] = useState<TerritorialZone[]>([]);
  const [subdivisions, setSubdivisions] = useState<TerritorialSubdivision[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSubdivisions, setLoadingSubdivisions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchZones = async () => {
    if (!supabase || !user?.tenantId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('territorial_zones')
        .select('*')
        .eq('client_id', user.tenantId)
        .order('nombre');

      if (fetchError) throw fetchError;
      
      const mappedZones: TerritorialZone[] = (data || []).map(z => ({
        id: z.id,
        clientId: z.client_id,
        nombre: z.nombre,
        lideresCount: z.lideres_count || 0,
        votantesCount: z.votantes_count || 0,
        metaVotos: z.meta_votos || 0,
        cobertura: z.cobertura || 0,
        coordenadasX: z.coordenadas_x || 0,
        coordenadasY: z.coordenadas_y || 0,
        status: z.status || 'ACTIVE'
      }));

      setZones(mappedZones);
    } catch (err: any) {
      console.error('Error fetching territory zones:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubdivisions = async (zoneId?: string) => {
    if (!supabase || !user?.tenantId) return;

    try {
      setLoadingSubdivisions(true);
      let query = supabase
        .from('territorial_subdivisions')
        .select('*')
        .eq('client_id', user.tenantId);
      
      if (zoneId) {
        query = query.eq('zone_id', zoneId);
      }

      const { data, error: fetchError } = await query.order('nombre');

      if (fetchError) throw fetchError;

      const mappedSubdivisions: TerritorialSubdivision[] = (data || []).map(s => ({
        id: s.id,
        zoneId: s.zone_id,
        clientId: s.client_id,
        nombre: s.nombre,
        tipo: s.tipo,
        createdAt: s.created_at
      }));

      setSubdivisions(mappedSubdivisions);
    } catch (err: any) {
      console.error('Error fetching subdivisions:', err);
    } finally {
      setLoadingSubdivisions(false);
    }
  };

  const addZone = async (zone: Omit<TerritorialZone, 'id' | 'clientId'>) => {
    if (!supabase || !user?.tenantId) return null;

    try {
      const dbZone = {
        nombre: zone.nombre,
        lideres_count: zone.lideresCount,
        votantes_count: zone.votantesCount,
        meta_votos: zone.metaVotos,
        cobertura: zone.cobertura,
        coordenadas_x: zone.coordenadasX,
        coordenadas_y: zone.coordenadasY,
        status: zone.status,
        client_id: user.tenantId
      };

      const { data, error: addError } = await supabase
        .from('territorial_zones')
        .insert([dbZone])
        .select()
        .single();

      if (addError) throw addError;
      
      const mappedZone: TerritorialZone = {
        id: data.id,
        clientId: data.client_id,
        nombre: data.nombre,
        lideresCount: data.lideres_count,
        votantesCount: data.votantes_count,
        metaVotos: data.meta_votos,
        cobertura: data.cobertura,
        coordenadasX: data.coordenadas_x,
        coordenadasY: data.coordenadas_y,
        status: data.status
      };

      setZones([...zones, mappedZone]);
      return mappedZone;
    } catch (err: any) {
      console.error('Error adding zone:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchZones();
    fetchSubdivisions();
  }, [user?.tenantId]);

  return {
    zones,
    subdivisions,
    loading,
    loadingSubdivisions,
    error,
    refresh: fetchZones,
    refreshSubdivisions: fetchSubdivisions,
    addZone
  };
}
