import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Admin client for the backend only (uses the secret key, bypasses RLS).
export function createAdminClient(url: string, secretKey: string): SupabaseClient {
  return createClient(url, secretKey, { auth: { persistSession: false, autoRefreshToken: false } })
}
