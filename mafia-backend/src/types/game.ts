export type GameStatus = 'waiting' | 'in-progress' | 'finished' | 'cancelled'

export type GamePhase = 'day' | 'night'

export type PlayerRole = 'mafia' | 'doctor' | 'villager'

export type GameWinner = 'mafia' | 'villagers'

export interface Player {
  userId: string
  nickname: string
  avatarSeed?: string // Optional avatar seed (DiceBear seed)
  role?: PlayerRole // Assigned when game starts
  alive: boolean // Default true, set to false when killed
}

export interface Vote {
  fromUserId: string
  targetUserId: string | null // null means no vote / abstain
  timestamp: Date
}

export interface GameLog {
  id: string
  message: string
  timestamp: Date
  type?: 'join' | 'leave' | 'kill' | 'vote' | 'system' | 'phase' | 'heal' // For future filtering
  /** Optional i18n key for backend log translation (en/ar) */
  logKey?: string
  /** Optional params for logKey interpolation (e.g. {{nickname}}, {{dayNumber}}) */
  logParams?: Record<string, string | number>
}

export interface Comment extends Player {
  id: string
  gameId: string
  message: string
  timestamp: Date
}

export interface Game {
  id: string
  name: string
  hostId: string // Socket ID or user ID of the game creator
  hostNickname?: string // Optional nickname of the host
  status: GameStatus
  maxPlayers: number
  currentPlayers: number
  players: Player[]
  logs: GameLog[]
  comments: Comment[]
  createdAt: Date
  settings: {
    // Future: game-specific settings like mafia count, sheriff, etc.
  }
  // Game state (only present when game is in-progress)
  phase?: GamePhase // 'day' or 'night'
  dayNumber?: number // Current day number (starts at 1)
  nightVotes?: Vote[] // Mafia votes during night
  dayVotes?: Vote[] // Villager votes during day
  doctorHeal?: Vote | null // Doctor's heal choice during night
  phaseEndTime?: Date // When current phase ends
  timerIntervalId?: NodeJS.Timeout // Timer for phase transitions
  // Game result (only present when game is finished)
  winner?: GameWinner // 'mafia' or 'villagers' - who won the game
}

export interface CreateGameRequest {
  name: string
  maxPlayers?: number // Optional, defaults to a reasonable number
}
