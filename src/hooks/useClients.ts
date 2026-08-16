import { useState, useEffect } from 'react';
import { supabase } from '@/src/lib/supabase';
import { useAuth } from '@/src/contexts/AuthContext';
import { UserRole } from '@/src/types';

export interface Client {
  id: string;
  name: string;
  email: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'EXPIRED';
  plan: 'BASIC' | 'PRO' | 'ENTERPRISE';
  modules: string[];
  max_users: number;
  created_at: string;
  client_api_usage?: {
    total_assigned: number;
    total_consumed: number;
    last_query_at: string | null;
    status: string;
  }[];
}

export function useClients() {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = async () => {
    // SECURITY: Only SuperAdmin can fetch all clients
    if (!supabase || user?.role !== UserRole.SUPERADMIN) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Try with join first
      const { data, error: fetchError } = await supabase
        .from('clients')
        .select(`
          *,
          client_api_usage (
            total_assigned,
            total_consumed,
            last_query_at,
            status
          )
        `)
        .order('created_at', { ascending: false });

      if (fetchError) {
        // If error is about missing table, try without join
        if (fetchError.code === 'PGRST205' || fetchError.message?.includes('does not exist')) {
          console.warn('client_api_usage table missing, fetching clients without usage data');
          const { data: simpleData, error: simpleError } = await supabase
            .from('clients')
            .select('*')
            .order('created_at', { ascending: false });
          
          if (simpleError) throw simpleError;
          setClients(simpleData || []);
        } else {
          throw fetchError;
        }
      } else {
        setClients(data || []);
      }
    } catch (err: any) {
      console.error('Error fetching clients:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addClient = async (client: Omit<Client, 'id' | 'created_at'>) => {
    if (!supabase || user?.role !== UserRole.SUPERADMIN) return null;

    try {
      const { data, error: addError } = await supabase
        .from('clients')
        .insert([client])
        .select()
        .single();

      if (addError) throw addError;
      setClients([data, ...clients]);
      return data;
    } catch (err: any) {
      console.error('Error adding client:', err);
      throw err;
    }
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    if (!supabase || user?.role !== UserRole.SUPERADMIN) return null;

    try {
      const { data, error: updateError } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      setClients(clients.map(c => c.id === id ? data : c));
      return data;
    } catch (err: any) {
      console.error('Error updating client:', err);
      throw err;
    }
  };

  const deleteClient = async (id: string) => {
    if (!supabase || user?.role !== UserRole.SUPERADMIN) return false;

    try {
      const { error: deleteError } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      setClients(clients.filter(c => c.id !== id));
      return true;
    } catch (err: any) {
      console.error('Error deleting client:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchClients();
  }, [user?.role]);

  return {
    clients,
    loading,
    error,
    refresh: fetchClients,
    addClient,
    updateClient,
    deleteClient
  };
}
