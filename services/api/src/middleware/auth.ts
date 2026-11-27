import type { RequestHandler, Response } from 'express'
import type { AuthUser, Role, TokenVerifier } from '../services/auth.js'
import { AppError } from './error.js'

/** Requires `Authorization: Bearer <Supabase access token>`. Puts the user on res.locals. */
export function requireAuth(verify: TokenVerifier): RequestHandler {
  return async (req, res, next) => {
    try {
      const [scheme, token] = (req.header('authorization') ?? '').split(' ')
      if (scheme?.toLowerCase() !== 'bearer' || !token) {
        throw new AppError(401, 'unauthorized', 'Missing bearer token')
      }
      const user = await verify(token)
      if (!user) throw new AppError(401, 'unauthorized', 'Invalid or expired token')
      res.locals['user'] = user
      next()
    } catch (err) {
      next(err)
    }
  }
}

/** Use after requireAuth: only the listed roles may continue. */
export function requireRole(...roles: Role[]): RequestHandler {
  return (_req, res, next) => {
    const user = currentUser(res)
    if (!roles.includes(user.role)) {
      next(new AppError(403, 'forbidden', 'You do not have access to this resource'))
      return
    }
    next()
  }
}

export function currentUser(res: Response): AuthUser {
  const user = res.locals['user'] as AuthUser | undefined
  if (!user) throw new AppError(401, 'unauthorized', 'Not signed in')
  return user
}
