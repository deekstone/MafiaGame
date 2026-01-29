# HTTP Routes

This directory contains Express.js route handlers for RESTful API endpoints.

## Game Routes (`gameRoutes.ts`)

REST API endpoints for game operations.

**Endpoints:**

- `GET /api/games` - Get all games (optionally filtered by `?status=waiting|in-progress|finished|cancelled`)
- `GET /api/games/:gameId` - Get a specific game by ID
- `POST /api/games/:gameId/join` - Join a game as a player
- `POST /api/games/:gameId/cancel` - Cancel a game (host only)
- `POST /api/games/:gameId/end` - End a game (host only)
- `POST /api/games/:gameId/comments` - Send a comment to a game
- `GET /api/games/:gameId/comments` - Get comments for a game (optionally limited by `?limit=N`)

**Authentication:**

- All endpoints use the `userIdentity` middleware to extract user ID from cookies
- Host-only operations (cancel, end) verify the user is the game host

**Integration:**

- Uses `GameManager` for game operations
- Uses `GameSocketHandler` to emit real-time updates via Socket.IO
- Emits socket events for real-time synchronization with connected clients

---

## User Routes (`userRoutes.ts`)

REST API endpoints for user operations.

**Endpoints:**

- `GET /api/user/me` - Get current user details (ID and nickname)
- `GET /api/user/nickname` - Get user's nickname
- `POST /api/user/nickname` - Set user's nickname (body: `{ nickname: string }`)
- `GET /api/user/online-players` - Get all currently online players with their nicknames

**Authentication:**

- All endpoints use the `userIdentity` middleware to extract user ID from cookies

**Integration:**

- Uses `NicknameManager` for nickname operations
- Uses `ConnectionManager` for online player tracking
- Emits `lobby:online-players` socket event when nickname is updated (if user is connected)
