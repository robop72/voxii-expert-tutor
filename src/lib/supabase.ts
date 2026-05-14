import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL ?? '';
const key = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

let _supabase: SupabaseClient | null = null;

if (url && key) {
  try {
    _supabase = createClient(url, key);
  } catch (e) {
    console.error('[supabase] createClient failed:', e);
  }
}

export const supabase = _supabase;
export const SUPABASE_ENABLED = _supabase !== null;
