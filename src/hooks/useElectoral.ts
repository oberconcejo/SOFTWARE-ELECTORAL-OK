import { useState, useEffect } from 'react';
import { supabase } from '@/src/lib/supabase';
import { useAuth } from '@/src/contexts/AuthContext';

export interface E14Record {
  id: string;
  client_id: string;
  mesa: string;
  puesto: string;
  votos: number;
  image_url?: string;
  status: 'PENDIENTE' | 'VALIDADO' | 'ERROR';
  verified_by?: string;
  created_at: string;
}

export function useElectoral() {
  const { user } = useAuth();
  const [records, setRecords] = useState<E14Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = async () => {
    if (!supabase || !user?.tenantId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('e14_records')
        .select('*')
        .eq('client_id', user.tenantId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setRecords(data || []);
    } catch (err: any) {
      console.error('Error fetching electoral records:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addRecord = async (record: Omit<E14Record, 'id' | 'client_id' | 'created_at'>) => {
    if (!supabase || !user?.tenantId) return null;

    try {
      const { data, error: addError } = await supabase
        .from('e14_records')
        .insert([{ ...record, client_id: user.tenantId }])
        .select()
        .single();

      if (addError) throw addError;
      setRecords([data, ...records]);
      return data;
    } catch (err: any) {
      console.error('Error adding E14 record:', err);
      throw err;
    }
  };

  const updateRecord = async (id: string, updates: Partial<E14Record>) => {
    if (!supabase || !user?.tenantId) return null;

    try {
      const { data, error: updateError } = await supabase
        .from('e14_records')
        .update(updates)
        .eq('id', id)
        .eq('client_id', user.tenantId) // SECURITY: Record must belong to the tenant
        .select()
        .single();

      if (updateError) throw updateError;
      setRecords(records.map(r => r.id === id ? data : r));
      return data;
    } catch (err: any) {
      console.error('Error updating E14 record:', err);
      throw err;
    }
  };

  const deleteRecord = async (id: string) => {
    if (!supabase || !user?.tenantId) return false;

    try {
      const { error: deleteError } = await supabase
        .from('e14_records')
        .delete()
        .eq('id', id)
        .eq('client_id', user.tenantId); // SECURITY: Record must belong to the tenant

      if (deleteError) throw deleteError;
      setRecords(records.filter(r => r.id !== id));
      return true;
    } catch (err: any) {
      console.error('Error deleting E14 record:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [user?.tenantId]);

  return {
    records,
    loading,
    error,
    refresh: fetchRecords,
    addRecord,
    updateRecord,
    deleteRecord
  };
}
