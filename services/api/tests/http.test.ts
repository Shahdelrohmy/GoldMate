import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { createApp } from '../src/app.js'
import { requireAuth, requireRole } from '../src/middleware/auth.js'
import { errorHandler } from '../src/middleware/error.js'
import type { AuthUser, TokenVerifier } from '../src/services/auth.js'
import express from 'express'

// Fake verifier: no Supabase needed in tests.
const users: Record<string, AuthUser> = {
  'token-individual': { id: 'u1', role: 'individual' },
  'token-admin': { id: 'u2', role: 'admin' },
}
const verifyToken: TokenVerifier = async (token) => users[token] ?? null

describe('GET /health', () => {
  it('returns ok without a token', async () => {
    const res = await request(createApp({ verifyToken })).get('/health')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ status: 'ok' })
  })
})

describe('GET /me (auth)', () => {
  const app = createApp({ verifyToken })

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

describe('errors', () => {
  it('unknown route gives the standard error shape', async () => {
    const res = await request(createApp({ verifyToken })).get('/nope')
    expect(res.status).toBe(404)
    expect(res.body).toEqual({ error: { code: 'not_found', message: 'Route not found' } })
  })

  it('bad JSON body gives 400', async () => {
    const res = await request(createApp({ verifyToken })).post('/health').set('Content-Type', 'application/json').send('{bad')
    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('invalid_json')
  })
})

describe('requireRole', () => {
  const app = express()
  app.get('/admin-only', requireAuth(verifyToken), requireRole('admin'), (_req, res) => {
    res.json({ ok: true })
  })
  app.use(errorHandler)

  it('403 for a non-admin', async () => {
    const res = await request(app).get('/admin-only').set('Authorization', 'Bearer token-individual')
    expect(res.status).toBe(403)
    expect(res.body.error.code).toBe('forbidden')
  })

  it('200 for an admin', async () => {
    const res = await request(app).get('/admin-only').set('Authorization', 'Bearer token-admin')
    expect(res.status).toBe(200)
  })
})
