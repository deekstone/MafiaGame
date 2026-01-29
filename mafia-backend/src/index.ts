import express, { Request, Response } from 'express'
import { createServer } from 'http'
import { Server, Socket } from 'socket.io'
import { instrument } from '@socket.io/admin-ui'
import { GameManager } from './services/gameManager'
import { GameSocketHandler } from './socket/gameSocket'
import { createGameRoutes } from './routes/gameRoutes'
import { createUserRoutes } from './routes/userRoutes'
import cookieParser from 'cookie-parser'
import { userIdentity } from './middlewares/userIdentity'
import { startGameCleanupCron } from './jobs/gameCleanupCron'
import cors from 'cors'
import { randomUUID } from 'crypto'
import { ConnectionManager } from './services/connectionManager'

const USER_COOKIE = 'mafia_user_id'

/**
 * Parse cookies from cookie header string
 */
function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  if (!cookieHeader) return {}
  const cookies: Record<string, string> = {}
  cookieHeader.split(';').forEach((cookie) => {
    const [name, ...rest] = cookie.trim().split('=')
    if (name) {
      cookies[name] = rest.join('=') // Handle values with = in them
    }
  })
  return cookies
}

const app = express()
const httpServer = createServer(app)

app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://admin.socket.io',
      'http://localhost:3000',
      'http://192.168.2.47:5173',
    ],
    credentials: true,
  })
)
app.use(cookieParser())
app.use(userIdentity)

const io = new Server(httpServer, {
  cors: {
    origin: [
      'http://localhost:5173',
      'https://admin.socket.io',
      'http://localhost:3000',
      'http://192.168.2.47:5173',
    ],
    credentials: true,
    methods: ['GET', 'POST'],
  },
})

instrument(io, {
  auth: false,
})

// Initialize socket handlers
const gameSocketHandler = new GameSocketHandler(io)

const PORT = process.env.PORT || 3000

// Middleware
app.use(express.json())

// Health API endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})

// Game API routes
app.use('/api/games', createGameRoutes(gameSocketHandler))

// User API routes
app.use('/api/user', createUserRoutes(io))

// Socket.IO connection handling
io.on('connection', (socket: Socket) => {
  // Extract userId from cookie sent with handshake
  const cookieHeader = socket.handshake.headers.cookie
  const cookies = parseCookies(cookieHeader)
  let userId = cookies[USER_COOKIE]

  // If no cookie, generate a new UUID (client should set cookie on next request)
  if (!userId) {
    userId = randomUUID()
  }

  // Attach userId to socket data for use in handlers
  socket.data.userId = userId

  // Track connection
  ConnectionManager.connect(userId, socket.id)

  // Emit online players update to all clients when someone connects
  const onlinePlayers = ConnectionManager.getOnlinePlayers()
  io.emit('lobby:online-players', {
    success: true,
    players: onlinePlayers,
    count: onlinePlayers.length,
  })

  // Auto-resubscribe to active games on initial connection
  // This handles both new connections and reconnections
  const userGames = GameManager.getGamesForUser(userId)
  if (userGames.length > 0) {
    console.log(
      `[Connection] User ${userId} has ${userGames.length} active game(s), auto-subscribing...`
    )
    userGames.forEach((game) => {
      const gameRoom = `game:${game.id}`
      socket.join(gameRoom)

      // Send all logs
      gameSocketHandler.sendAllLogsToSocket(socket, game.id)

      // Send all comments
      gameSocketHandler.sendAllCommentsToSocket(socket, game.id)

      // Send current game state
      gameSocketHandler.emitGameUpdated(game)
    })
  }

  // Handle disconnect
  socket.on('disconnect', (reason) => {
    console.log(
      `[Disconnect] User ${userId} disconnected (socket: ${socket.id}, reason: ${reason})`
    )
    ConnectionManager.disconnect(socket.id)

    // Emit online players update to all clients when someone disconnects
    const onlinePlayers = ConnectionManager.getOnlinePlayers()
    io.emit('lobby:online-players', {
      success: true,
      players: onlinePlayers,
      count: onlinePlayers.length,
    })

    // Notify game socket handler about disconnect
    gameSocketHandler.handleUserDisconnect(userId, socket.id)
  })

  // Handle reconnection
  socket.on('reconnect', (attemptNumber) => {
    console.log(
      `[Reconnect] User ${userId} reconnected (socket: ${socket.id}, attempt: ${attemptNumber})`
    )
    // Reconnection is handled automatically by Socket.IO
    // We'll handle game re-subscription in the game:reconnect event
  })

  // Register game-related socket handlers
  gameSocketHandler.registerHandlers(socket)

  // Handle explicit reconnect event from client (optional { lang } for log i18n)
  socket.on('user:reconnect', (data?: { lang?: string }) => {
    console.log(`[User Reconnect] User ${userId} requesting reconnection (socket: ${socket.id})`)
    gameSocketHandler.handleUserReconnect(socket, data)
  })

  // Update frontend lang for log i18n (e.g. when user switches language in settings)
  socket.on('user:set-lang', (data?: { lang?: string }) => {
    if (data?.lang !== undefined) {
      socket.data.lang = data.lang
    }
  })

  // Get all games via socket
  socket.on('game:list', (callback) => {
    try {
      const games = GameManager.getAllGames()
      if (callback) {
        callback({
          success: true,
          games,
          count: games.length,
        })
      }
    } catch (error) {
      console.error('Error fetching games via socket:', error)
      if (callback) {
        callback({
          success: false,
          error: 'Failed to fetch games',
          message: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }
  })

  // Get online players list via socket
  socket.on('lobby:get-online-players', (callback) => {
    try {
      const onlinePlayers = ConnectionManager.getOnlinePlayers()
      if (callback) {
        callback({
          success: true,
          players: onlinePlayers,
          count: onlinePlayers.length,
        })
      }
    } catch (error) {
      console.error('Error fetching online players via socket:', error)
      if (callback) {
        callback({
          success: false,
          error: 'Failed to fetch online players',
          message: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }
  })

  // Legacy message handler (keeping for backward compatibility)
  socket.on('message', (data: unknown) => {
    socket.emit('message', {
      echo: data,
      timestamp: new Date().toISOString(),
    })
  })

  socket.onAny((event, ...args) => {
    console.log('[SOCKET EVENT]', {
      socketId: socket.id,
      event,
      args: JSON.stringify(args),
    })
  })
})

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📡 Socket.IO server ready`)
  console.log(`❤️  Health endpoint: http://localhost:${PORT}/health`)
})

startGameCleanupCron()
