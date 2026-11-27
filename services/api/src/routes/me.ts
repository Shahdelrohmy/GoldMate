import { Router } from 'express'
import { currentUser, requireAuth } from '../middleware/auth.js'
import type { TokenVerifier } from '../services/auth.js'

// Who am I? Also the simplest way to test that a Supabase token and the role lookup work.
export function meRouter(verify: TokenVerifier): Router {
  const router = Router()
  router.get('/me', requireAuth(verify), (_req, res) => {
    const user = currentUser(res)
    res.status(200).json({ id: user.id, role: user.role })
  })
  return router
}
