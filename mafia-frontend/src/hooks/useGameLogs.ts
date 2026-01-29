import { useEffect, useState, useRef } from 'react'
import type { Socket } from 'socket.io-client'
import type { GameLogEntry, GameLog } from '../types/game'
import { useNotificationTone } from './useNotificationTone'
import { getSocket } from '../utils/socket'
import { subscribeToGame } from '../utils/gameSubscription'

/**
 * Hook to listen for game log events for a specific game
 */
export function useGameLogs(gameId: string | undefined) {
  const [logs, setLogs] = useState<GameLogEntry[]>([])
  const socketRef = useRef<Socket | null>(null)
  const playTone = useNotificationTone()

  useEffect(() => {
    if (!gameId) {
      return
    }

    // Get or create the shared socket instance
    socketRef.current = getSocket()

    const socket = socketRef.current

    // Helper function to convert GameLog to GameLogEntry
    const convertLogToEntry = (log: GameLog): GameLogEntry => {
      const timestamp = log.timestamp instanceof Date ? log.timestamp : new Date(log.timestamp)

      return {
        id: log.id,
        message: log.message,
        timestamp,
        type: log.type,
      }
    }

    // Listen for all logs event (sent when subscribing/reconnecting)
    // This loads all previous logs for the game
    const handleAllLogs = (data: { gameId: string; logs: GameLog[] }) => {
      // Events are already filtered by the game room, so we don't need to check gameId
      const logEntries = data.logs.map(convertLogToEntry)
      setLogs(logEntries)
    }

    // Listen for individual game:log events (new logs as they happen)
    const handleGameLog = (data: { gameId: string; log: GameLog }) => {
      const logEntry = convertLogToEntry(data.log)

      setLogs((prev) => {
        // Avoid duplicates
        if (prev.some((log) => log.id === logEntry.id)) {
          return prev
        }
        // Play tone when a new log is added
        playTone()
        return [logEntry, ...prev]
      })
    }

    socket.on('game:logs:all', handleAllLogs)
    socket.on('game:log', handleGameLog)

    // Subscribe to the game room using shared subscription manager
    // This ensures game:subscribe is only emitted once per gameId
    const unsubscribe = subscribeToGame(gameId)

    // Cleanup: unsubscribe when component unmounts or gameId changes
    return () => {
      socket.off('game:logs:all', handleAllLogs)
      socket.off('game:log', handleGameLog)
      unsubscribe()
    }
  }, [gameId])

  return logs
}
