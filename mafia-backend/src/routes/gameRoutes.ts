import { Router, Request, Response } from 'express'
import { GameManager } from '../services/gameManager'
import { GameStatus } from '../types/game'
import { GameSocketHandler } from '../socket/gameSocket'
import { maskRolesForViewer } from '../utils/gameVisibility'
/**
 * Create game routes
 */
export function createGameRoutes(gameSocketHandler: GameSocketHandler): Router {
  const router = Router()

  // /**
  //  * Create a new game
  //  * Rule: one ACTIVE game per host
  //  */
  // router.post('/', (req: Request, res: Response) => {
  //   try {
  //     const body = req.body as CreateGameRequest

  //     // Validate request
  //     if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
  //       return res.status(400).json({
  //         error: 'Game name is required and must be a non-empty string',
  //       })
  //     }

  //     // ✅ Stable, server-generated identity
  //     const hostId = req.userId!
  //     if (!hostId) {
  //       return res.status(400).json({ error: 'User identity missing' })
  //     }

  //     // 🚨 Check if host already has an ACTIVE game
  //     const existingGame = GameManager.getGameByHostAndStatus(hostId, ['waiting', 'in-progress'])

  //     if (existingGame) {
  //       return res.status(409).json({
  //         error: 'You already have an active game',
  //         gameId: existingGame.id,
  //         status: existingGame.status,
  //       })
  //     }

  //     const game = GameManager.createGame(hostId, {
  //       name: body.name.trim(),
  //       maxPlayers: body.maxPlayers,
  //     })

  //     gameSocketHandler.emitGameCreated(game)

  //     res.status(201).json({
  //       success: true,
  //       game,
  //     })
  //   } catch (error) {
  //     console.error('Error creating game:', error)
  //     res.status(500).json({
  //       error: 'Failed to create game',
  //     })
  //   }
  // })

  /**
   * Cancel a game (host only)
   */
  router.post('/:gameId/cancel', (req: Request, res: Response) => {
    try {
      const { gameId } = req.params
      const hostId = req.userId!

      const game = GameManager.getGame(gameId)

      if (!game) {
        return res.status(404).json({ error: 'Game not found' })
      }

      if (game.hostId !== hostId) {
        return res.status(403).json({ error: 'Only host can cancel the game' })
      }

      GameManager.cancelGame(gameId)
      // gameSocketHandler.emitGameCancelled(gameId)

      res.status(200).json({
        success: true,
        message: 'Game cancelled',
      })
    } catch (error) {
      console.error('Error cancelling game:', error)
      res.status(500).json({
        error: 'Failed to cancel game',
      })
    }
  })

  /**
   * End a game (host only)
   */
  router.post('/:gameId/end', (req: Request, res: Response) => {
    try {
      const { gameId } = req.params
      const hostId = req.userId!

      const game = GameManager.getGame(gameId)

      if (!game) {
        return res.status(404).json({ error: 'Game not found' })
      }

      if (game.hostId !== hostId) {
        return res.status(403).json({ error: 'Only host can end the game' })
      }

      GameManager.endGame(gameId)
      const updatedGame = GameManager.getGame(gameId)
      if (updatedGame) {
        gameSocketHandler.emitGameUpdated(updatedGame)
      }
      gameSocketHandler.emitGameEnded(gameId)

      res.status(200).json({
        success: true,
        message: 'Game ended',
      })
    } catch (error) {
      console.error('Error ending game:', error)
      res.status(500).json({
        error: 'Failed to end game',
      })
    }
  })

  /**
   * Get all games
   */
  router.get('/', (req: Request, res: Response) => {
    try {
      const status = req.query.status as GameStatus | undefined
      const games = status ? GameManager.getGamesByStatus(status) : GameManager.getAllGames()
      const viewerUserId = req.userId

      res.status(200).json({
        success: true,
        games: games.map((g) => maskRolesForViewer(g, viewerUserId)),
        count: games.length,
      })
    } catch (error) {
      console.error('Error fetching games:', error)
      res.status(500).json({
        error: 'Failed to fetch games',
      })
    }
  })

  /**
   * Get game by ID
   */
  router.get('/:gameId', (req: Request, res: Response) => {
    try {
      const { gameId } = req.params
      const game = GameManager.getGame(gameId)

      if (!game) {
        return res.status(404).json({ error: 'Game not found' })
      }

      res.status(200).json({
        success: true,
        game: maskRolesForViewer(game, req.userId),
      })
    } catch (error) {
      console.error('Error fetching game:', error)
      res.status(500).json({
        error: 'Failed to fetch game',
      })
    }
  })

  /**
   * Join a game
   */
  router.post('/:gameId/join', (req: Request, res: Response) => {
    try {
      const { gameId } = req.params
      const userId = req.userId!

      if (!userId) {
        return res.status(400).json({ error: 'User identity missing' })
      }

      const result = GameManager.joinGame(gameId, userId)

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error,
          game: result.game,
        })
      }

      // Emit events for successful join (game-specific)
      gameSocketHandler.handleJoinResult(gameId, result)

      res.status(200).json({
        success: true,
        game: result.game,
      })
    } catch (error) {
      console.error('Error joining game:', error)
      res.status(500).json({
        error: 'Failed to join game',
      })
    }
  })

  /**
   * Send a comment to a game
   */
  router.post('/:gameId/comments', (req: Request, res: Response) => {
    try {
      const { gameId } = req.params
      const userId = req.userId!
      const { message } = req.body

      if (!userId) {
        return res.status(400).json({ error: 'User identity missing' })
      }

      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return res.status(400).json({
          error: 'Comment message is required and must be a non-empty string',
        })
      }

      const result = GameManager.addComment(gameId, userId, message)

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error,
        })
      }

      // Emit comment to all players in the game room via socket
      if (result.comment) {
        gameSocketHandler.emitGameComment(gameId, result.comment)
      }

      res.status(201).json({
        success: true,
        comment: result.comment,
      })
    } catch (error) {
      console.error('Error sending comment:', error)
      res.status(500).json({
        error: 'Failed to send comment',
      })
    }
  })

  /**
   * Get comments for a game
   */
  router.get('/:gameId/comments', (req: Request, res: Response) => {
    try {
      const { gameId } = req.params
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined

      // Verify game exists
      const game = GameManager.getGame(gameId)
      if (!game) {
        return res.status(404).json({ error: 'Game not found' })
      }

      const comments = GameManager.getComments(gameId, limit)

      res.status(200).json({
        success: true,
        comments,
        count: comments.length,
      })
    } catch (error) {
      console.error('Error fetching comments:', error)
      res.status(500).json({
        error: 'Failed to fetch comments',
      })
    }
  })

  return router
}
