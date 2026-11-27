
import request from 'supertest'
import { describe, expect, it, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createApp } from '../src/app.js'
import { requireAuth, requireRole } from '../src/middleware/auth.js'
import { errorHandler } from '../src/middleware/error.js'
import type { AuthUser, TokenVerifier } from '../src/services/auth.js'
import express from 'express'

// Fake verifier: no real Supabase Auth needed in tests.
const users: Record<string, AuthUser> = {
  'token-individual': { id: 'u1', role: 'individual' },
  'token-admin': { id: 'u2', role: 'admin' },
}

const verifyToken: TokenVerifier = async (token) => users[token] ?? null

// Fake latest price returned by the database.
type LatestPriceResult = {
  data: {
    fetched_at: string
    ounce_usd: number
    usd_egp: number
    source: 'api' | 'manual'
  } | null
  error: { message: string } | null
}

let latestPriceResult: LatestPriceResult = {
  data: {
    fetched_at: '2026-11-27T19:49:50.000Z',
    ounce_usd: 3650,
    usd_egp: 54.693,
    source: 'api',
  },
  error: null,
}

// Mock Supabase query chain.
const query = {
  select: vi.fn(),
  order: vi.fn(),
  limit: vi.fn(),
  maybeSingle: vi.fn(async () => latestPriceResult),
}

query.select.mockReturnValue(query)
query.order.mockReturnValue(query)
query.limit.mockReturnValue(query)

const supabase = {
  from: vi.fn(() => query),
} as unknown as SupabaseClient

describe('GET /health', () => {
  it('returns ok without a token', async () => {
    const res = await request(createApp({ verifyToken, supabase })).get('/health')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ status: 'ok' })
  })
})

describe('GET /me (auth)', () => {
  const app = createApp({ verifyToken, supabase })

  it('401 without a token', async () => {
    const res = await request(app).get('/me')
    expect(res.status).toBe(401)
    expect(res.body.error.code).toBe('unauthorized')
  })

  it('401 with a bad token', async () => {
    const res = await request(app).get('/me').set('Authorization', 'Bearer nope')
    expect(res.status).toBe(401)
  })

  it('200 with a valid token returns id and role', async () => {
    const res = await request(app).get('/me').set('Authorization', 'Bearer token-individual')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ id: 'u1', role: 'individual' })
  })
})

describe('GET /prices/latest', () => {
  it('returns the latest prices for an authenticated user', async () => {
    latestPriceResult = {
      data: {
        fetched_at: '2026-11-27T19:49:50.000Z',
        ounce_usd: 3650,
        usd_egp: 54.693,
        source: 'api',
      },
      error: null,
    }

    const res = await request(createApp({ verifyToken, supabase }))
      .get('/prices/latest')
      .set('Authorization', 'Bearer token-individual')

    expect(res.status).toBe(200)
    expect(res.body).toEqual({
      fetched_at: '2026-11-27T19:49:50.000Z',
      ounce_usd: 3650,
      usd_egp: 54.693,
      gram_price_piasters: {
        '24': 641823,
        '21': 561595,
        '18': 481367,
      },
      source: 'api',
      is_estimate: true,
    })
  })

  it('returns 401 without an authentication token', async () => {
    const res = await request(createApp({ verifyToken, supabase }))
      .get('/prices/latest')

    expect(res.status).toBe(401)
    expect(res.body.error.code).toBe('unauthorized')
  })

  it('returns 404 when no price is available', async () => {
    latestPriceResult = { data: null, error: null }

    const res = await request(createApp({ verifyToken, supabase }))
      .get('/prices/latest')
      .set('Authorization', 'Bearer token-individual')

    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe('price_unavailable')
  })
})

describe('errors', () => {
  it('unknown route gives the standard error shape', async () => {
    const res = await request(createApp({ verifyToken, supabase })).get('/nope')
    expect(res.status).toBe(404)
    expect(res.body).toEqual({
      error: { code: 'not_found', message: 'Route not found' },
    })
  })

  it('bad JSON body gives 400', async () => {
    const res = await request(createApp({ verifyToken, supabase }))
      .post('/health')
      .set('Content-Type', 'application/json')
      .send('{bad')

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('invalid_json')
  })
})

describe('requireRole', () => {
  const app = express()

  app.get(
    '/admin-only',
    requireAuth(verifyToken),
    requireRole('admin'),
    (_req, res) => {
      res.json({ ok: true })
    },
  )

  app.use(errorHandler)

  it('403 for a non-admin', async () => {
    const res = await request(app)
      .get('/admin-only')
      .set('Authorization', 'Bearer token-individual')

    expect(res.status).toBe(403)
    expect(res.body.error.code).toBe('forbidden')
  })

  it('200 for an admin', async () => {
    const res = await request(app)
      .get('/admin-only')
      .set('Authorization', 'Bearer token-admin')

    expect(res.status).toBe(200)
  })
})
