import { useState, useEffect } from 'react';
import { supabase } from '@/src/lib/supabase';
import { useAuth } from '@/src/contexts/AuthContext';

export interface Voter {
  id: string;
  client_id: string;
  nombre: string;
  cedula: string;
  telefono: string;
  email?: string;
  comuna: string;
  puesto: string;
  mesa: number;
  intencion: 'Voto Seguro' | 'Simpatizante' | 'Indeciso' | 'Opositor';
  lider_id?: string;
  lider_nombre?: string;
  created_at: string;
}

export function useVoters() {
  const { user } = useAuth();
  const [voters, setVoters] = useState<Voter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVoters = async () => {
    if (!supabase || !user?.tenantId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('voters')
        .select('*')
        .eq('client_id', user.tenantId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setVoters(data || []);
    } catch (err: any) {
      console.error('Error fetching voters:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addVoter = async (voter: Omit<Voter, 'id' | 'client_id' | 'created_at'>) => {
    if (!supabase || !user?.tenantId) return null;

    try {
      const { data, error: addError } = await supabase
        .from('voters')
        .insert([{ ...voter, client_id: user.tenantId }])
        .select()
        .single();

      if (addError) throw addError;
      setVoters([data, ...voters]);
      return data;
    } catch (err: any) {
      console.error('Error adding voter:', err);
      throw err;
    }
  };

  const updateVoter = async (id: string, updates: Partial<Voter>) => {
    if (!supabase || !user?.tenantId) return null;

    try {
      const { data, error: updateError } = await supabase
        .from('voters')
        .update(updates)
        .eq('id', id)
        .eq('client_id', user.tenantId) // SECURITY: Record must belong to the tenant
        .select()
        .single();

      if (updateError) throw updateError;
      setVoters(voters.map(v => v.id === id ? data : v));
      return data;
    } catch (err: any) {
      console.error('Error updating voter:', err);
      throw err;
    }
  };

  const deleteVoter = async (id: string) => {
    if (!supabase || !user?.tenantId) return false;

    try {
      const { error: deleteError } = await supabase
        .from('voters')
        .delete()
        .eq('id', id)
        .eq('client_id', user.tenantId); // SECURITY: Record must belong to the tenant

      if (deleteError) throw deleteError;
      setVoters(voters.filter(v => v.id !== id));
      return true;
    } catch (err: any) {
      console.error('Error deleting voter:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchVoters();
  }, [user?.tenantId]);

  return {
    voters,
    loading,
    error,
    refresh: fetchVoters,
    addVoter,
    updateVoter,
    deleteVoter
  };
}
