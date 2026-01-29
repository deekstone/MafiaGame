# Services Directory

This directory contains the core business logic services for the Mafia game backend.

## Services

### GameManager (`gameManager.ts`)

The central service for managing all game state and logic.

**Responsibilities:**

- Game lifecycle management (create, join, leave, cancel, end)
- Game state management (status, phase, players, votes)
- Role assignment and distribution
- Phase transitions (day/night cycles)
- Vote processing (mafia kills, villager lynches, doctor heals)
- Win condition checking
- Game log generation
- Comment management

**Key Methods:**

- `createGame()` - Create a new game with a host
- `joinGame()` - Add a player to a waiting game
- `leaveGame()` - Remove a player from a game
- `startGame()` - Begin the game, assign roles, start day/night cycle
- `voteDay()` - Process villager lynch votes during day phase
- `voteNight()` - Process mafia kill and doctor heal votes during night phase
- `transitionPhase()` - Move from day to night or night to day, process votes
- `addComment()` - Add a comment to a game
- `getGamesForUser()` - Get all active games a user is participating in

**Storage:** In-memory Map (games are stored in memory, not persisted)

---

### ConnectionManager (`connectionManager.ts`)

Manages user socket connections and tracks online players.

**Responsibilities:**

- Track which users are connected and their socket IDs
- Support multiple connections per user (multiple tabs/devices)
- Provide online player lists with nicknames
- Track connection/disconnection events

**Key Methods:**

- `connect()` - Register a new socket connection for a user
- `disconnect()` - Unregister a socket connection
- `isUserConnected()` - Check if a user has any active connections
- `getUserSockets()` - Get all socket IDs for a user
- `getOnlinePlayers()` - Get all online players with their nicknames

**Storage:** In-memory Maps (userSockets, socketUsers)

---

### NicknameManager (`nicknameManager.ts`)

Manages user nicknames for display in games and lobbies.

**Responsibilities:**

- Store and retrieve user nicknames
- Validate nickname format
- Provide nickname lookup for other services

**Key Methods:**

- `setNickname()` - Set a nickname for a user
- `getNickname()` - Get a nickname for a user
- `hasNickname()` - Check if a user has a nickname
- `deleteNickname()` - Remove a user's nickname

**Storage:** In-memory Map
