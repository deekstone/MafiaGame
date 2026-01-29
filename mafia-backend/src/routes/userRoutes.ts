import { Router, Request, Response } from 'express'
import { Server } from 'socket.io'
import { NicknameManager } from '../services/nicknameManager'
import { ConnectionManager } from '../services/connectionManager'

/**
 * Create user routes
 */
export function createUserRoutes(io?: Server): Router {
  const router = Router()

  /**
   * Get current user details (id and nickname)
   * GET /api/user/me
   */
  router.get('/me', (req: Request, res: Response) => {
    try {
      const userId = req.userId!
      if (!userId) {
        return res.status(400).json({ error: 'User identity missing' })
      }

      const profile = NicknameManager.getProfile(userId)

      res.status(200).json({
        success: true,
        user: {
          id: userId,
          nickname: profile?.nickname || null,
          avatarSeed: profile?.avatarSeed || null,
        },
      })
    } catch (error) {
      console.error('Error getting user details:', error)
      res.status(500).json({
        error: 'Failed to get user details',
      })
    }
  })

  /**
   * Set user nickname
   * POST /api/user/nickname
   */
  router.post('/nickname', (req: Request, res: Response) => {
    try {
      const userId = req.userId!
      if (!userId) {
        return res.status(400).json({ error: 'User identity missing' })
      }

      const { nickname, avatarSeed } = req.body

      if (!nickname || typeof nickname !== 'string' || nickname.trim().length === 0) {
        return res.status(400).json({
          error: 'Nickname is required and must be a non-empty string',
        })
      }

      const trimmedNickname = nickname.trim()
      NicknameManager.setNickname(userId, trimmedNickname, avatarSeed)

      // Emit online players update if user is connected and io is available
      if (io && ConnectionManager.isUserConnected(userId)) {
        const onlinePlayers = ConnectionManager.getOnlinePlayers()
        io.emit('lobby:online-players', {
          success: true,
          players: onlinePlayers,
          count: onlinePlayers.length,
        })
      }

      res.status(200).json({
        success: true,
        nickname: trimmedNickname,
        avatarSeed: NicknameManager.getAvatarSeed(userId) || trimmedNickname,
        userId,
      })
    } catch (error) {
      console.error('Error setting nickname:', error)
      res.status(500).json({
        error: 'Failed to set nickname',
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  })

  /**
   * Get user nickname
   * GET /api/user/nickname
   */
  router.get('/nickname', (req: Request, res: Response) => {
    try {
      const userId = req.userId!
      if (!userId) {
        return res.status(400).json({ error: 'User identity missing' })
      }

      const profile = NicknameManager.getProfile(userId)

      res.status(200).json({
        success: true,
        nickname: profile?.nickname || null,
        avatarSeed: profile?.avatarSeed || null,
        userId,
      })
    } catch (error) {
      console.error('Error getting nickname:', error)
      res.status(500).json({
        error: 'Failed to get nickname',
      })
    }
  })

  /**
   * Get all online players
   * GET /api/user/online-players
   */
  router.get('/online-players', (req: Request, res: Response) => {
    try {
      const onlinePlayers = ConnectionManager.getOnlinePlayers()

      res.status(200).json({
        success: true,
        players: onlinePlayers,
        count: onlinePlayers.length,
      })
    } catch (error) {
      console.error('Error fetching online players:', error)
      res.status(500).json({
        error: 'Failed to fetch online players',
      })
    }
  })

  return router
}
