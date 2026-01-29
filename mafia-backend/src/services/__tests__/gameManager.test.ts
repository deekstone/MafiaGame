import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'
import {
  GameManager,
  DOCTOR_LYNCH_MESSAGE_PHRASES,
  VILLAGER_LYNCH_MESSAGE_PHRASES,
} from '../gameManager'
import { NicknameManager } from '../nicknameManager'

describe('GameManager - Winning Conditions', () => {
  // Use fake timers to prevent setTimeout from keeping Jest alive
  beforeEach(() => {
    jest.useFakeTimers()

    // Clean up all games before each test
    const allGames = GameManager.getAllGames()
    for (const game of allGames) {
      GameManager.deleteGame(game.id)
    }

    // Clear nicknames
    const allNicknames = NicknameManager.getAllNicknames()
    for (const userId of allNicknames.keys()) {
      NicknameManager.deleteNickname(userId)
    }
  })

  afterEach(() => {
    // Clear any pending timers and restore real timers
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  describe('Villagers Win Conditions', () => {
    it('should win when all mafia are eliminated', () => {
      // Setup: 1 mafia (dead), 1 doctor (alive), 2 villagers (alive)
      const hostId = 'host-1'
      NicknameManager.setNickname(hostId, 'Host')
      NicknameManager.setNickname('player-1', 'Player1')
      NicknameManager.setNickname('player-2', 'Player2')
      NicknameManager.setNickname('player-3', 'Player3')
      NicknameManager.setNickname('player-4', 'Player4')

      const game = GameManager.createGame(hostId, { name: 'Test Game' })

      // Manually set players for testing
      game.players = [
        { userId: 'host-1', nickname: 'Host', role: 'mafia', alive: false },
        { userId: 'player-1', nickname: 'Player1', role: 'doctor', alive: true },
        { userId: 'player-2', nickname: 'Player2', role: 'villager', alive: true },
        { userId: 'player-3', nickname: 'Player3', role: 'villager', alive: true },
      ]
      game.status = 'in-progress'
      game.phase = 'day'
      game.dayNumber = 1

      const onPhaseTransition = jest.fn()
      const result = GameManager.transitionPhase(game.id, onPhaseTransition)

      expect(result.success).toBe(true)
      expect(result.game?.status).toBe('finished')
      expect(result.logs?.some((log) => log.message.includes('Villagers win'))).toBe(true)
      expect(
        result.logs?.some((log) => log.message.includes('All mafia have been eliminated'))
      ).toBe(true)
    })

    it('should win when last mafia is lynched during day phase', () => {
      // Win conditions are now checked AFTER processing votes, so the game should end immediately
      // after the lynch when all mafia are eliminated
      const hostId = 'host-1'
      NicknameManager.setNickname(hostId, 'Host')
      NicknameManager.setNickname('mafia-1', 'Mafia1')
      NicknameManager.setNickname('villager-1', 'Villager1')
      NicknameManager.setNickname('villager-2', 'Villager2')

      const game = GameManager.createGame(hostId, { name: 'Test Game' })
      game.players = [
        { userId: 'host-1', nickname: 'Host', role: 'villager', alive: true },
        { userId: 'mafia-1', nickname: 'Mafia1', role: 'mafia', alive: true },
        { userId: 'villager-1', nickname: 'Villager1', role: 'villager', alive: true },
        { userId: 'villager-2', nickname: 'Villager2', role: 'villager', alive: true },
      ]
      game.status = 'in-progress'
      game.phase = 'day'
      game.dayNumber = 1
      game.dayVotes = [
        { fromUserId: 'host-1', targetUserId: 'mafia-1', timestamp: new Date() },
        { fromUserId: 'villager-1', targetUserId: 'mafia-1', timestamp: new Date() },
        { fromUserId: 'villager-2', targetUserId: 'mafia-1', timestamp: new Date() },
      ]

      const onPhaseTransition = jest.fn()
      // Single transition: process lynch (kills mafia) and check win conditions immediately
      const result = GameManager.transitionPhase(game.id, onPhaseTransition)
      expect(result.success).toBe(true)
      expect(result.game?.status).toBe('finished')
      expect(result.logs?.some((log) => log.message.includes('Villagers win'))).toBe(true)
    })

    it('should win when only villagers remain', () => {
      const hostId = 'host-1'
      NicknameManager.setNickname(hostId, 'Host')
      NicknameManager.setNickname('villager-1', 'Villager1')
      NicknameManager.setNickname('villager-2', 'Villager2')

      const game = GameManager.createGame(hostId, { name: 'Test Game' })
      game.players = [
        { userId: 'host-1', nickname: 'Host', role: 'villager', alive: true },
        { userId: 'villager-1', nickname: 'Villager1', role: 'villager', alive: true },
        { userId: 'villager-2', nickname: 'Villager2', role: 'villager', alive: true },
      ]
      game.status = 'in-progress'
      game.phase = 'day'
      game.dayNumber = 1

      const onPhaseTransition = jest.fn()
      const result = GameManager.transitionPhase(game.id, onPhaseTransition)

      expect(result.success).toBe(true)
      expect(result.game?.status).toBe('finished')
      expect(result.logs?.some((log) => log.message.includes('Villagers win'))).toBe(true)
    })
  })

  describe('Mafia Win Conditions', () => {
    it('should win when mafia have full voting control (mafia >= others)', () => {
      // Scenario: 2 mafia alive, 1 doctor alive, 1 villager alive
      // aliveMafia (2) >= aliveOthers (1+1=2) -> Mafia wins
      const hostId = 'host-1'
      NicknameManager.setNickname(hostId, 'Host')
      NicknameManager.setNickname('mafia-1', 'Mafia1')
      NicknameManager.setNickname('mafia-2', 'Mafia2')
      NicknameManager.setNickname('doctor-1', 'Doctor1')
      NicknameManager.setNickname('villager-1', 'Villager1')

      const game = GameManager.createGame(hostId, { name: 'Test Game' })
      game.players = [
        { userId: 'host-1', nickname: 'Host', role: 'mafia', alive: true },
        { userId: 'mafia-1', nickname: 'Mafia1', role: 'mafia', alive: true },
        { userId: 'doctor-1', nickname: 'Doctor1', role: 'doctor', alive: true },
        { userId: 'villager-1', nickname: 'Villager1', role: 'villager', alive: true },
      ]
      game.status = 'in-progress'
      game.phase = 'day'
      game.dayNumber = 1

      const onPhaseTransition = jest.fn()
      const result = GameManager.transitionPhase(game.id, onPhaseTransition)

      expect(result.success).toBe(true)
      expect(result.game?.status).toBe('finished')
      expect(result.logs?.some((log) => log.message.includes('Mafia wins'))).toBe(true)
      expect(result.logs?.some((log) => log.message.includes('They control the town'))).toBe(true)
    })

    it('should win when mafia have majority (mafia > others)', () => {
      // Scenario: 3 mafia alive, 2 others alive
      const hostId = 'host-1'
      NicknameManager.setNickname(hostId, 'Host')
      NicknameManager.setNickname('mafia-1', 'Mafia1')
      NicknameManager.setNickname('mafia-2', 'Mafia2')
      NicknameManager.setNickname('mafia-3', 'Mafia3')
      NicknameManager.setNickname('doctor-1', 'Doctor1')
      NicknameManager.setNickname('villager-1', 'Villager1')

      const game = GameManager.createGame(hostId, { name: 'Test Game' })
      game.players = [
        { userId: 'host-1', nickname: 'Host', role: 'mafia', alive: true },
        { userId: 'mafia-1', nickname: 'Mafia1', role: 'mafia', alive: true },
        { userId: 'mafia-2', nickname: 'Mafia2', role: 'mafia', alive: true },
        { userId: 'doctor-1', nickname: 'Doctor1', role: 'doctor', alive: true },
        { userId: 'villager-1', nickname: 'Villager1', role: 'villager', alive: true },
      ]
      game.status = 'in-progress'
      game.phase = 'day'
      game.dayNumber = 1

      const onPhaseTransition = jest.fn()
      const result = GameManager.transitionPhase(game.id, onPhaseTransition)

      expect(result.success).toBe(true)
      expect(result.game?.status).toBe('finished')
      expect(result.logs?.some((log) => log.message.includes('Mafia wins'))).toBe(true)
    })

    it('should win when no doctors left and mafia have parity (mafia >= villagers)', () => {
      // Scenario: 2 mafia alive, 0 doctors, 2 villagers alive
      // aliveDoctors (0) && aliveMafia (2) >= aliveVillagers (2) -> Mafia wins
      // Note: When doctors = 0, condition 2 (full control) triggers first because:
      // aliveOthers = aliveDoctors + aliveVillagers = 0 + 2 = 2
      // aliveMafia (2) >= aliveOthers (2) -> triggers condition 2 first
      // So condition 3 never gets checked. Both messages are valid, but condition 2 wins.
      const hostId = 'host-1'
      NicknameManager.setNickname(hostId, 'Host')
      NicknameManager.setNickname('mafia-1', 'Mafia1')
      NicknameManager.setNickname('mafia-2', 'Mafia2')
      NicknameManager.setNickname('villager-1', 'Villager1')
      NicknameManager.setNickname('villager-2', 'Villager2')

      const game = GameManager.createGame(hostId, { name: 'Test Game' })
      game.players = [
        { userId: 'host-1', nickname: 'Host', role: 'mafia', alive: true },
        { userId: 'mafia-1', nickname: 'Mafia1', role: 'mafia', alive: true },
        { userId: 'villager-1', nickname: 'Villager1', role: 'villager', alive: true },
        { userId: 'villager-2', nickname: 'Villager2', role: 'villager', alive: true },
      ]
      game.status = 'in-progress'
      game.phase = 'day'
      game.dayNumber = 1

      const onPhaseTransition = jest.fn()
      const result = GameManager.transitionPhase(game.id, onPhaseTransition)

      expect(result.success).toBe(true)
      expect(result.game?.status).toBe('finished')
      expect(result.logs?.some((log) => log.message.includes('Mafia wins'))).toBe(true)
      // Condition 2 triggers first (full control), so we get "They control the town" message
      // Condition 3 never gets checked because condition 2 returns early
      expect(result.logs?.some((log) => log.message.includes('They control the town'))).toBe(true)
    })

    it('should win when no doctors left and mafia outnumber villagers', () => {
      // Scenario: 3 mafia alive, 0 doctors, 2 villagers alive
      const hostId = 'host-1'
      NicknameManager.setNickname(hostId, 'Host')
      NicknameManager.setNickname('mafia-1', 'Mafia1')
      NicknameManager.setNickname('mafia-2', 'Mafia2')
      NicknameManager.setNickname('mafia-3', 'Mafia3')
      NicknameManager.setNickname('villager-1', 'Villager1')
      NicknameManager.setNickname('villager-2', 'Villager2')

      const game = GameManager.createGame(hostId, { name: 'Test Game' })
      game.players = [
        { userId: 'host-1', nickname: 'Host', role: 'mafia', alive: true },
        { userId: 'mafia-1', nickname: 'Mafia1', role: 'mafia', alive: true },
        { userId: 'mafia-2', nickname: 'Mafia2', role: 'mafia', alive: true },
        { userId: 'villager-1', nickname: 'Villager1', role: 'villager', alive: true },
        { userId: 'villager-2', nickname: 'Villager2', role: 'villager', alive: true },
      ]
      game.status = 'in-progress'
      game.phase = 'day'
      game.dayNumber = 1

      const onPhaseTransition = jest.fn()
      const result = GameManager.transitionPhase(game.id, onPhaseTransition)

      expect(result.success).toBe(true)
      expect(result.game?.status).toBe('finished')
      expect(result.logs?.some((log) => log.message.includes('Mafia wins'))).toBe(true)
    })

    it('should win when only mafia and doctor remain (1 mafia vs 1 doctor)', () => {
      // Final scenario: 1 mafia alive, 1 doctor alive, 0 villagers
      // aliveMafia (1) >= aliveOthers (0 + 1 = 1) -> Mafia wins (full control)
      // This tests the critical end-game scenario where only mafia and doctor remain
      const hostId = 'host-1'
      NicknameManager.setNickname(hostId, 'Host')
      NicknameManager.setNickname('doctor-1', 'Doctor1')

      const game = GameManager.createGame(hostId, { name: 'Test Game' })
      game.players = [
        { userId: 'host-1', nickname: 'Host', role: 'mafia', alive: true },
        { userId: 'doctor-1', nickname: 'Doctor1', role: 'doctor', alive: true },
      ]
      game.status = 'in-progress'
      game.phase = 'day'
      game.dayNumber = 1

      const onPhaseTransition = jest.fn()
      const result = GameManager.transitionPhase(game.id, onPhaseTransition)

      expect(result.success).toBe(true)
      expect(result.game?.status).toBe('finished')
      expect(result.logs?.some((log) => log.message.includes('Mafia wins'))).toBe(true)
      expect(result.logs?.some((log) => log.message.includes('They control the town'))).toBe(true)
    })

    it('should win immediately after villager is lynched leaving mafia with parity (3 players scenario)', () => {
      // Scenario: Day 1 with 3 players - villager, mafia, doc
      // Doc votes for villager -> villager is lynched
      // After lynch: 1 mafia, 1 doc -> Mafia wins (1 >= 1)
      // This tests the exact scenario from the bug report
      const hostId = 'host-1'
      NicknameManager.setNickname(hostId, 'Host')
      NicknameManager.setNickname('mafia-1', 'Mafia1')
      NicknameManager.setNickname('doctor-1', 'Doctor1')

      const game = GameManager.createGame(hostId, { name: 'Test Game' })
      game.players = [
        { userId: 'host-1', nickname: 'Host', role: 'villager', alive: true },
        { userId: 'mafia-1', nickname: 'Mafia1', role: 'mafia', alive: true },
        { userId: 'doctor-1', nickname: 'Doctor1', role: 'doctor', alive: true },
      ]
      game.status = 'in-progress'
      game.phase = 'day'
      game.dayNumber = 1
      game.dayVotes = [{ fromUserId: 'doctor-1', targetUserId: 'host-1', timestamp: new Date() }]

      const onPhaseTransition = jest.fn()
      // Single transition: process lynch (kills villager) and check win conditions immediately
      // After lynch: 1 mafia >= 1 other (doc) -> Mafia wins
      const result = GameManager.transitionPhase(game.id, onPhaseTransition)

      expect(result.success).toBe(true)
      expect(result.game?.status).toBe('finished')
      expect(result.logs?.some((log) => log.message.includes('Mafia wins'))).toBe(true)
      expect(result.logs?.some((log) => log.message.includes('They control the town'))).toBe(true)
    })

    it('should win during night phase when conditions are met', () => {
      // Mafia wins at night: 2 mafia >= 2 others (1 doctor + 1 villager)
      const hostId = 'host-1'
      NicknameManager.setNickname(hostId, 'Host')
      NicknameManager.setNickname('mafia-1', 'Mafia1')
      NicknameManager.setNickname('doctor-1', 'Doctor1')
      NicknameManager.setNickname('villager-1', 'Villager1')

      const game = GameManager.createGame(hostId, { name: 'Test Game' })
      game.players = [
        { userId: 'host-1', nickname: 'Host', role: 'mafia', alive: true },
        { userId: 'mafia-1', nickname: 'Mafia1', role: 'mafia', alive: true },
        { userId: 'doctor-1', nickname: 'Doctor1', role: 'doctor', alive: true },
        { userId: 'villager-1', nickname: 'Villager1', role: 'villager', alive: true },
      ]
      game.status = 'in-progress'
      game.phase = 'night'
      game.dayNumber = 1

      const onPhaseTransition = jest.fn()
      const result = GameManager.transitionPhase(game.id, onPhaseTransition)

      expect(result.success).toBe(true)
      expect(result.game?.status).toBe('finished')
      expect(result.logs?.some((log) => log.message.includes('Mafia wins'))).toBe(true)
    })

    it('should win immediately when transitioning to night with 2 villagers, 1 mafia, and no doctor', () => {
      // Scenario: Day phase ends, doctor was lynched
      // Remaining: 2 villagers, 1 mafia, 0 doctors
      // Game should end immediately before night because:
      // - At night, villagers can't do anything
      // - Mafia will kill one villager (no doctor to save)
      // - After kill: 1 villager, 1 mafia -> mafia wins (1 >= 1)
      const hostId = 'host-1'
      NicknameManager.setNickname(hostId, 'Host')
      NicknameManager.setNickname('mafia-1', 'Mafia1')
      NicknameManager.setNickname('doctor-1', 'Doctor1')
      NicknameManager.setNickname('villager-1', 'Villager1')
      NicknameManager.setNickname('villager-2', 'Villager2')

      const game = GameManager.createGame(hostId, { name: 'Test Game' })
      game.players = [
        { userId: 'host-1', nickname: 'Host', role: 'villager', alive: true },
        { userId: 'villager-1', nickname: 'Villager1', role: 'villager', alive: true },
        { userId: 'mafia-1', nickname: 'Mafia1', role: 'mafia', alive: true },
        { userId: 'doctor-1', nickname: 'Doctor1', role: 'doctor', alive: true },
      ]
      game.status = 'in-progress'
      game.phase = 'day'
      game.dayNumber = 1
      // Doctor is lynched during day
      game.dayVotes = [
        { fromUserId: 'host-1', targetUserId: 'doctor-1', timestamp: new Date() },
        { fromUserId: 'villager-1', targetUserId: 'doctor-1', timestamp: new Date() },
        { fromUserId: 'mafia-1', targetUserId: 'doctor-1', timestamp: new Date() },
      ]

      const onPhaseTransition = jest.fn()
      // After lynching doctor: 2 villagers, 1 mafia, 0 doctors remain
      // Game should end immediately (before transitioning to night)
      const result = GameManager.transitionPhase(game.id, onPhaseTransition)

      expect(result.success).toBe(true)
      expect(result.game?.status).toBe('finished')
      expect(result.game?.winner).toBe('mafia')
      expect(result.game?.phase).toBe('day') // Should still be day phase, not transitioned to night
      expect(result.logs?.some((log) => log.message.includes('Mafia wins'))).toBe(true)
      expect(
        result.logs?.some((log) =>
          log.message.includes('will eliminate the remaining villagers tonight')
        )
      ).toBe(true)
    })
  })

  describe('Edge Cases for Winning Conditions', () => {
    it('should NOT end game when mafia < others (but doctors still alive)', () => {
      // Scenario: 1 mafia, 1 doctor, 2 villagers (mafia < others, but doctor alive)
      const hostId = 'host-1'
      NicknameManager.setNickname(hostId, 'Host')
      NicknameManager.setNickname('mafia-1', 'Mafia1')
      NicknameManager.setNickname('doctor-1', 'Doctor1')
      NicknameManager.setNickname('villager-1', 'Villager1')
      NicknameManager.setNickname('villager-2', 'Villager2')

      const game = GameManager.createGame(hostId, { name: 'Test Game' })
      game.players = [
        { userId: 'host-1', nickname: 'Host', role: 'mafia', alive: true },
        { userId: 'doctor-1', nickname: 'Doctor1', role: 'doctor', alive: true },
        { userId: 'villager-1', nickname: 'Villager1', role: 'villager', alive: true },
        { userId: 'villager-2', nickname: 'Villager2', role: 'villager', alive: true },
      ]
      game.status = 'in-progress'
      game.phase = 'day'
      game.dayNumber = 1

      const onPhaseTransition = jest.fn()
      const result = GameManager.transitionPhase(game.id, onPhaseTransition)

      expect(result.success).toBe(true)
      expect(result.game?.status).toBe('in-progress') // Game continues
    })

    it('should NOT end game when mafia = villagers but doctors still alive', () => {
      // Scenario: 2 mafia, 1 doctor, 2 villagers
      // aliveMafia (2) < aliveOthers (1+2=3) -> No win
      const hostId = 'host-1'
      NicknameManager.setNickname(hostId, 'Host')
      NicknameManager.setNickname('mafia-1', 'Mafia1')
      NicknameManager.setNickname('mafia-2', 'Mafia2')
      NicknameManager.setNickname('doctor-1', 'Doctor1')
      NicknameManager.setNickname('villager-1', 'Villager1')
      NicknameManager.setNickname('villager-2', 'Villager2')

      const game = GameManager.createGame(hostId, { name: 'Test Game' })
      game.players = [
        { userId: 'host-1', nickname: 'Host', role: 'mafia', alive: true },
        { userId: 'mafia-1', nickname: 'Mafia1', role: 'mafia', alive: true },
        { userId: 'doctor-1', nickname: 'Doctor1', role: 'doctor', alive: true },
        { userId: 'villager-1', nickname: 'Villager1', role: 'villager', alive: true },
        { userId: 'villager-2', nickname: 'Villager2', role: 'villager', alive: true },
      ]
      game.status = 'in-progress'
      game.phase = 'day'
      game.dayNumber = 1

      const onPhaseTransition = jest.fn()
      const result = GameManager.transitionPhase(game.id, onPhaseTransition)

      expect(result.success).toBe(true)
      expect(result.game?.status).toBe('in-progress') // Game continues
    })

    it('should handle tie condition correctly (mafia = villagers, no doctors)', () => {
      // Scenario: 1 mafia, 0 doctors, 1 villager
      // This should trigger mafia win (parity condition)
      const hostId = 'host-1'
      NicknameManager.setNickname(hostId, 'Host')
      NicknameManager.setNickname('villager-1', 'Villager1')

      const game = GameManager.createGame(hostId, { name: 'Test Game' })
      game.players = [
        { userId: 'host-1', nickname: 'Host', role: 'mafia', alive: true },
        { userId: 'villager-1', nickname: 'Villager1', role: 'villager', alive: true },
      ]
      game.status = 'in-progress'
      game.phase = 'day'
      game.dayNumber = 1

      const onPhaseTransition = jest.fn()
      const result = GameManager.transitionPhase(game.id, onPhaseTransition)

      expect(result.success).toBe(true)
      expect(result.game?.status).toBe('finished')
      expect(result.logs?.some((log) => log.message.includes('Mafia wins'))).toBe(true)
    })

    it('should check win conditions after night kill reduces villagers', () => {
      // Setup: After night kill, we have 2 mafia, 1 doctor, 0 villagers
      // aliveMafia (2) >= aliveOthers (1+0=1) -> Mafia wins
      // Note: Win conditions are checked at START of transitionPhase and also AFTER processing votes
      // This test simulates the state AFTER a kill has occurred (no votes to process)
      const hostId = 'host-1'
      NicknameManager.setNickname(hostId, 'Host')
      NicknameManager.setNickname('mafia-1', 'Mafia1')
      NicknameManager.setNickname('doctor-1', 'Doctor1')

      const game = GameManager.createGame(hostId, { name: 'Test Game' })
      // Simulate state after villager was killed - only mafia and doctor remain
      game.players = [
        { userId: 'host-1', nickname: 'Host', role: 'mafia', alive: true },
        { userId: 'mafia-1', nickname: 'Mafia1', role: 'mafia', alive: true },
        { userId: 'doctor-1', nickname: 'Doctor1', role: 'doctor', alive: true },
      ]
      game.status = 'in-progress'
      game.phase = 'night'
      game.dayNumber = 1

      const onPhaseTransition = jest.fn()
      const result = GameManager.transitionPhase(game.id, onPhaseTransition)

      // 2 mafia >= 1 doctor -> Mafia wins (full control)
      expect(result.success).toBe(true)
      expect(result.game?.status).toBe('finished')
      expect(result.logs?.some((log) => log.message.includes('Mafia wins'))).toBe(true)
    })

    it('should check win conditions after day lynch reduces mafia', () => {
      // Setup: 1 mafia, 1 doctor, 3 villagers
      // After lynch: 0 mafia, 1 doctor, 3 villagers -> Villagers win
      // Win conditions are now checked AFTER processing votes, so the game should end immediately
      const hostId = 'host-1'
      NicknameManager.setNickname(hostId, 'Host')
      NicknameManager.setNickname('mafia-1', 'Mafia1')
      NicknameManager.setNickname('doctor-1', 'Doctor1')
      NicknameManager.setNickname('villager-1', 'Villager1')
      NicknameManager.setNickname('villager-2', 'Villager2')
      NicknameManager.setNickname('villager-3', 'Villager3')

      const game = GameManager.createGame(hostId, { name: 'Test Game' })
      game.players = [
        { userId: 'host-1', nickname: 'Host', role: 'mafia', alive: true },
        { userId: 'doctor-1', nickname: 'Doctor1', role: 'doctor', alive: true },
        { userId: 'villager-1', nickname: 'Villager1', role: 'villager', alive: true },
        { userId: 'villager-2', nickname: 'Villager2', role: 'villager', alive: true },
        { userId: 'villager-3', nickname: 'Villager3', role: 'villager', alive: true },
      ]
      game.status = 'in-progress'
      game.phase = 'day'
      game.dayNumber = 1
      game.dayVotes = [
        { fromUserId: 'doctor-1', targetUserId: 'host-1', timestamp: new Date() },
        { fromUserId: 'villager-1', targetUserId: 'host-1', timestamp: new Date() },
        { fromUserId: 'villager-2', targetUserId: 'host-1', timestamp: new Date() },
        { fromUserId: 'villager-3', targetUserId: 'host-1', timestamp: new Date() },
      ]

      const onPhaseTransition = jest.fn()
      // Single transition: process lynch (kills mafia) and check win conditions immediately
      const result = GameManager.transitionPhase(game.id, onPhaseTransition)
      expect(result.success).toBe(true)
      expect(result.game?.status).toBe('finished')
      expect(result.logs?.some((log) => log.message.includes('Villagers win'))).toBe(true)
    })

    it('should handle minimum viable game (3 players)', () => {
      // 1 mafia, 1 doctor, 1 villager
      const hostId = 'host-1'
      NicknameManager.setNickname(hostId, 'Host')
      NicknameManager.setNickname('doctor-1', 'Doctor1')
      NicknameManager.setNickname('villager-1', 'Villager1')

      const game = GameManager.createGame(hostId, { name: 'Test Game' })
      game.players = [
        { userId: 'host-1', nickname: 'Host', role: 'mafia', alive: true },
        { userId: 'doctor-1', nickname: 'Doctor1', role: 'doctor', alive: true },
        { userId: 'villager-1', nickname: 'Villager1', role: 'villager', alive: true },
      ]
      game.status = 'in-progress'
      game.phase = 'day'
      game.dayNumber = 1

      const onPhaseTransition = jest.fn()
      const result = GameManager.transitionPhase(game.id, onPhaseTransition)

      // 1 mafia < 2 others, so game continues
      expect(result.success).toBe(true)
      expect(result.game?.status).toBe('in-progress')
    })

    it('should handle all mafia eliminated edge case', () => {
      // Only villagers remain (mafia all dead)
      const hostId = 'host-1'
      NicknameManager.setNickname(hostId, 'Host')
      NicknameManager.setNickname('villager-1', 'Villager1')
      NicknameManager.setNickname('villager-2', 'Villager2')

      const game = GameManager.createGame(hostId, { name: 'Test Game' })
      game.players = [
        { userId: 'host-1', nickname: 'Host', role: 'villager', alive: true },
        { userId: 'villager-1', nickname: 'Villager1', role: 'villager', alive: true },
        { userId: 'villager-2', nickname: 'Villager2', role: 'villager', alive: true },
      ]
      game.status = 'in-progress'
      game.phase = 'day'
      game.dayNumber = 1

      const onPhaseTransition = jest.fn()
      const result = GameManager.transitionPhase(game.id, onPhaseTransition)

      expect(result.success).toBe(true)
      expect(result.game?.status).toBe('finished')
      expect(result.logs?.some((log) => log.message.includes('Villagers win'))).toBe(true)
    })
  })

  describe('Win Condition Priority', () => {
    it('should prioritize villagers win over mafia win when all mafia eliminated', () => {
      // Even if mafia >= others condition might seem true, villagers win takes priority
      // This tests the order of checks in checkWinConditions
      // When aliveMafia === 0, the first condition (villagers win) triggers,
      // preventing the second condition (mafia win) from being checked
      const hostId = 'host-1'
      NicknameManager.setNickname(hostId, 'Host')
      NicknameManager.setNickname('villager-1', 'Villager1')

      const game = GameManager.createGame(hostId, { name: 'Test Game' })
      game.players = [
        { userId: 'host-1', nickname: 'Host', role: 'villager', alive: true },
        { userId: 'villager-1', nickname: 'Villager1', role: 'villager', alive: true },
      ]
      game.status = 'in-progress'
      game.phase = 'day'
      game.dayNumber = 1

      const onPhaseTransition = jest.fn()
      const result = GameManager.transitionPhase(game.id, onPhaseTransition)

      // Should be villagers win, not mafia win
      expect(result.success).toBe(true)
      expect(result.game?.status).toBe('finished')
      // Check that villagers win log exists
      expect(result.logs?.some((log) => log.message.includes('Villagers win'))).toBe(true)
      // Ensure no mafia win log exists
      expect(result.logs?.some((log) => log.message.includes('Mafia wins'))).toBe(false)
    })
  })

  describe('Kill Messages', () => {
    describe('Mafia Kills', () => {
      it('should use mafia kill message when mafia kills a villager', () => {
        const hostId = 'host-1'
        NicknameManager.setNickname(hostId, 'Host')
        NicknameManager.setNickname('mafia-1', 'Mafia1')
        NicknameManager.setNickname('villager-1', 'Villager1')

        const game = GameManager.createGame(hostId, { name: 'Test Game' })
        game.players = [
          { userId: 'host-1', nickname: 'Host', role: 'mafia', alive: true },
          { userId: 'mafia-1', nickname: 'Mafia1', role: 'mafia', alive: true },
          { userId: 'villager-1', nickname: 'Villager1', role: 'villager', alive: true },
        ]
        game.status = 'in-progress'
        game.phase = 'night'
        game.dayNumber = 1
        game.nightVotes = [
          { fromUserId: 'host-1', targetUserId: 'villager-1', timestamp: new Date() },
          { fromUserId: 'mafia-1', targetUserId: 'villager-1', timestamp: new Date() },
        ]

        const onPhaseTransition = jest.fn()
        const result = GameManager.transitionPhase(game.id, onPhaseTransition)

        expect(result.success).toBe(true)
        const killLog = result.logs?.find(
          (log) => log.type === 'kill' && log.message.includes('Villager1')
        )
        expect(killLog).toBeDefined()
        expect(killLog?.message).toContain('🔫 [Mafia Kill]')
        expect(killLog?.message).toContain('Villager1')
      })

      it('should use mafia kill message when mafia kills a doctor', () => {
        const hostId = 'host-1'
        NicknameManager.setNickname(hostId, 'Host')
        NicknameManager.setNickname('mafia-1', 'Mafia1')
        NicknameManager.setNickname('doctor-1', 'Doctor1')

        const game = GameManager.createGame(hostId, { name: 'Test Game' })
        game.players = [
          { userId: 'host-1', nickname: 'Host', role: 'mafia', alive: true },
          { userId: 'mafia-1', nickname: 'Mafia1', role: 'mafia', alive: true },
          { userId: 'doctor-1', nickname: 'Doctor1', role: 'doctor', alive: true },
        ]
        game.status = 'in-progress'
        game.phase = 'night'
        game.dayNumber = 1
        game.nightVotes = [
          { fromUserId: 'host-1', targetUserId: 'doctor-1', timestamp: new Date() },
          { fromUserId: 'mafia-1', targetUserId: 'doctor-1', timestamp: new Date() },
        ]

        const onPhaseTransition = jest.fn()
        const result = GameManager.transitionPhase(game.id, onPhaseTransition)

        expect(result.success).toBe(true)
        const killLog = result.logs?.find(
          (log) => log.type === 'kill' && log.message.includes('Doctor1')
        )
        expect(killLog).toBeDefined()
        expect(killLog?.message).toContain('🔫 [Mafia Kill]')
        expect(killLog?.message).toContain('Doctor1')
      })
    })

    describe('Villager Lynchings', () => {
      it('should use villager lynch message when villagers lynch a villager', () => {
        const hostId = 'host-1'
        NicknameManager.setNickname(hostId, 'Host')
        NicknameManager.setNickname('villager-1', 'Villager1')
        NicknameManager.setNickname('villager-2', 'Villager2')
        NicknameManager.setNickname('villager-3', 'Villager3')

        const game = GameManager.createGame(hostId, { name: 'Test Game' })
        game.players = [
          { userId: 'host-1', nickname: 'Host', role: 'villager', alive: true },
          { userId: 'villager-1', nickname: 'Villager1', role: 'villager', alive: true },
          { userId: 'villager-2', nickname: 'Villager2', role: 'villager', alive: true },
          { userId: 'villager-3', nickname: 'Villager3', role: 'villager', alive: true },
        ]
        game.status = 'in-progress'
        game.phase = 'day'
        game.dayNumber = 1
        game.dayVotes = [
          { fromUserId: 'host-1', targetUserId: 'villager-1', timestamp: new Date() },
          { fromUserId: 'villager-2', targetUserId: 'villager-1', timestamp: new Date() },
          { fromUserId: 'villager-3', targetUserId: 'villager-1', timestamp: new Date() },
        ]

        const onPhaseTransition = jest.fn()
        const result = GameManager.transitionPhase(game.id, onPhaseTransition)

        expect(result.success).toBe(true)
        const killLog = result.logs?.find(
          (log) => log.type === 'kill' && log.message.includes('Villager1')
        )
        expect(killLog).toBeDefined()
        expect(killLog?.message).toContain('⚖️ [Lynched]')
        expect(killLog?.message).toContain('Villager1')
        // Should have one of the villager-specific messages (innocent/not mafia)
        const hasVillagerMessage = VILLAGER_LYNCH_MESSAGE_PHRASES.some((phrase: string) =>
          killLog?.message.includes(phrase)
        )
        expect(hasVillagerMessage).toBe(true)
      })

      it('should use mafia lynch message when villagers lynch a mafia', () => {
        const hostId = 'host-1'
        NicknameManager.setNickname(hostId, 'Host')
        NicknameManager.setNickname('mafia-1', 'Mafia1')
        NicknameManager.setNickname('villager-1', 'Villager1')
        NicknameManager.setNickname('villager-2', 'Villager2')

        const game = GameManager.createGame(hostId, { name: 'Test Game' })
        game.players = [
          { userId: 'host-1', nickname: 'Host', role: 'villager', alive: true },
          { userId: 'mafia-1', nickname: 'Mafia1', role: 'mafia', alive: true },
          { userId: 'villager-1', nickname: 'Villager1', role: 'villager', alive: true },
          { userId: 'villager-2', nickname: 'Villager2', role: 'villager', alive: true },
        ]
        game.status = 'in-progress'
        game.phase = 'day'
        game.dayNumber = 1
        game.dayVotes = [
          { fromUserId: 'host-1', targetUserId: 'mafia-1', timestamp: new Date() },
          { fromUserId: 'villager-1', targetUserId: 'mafia-1', timestamp: new Date() },
          { fromUserId: 'villager-2', targetUserId: 'mafia-1', timestamp: new Date() },
        ]

        const onPhaseTransition = jest.fn()
        const result = GameManager.transitionPhase(game.id, onPhaseTransition)

        expect(result.success).toBe(true)
        const killLog = result.logs?.find(
          (log) => log.type === 'kill' && log.message.includes('Mafia1')
        )
        expect(killLog).toBeDefined()
        expect(killLog?.message).toContain('⚖️ [Lynched]')
        expect(killLog?.message).toContain('Mafia1')
        // Should have one of the mafia-specific celebratory messages (check multiple possible phrases)
        const hasMafiaMessage =
          killLog?.message.includes('exposed') ||
          killLog?.message.includes('caught') ||
          killLog?.message.includes('was the mafia') ||
          killLog?.message.includes('celebrates') ||
          killLog?.message.includes('outsmarted') ||
          killLog?.message.includes('slick') ||
          killLog?.message.includes('blend in') ||
          killLog?.message.includes('too sus') ||
          killLog?.message.includes('mistake') ||
          killLog?.message.includes('slipped up') ||
          killLog?.message.includes('playing both sides') ||
          killLog?.message.includes('detective work')
        expect(hasMafiaMessage).toBe(true)
      })

      it('should use doctor lynch message when villagers lynch a doctor', () => {
        const hostId = 'host-1'
        NicknameManager.setNickname(hostId, 'Host')
        NicknameManager.setNickname('doctor-1', 'Doctor1')
        NicknameManager.setNickname('villager-1', 'Villager1')
        NicknameManager.setNickname('villager-2', 'Villager2')

        const game = GameManager.createGame(hostId, { name: 'Test Game' })
        game.players = [
          { userId: 'host-1', nickname: 'Host', role: 'villager', alive: true },
          { userId: 'doctor-1', nickname: 'Doctor1', role: 'doctor', alive: true },
          { userId: 'villager-1', nickname: 'Villager1', role: 'villager', alive: true },
          { userId: 'villager-2', nickname: 'Villager2', role: 'villager', alive: true },
        ]
        game.status = 'in-progress'
        game.phase = 'day'
        game.dayNumber = 1
        game.dayVotes = [
          { fromUserId: 'host-1', targetUserId: 'doctor-1', timestamp: new Date() },
          { fromUserId: 'villager-1', targetUserId: 'doctor-1', timestamp: new Date() },
          { fromUserId: 'villager-2', targetUserId: 'doctor-1', timestamp: new Date() },
        ]

        const onPhaseTransition = jest.fn()
        const result = GameManager.transitionPhase(game.id, onPhaseTransition)

        expect(result.success).toBe(true)
        const killLog = result.logs?.find(
          (log) => log.type === 'kill' && log.message.includes('Doctor1')
        )
        expect(killLog).toBeDefined()
        expect(killLog?.message).toContain('⚖️ [Lynched]')
        expect(killLog?.message).toContain('Doctor1')
        // Should have one of the doctor-specific tragic messages (check multiple possible phrases)
        const hasDoctorMessage = DOCTOR_LYNCH_MESSAGE_PHRASES.some((phrase: string) =>
          killLog?.message.includes(phrase)
        )
        expect(hasDoctorMessage).toBe(true)
      })
    })

    describe('Message Format Validation', () => {
      it('should ensure all mafia kill messages have the correct prefix', () => {
        const hostId = 'host-1'
        NicknameManager.setNickname(hostId, 'Host')
        NicknameManager.setNickname('mafia-1', 'Mafia1')
        NicknameManager.setNickname('villager-1', 'Villager1')

        const game = GameManager.createGame(hostId, { name: 'Test Game' })
        game.players = [
          { userId: 'host-1', nickname: 'Host', role: 'mafia', alive: true },
          { userId: 'mafia-1', nickname: 'Mafia1', role: 'mafia', alive: true },
          { userId: 'villager-1', nickname: 'Villager1', role: 'villager', alive: true },
        ]
        game.status = 'in-progress'
        game.phase = 'night'
        game.dayNumber = 1
        game.nightVotes = [
          { fromUserId: 'host-1', targetUserId: 'villager-1', timestamp: new Date() },
          { fromUserId: 'mafia-1', targetUserId: 'villager-1', timestamp: new Date() },
        ]

        const onPhaseTransition = jest.fn()
        const result = GameManager.transitionPhase(game.id, onPhaseTransition)

        const killLog = result.logs?.find(
          (log) => log.type === 'kill' && log.message.includes('Villager1')
        )
        expect(killLog?.message).toMatch(/^🔫 \[Mafia Kill\]/)
      })

      it('should ensure all lynch messages have the correct prefix', () => {
        const hostId = 'host-1'
        NicknameManager.setNickname(hostId, 'Host')
        NicknameManager.setNickname('villager-1', 'Villager1')
        NicknameManager.setNickname('villager-2', 'Villager2')

        const game = GameManager.createGame(hostId, { name: 'Test Game' })
        game.players = [
          { userId: 'host-1', nickname: 'Host', role: 'villager', alive: true },
          { userId: 'villager-1', nickname: 'Villager1', role: 'villager', alive: true },
          { userId: 'villager-2', nickname: 'Villager2', role: 'villager', alive: true },
        ]
        game.status = 'in-progress'
        game.phase = 'day'
        game.dayNumber = 1
        game.dayVotes = [
          { fromUserId: 'host-1', targetUserId: 'villager-1', timestamp: new Date() },
          { fromUserId: 'villager-2', targetUserId: 'villager-1', timestamp: new Date() },
        ]

        const onPhaseTransition = jest.fn()
        const result = GameManager.transitionPhase(game.id, onPhaseTransition)

        const killLog = result.logs?.find(
          (log) => log.type === 'kill' && log.message.includes('Villager1')
        )
        expect(killLog?.message).toMatch(/^⚖️ \[Lynched\]/)
      })
    })
  })
})
