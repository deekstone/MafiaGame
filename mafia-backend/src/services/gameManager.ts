import { Game, CreateGameRequest, GameStatus, Player, GameLog, Comment } from '../types/game'
import { randomUUID } from 'crypto'
import { NicknameManager } from './nicknameManager'

// In-memory storage (MVP)
const games = new Map<string, Game>()

// What counts as an ACTIVE game
const ACTIVE_STATUSES: GameStatus[] = ['waiting', 'in-progress']

/**
 * Key phrases that appear in villager lynch messages (for testing)
 */
export const VILLAGER_LYNCH_MESSAGE_PHRASES = [
  'innocent',
  'NOT the mafia',
  'trusted the process',
  "wasn't the mafia",
  'died for democracy',
  'was just vibing',
  'learned the village',
  'sacrificed',
  'voted out',
  'wrong choice',
  'died so everyone',
  'trusted their neighbors',
  'got caught in the classic',
  'wrong answer',
  'paid the price',
  "wasn't suspicious",
  'died to prove',
] as const

/**
 * Key phrases that appear in doctor lynch messages (for testing)
 */
export const DOCTOR_LYNCH_MESSAGE_PHRASES = [
  'was the doctor',
  'lost their only protection',
  'healing',
  'mafia is celebrating',
  'save lives',
  'saving lives',
  'protecting the innocent',
  "mafia's job easier",
  'only hope',
  'lifeline',
  "didn't care",
  'healer',
] as const

export class GameManager {
  private static readonly DEFAULT_MAX_PLAYERS = 10

  /**
   * Create a new game
   * Caller must ensure host has no ACTIVE game
   */
  static createGame(hostId: string, request: CreateGameRequest): Game {
    if (!request.name || request.name.trim().length === 0) {
      throw new Error('Game name is required')
    }

    const gameId = randomUUID()

    // Get host nickname and create initial players array with host
    const hostProfile = NicknameManager.getProfile(hostId)
    const hostNickname = hostProfile?.nickname || 'Unknown'
    const hostAvatarSeed = hostProfile?.avatarSeed || hostNickname
    const players: Player[] = [
      {
        userId: hostId,
        nickname: hostNickname,
        avatarSeed: hostAvatarSeed,
        alive: true,
      },
    ]

    // Create initial log for host joining
    const hostJoinLog: GameLog = {
      id: randomUUID(),
      message: `"${hostNickname}" joined the game`,
      timestamp: new Date(),
      type: 'join',
      logKey: 'join',
      logParams: { nickname: hostNickname },
    }

    const game: Game = {
      id: gameId,
      name: request.name.trim(),
      hostId,
      status: 'waiting',
      maxPlayers: request.maxPlayers || this.DEFAULT_MAX_PLAYERS,
      currentPlayers: 1, // host joins automatically
      players,
      logs: [hostJoinLog],
      comments: [],
      createdAt: new Date(),
      settings: {},
    }

    games.set(gameId, game)
    return game
  }

  /**
   * Get a game by ID
   */
  static getGame(gameId: string): Game | undefined {
    const game = games.get(gameId)
    if (!game) return undefined

    // Enrich with host nickname
    const hostNickname = NicknameManager.getNickname(game.hostId)
    return {
      ...game,
      hostNickname,
    }
  }

  /**
   * Sort games by status priority and createdAt
   * Status priority: waiting (0), in-progress (1), finished (2), cancelled (3)
   * Within same status, sorted by createdAt descending (newest first)
   */
  private static sortGames(a: Game, b: Game): number {
    const statusPriority: Record<GameStatus, number> = {
      waiting: 0,
      'in-progress': 1,
      finished: 2,
      cancelled: 3,
    }

    // First sort by status priority
    const statusDiff = statusPriority[a.status] - statusPriority[b.status]
    if (statusDiff !== 0) {
      return statusDiff
    }
    // Within same status, sort by createdAt descending (newest first)
    return b.createdAt.getTime() - a.createdAt.getTime()
  }

  /**
   * Get all games
   * Sorted by: waiting first, then in-progress, then finished, then cancelled
   * Within each status, sorted by createdAt descending (newest first)
   */
  static getAllGames(): Game[] {
    return Array.from(games.values())
      .map((game) => {
        const hostNickname = NicknameManager.getNickname(game.hostId)
        return {
          ...game,
          hostNickname,
        }
      })
      .sort(this.sortGames)
  }

  /**
   * Get games by status
   */
  static getGamesByStatus(status: GameStatus): Game[] {
    return Array.from(games.values())
      .filter((game) => game.status === status)
      .map((game) => {
        const hostNickname = NicknameManager.getNickname(game.hostId)
        return {
          ...game,
          hostNickname,
        }
      })
      .sort(this.sortGames)
  }

  /**
   * 🔑 Get ACTIVE game for a host (waiting | in-progress)
   */
  static getGameByHostAndStatus(
    hostId: string,
    statuses: GameStatus[] = ACTIVE_STATUSES
  ): Game | undefined {
    const game = Array.from(games.values()).find(
      (game) => game.hostId === hostId && statuses.includes(game.status)
    )
    if (!game) return undefined

    const hostNickname = NicknameManager.getNickname(game.hostId)
    return {
      ...game,
      hostNickname,
    }
  }

  /**
   * Cancel a game
   * Frees host to create another game
   */
  static cancelGame(gameId: string): boolean {
    const game = games.get(gameId) as Game
    if (!game) return false

    game.status = 'cancelled'
    games.set(gameId, game)
    return true
  }

  /**
   * End a game normally
   * Frees host to create another game
   */
  static endGame(gameId: string): boolean {
    const game = games.get(gameId)
    if (!game) return false

    game.status = 'finished'
    games.set(gameId, game)
    return true
  }

  /**
   * Hard delete (dev / cleanup only)
   */
  static deleteGame(gameId: string): boolean {
    return games.delete(gameId)
  }

  /**
   * Join a game as a player
   * Validates game exists, status is waiting, user not already joined, and game not full
   */
  static joinGame(
    gameId: string,
    userId: string
  ): { success: boolean; game?: Game; error?: string; log?: GameLog } {
    const game = games.get(gameId)

    if (!game) {
      return {
        success: false,
        error: 'Game not found',
      }
    }

    // Only allow joining waiting games
    if (game.status !== 'waiting') {
      return {
        success: false,
        error: `Cannot join game with status: ${game.status}. Only waiting games can be joined.`,
      }
    }

    // Check if user already joined
    const alreadyJoined = game.players.some((player) => player.userId === userId)
    if (alreadyJoined) {
      return {
        success: false,
        error: 'You have already joined this game',
        game: {
          ...game,
          hostNickname: NicknameManager.getNickname(game.hostId),
        },
      }
    }

    // Check if game is full
    if (game.currentPlayers >= game.maxPlayers) {
      return {
        success: false,
        error: 'Game is full',
        game: {
          ...game,
          hostNickname: NicknameManager.getNickname(game.hostId),
        },
      }
    }

    // Get player nickname
    const playerProfile = NicknameManager.getProfile(userId)
    const playerNickname = playerProfile?.nickname || 'Unknown'
    const playerAvatarSeed = playerProfile?.avatarSeed || playerNickname

    // Add player to players array
    game.players.push({
      userId,
      nickname: playerNickname,
      avatarSeed: playerAvatarSeed,
      alive: true,
    })

    // Increment player count
    game.currentPlayers++

    // Add log entry for player joining
    const joinLog: GameLog = {
      id: randomUUID(),
      message: `"${playerNickname}" joined the game`,
      timestamp: new Date(),
      type: 'join',
      logKey: 'join',
      logParams: { nickname: playerNickname },
    }
    game.logs.unshift(joinLog)

    games.set(gameId, game)

    // Return enriched game with the new log
    const enrichedGame = {
      ...game,
      hostNickname: NicknameManager.getNickname(game.hostId),
    }

    return {
      success: true,
      game: enrichedGame,
      log: joinLog,
    }
  }

  /**
   * Leave a game (remove a player)
   * If the host leaves a waiting game, the game is cancelled
   * If a player leaves an in-progress game, they are removed but the game continues
   */
  static leaveGame(
    gameId: string,
    userId: string
  ): { success: boolean; game?: Game; error?: string; log?: GameLog; gameCancelled?: boolean } {
    const game = games.get(gameId)

    if (!game) {
      return {
        success: false,
        error: 'Game not found',
      }
    }

    // Check if user is in the game
    const playerIndex = game.players.findIndex((p) => p.userId === userId)
    if (playerIndex === -1) {
      return {
        success: false,
        error: 'You are not in this game',
      }
    }

    const player = game.players[playerIndex]
    const isHost = game.hostId === userId

    // Special handling for host
    if (isHost) {
      // If host leaves a waiting game, cancel it
      if (game.status === 'waiting') {
        // Remove host from players array
        game.players.splice(playerIndex, 1)
        
        // Decrement player count
        game.currentPlayers = Math.max(0, game.currentPlayers - 1)
        
        // Cancel the game
        game.status = 'cancelled'
        
        // Add log entry
        const leaveLog: GameLog = {
          id: randomUUID(),
          message: `"${player.nickname}" (host) left the game. Game cancelled.`,
          timestamp: new Date(),
          type: 'leave',
          logKey: 'leaveHostCancel',
          logParams: { nickname: player.nickname },
        }
        game.logs.unshift(leaveLog)
        
        games.set(gameId, game)

        const enrichedGame = {
          ...game,
          hostNickname: NicknameManager.getNickname(game.hostId),
        }

        return {
          success: true,
          game: enrichedGame,
          log: leaveLog,
          gameCancelled: true,
        }
      }
      // If host leaves an in-progress game, we still remove them but game continues
      // (Could also end the game here if desired)
    }

    // Remove player from players array
    game.players.splice(playerIndex, 1)

    // Decrement player count
    game.currentPlayers = Math.max(0, game.currentPlayers - 1)

    // Add log entry for player leaving
    const leaveLog: GameLog = {
      id: randomUUID(),
      message: `"${player.nickname}" left the game`,
      timestamp: new Date(),
      type: 'leave',
      logKey: 'leave',
      logParams: { nickname: player.nickname },
    }
    game.logs.unshift(leaveLog)

    games.set(gameId, game)

    // Return enriched game with the new log
    const enrichedGame = {
      ...game,
      hostNickname: NicknameManager.getNickname(game.hostId),
    }

    return {
      success: true,
      game: enrichedGame,
      log: leaveLog,
      gameCancelled: false,
    }
  }

  /**
   * Increment player count
   */
  static incrementPlayerCount(gameId: string): boolean {
    const game = games.get(gameId)
    if (!game || game.currentPlayers >= game.maxPlayers) return false

    game.currentPlayers++
    games.set(gameId, game)
    return true
  }

  /**
   * Decrement player count (safe)
   */
  static decrementPlayerCount(gameId: string): boolean {
    const game = games.get(gameId)
    if (!game) return false

    game.currentPlayers = Math.max(0, game.currentPlayers - 1)
    games.set(gameId, game)
    return true
  }

  /**
   * Utility
   */
  static gameExists(gameId: string): boolean {
    return games.has(gameId)
  }

  /**
   * Get all games a user is participating in (as host or player)
   * Returns games with status: waiting, in-progress
   */
  static getGamesForUser(userId: string): Game[] {
    return Array.from(games.values())
      .filter((game) => {
        // User is host or player
        const isHost = game.hostId === userId
        const isPlayer = game.players.some((p) => p.userId === userId)
        // Only return active games
        return (isHost || isPlayer) && ACTIVE_STATUSES.includes(game.status)
      })
      .map((game) => {
        const hostNickname = NicknameManager.getNickname(game.hostId)
        return {
          ...game,
          hostNickname,
        }
      })
      .sort(this.sortGames)
  }

  /**
   * Delete all inactive games (finished / cancelled)
   */
  static deleteInactiveGames(): number {
    let deletedCount = 0

    for (const [gameId, game] of games.entries()) {
      if (game.status === 'finished' || game.status === 'cancelled') {
        games.delete(gameId)
        deletedCount++
      }
    }

    return deletedCount
  }

  /**
   * Add a comment to a game
   * Only players in the game can comment
   */
  static addComment(
    gameId: string,
    userId: string,
    message: string
  ): { success: boolean; comment?: Comment; error?: string } {
    const game = games.get(gameId)

    if (!game) {
      return {
        success: false,
        error: 'Game not found',
      }
    }

    // Prevent comments if game has ended
    if (game.status === 'finished' || game.status === 'cancelled') {
      return {
        success: false,
        error: 'Cannot comment on a game that has ended',
      }
    }

    // Validate message
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return {
        success: false,
        error: 'Comment message is required and must be a non-empty string',
      }
    }

    // Check if message is too long (e.g., 500 characters)
    if (message.length > 500) {
      return {
        success: false,
        error: 'Comment message is too long (max 500 characters)',
      }
    }

    // Verify user is a player in the game
    const player = game.players.find((p) => p.userId === userId)
    if (!player) {
      return {
        success: false,
        error: 'Only players in the game can comment',
      }
    }

    // Create comment
    const comment: Comment = {
      id: randomUUID(),
      gameId,
      userId,
      nickname: player.nickname,
      message: message.trim(),
      timestamp: new Date(),
      alive: player.alive,
      role: player.role,
    }

    // Add comment to game (prepend to show newest first)
    game.comments.unshift(comment)

    // Limit comments to last 1000 to prevent memory issues
    if (game.comments.length > 1000) {
      game.comments = game.comments.slice(0, 1000)
    }

    games.set(gameId, game)

    return {
      success: true,
      comment,
    }
  }

  /**
   * Get comments for a game
   */
  static getComments(gameId: string, limit?: number): Comment[] {
    const game = games.get(gameId)
    if (!game) {
      return []
    }

    const comments = game.comments || []
    return limit ? comments.slice(0, limit) : comments
  }

  /**
   * Start the game - assign roles and begin day/night cycle
   * For 10 players: 2 mafia, 1 doctor, 7 villagers
   */
  static startGame(
    gameId: string,
    hostId: string,
    onPhaseTransition?: (game: Game) => void // eslint-disable-line no-unused-vars
  ): { success: boolean; game?: Game; error?: string; logs?: GameLog[] } {
    const game = games.get(gameId)
    if (!game) {
      return {
        success: false,
        error: 'Game not found',
      }
    }

    if (game.status !== 'waiting') {
      return {
        success: false,
        error: `Cannot start game with status: ${game.status}. Only waiting games can be started.`,
      }
    }

    if (game.hostId !== hostId) {
      return {
        success: false,
        error: 'Only the host can start the game',
      }
    }

    const playerCount = game.currentPlayers
    // if (playerCount < 5) {
    //   return {
    //     success: false,
    //     error: 'Need at least 5 players to start the game',
    //   }
    // }

    // Calculate role distribution based on player count
    let mafiaCount = 2
    let doctorCount = 1
    let villagerCount = playerCount - mafiaCount - doctorCount

    // Adjust for smaller games (minimum viable)
    if (playerCount < 7) {
      mafiaCount = 1
      // doctorCount = playerCount >= 6 ? 1 : 0
      doctorCount = 1
      villagerCount = playerCount - mafiaCount - doctorCount
    }

    const logs: GameLog[] = []

    // Assign roles first (sequentially)
    let mafiaAssigned = 0
    let doctorAssigned = 0
    for (const player of game.players) {
      if (mafiaAssigned < mafiaCount) {
        player.role = 'mafia'
        mafiaAssigned++
      } else if (doctorAssigned < doctorCount) {
        player.role = 'doctor'
        doctorAssigned++
      } else {
        player.role = 'villager'
      }
      player.alive = true
    }

    // Shuffle players array AFTER role assignment (Fisher-Yates shuffle)
    const players = game.players
    for (let i = players.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[players[i], players[j]] = [players[j], players[i]]
    }

    // Update game state
    game.status = 'in-progress'
    game.phase = 'day'
    game.dayNumber = 1
    game.nightVotes = []
    game.dayVotes = []
    game.doctorHeal = null
    game.players = players
    // Create logs
    const startLog: GameLog = {
      id: randomUUID(),
      message: `Game started! Roles have been assigned. ${mafiaCount} Mafia, ${doctorCount} Doctor, ${villagerCount} Villagers.`,
      timestamp: new Date(),
      type: 'system',
      logKey: 'gameStarted',
      logParams: {
        mafiaCount,
        doctorCount,
        villagerCount,
      },
    }

    const dayLog: GameLog = {
      id: randomUUID(),
      message: 'Day 1 begins. Discuss and vote to lynch a suspect.',
      timestamp: new Date(),
      type: 'phase',
      logKey: 'day1Begins',
    }

    logs.push(startLog, dayLog)
    game.logs.unshift(...logs)

    // Set phase end time (1 minute for day)
    game.phaseEndTime = new Date(Date.now() + 60 * 1000)

    games.set(gameId, game)

    // Set up phase transition callback
    if (onPhaseTransition) {
      setTimeout(() => {
        this.transitionPhase(gameId, onPhaseTransition)
      }, 60 * 1000) // 1 minute
    }

    const enrichedGame = {
      ...game,
      hostNickname: NicknameManager.getNickname(game.hostId),
    }

    return {
      success: true,
      game: enrichedGame,
      logs,
    }
  }

  /**
   * Submit a vote during night (mafia kill or doctor heal)
   */
  static voteNight(
    gameId: string,
    userId: string,
    targetUserId: string | null
  ): { success: boolean; game?: Game; error?: string } {
    const game = games.get(gameId)
    if (!game) {
      return {
        success: false,
        error: 'Game not found',
      }
    }

    if (game.status !== 'in-progress' || game.phase !== 'night') {
      return {
        success: false,
        error: 'Can only vote during night phase',
      }
    }

    const player = game.players.find((p) => p.userId === userId && p.alive)
    if (!player) {
      return {
        success: false,
        error: 'Player not found or not alive',
      }
    }

    // Validate target is alive if voting to kill/heal
    if (targetUserId) {
      const target = game.players.find((p) => p.userId === targetUserId)
      if (!target || !target.alive) {
        return {
          success: false,
          error: 'Target player not found or not alive',
        }
      }
    }

    if (player.role === 'mafia') {
      // Mafia vote
      if (!game.nightVotes) {
        game.nightVotes = []
      }
      // Remove existing vote from this mafia
      game.nightVotes = game.nightVotes.filter((v) => v.fromUserId !== userId)
      // Add new vote
      if (targetUserId) {
        game.nightVotes.push({
          fromUserId: userId,
          targetUserId,
          timestamp: new Date(),
        })
      }
    } else if (player.role === 'doctor') {
      // Doctor heal
      game.doctorHeal = targetUserId
        ? {
            fromUserId: userId,
            targetUserId,
            timestamp: new Date(),
          }
        : null
    } else {
      return {
        success: false,
        error: 'Only mafia and doctor can vote during night',
      }
    }

    games.set(gameId, game)

    const enrichedGame = {
      ...game,
      hostNickname: NicknameManager.getNickname(game.hostId),
    }

    return {
      success: true,
      game: enrichedGame,
    }
  }

  /**
   * Submit a vote during day (villager lynch)
   */
  static voteDay(
    gameId: string,
    userId: string,
    targetUserId: string | null
  ): { success: boolean; game?: Game; error?: string } {
    const game = games.get(gameId)
    if (!game) {
      return {
        success: false,
        error: 'Game not found',
      }
    }

    if (game.status !== 'in-progress' || game.phase !== 'day') {
      return {
        success: false,
        error: 'Can only vote during day phase',
      }
    }

    const player = game.players.find((p) => p.userId === userId && p.alive)
    if (!player) {
      return {
        success: false,
        error: 'Player not found or not alive',
      }
    }

    // Validate target is alive if voting to lynch
    if (targetUserId) {
      const target = game.players.find((p) => p.userId === targetUserId)
      if (!target || !target.alive) {
        return {
          success: false,
          error: 'Target player not found or not alive',
        }
      }
    }

    if (!game.dayVotes) {
      game.dayVotes = []
    }

    // Remove existing vote from this player
    game.dayVotes = game.dayVotes.filter((v) => v.fromUserId !== userId)
    // Add new vote
    if (targetUserId) {
      game.dayVotes.push({
        fromUserId: userId,
        targetUserId,
        timestamp: new Date(),
      })
    }

    games.set(gameId, game)

    const enrichedGame = {
      ...game,
      hostNickname: NicknameManager.getNickname(game.hostId),
    }

    return {
      success: true,
      game: enrichedGame,
    }
  }

  /**
   * Process votes at end of phase and transition to next phase
   */
  static transitionPhase(
    gameId: string,
    onPhaseTransition?: (game: Game) => void // eslint-disable-line no-unused-vars
  ): { success: boolean; game?: Game; logs?: GameLog[] } {
    const game = games.get(gameId)
    if (!game || game.status !== 'in-progress') {
      return { success: false }
    }

    const logs: GameLog[] = []

    // Process votes/kills based on current phase (without changing phase yet)
    if (game.phase === 'day') {
      // Process day votes (lynch)
      const lynchedPlayer = this.processDayVotes(game, logs)
      if (lynchedPlayer) {
        game.players = game.players.map((p) =>
          p.userId === lynchedPlayer.userId ? { ...p, alive: false } : p
        )
      }
    } else {
      // Process night votes (mafia kill)
      const killedPlayer = this.processNightVotes(game, logs)
      if (killedPlayer) {
        game.players = game.players.map((p) =>
          p.userId === killedPlayer.userId ? { ...p, alive: false } : p
        )
      }
    }

    // Check win conditions BEFORE transitioning phase
    // If transitioning to night, check if mafia will win after inevitable night kill
    const isTransitioningToNight = game.phase === 'day'
    const winResult = this.checkWinConditions(game, logs, isTransitioningToNight)
    if (winResult.gameFinished) {
      // Game ended - don't transition phase, just end the game
      game.logs.unshift(...logs)
      games.set(gameId, game)

      const enrichedGame = {
        ...game,
        hostNickname: NicknameManager.getNickname(game.hostId),
      }

      // Emit game state and logs when game ends
      if (onPhaseTransition) {
        onPhaseTransition(enrichedGame)
      }

      return {
        success: true,
        game: enrichedGame,
        logs,
      }
    }

    // Game continues - now transition phase
    if (game.phase === 'day') {
      this.completeDayToNightTransition(game, logs)
    } else {
      this.completeNightToDayTransition(game, logs)
    }

    game.logs.unshift(...logs)
    games.set(gameId, game)

    // Schedule next phase transition
    if (game.status === 'in-progress') {
      setTimeout(() => {
        this.transitionPhase(gameId, onPhaseTransition)
      }, 60 * 1000)
    }

    if (onPhaseTransition) {
      onPhaseTransition({
        ...game,
        hostNickname: NicknameManager.getNickname(game.hostId),
      })
    }

    return {
      success: true,
      game: {
        ...game,
        hostNickname: NicknameManager.getNickname(game.hostId),
      },
      logs,
    }
  }

  /**
   * Check win conditions and end game if met
   * @param game The game to check
   * @param logs Array to add win condition logs to
   * @param isTransitioningToNight If true, checks if mafia will win after inevitable night kill
   */
  private static checkWinConditions(
    game: Game,
    logs: GameLog[],
    isTransitioningToNight: boolean = false
  ): { gameFinished: boolean } {
    const alivePlayers = game.players.filter((p) => p.alive)

    const aliveMafia = alivePlayers.filter((p) => p.role === 'mafia').length
    const aliveDoctors = alivePlayers.filter((p) => p.role === 'doctor').length
    const aliveVillagers = alivePlayers.filter((p) => p.role === 'villager').length

    const aliveOthers = aliveDoctors + aliveVillagers

    // ✅ Villagers win
    if (aliveMafia === 0) {
      game.status = 'finished'
      game.winner = 'villagers'
      logs.push({
        id: randomUUID(),
        message: '🎉 Villagers win! All mafia have been eliminated.',
        timestamp: new Date(),
        type: 'system',
        logKey: 'villagersWin',
      })
      return { gameFinished: true }
    }

    // ✅ Mafia win: full voting control
    if (aliveMafia >= aliveOthers) {
      game.status = 'finished'
      game.winner = 'mafia'
      logs.push({
        id: randomUUID(),
        message: '🎉 Mafia wins! They control the town.',
        timestamp: new Date(),
        type: 'system',
        logKey: 'mafiaWinsControl',
      })
      return { gameFinished: true }
    }

    // ✅ Mafia win: no doctors left + numerical parity
    if (aliveDoctors === 0 && aliveMafia >= aliveVillagers) {
      game.status = 'finished'
      game.winner = 'mafia'
      logs.push({
        id: randomUUID(),
        message: '🎉 Mafia wins! No one can stop them anymore.',
        timestamp: new Date(),
        type: 'system',
        logKey: 'mafiaWinsNoOne',
      })
      return { gameFinished: true }
    }

    // ✅ Mafia win (before night): If transitioning to night with no doctors, check if mafia will win after inevitable kill
    // At night, villagers can't do anything and mafia will kill a villager (no doctor to save)
    // If this results in mafia >= villagers, game should end immediately
    if (isTransitioningToNight && aliveDoctors === 0 && aliveVillagers >= 1) {
      // After night kill: aliveVillagers - 1
      const villagersAfterKill = aliveVillagers - 1
      if (aliveMafia >= villagersAfterKill) {
        game.status = 'finished'
        game.winner = 'mafia'
        logs.push({
          id: randomUUID(),
          message: '🎉 Mafia wins! They will eliminate the remaining villagers tonight.',
          timestamp: new Date(),
          type: 'system',
          logKey: 'mafiaWinsTonight',
        })
        return { gameFinished: true }
      }
    }

    return { gameFinished: false }
  }

  /**
   * Complete transition from Day to Night (phase change only, votes already processed)
   */
  private static completeDayToNightTransition(game: Game, logs: GameLog[]): void {
    // Transition from Day N to Night N (same day number)
    game.phase = 'night'
    game.dayVotes = []

    const nightLog: GameLog = {
      id: randomUUID(),
      message: `Night ${game.dayNumber} begins. Mafia, choose your target. Doctor, choose who to heal.`,
      timestamp: new Date(),
      type: 'phase',
      logKey: 'nightBegins',
      logParams: { nightNumber: game.dayNumber ?? 0 },
    }
    logs.push(nightLog)
    game.phaseEndTime = new Date(Date.now() + 60 * 1000) // 1 minute for night
  }

  /**
   * Complete transition from Night to Day (phase change only, votes already processed)
   */
  private static completeNightToDayTransition(game: Game, logs: GameLog[]): void {
    // Transition from Night N to Day N+1 (increment day number)
    game.dayNumber = (game.dayNumber || 0) + 1
    game.phase = 'day'
    game.nightVotes = []
    game.doctorHeal = null

    const dayLog: GameLog = {
      id: randomUUID(),
      message: `Day ${game.dayNumber} begins. Discuss and vote to lynch a suspect.`,
      timestamp: new Date(),
      type: 'phase',
      logKey: 'dayBegins',
      logParams: { dayNumber: game.dayNumber ?? 1 },
    }
    logs.push(dayLog)
    game.phaseEndTime = new Date(Date.now() + 60 * 1000) // 1 minute for day
  }

  /**
   * Get a random funny death message for mafia kills (returns index + message for i18n)
   */
  private static getRandomMafiaKill(nickname: string): { index: number; message: string } {
    const messages = [
      `🔫 [Mafia Kill] "${nickname}" vanished after a short conversation behind closed doors. 🚪`,
      `🔫 [Mafia Kill] "${nickname}" signed a contract they definitely didn't read. 📝💀`,
      `🔫 [Mafia Kill] "${nickname}" was promoted to an example for others. 📉`,
      `🔫 [Mafia Kill] "${nickname}" misunderstood what 'family meeting' meant. 👨‍👩‍👧‍👦`,
      `🔫 [Mafia Kill] "${nickname}" is now part of an ongoing investigation. 🕵️‍♂️`,
      `🔫 [Mafia Kill] "${nickname}" missed the memo about staying quiet. 🤐`,
      `🔫 [Mafia Kill] "${nickname}" won the argument. Lost everything else. 🥀`,
      `🔫 [Mafia Kill] "${nickname}" was removed from the payroll. Permanently. 💼`,
      `🔫 [Mafia Kill] "${nickname}" learned too much, too fast. 🧠`,
      `🔫 [Mafia Kill] "${nickname}" took responsibility. The mafia took care of the rest. 🪦`,
      `🔫 [Mafia Kill] "${nickname}" won't be causing any more problems. ✔️`,
      `🔫 [Mafia Kill] "${nickname}" is no longer accepting messages. 📵`,
      `🔫 [Mafia Kill] "${nickname}" reached the end of their character arc. 🎭`,
      `🔫 [Mafia Kill] "${nickname}" was last seen nodding nervously. Then silence. 😶`,
      `🔫 [Mafia Kill] "${nickname}" failed the loyalty test. ❌`,
      `🔫 [Mafia Kill] "${nickname}" got edited out of the story. ✂️`,
      `🔫 [Mafia Kill] "${nickname}" found out why we don't ask twice. 🔫`,
      `🔫 [Mafia Kill] "${nickname}" is now a cautionary tale. 📖`,
      `🔫 [Mafia Kill] "${nickname}" took a shortcut. It was final. 🛣️`,
      `🔫 [Mafia Kill] "${nickname}" has been dealt with. 🧤`,
    ]
    const index = Math.floor(Math.random() * messages.length)
    return { index, message: messages[index] }
  }

  /**
   * Get a random funny death message for villagers killing a villager (returns index + message for i18n)
   */
  private static getRandomLynchVillager(
    nickname: string
  ): { index: number; message: string } {
    const messages = [
      `⚖️ [Lynched] "${nickname}" was innocent. The village will pretend this never happened. 😬`,
      `⚖️ [Lynched] "${nickname}" was NOT the mafia. Awkward silence follows… 😶`,
      `⚖️ [Lynched] "${nickname}" died for democracy. Democracy feels bad now. 🗳️💀`,
      `⚖️ [Lynched] "${nickname}" was just vibing. The villagers chose violence. 😐`,
      `⚖️ [Lynched] "${nickname}" trusted the process. That was the mistake. 🤡`,
      `⚖️ [Lynched] "${nickname}" wasn't the mafia. Whoops. 😅`,
      `⚖️ [Lynched] "${nickname}" learned the village has trust issues. 🚩`,
      `⚖️ [Lynched] "${nickname}" was sacrificed to poor logic and loud voices. 📉`,
      `⚖️ [Lynched] "${nickname}" got voted out by vibes alone. 🎭`,
      `⚖️ [Lynched] "${nickname}" was the wrong choice. The mafia approves. 👏`,
      `⚖️ [Lynched] "${nickname}" died so everyone could say "my bad" tomorrow. 🙃`,
      `⚖️ [Lynched] "${nickname}" was innocent. The village has regrets. Briefly. 😔`,
      `⚖️ [Lynched] "${nickname}" trusted their neighbors. Big mistake. 🏘️`,
      `⚖️ [Lynched] "${nickname}" got caught in the classic villagers L. 📉`,
      `⚖️ [Lynched] "${nickname}" was the wrong answer. Final answer. ❌`,
      `⚖️ [Lynched] "${nickname}" paid the price for bad group chat decisions. 📱`,
      `⚖️ [Lynched] "${nickname}" wasn't suspicious. Just unlucky. 🍀`,
      `⚖️ [Lynched] "${nickname}" died to prove the mafia didn't even need to try. 😈`,
    ]
    const index = Math.floor(Math.random() * messages.length)
    return { index, message: messages[index] }
  }

  /**
   * Get a random message for villagers killing a mafia (celebratory) (returns index + message for i18n)
   */
  private static getRandomLynchMafia(
    nickname: string
  ): { index: number; message: string } {
    const messages = [
      `⚖️ [Lynched] "${nickname}" was exposed! The mafia's plan crumbles. 🎯`,
      `⚖️ [Lynched] "${nickname}" got caught red-handed. Justice served! ⚖️`,
      `⚖️ [Lynched] "${nickname}" thought they were slick. The village wasn't having it. 😎`,
      `⚖️ [Lynched] "${nickname}" tried to blend in. Failed spectacularly. 🎭`,
      `⚖️ [Lynched] "${nickname}" was the mafia! The villagers got it right this time. ✅`,
      `⚖️ [Lynched] "${nickname}" got outsmarted by the village. Skill issue. 🧠`,
      `⚖️ [Lynched] "${nickname}" was too sus. The village had enough. 🚨`,
      `⚖️ [Lynched] "${nickname}" made one mistake too many. Game over. 🎮`,
      `⚖️ [Lynched] "${nickname}" was the mafia all along! The village celebrates. 🎉`,
      `⚖️ [Lynched] "${nickname}" got caught. The mafia's numbers are dwindling. 📉`,
      `⚖️ [Lynched] "${nickname}" slipped up. The village caught them. 🕵️`,
      `⚖️ [Lynched] "${nickname}" was playing both sides. The village chose a side. ⚔️`,
      `⚖️ [Lynched] "${nickname}" thought they were safe. They were wrong. ❌`,
      `⚖️ [Lynched] "${nickname}" got voted out for being too obvious. Oops. 😬`,
      `⚖️ [Lynched] "${nickname}" was the mafia! The village's detective work paid off. 🔍`,
    ]
    const index = Math.floor(Math.random() * messages.length)
    return { index, message: messages[index] }
  }

  /**
   * Get a random message for villagers killing a doctor (tragic) (returns index + message for i18n)
   */
  private static getRandomLynchDoctor(
    nickname: string
  ): { index: number; message: string } {
    const messages = [
      `⚖️ [Lynched] "${nickname}" was the doctor! The village just lost their only protection. 😱`,
      `⚖️ [Lynched] "${nickname}" was trying to save lives. The village didn't care. 💔`,
      `⚖️ [Lynched] "${nickname}" was the doctor! Who's going to save you now? 🏥`,
      `⚖️ [Lynched] "${nickname}" was healing people. The village lynched their healer. 🤦`,
      `⚖️ [Lynched] "${nickname}" was the doctor! The mafia is celebrating. 🎉`,
      `⚖️ [Lynched] "${nickname}" saved lives every night. The village killed them anyway. 😢`,
      `⚖️ [Lynched] "${nickname}" was the doctor! This is why we can't have nice things. 😤`,
      `⚖️ [Lynched] "${nickname}" was protecting the innocent. The village didn't notice. 🛡️`,
      `⚖️ [Lynched] "${nickname}" was the doctor! The village just made the mafia's job easier. 😈`,
      `⚖️ [Lynched] "${nickname}" was healing people. The village chose violence instead. ⚔️`,
      `⚖️ [Lynched] "${nickname}" was the doctor! The village has no one to blame but themselves. 🤷`,
      `⚖️ [Lynched] "${nickname}" was saving lives. The village voted to end theirs. 💉`,
      `⚖️ [Lynched] "${nickname}" was the doctor! The mafia sends their thanks. 🙏`,
      `⚖️ [Lynched] "${nickname}" was the village's only hope. Now it's gone. 🌑`,
      `⚖️ [Lynched] "${nickname}" was the doctor! The village just threw away their lifeline. 🚑`,
    ]
    const index = Math.floor(Math.random() * messages.length)
    return { index, message: messages[index] }
  }

  /**
   * Process night votes - mafia kill (can be saved by doctor)
   */
  private static processNightVotes(game: Game, logs: GameLog[]): Player | null {
    if (!game.nightVotes || game.nightVotes.length === 0) {
      const log: GameLog = {
        id: randomUUID(),
        message: 'Night ends. No one was targeted by the mafia.',
        timestamp: new Date(),
        type: 'kill',
        logKey: 'nightNoTarget',
      }
      logs.push(log)
      return null
    }

    // Count mafia votes
    const voteCounts = new Map<string, number>()
    for (const vote of game.nightVotes) {
      if (vote.targetUserId) {
        voteCounts.set(vote.targetUserId, (voteCounts.get(vote.targetUserId) || 0) + 1)
      }
    }

    // Find player with most votes
    let maxVotes = 0
    let targetUserId: string | null = null
    for (const [userId, count] of voteCounts.entries()) {
      if (count > maxVotes) {
        maxVotes = count
        targetUserId = userId
      }
    }

    if (!targetUserId) {
      const log: GameLog = {
        id: randomUUID(),
        message: 'Night ends. No one was targeted by the mafia.',
        timestamp: new Date(),
        type: 'kill',
        logKey: 'nightNoTarget',
      }
      logs.push(log)
      return null
    }

    const targetPlayer = game.players.find((p) => p.userId === targetUserId)
    if (!targetPlayer) {
      return null
    }

    // Check if doctor saved them
    const healed = game.doctorHeal?.targetUserId === targetUserId
    if (healed) {
      const log: GameLog = {
        id: randomUUID(),
        message: `The doctor saved "${targetPlayer.nickname}" from the mafia's attack!`,
        timestamp: new Date(),
        type: 'heal',
        logKey: 'heal',
        logParams: { nickname: targetPlayer.nickname },
      }
      logs.push(log)
      return null
    }

    // Player was killed - use random funny message
    const { index, message: killMessage } = this.getRandomMafiaKill(
      targetPlayer.nickname
    )
    const log: GameLog = {
      id: randomUUID(),
      message: killMessage,
      timestamp: new Date(),
      type: 'kill',
      logKey: `mafiaKill.${index}`,
      logParams: { nickname: targetPlayer.nickname },
    }
    logs.push(log)
    return targetPlayer
  }

  /**
   * Process day votes - villager lynch
   */
  private static processDayVotes(game: Game, logs: GameLog[]): Player | null {
    if (!game.dayVotes || game.dayVotes.length === 0) {
      const log: GameLog = {
        id: randomUUID(),
        message: 'Day ends. No one was lynched.',
        timestamp: new Date(),
        type: 'vote',
        logKey: 'dayNoLynch',
      }
      logs.push(log)
      return null
    }

    // Count votes
    const voteCounts = new Map<string, number>()
    for (const vote of game.dayVotes) {
      if (vote.targetUserId) {
        voteCounts.set(vote.targetUserId, (voteCounts.get(vote.targetUserId) || 0) + 1)
      }
    }

    // Find player with most votes
    let maxVotes = 0
    let targetUserId: string | null = null
    for (const [userId, count] of voteCounts.entries()) {
      if (count > maxVotes) {
        maxVotes = count
        targetUserId = userId
      }
    }

    if (!targetUserId) {
      const log: GameLog = {
        id: randomUUID(),
        message: 'Day ends. No one was lynched.',
        timestamp: new Date(),
        type: 'vote',
        logKey: 'dayNoLynch',
      }
      logs.push(log)
      return null
    }

    const targetPlayer = game.players.find((p) => p.userId === targetUserId)
    if (!targetPlayer) {
      return null
    }

    // Get role-specific lynch message (index + message for i18n)
    let keyPrefix: string
    let lynchResult: { index: number; message: string }
    if (targetPlayer.role === 'mafia') {
      keyPrefix = 'lynchMafia'
      lynchResult = this.getRandomLynchMafia(targetPlayer.nickname)
    } else if (targetPlayer.role === 'doctor') {
      keyPrefix = 'lynchDoctor'
      lynchResult = this.getRandomLynchDoctor(targetPlayer.nickname)
    } else {
      keyPrefix = 'lynchVillager'
      lynchResult = this.getRandomLynchVillager(targetPlayer.nickname)
    }

    const log: GameLog = {
      id: randomUUID(),
      message: lynchResult.message,
      timestamp: new Date(),
      type: 'kill',
      logKey: `${keyPrefix}.${lynchResult.index}`,
      logParams: { nickname: targetPlayer.nickname },
    }
    logs.push(log)
    return targetPlayer
  }
}
