import { useState, useEffect } from 'react';
import { supabase } from '@/src/lib/supabase';
import { useAuth } from '@/src/contexts/AuthContext';

export interface StrategicGoal {
  id: string;
  client_id: string;
  title: string;
  current_value: number;
  target_value: number;
  color: string;
  category: 'VOTES' | 'LEADERS' | 'VISITS' | 'POLLS' | 'OTHER';
  created_at: string;
}

export interface Milestone {
  id: string;
  client_id: string;
  title: string;
  date: string;
  status: 'COMPLETED' | 'UPCOMING' | 'WARNING';
  created_at: string;
}

export function useStrategy() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<StrategicGoal[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStrategyData = async () => {
    if (!supabase || !user?.tenantId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const [goalsRes, milestonesRes] = await Promise.all([
        supabase.from('strategic_goals').select('*').eq('client_id', user.tenantId).order('created_at'),
        supabase.from('milestones').select('*').eq('client_id', user.tenantId).order('date')
      ]);

      if (goalsRes.error) throw goalsRes.error;
      if (milestonesRes.error) throw milestonesRes.error;

      setGoals(goalsRes.data || []);
      setMilestones(milestonesRes.data || []);
    } catch (err: any) {
      console.error('Error fetching strategy data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStrategyData();
  }, [user?.tenantId]);

  return {
    goals,
    milestones,
    loading,
    error,
    refresh: fetchStrategyData
  };
}
