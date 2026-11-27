import type { ErrorRequestHandler, RequestHandler } from 'express'
import { ZodError } from 'zod'

// AGENTS.md: errors look like { "error": { "code": "...", "message": "..." } } and never leak stack traces.
export class AppError extends Error {
  readonly status: number
  readonly code: string

  constructor(status: number, code: string, message: string) {
    super(message)
    this.status = status
    this.code = code
  }
}

export const notFound: RequestHandler = (_req, _res, next) => {
  next(new AppError(404, 'not_found', 'Route not found'))
}

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.status).json({ error: { code: err.code, message: err.message } })
    return
  }
  if (err instanceof ZodError) {
    res.status(400).json({ error: { code: 'validation_failed', message: err.issues.map((i) => i.message).join('; ') } })
    return
  }
  // Malformed JSON bodies from express.json()
  if (typeof err === 'object' && err !== null && (err as { type?: string }).type === 'entity.parse.failed') {
    res.status(400).json({ error: { code: 'invalid_json', message: 'Request body is not valid JSON' } })
    return
  }
  console.error('Unhandled error:', err instanceof Error ? err.message : 'unknown')
  res.status(500).json({ error: { code: 'internal_error', message: 'Something went wrong' } })
}
