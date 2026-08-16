import { createClient } from '@supabase/supabase-js';

const normalizeSupabaseUrl = (url: string | undefined): string => {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    // Return just the origin (protocol + host + port)
    return parsed.origin;
  } catch (e) {
    // Fallback: strip trailing slash and sub-paths manually if URL parser fails
    return url.split('/rest/v1')[0].split('/auth/v1')[0].replace(/\/$/, '');
  }
};

const rawUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseUrl = normalizeSupabaseUrl(rawUrl);
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

// Diagnostic logs (safe)
if (process.env.NODE_ENV !== 'production') {
  console.log('[Supabase Diagnostic]', {
    hasUrl: !!rawUrl,
    normalizedUrl: supabaseUrl,
    hasKey: !!supabaseAnonKey,
    keyLength: supabaseAnonKey?.length,
  });
}

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// Mock functions for compatibility with existing code
export const testSupabaseConnection = async () => true;
export const registerNewClient = async () => ({ id: 'new-client' });
