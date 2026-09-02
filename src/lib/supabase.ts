import { createClient } from '@supabase/supabase-js';

const url = (import.meta.env.VITE_SUPABASE_URL as string) || 'https://xbxwnjgnuyqnaszjsvni.supabase.co';
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || 'sb_publishable_eCLqGT1STxpIBTd_EHqYcw_RyDbX10p';

export const isSupabaseConfigured = Boolean(
  url && anonKey && !url.includes('placeholder')
);

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

