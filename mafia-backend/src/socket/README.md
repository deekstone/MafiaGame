# Socket Handlers

This directory contains Socket.IO event handlers for real-time game communication.

## GameSocketHandler (`gameSocket.ts`)

Handles all game-related Socket.IO events and manages real-time game state synchronization.

**Responsibilities:**

- Register and handle game-related socket events
- Manage game room subscriptions (Socket.IO rooms)
- Emit game state updates to subscribed clients
- Handle game creation, joining, and voting via sockets
- Manage comment broadcasting
- Handle user reconnection and game state restoration
- Coordinate with GameManager for game operations

**Key Methods:**

- `registerHandlers()` - Register all socket event handlers for a socket connection
- `handleGameCreate()` - Create a game via socket event
- `handleGameJoin()` - Join a game via socket event
- `handleGameSubscribe()` - Subscribe to game events (join game room)
- `handleGameStart()` - Start a game (host only)
- `handleVote()` - Process day/night votes
- `handleCommentSend()` - Send and broadcast comments
- `handleUserReconnect()` - Restore game subscriptions on reconnect
- `emitGameUpdated()` - Broadcast game state changes to game room
- `emitGameLog()` - Broadcast new log entries to game room
- `emitGameComment()` - Broadcast new comments to game room

**Socket Events Handled:**

- `game:create` - Create a new game
- `game:join` - Join a game
- `game:subscribe` - Subscribe to game events
- `game:unsubscribe` - Unsubscribe from game events
- `game:start` - Start the game
- `game:vote` - Submit a vote
- `game:comment:send` - Send a comment
- `game:reconnect` - Reconnect to active games

**Socket Events Emitted:**

- `game:created` - Broadcast to all clients when a game is created
- `game:updated` - Broadcast to game room when game state changes
- `game:ended` - Broadcast when a game ends
- `game:cancelled` - Broadcast when a game is cancelled
- `game:log` - Broadcast to game room when a new log is created
- `game:logs:all` - Send all logs to a specific socket (on subscribe/reconnect)
- `game:comment` - Broadcast to game room when a comment is added
- `game:comments:all` - Send all comments to a specific socket (on subscribe/reconnect)
- `game:reconnected` - Confirm reconnection with active games list

**Room Management:**

- Games use Socket.IO rooms with format: `game:{gameId}`
- Clients automatically join game rooms when joining/subscribing
- Events are scoped to game rooms for efficient broadcasting
