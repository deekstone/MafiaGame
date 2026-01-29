# Mafia Game Frontend

A React-based frontend application for playing the Mafia game in real-time.

## Overview

This is the client-side application that provides the user interface for the Mafia game. It connects to the backend via WebSocket (Socket.IO) and REST API for real-time game state synchronization.

## Technology Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Routing**: TanStack Router
- **State Management**: TanStack Query (React Query)
- **Styling**: Tailwind CSS v4
- **WebSocket**: Socket.IO Client
- **UI Components**: Custom components with Storybook
- **Notifications**: react-hot-toast

## Project Structure

```
src/
├── components/     # Reusable UI components
├── hooks/         # Custom React hooks
├── pages/         # Page components (Lobby, Game)
├── types/         # TypeScript type definitions
├── utils/         # Utility functions
└── main.tsx       # Application entry point
```

## Key Features

- **Real-time Game Updates**: WebSocket connection for live game state
- **Lobby System**: Browse and join available games
- **Game Interface**: Full game UI with voting, commenting, and role display
- **Online Players**: See who's currently online
- **Responsive Design**: Mobile-friendly interface
- **Theme Support**: Light/dark theme support
- **Sound Effects**: Audio feedback for game events
- **Component Library**: Storybook for component development and documentation

## Main Pages

### Lobby (`src/pages/Lobby.tsx`)

- View all available games
- Create new games
- Join waiting games
- See online players
- Set nickname

### Game (`src/pages/Game.tsx`)

- View game state and players
- Submit votes (day/night phases)
- Send comments
- View game logs
- See your role (when game starts)
- Timer display for phase transitions

## Custom Hooks

- `useGameSocket` - Manages Socket.IO connection and game events
- `useGame` - Fetches and manages game state
- `useGameLogs` - Manages game log entries
- `useComments` - Manages in-game comments
- `useOnlinePlayers` - Tracks online players
- `useNickname` - Manages user nickname
- `useTheme` - Theme management (light/dark)
- `usePhaseTransitionSounds` - Audio for phase changes
- `useClockTickingSound` - Timer ticking sound

## Running the Application

### Development

```bash
pnpm dev
```

### Build

```bash
pnpm build
```

### Preview Production Build

```bash
pnpm preview
```

### Storybook (Component Development)

```bash
pnpm storybook
```

## Environment Variables

Create a `.env` file with:

- `VITE_API_URL` - Backend API URL (default: `http://localhost:3000`)

## Socket.IO Events

The frontend listens for and emits various Socket.IO events:

**Listening:**

- `game:created` - New game created
- `game:updated` - Game state updated
- `game:ended` - Game ended
- `game:cancelled` - Game cancelled
- `game:log` - New game log entry
- `game:logs:all` - All game logs (on subscribe)
- `game:comment` - New comment added
- `game:comments:all` - All comments (on subscribe)
- `lobby:online-players` - Online players updated
- `game:reconnected` - Reconnection confirmed

**Emitting:**

- `game:create` - Create a new game
- `game:join` - Join a game
- `game:subscribe` - Subscribe to game events
- `game:start` - Start the game
- `game:vote` - Submit a vote
- `game:comment:send` - Send a comment
- `game:reconnect` - Request reconnection
- `game:list` - Get all games
- `lobby:get-online-players` - Get online players

## Component Library

The project uses Storybook for component development. All components have corresponding `.stories.tsx` files for documentation and testing.

## Styling

- Uses Tailwind CSS v4 for styling
- Custom theme configuration in `tailwind.config.ts`
- Global styles in `index.css` and `styles.css`
