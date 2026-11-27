import { describe, expect, it } from 'vitest'
import { loadEnv } from '../src/config/env.js'

const base = { SUPABASE_URL: 'https://example.supabase.co' }

describe('loadEnv', () => {
  it('accepts the new secret key and defaults PORT to 3000', () => {
    const env = loadEnv({ ...base, SUPABASE_SECRET_KEY: 'sb_secret_x' })
    expect(env.supabaseSecretKey).toBe('sb_secret_x')
    expect(env.port).toBe(3000)
  })

  it('accepts the legacy service_role key', () => {
    expect(loadEnv({ ...base, SUPABASE_SERVICE_ROLE_KEY: 'legacy', PORT: '4000' })).toMatchObject({ supabaseSecretKey: 'legacy', port: 4000 })
  })

  it('fails clearly when the key or URL is missing', () => {
    expect(() => loadEnv(base)).toThrow(/SUPABASE_SECRET_KEY/)
    expect(() => loadEnv({ SUPABASE_SECRET_KEY: 'x' })).toThrow(/SUPABASE_URL/)
  })
})
