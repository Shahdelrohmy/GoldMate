import express, { type Express } from 'express'
import { errorHandler, notFound } from './middleware/error.js'
import { healthRouter } from './routes/health.js'
import { meRouter } from './routes/me.js'
import type { TokenVerifier } from './services/auth.js'

// Builds the Express app. No listening and no env reads here, so tests can create it freely.
export function createApp(deps: { verifyToken: TokenVerifier }): Express {
  const app = express()
  app.disable('x-powered-by')
  app.use(express.json({ limit: '1mb' }))

  app.use(healthRouter())
  app.use(meRouter(deps.verifyToken))
  // Next routers go here: prices, vault, zakat, calculators (see contracts/openapi.yaml).

  app.use(notFound)
  app.use(errorHandler)
  return app
}
