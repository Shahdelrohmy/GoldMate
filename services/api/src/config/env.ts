import { z } from 'zod'

// Reads and validates environment variables once, at startup.
// Supabase renamed its keys: "secret key" (new) = "service_role key" (legacy). Either works here.
const schema = z
  .object({
    PORT: z.coerce.number().int().positive().default(3000),
    SUPABASE_URL: z.url(),
    SUPABASE_SECRET_KEY: z.string().min(1).optional(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  })
  .refine((v) => v.SUPABASE_SECRET_KEY !== undefined || v.SUPABASE_SERVICE_ROLE_KEY !== undefined, {
    message: 'Set SUPABASE_SECRET_KEY (or the legacy SUPABASE_SERVICE_ROLE_KEY)',
    path: ['SUPABASE_SECRET_KEY'],
  })

export type Env = {
  port: number
  supabaseUrl: string
  /** Backend-only key. It bypasses Row Level Security: never send it to the mobile app or the Admin web. */
  supabaseSecretKey: string
}

export function loadEnv(source: Record<string, string | undefined> = process.env): Env {
  const parsed = schema.safeParse(source)
  if (!parsed.success) {
    const problems = parsed.error.issues.map((i) => `${i.path.join('.') || 'env'}: ${i.message}`).join('; ')
    throw new Error(`Invalid environment: ${problems}`)
  }
  const v = parsed.data
  const key = v.SUPABASE_SECRET_KEY ?? v.SUPABASE_SERVICE_ROLE_KEY
  if (key === undefined) throw new Error('Invalid environment: missing Supabase secret key')
  return { port: v.PORT, supabaseUrl: v.SUPABASE_URL, supabaseSecretKey: key }
}
