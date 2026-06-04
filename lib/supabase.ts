import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const rawUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const rawAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

function isConfigured(value: string | undefined): value is string {
  return !!value && value.length > 10 && !value.startsWith('__PASTE');
}

export const SUPABASE_URL = isConfigured(rawUrl) ? rawUrl.replace(/\/+$/, '') : null;
export const SUPABASE_ANON_KEY = isConfigured(rawAnonKey) ? rawAnonKey : null;

export const supabase: SupabaseClient | null =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } })
    : null;

export function requireSupabaseConfig(): { url: string; anonKey: string } {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      'Supabase is not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env, then restart Expo with --clear.',
    );
  }
  return { url: SUPABASE_URL, anonKey: SUPABASE_ANON_KEY };
}

export function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env, then restart Expo with --clear.',
    );
  }
  return supabase;
}
