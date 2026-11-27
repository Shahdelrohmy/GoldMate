
import { Router } from 'express'
import type { SupabaseClient } from '@supabase/supabase-js'
import { requireAuth } from '../middleware/auth.js'
import type { TokenVerifier } from '../services/auth.js'
import { getLatestPriceSnapshot } from '../services/prices.js'

export function pricesRouter(
  verifyToken: TokenVerifier,
  supabase: SupabaseClient,
): Router {
  const router = Router()

  router.get(
    '/prices/latest',
    requireAuth(verifyToken),
    async (_req, res, next) => {
      try {
        const snapshot = await getLatestPriceSnapshot(supabase)
        res.status(200).json(snapshot)
      } catch (error) {
        next(error)
      }
    },
  )

  return router
}
