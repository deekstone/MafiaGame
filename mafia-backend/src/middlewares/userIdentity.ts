import { Request, Response, NextFunction } from 'express'
import { randomUUID } from 'crypto'

const USER_COOKIE = 'mafia_user_id'

export function userIdentity(req: Request, res: Response, next: NextFunction) {
  let userId = req.cookies?.[USER_COOKIE]
  console.log('userID', userId)
  if (!userId) {
    userId = randomUUID()
    res.cookie(USER_COOKIE, userId, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    })
  }

  // Attach to request (typed-safe access)
  ;(req as any).userId = userId
  next()
}
