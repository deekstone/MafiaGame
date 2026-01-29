# Mafia Game Backend Service

A Node.js/Express backend service for managing real-time Mafia game sessions with WebSocket support via Socket.IO.

## Overview

This service provides the backend infrastructure for a multiplayer Mafia game, handling game state management, player connections, real-time communication, and game logic.

## Technology Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **WebSocket**: Socket.IO
- **Task Scheduling**: node-cron

## Architecture

The service is organized into several key components:

### Services

- **GameManager** (`src/services/gameManager.ts`) - Core game logic and state management
- **ConnectionManager** (`src/services/connectionManager.ts`) - Tracks user socket connections
- **NicknameManager** (`src/services/nicknameManager.ts`) - Manages user nicknames

### Socket Handlers

- **GameSocketHandler** (`src/socket/gameSocket.ts`) - Handles all game-related Socket.IO events

### HTTP Routes

- **Game Routes** (`src/routes/gameRoutes.ts`) - REST API endpoints for game operations
- **User Routes** (`src/routes/userRoutes.ts`) - REST API endpoints for user operations

### Background Jobs

- **Game Cleanup Cron** (`src/jobs/gameCleanupCron.ts`) - Scheduled cleanup of inactive games

## Features

- Real-time game state synchronization via WebSockets
- RESTful API for game and user management
- Automatic game cleanup of finished/cancelled games
- User identity management via cookies
- Support for multiple concurrent games
- Phase-based gameplay (day/night cycles)
- Voting system for mafia kills and villager lynches
- In-game commenting system
- Online player tracking

## API Endpoints

### Health

- `GET /health` - Server health check

### Games

- `GET /api/games` - Get all games (optionally filtered by status)
- `GET /api/games/:gameId` - Get a specific game
- `POST /api/games/:gameId/join` - Join a game
- `POST /api/games/:gameId/cancel` - Cancel a game (host only)
- `POST /api/games/:gameId/end` - End a game (host only)
- `POST /api/games/:gameId/comments` - Send a comment to a game
- `GET /api/games/:gameId/comments` - Get comments for a game

### Users

- `GET /api/user/me` - Get current user details
- `GET /api/user/nickname` - Get user nickname
- `POST /api/user/nickname` - Set user nickname
- `GET /api/user/online-players` - Get all online players

## Socket.IO Events

### Client → Server

- `game:create` - Create a new game
- `game:join` - Join a game
- `game:subscribe` - Subscribe to game events
- `game:unsubscribe` - Unsubscribe from game events
- `game:start` - Start a game (host only)
- `game:vote` - Submit a vote (day/night)
- `game:comment:send` - Send a comment
- `game:reconnect` - Reconnect to active games
- `game:list` - Get all games
- `lobby:get-online-players` - Get online players

### Server → Client

- `game:created` - New game created
- `game:updated` - Game state updated
- `game:ended` - Game ended
- `game:cancelled` - Game cancelled
- `game:log` - New game log entry
- `game:logs:all` - All game logs (on subscribe/reconnect)
- `game:comment` - New comment added
- `game:comments:all` - All game comments (on subscribe/reconnect)
- `lobby:online-players` - Online players list updated

## Running the Service

### Development

```bash
pnpm dev
```

### Production

```bash
pnpm build
pnpm start
```

## Environment Variables

- `PORT` - Server port (default: 3000)

## Game Rules

- **Roles**: Mafia, Doctor, Villagers
- **Phases**: Day (discussion/voting) and Night (mafia kill/doctor heal)
- **Win Conditions**:
  - Villagers win when all mafia are eliminated
  - Mafia win when they have voting control or numerical parity without doctors
