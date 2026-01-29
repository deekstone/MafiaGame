import { Server, Socket } from 'socket.io'
import { GameManager } from '../services/gameManager'
import { CreateGameRequest, Game, GameLog, Comment } from '../types/game'
import { ConnectionManager } from '../services/connectionManager'
import { maskRolesForViewer } from '../utils/gameVisibility'
import { translateLog, normalizeLogLang, type LogLang } from '../i18n/logs'

type GameResponse = {
  success: boolean
  game?: Game
  error?: string
  message?: string
}

// Parameter name required by TypeScript syntax, but not used at type level
// eslint-disable-next-line no-unused-vars
type CreateGameCallback = (response: GameResponse) => void

// eslint-disable-next-line no-unused-vars
type JoinGameCallback = (response: GameResponse) => void

/**
 * Handles game-related socket events
 */
export class GameSocketHandler {
  private io: Server

  constructor(io: Server) {
    this.io = io
  }

  /**
   * Register all game-related socket event handlers for a socket
   */
  registerHandlers(socket: Socket): void {
    socket.on('game:create', (data: CreateGameRequest, callback?: CreateGameCallback) => {
      this.handleGameCreate(socket, data, callback)
    })

    socket.on(
      'game:join',
      (
        data: { gameId: string; lang?: string },
        callback?: JoinGameCallback
      ) => {
        this.handleGameJoin(socket, data, callback)
      }
    )

    // Subscribe to a game channel to receive game-specific events (logs, updates)

    socket.on(
      'game:subscribe',
      (
        data: { gameId: string; lang?: string },
        // eslint-disable-next-line no-unused-vars
        callback?: (_response: { success: boolean; error?: string }) => void
      ) => {
        this.handleGameSubscribe(socket, data, callback)
      }
    )

    // Unsubscribe from a game channel

    socket.on(
      'game:unsubscribe',
      (
        data: { gameId: string },
        // eslint-disable-next-line no-unused-vars
        callback?: (_response: { success: boolean; error?: string }) => void
      ) => {
        this.handleGameUnsubscribe(socket, data, callback)
      }
    )

    // Comment events
    socket.on(
      'game:comment:send',
      (
        data: { gameId: string; message: string },
        // eslint-disable-next-line no-unused-vars
        callback?: (_response: { success: boolean; comment?: Comment; error?: string }) => void
      ) => {
        this.handleCommentSend(socket, data, callback)
      }
    )

    // Start game event (host only)
    socket.on(
      'game:start',
      (
        data: { gameId: string },
        // eslint-disable-next-line no-unused-vars
        callback?: (_response: { success: boolean; game?: Game; error?: string }) => void
      ) => {
        this.handleGameStart(socket, data, callback)
      }
    )

    // Vote event (during day/night)
    socket.on(
      'game:vote',
      (
        data: { gameId: string; targetUserId: string | null },
        // eslint-disable-next-line no-unused-vars
        callback?: (_response: { success: boolean; game?: Game; error?: string }) => void
      ) => {
        this.handleVote(socket, data, callback)
      }
    )

    // Reconnect event - client explicitly requests reconnection
    socket.on(
      'game:reconnect',
      (
        // eslint-disable-next-line no-unused-vars
        callback?: (_response: { success: boolean; games?: Game[]; error?: string }) => void
      ) => {
        this.handleGameReconnect(socket, callback)
      }
    )
  }

  /**
   * Handle game creation via socket
   */
  private handleGameCreate(
    socket: Socket,
    data: CreateGameRequest,
    callback?: CreateGameCallback
  ): void {
    try {
      // Validate request
      if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
        callback?.({
          success: false,
          error: 'Game name is required and must be a non-empty string',
        })
        return
      }
      // ✅ Stable identity (from cookie → socket handshake)
      const hostId = socket.data.userId

      if (!hostId) {
        callback?.({
          success: false,
          error: 'User identity missing',
        })
        return
      }

      // 🚨 Enforce one ACTIVE game per host
      const existingGame = GameManager.getGameByHostAndStatus(hostId, ['waiting', 'in-progress'])

      if (existingGame) {
        callback?.({
          success: false,
          error: 'You already have an active game',
          game: existingGame,
        })
        return
      }

      const game = GameManager.createGame(hostId, {
        name: data.name.trim(),
        maxPlayers: data.maxPlayers,
      })

      // Automatically join the game's room/channel as the host
      const gameRoom = this.getGameRoom(game.id)
      socket.join(gameRoom)

      // Send all previous logs to the host (initially just the host join log)
      this.sendAllLogsToSocket(socket, game.id)

      // Send all previous comments to the host (initially empty)
      this.sendAllCommentsToSocket(socket, game.id)

      // Emit to all lobby listeners (broadcast for game list)
      this.io.emit('game:created', game)

      // Emit the initial host join log to the game room only
      if (game.logs && game.logs.length > 0) {
        this.emitGameLog(game.id, game.logs[0])
      }

      callback?.({
        success: true,
        game,
      })
    } catch (error) {
      console.error('Error creating game via socket:', error)

      callback?.({
        success: false,
        error: 'Failed to create game',
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  /**
   * Emit game created event (used by REST as well)
   */
  emitGameCreated(game: Game): void {
    this.io.emit('game:created', game)
  }

  /**
   * Emit game ended event
   */
  emitGameEnded(gameId: string): void {
    this.io.emit('game:ended', { gameId })
  }

  /**
   * Emit game cancelled event
   */
  emitGameCancelled(gameId: string): void {
    this.io.emit('game:cancelled', { gameId })
  }

  /** Get socket language for log i18n; default 'en'. */
  private getSocketLang(socket: Socket): LogLang {
    return normalizeLogLang(socket.data.lang)
  }

  /**
   * Handle game join via socket
   */
  private handleGameJoin(
    socket: Socket,
    data: { gameId: string; lang?: string },
    callback?: JoinGameCallback
  ): void {
    try {
      // Validate request
      if (!data.gameId || typeof data.gameId !== 'string') {
        callback?.({
          success: false,
          error: 'Game ID is required and must be a string',
        })
        return
      }
      if (data.lang !== undefined) {
        socket.data.lang = data.lang
      }

      const userId = socket.data.userId

      if (!userId) {
        callback?.({
          success: false,
          error: 'User identity missing',
        })
        return
      }

      // Join the game
      const result = GameManager.joinGame(data.gameId, userId)

      if (!result.success) {
        callback?.({
          success: false,
          error: result.error,
          game: result.game,
        })
        return
      }

      // Automatically join the game's room/channel to receive game events
      const gameRoom = this.getGameRoom(data.gameId)
      socket.join(gameRoom)

      // Send all previous logs to the reconnected/joining client
      this.sendAllLogsToSocket(socket, data.gameId)

      // Send all previous comments to the joining client
      this.sendAllCommentsToSocket(socket, data.gameId)

      // Emit events for successful join (to the game room)
      this.handleJoinResult(data.gameId, result)

      callback?.({
        success: true,
        game: result.game,
      })
    } catch (error) {
      console.error('Error joining game via socket:', error)

      callback?.({
        success: false,
        error: 'Failed to join game',
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  /**
   * Get the room name for a game
   */
  private getGameRoom(gameId: string): string {
    return `game:${gameId}`
  }

  /**
   * Send all previous logs to a specific socket (for reconnection/initial load)
   * Sends logs in descending order by timestamp (newest first).
   * Messages are translated per socket lang (en/ar).
   */
  sendAllLogsToSocket(socket: Socket, gameId: string): void {
    const game = GameManager.getGame(gameId)
    if (!game || !game.logs || game.logs.length === 0) {
      return
    }

    const lang = this.getSocketLang(socket)
    const logs = game.logs.map((log) => ({
      id: log.id,
      message: translateLog(log, lang),
      timestamp: log.timestamp,
      type: log.type,
    }))

    socket.emit('game:logs:all', {
      gameId,
      logs,
    })
  }

  /**
   * Send all previous comments to a specific socket (for reconnection/initial load)
   * Sends comments in descending order by timestamp (newest first)
   */
  sendAllCommentsToSocket(socket: Socket, gameId: string): void {
    const comments = GameManager.getComments(gameId)
    if (!comments || comments.length === 0) {
      return
    }

    // Send all comments to the specific socket
    socket.emit('game:comments:all', {
      gameId,
      comments,
    })
  }

  /**
   * Handle subscribing to a game channel
   */
  private handleGameSubscribe(
    socket: Socket,
    data: { gameId: string; lang?: string },
    // eslint-disable-next-line no-unused-vars
    callback?: (_response: { success: boolean; error?: string }) => void
  ): void {
    try {
      if (!data.gameId || typeof data.gameId !== 'string') {
        callback?.({
          success: false,
          error: 'Game ID is required and must be a string',
        })
        return
      }
      if (data.lang !== undefined) {
        socket.data.lang = data.lang
      }

      // Verify game exists
      const game = GameManager.getGame(data.gameId)
      if (!game) {
        callback?.({
          success: false,
          error: 'Game not found',
        })
        return
      }

      // Join the game's room/channel
      const gameRoom = this.getGameRoom(data.gameId)
      socket.join(gameRoom)

      // Send all previous logs to the reconnected/joining client
      this.sendAllLogsToSocket(socket, data.gameId)

      // Send all previous comments to the reconnected/joining client
      this.sendAllCommentsToSocket(socket, data.gameId)

      callback?.({
        success: true,
      })
    } catch (error) {
      console.error('Error subscribing to game:', error)
      callback?.({
        success: false,
        error: 'Failed to subscribe to game',
      })
    }
  }

  /**
   * Handle unsubscribing from a game channel
   */
  private handleGameUnsubscribe(
    socket: Socket,
    data: { gameId: string },
    // eslint-disable-next-line no-unused-vars
    callback?: (_response: { success: boolean; error?: string }) => void
  ): void {
    try {
      if (!data.gameId || typeof data.gameId !== 'string') {
        callback?.({
          success: false,
          error: 'Game ID is required and must be a string',
        })
        return
      }

      const gameRoom = this.getGameRoom(data.gameId)
      socket.leave(gameRoom)

      callback?.({
        success: true,
      })
    } catch (error) {
      console.error('Error unsubscribing from game:', error)
      callback?.({
        success: false,
        error: 'Failed to unsubscribe from game',
      })
    }
  }

  /**
   * Emit game updated event to the game's room only
   * Excludes logs, comments, and internal timer fields for performance
   */
  emitGameUpdated(game: Game): void {
    // Exclude logs, comments, and timerIntervalId from game:updated to avoid sending internal data
    // Logs and comments are sent separately via game:log and game:comment events as they happen
    const gameWithoutLogsAndComments: Omit<Game, 'logs' | 'comments' | 'timerIntervalId'> = {
      id: game.id,
      name: game.name,
      hostId: game.hostId,
      hostNickname: game.hostNickname,
      status: game.status,
      maxPlayers: game.maxPlayers,
      currentPlayers: game.currentPlayers,
      players: game.players,
      createdAt: game.createdAt,
      settings: game.settings,
      phase: game.phase,
      dayNumber: game.dayNumber,
      nightVotes: game.nightVotes,
      dayVotes: game.dayVotes,
      doctorHeal: game.doctorHeal,
      phaseEndTime: game.phaseEndTime,
      winner: game.winner,
    }
    const gameRoom = this.getGameRoom(game.id)

    // IMPORTANT: During an in-progress game, never broadcast other players' roles.
    // Instead, emit a per-socket personalized payload (each player sees only their own role).
    if (game.status === 'in-progress') {
      void this.io
        .in(gameRoom)
        .fetchSockets()
        .then((sockets) => {
          sockets.forEach((s) => {
            const viewerUserId = s.data.userId as string | undefined
            const personalized = maskRolesForViewer(gameWithoutLogsAndComments as Game, viewerUserId)
            this.io.to(s.id).emit('game:updated', personalized)
          })
        })
        .catch((err) => {
          console.error('Failed to emit personalized game update:', err)
        })
      return
    }

    // Waiting / finished / cancelled: safe to broadcast as-is
    this.io.to(gameRoom).emit('game:updated', gameWithoutLogsAndComments)
  }

  /**
   * Emit game log event to the game's room only.
   * Logs are game-specific; each socket receives the log message in its lang (en/ar).
   */
  emitGameLog(gameId: string, log: GameLog): void {
    const gameRoom = this.getGameRoom(gameId)
    void this.io
      .in(gameRoom)
      .fetchSockets()
      .then((sockets) => {
        sockets.forEach((s) => {
          const lang = normalizeLogLang((s as { data?: { lang?: string } }).data?.lang)
          const translatedLog = {
            id: log.id,
            message: translateLog(log, lang),
            timestamp: log.timestamp,
            type: log.type,
          }
          this.io.to(s.id).emit('game:log', {
            gameId,
            log: translatedLog,
          })
        })
      })
      .catch((err) => {
        console.error('Failed to emit game log:', err)
      })
  }

  /**
   * Handle join result and emit necessary events
   * This centralizes the logic used by both socket and REST handlers
   */
  handleJoinResult(gameId: string, result: { success: boolean; game?: Game; log?: GameLog }): void {
    if (!result.success || !result.game) {
      return
    }

    // Emit game updated event (game-specific - clients can filter by gameId)
    this.emitGameUpdated(result.game)

    // Emit log event if a new log was created (game-specific)
    if (result.log) {
      this.emitGameLog(gameId, result.log)
    }
  }

  /**
   * Handle sending a comment
   */
  private handleCommentSend(
    socket: Socket,
    data: { gameId: string; message: string },
    // eslint-disable-next-line no-unused-vars
    callback?: (_response: { success: boolean; comment?: Comment; error?: string }) => void
  ): void {
    try {
      // Validate request
      if (!data.gameId || typeof data.gameId !== 'string') {
        callback?.({
          success: false,
          error: 'Game ID is required and must be a string',
        })
        return
      }

      if (!data.message || typeof data.message !== 'string' || data.message.trim().length === 0) {
        callback?.({
          success: false,
          error: 'Comment message is required and must be a non-empty string',
        })
        return
      }

      const userId = socket.data.userId

      if (!userId) {
        callback?.({
          success: false,
          error: 'User identity missing',
        })
        return
      }

      // Add comment via GameManager
      const result = GameManager.addComment(data.gameId, userId, data.message)

      if (!result.success) {
        callback?.({
          success: false,
          error: result.error,
        })
        return
      }

      // Emit comment to all players in the game room
      if (result.comment) {
        this.emitGameComment(data.gameId, result.comment)
      }

      callback?.({
        success: true,
        comment: result.comment,
      })
    } catch (error) {
      console.error('Error sending comment:', error)

      callback?.({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send comment',
      })
    }
  }

  /**
   * Emit game comment event to the game's room only
   * Comments are game-specific - only clients subscribed to this game receive them
   */
  emitGameComment(gameId: string, comment: Comment): void {
    // Emit only to subscribers of this game's room
    const gameRoom = this.getGameRoom(gameId)
    this.io.to(gameRoom).emit('game:comment', {
      gameId,
      comment,
    })
  }

  /**
   * Handle starting the game (host only)
   */
  private handleGameStart(
    socket: Socket,
    data: { gameId: string },
    // eslint-disable-next-line no-unused-vars
    callback?: (_response: { success: boolean; game?: Game; error?: string }) => void
  ): void {
    try {
      if (!data.gameId || typeof data.gameId !== 'string') {
        callback?.({
          success: false,
          error: 'Game ID is required and must be a string',
        })
        return
      }

      const hostId = socket.data.userId
      if (!hostId) {
        callback?.({
          success: false,
          error: 'User identity missing',
        })
        return
      }

      // Start the game with phase transition callback
      const result = GameManager.startGame(data.gameId, hostId, (updatedGame) => {
        // Emit game updated event
        this.emitGameUpdated(updatedGame)

        // Emit any logs
        if (updatedGame.logs && updatedGame.logs.length > 0) {
          const recentLogs = updatedGame.logs.slice(0, 10) // Emit recent logs
          recentLogs.forEach((log) => {
            this.emitGameLog(data.gameId, log)
          })
        }
      })

      if (!result.success) {
        callback?.({
          success: false,
          error: result.error,
        })
        return
      }

      // Emit game updated event
      if (result.game) {
        this.emitGameUpdated(result.game)
      }

      // Emit logs
      if (result.logs) {
        result.logs.forEach((log) => {
          this.emitGameLog(data.gameId, log)
        })
      }

      callback?.({
        success: true,
        // While in-progress, only return the host's own role
        game: result.game ? maskRolesForViewer(result.game, hostId) : undefined,
      })
    } catch (error) {
      console.error('Error starting game:', error)
      callback?.({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to start game',
      })
    }
  }

  /**
   * Handle voting (day or night)
   */
  private handleVote(
    socket: Socket,
    data: { gameId: string; targetUserId: string | null },
    // eslint-disable-next-line no-unused-vars
    callback?: (_response: { success: boolean; game?: Game; error?: string }) => void
  ): void {
    try {
      if (!data.gameId || typeof data.gameId !== 'string') {
        callback?.({
          success: false,
          error: 'Game ID is required and must be a string',
        })
        return
      }

      const userId = socket.data.userId
      if (!userId) {
        callback?.({
          success: false,
          error: 'User identity missing',
        })
        return
      }

      const game = GameManager.getGame(data.gameId)
      if (!game) {
        callback?.({
          success: false,
          error: 'Game not found',
        })
        return
      }

      if (game.status !== 'in-progress') {
        callback?.({
          success: false,
          error: 'Game is not in progress',
        })
        return
      }

      let result
      if (game.phase === 'night') {
        result = GameManager.voteNight(data.gameId, userId, data.targetUserId || null)
      } else {
        result = GameManager.voteDay(data.gameId, userId, data.targetUserId || null)
      }

      if (!result.success) {
        callback?.({
          success: false,
          error: result.error,
        })
        return
      }

      // Emit game updated event
      if (result.game) {
        this.emitGameUpdated(result.game)
      }

      callback?.({
        success: true,
        // While in-progress, only return the voter's own role
        game: result.game ? maskRolesForViewer(result.game, userId) : undefined,
      })
    } catch (error) {
      console.error('Error voting:', error)
      callback?.({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to vote',
      })
    }
  }

  /**
   * Handle user disconnect - remove user from games if they have no remaining connections
   */
  handleUserDisconnect(userId: string, socketId: string): void {
    // Check if user has any remaining connections
    // Only remove from games if they're completely disconnected (no other tabs/devices)
    const remainingConnections = ConnectionManager.getUserConnectionCount(userId)
    
    if (remainingConnections > 0) {
      // User still has other connections, don't remove from games
      console.log(`[Disconnect] User ${userId} disconnected socket ${socketId}, but has ${remainingConnections} connection(s) remaining`)
      return
    }

    // User has no remaining connections.
    // IMPORTANT: If a game has already started, do NOT remove the player on disconnect.
    // We keep them in the game so they can reconnect and continue playing.
    const userGames = GameManager.getGamesForUser(userId)
    
    if (userGames.length > 0) {
      const waitingGames = userGames.filter((g) => g.status === 'waiting')
      const inProgressGames = userGames.filter((g) => g.status === 'in-progress')

      if (inProgressGames.length > 0) {
        console.log(
          `[Disconnect] User ${userId} fully disconnected but is in ${inProgressGames.length} in-progress game(s); keeping them in-game for reconnect`
        )
      }

      if (waitingGames.length === 0) {
        return
      }

      console.log(
        `[Disconnect] User ${userId} fully disconnected, removing from ${waitingGames.length} waiting game(s)`
      )
      
      waitingGames.forEach((game) => {
        const result = GameManager.leaveGame(game.id, userId)
        
        if (result.success && result.game) {
          const gameRoom = this.getGameRoom(game.id)
          
          // Emit game updated event
          this.emitGameUpdated(result.game)
          
          // Emit leave log if created
          if (result.log) {
            this.emitGameLog(game.id, result.log)
          }
          
          // If game was cancelled (host left waiting game), emit cancelled event
          if (result.gameCancelled) {
            this.emitGameCancelled(game.id)
            console.log(`[Disconnect] Game ${game.id} cancelled because host left`)
          } else {
            console.log(`[Disconnect] User ${userId} removed from game ${game.id}`)
          }
        }
      })
    }
  }

  /**
   * Handle user reconnect - restore game subscriptions and send current state.
   * Optional data.lang sets socket lang for log i18n (en/ar).
   */
  handleUserReconnect(socket: Socket, data?: { lang?: string }): void {
    const userId = socket.data.userId
    if (!userId) {
      return
    }
    if (data?.lang !== undefined) {
      socket.data.lang = data.lang
    }

    // Find all games the user is in
    const userGames = GameManager.getGamesForUser(userId)
    
    if (userGames.length > 0) {
      console.log(`[Reconnect] User ${userId} reconnecting to ${userGames.length} game(s)`)
      
      // Auto-resubscribe to all games and send current state
      userGames.forEach((game) => {
        const gameRoom = this.getGameRoom(game.id)
        socket.join(gameRoom)
        
        // Send all logs
        this.sendAllLogsToSocket(socket, game.id)
        
        // Send all comments
        this.sendAllCommentsToSocket(socket, game.id)
        
        // Send current game state only to this socket (avoid broadcasting on reconnect)
        socket.emit('game:updated', maskRolesForViewer(game, userId))
      })
      
      // Emit reconnect success with games list
      socket.emit('game:reconnected', {
        success: true,
        games: userGames.map((g) => maskRolesForViewer(g, userId)),
        count: userGames.length,
      })
    } else {
      // No active games to reconnect to
      socket.emit('game:reconnected', {
        success: true,
        games: [],
        count: 0,
      })
    }
  }

  /**
   * Handle game reconnect event (explicit client request)
   */
  private handleGameReconnect(
    socket: Socket,
    // eslint-disable-next-line no-unused-vars
    callback?: (_response: { success: boolean; games?: Game[]; error?: string }) => void
  ): void {
    try {
      const userId = socket.data.userId
      if (!userId) {
        callback?.({
          success: false,
          error: 'User identity missing',
        })
        return
      }

      // Find all games the user is in
      const userGames = GameManager.getGamesForUser(userId)
      
      // Auto-resubscribe to all games and send current state
      userGames.forEach((game) => {
        const gameRoom = this.getGameRoom(game.id)
        socket.join(gameRoom)
        
        // Send all logs
        this.sendAllLogsToSocket(socket, game.id)
        
        // Send all comments
        this.sendAllCommentsToSocket(socket, game.id)
        
        // Send current game state only to this socket (avoid broadcasting on reconnect)
        socket.emit('game:updated', maskRolesForViewer(game, userId))
      })

      callback?.({
        success: true,
        games: userGames.map((g) => maskRolesForViewer(g, userId)),
      })
    } catch (error) {
      console.error('Error handling game reconnect:', error)
      callback?.({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to reconnect to games',
      })
    }
  }
}
