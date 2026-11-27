import type { SupabaseClient } from '@supabase/supabase-js'
import { z } from 'zod'

export const roleSchema = z.enum(['individual', 'shop', 'admin'])
export type Role = z.infer<typeof roleSchema>
export type AuthUser = { id: string; role: Role }

/** Turns an access token into a user, or null if the token is not valid. Injected so tests need no Supabase. */
export type TokenVerifier = (token: string) => Promise<AuthUser | null>

// Asks Supabase Auth to validate the token (works with any key type), then reads the role from `profiles`.
// Trade-off: one extra network call per request. Fine for this project; switch to local JWT verification later if needed.
export function createSupabaseVerifier(client: SupabaseClient): TokenVerifier {
  return async (token) => {
    const { data, error } = await client.auth.getUser(token)
    if (error || !data.user) return null

    const { data: profile, error: profileError } = await client
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()
    if (profileError || !profile) return null

    const role = roleSchema.safeParse((profile as { role?: unknown }).role)
    if (!role.success) return null
    return { id: data.user.id, role: role.data }
  }
}
