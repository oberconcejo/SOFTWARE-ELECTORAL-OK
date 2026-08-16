import { supabase } from '@/src/lib/supabase';

export async function logAuditEvent(actorId: string, clientId: string, action: string, targetId: string, details: any) {
  try {
    const { error } = await supabase
      .from('audit_logs')
      .insert([
        {
          user_id: actorId,
          client_id: clientId,
          action: action,
          resource: targetId,
          details: details,
          timestamp: Date.now()
        }
      ]);
    
    if (error) throw error;
  } catch (err) {
    console.error('Audit Log Error:', err);
  }
}
