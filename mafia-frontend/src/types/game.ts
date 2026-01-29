export type GameStatus = 'waiting' | 'in-progress' | 'finished' | 'cancelled'

export type GamePhase = 'day' | 'night'

export type PlayerRole = 'mafia' | 'doctor' | 'villager'

export interface Player {
  userId: string
  nickname: string
  avatarSeed?: string
  role?: PlayerRole // Assigned when game starts
  alive: boolean // Default true, set to false when killed
}

export interface Vote {
  fromUserId: string
  targetUserId: string | null // null means no vote / abstain
  timestamp: Date | string
}

export interface GameResponse {
  success: boolean
  games: Game[]
  count: number
}

export interface Game {
  id: string
  name: string
  players: Player[]
  maxPlayers: number
  status: GameStatus
  hostId: string
  hostNickname?: string
  currentPlayers?: number
  logs?: GameLog[]
  comments?: Comment[]
  createdAt?: Date | string
  settings?: Record<string, unknown>
  // Game state (only present when game is in-progress)
  phase?: GamePhase // 'day' or 'night'
  dayNumber?: number // Current day number (starts at 1)
  nightVotes?: Vote[] // Mafia votes during night
  dayVotes?: Vote[] // Villager votes during day
  doctorHeal?: Vote | null // Doctor's heal choice during night
  phaseEndTime?: Date | string // When current phase ends
  // Winner (only present when game is finished)
  winner?: 'mafia' | 'villagers'
}

export interface GameMessage {
  id: string
  text: string
  timestamp: Date
}

export type GameLogType = 'join' | 'leave' | 'kill' | 'vote' | 'system' | 'phase' | 'heal'

export interface GameLogEntry {
  id: string
  message: string
  timestamp: Date
  type?: GameLogType
}

// GameLog from backend (timestamp may be string or Date)
export interface GameLog {
  id: string
  message: string
  timestamp: string | Date
  type?: GameLogType
}

// Comment from backend (timestamp may be string or Date)
export interface Comment {
  id: string
  gameId: string
  userId: string
  nickname: string
  message: string
  timestamp: string | Date
}

// Comment entry for frontend (normalized timestamp)
export interface CommentEntry {
  id: string
  gameId: string
  userId: string
  nickname: string
  message: string
  timestamp: Date
}
