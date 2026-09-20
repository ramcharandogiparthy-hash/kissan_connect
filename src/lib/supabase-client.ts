import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || 'https://xbxwnjgnuyqnaszjsvni.supabase.co';
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || 'sb_publishable_eCLqGT1STxpIBTd_EHqYcw_RyDbX10p';

export const typedSupabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// --------------------------------------------------------------------
// TYPED DATA ACCESS METHODS WITH ERROR HANDLING
// --------------------------------------------------------------------

/** Fetch user profile */
export async function getProfile(userId: string) {
  const { data, error } = await typedSupabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('[Supabase getProfile Error]:', error);
    throw new Error(error.message || 'Failed to fetch user profile.');
  }
  return data;
}

/** Update user profile */
export async function updateProfile(userId: string, updates: Database['public']['Tables']['profiles']['Update']) {
  const { data, error } = await typedSupabase
    .from('profiles')
    // @ts-expect-error - Postgrest generic schema overload resolution
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('[Supabase updateProfile Error]:', error);
    throw new Error(error.message || 'Failed to update profile.');
  }
  return data;
}

/** Get active MSP Rates */
export async function getActiveMSPRates() {
  const { data, error } = await typedSupabase
    .from('msp_prices')
    .select('*')
    .eq('is_active', true)
    .order('crop_name');

  if (error) {
    console.error('[Supabase getActiveMSPRates Error]:', error);
    throw new Error(error.message || 'Failed to fetch MSP rates.');
  }
  return data || [];
}

/** Create a new procurement token */
export async function createProcurementToken(tokenData: Database['public']['Tables']['tokens']['Insert']) {
  const { data, error } = await typedSupabase
    .from('tokens')
    // @ts-expect-error - Postgrest generic schema overload resolution
    .insert(tokenData)
    .select()
    .single();

  if (error) {
    console.error('[Supabase createProcurementToken Error]:', error);
    throw new Error(error.message || 'Failed to create procurement token.');
  }
  return data;
}

/** Get user's procurement tokens */
export async function getUserTokens(userId: string) {
  const { data, error } = await typedSupabase
    .from('tokens')
    .select('*, procurement_centers(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Supabase getUserTokens Error]:', error);
    throw new Error(error.message || 'Failed to fetch user tokens.');
  }
  return data || [];
}

/** Get user's payments with audit logs */
export async function getUserPayments(userId: string) {
  const { data, error } = await typedSupabase
    .from('payments')
    .select('*, payment_audit_logs(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Supabase getUserPayments Error]:', error);
    throw new Error(error.message || 'Failed to fetch payments.');
  }
  return data || [];
}
