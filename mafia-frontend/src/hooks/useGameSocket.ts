import { useEffect, useRef, useState, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { Socket } from 'socket.io-client'
import toast from 'react-hot-toast'
import i18n from '../i18n'
import type { Game, GameResponse, GameLog } from '../types/game'
import { getSocket } from '../utils/socket'

interface CreateGameParams {
  name: string
  maxPlayers: number
}

interface CreateGameResponse {
  success: boolean
  game?: Game
  error?: string
}

interface JoinGameResponse {
  success: boolean
  game?: Game
  error?: string
}

export function useGameSocket() {
  const queryClient = useQueryClient()
  const socketRef = useRef<Socket | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  // Initialize socket connection (reuses shared singleton from utils)
  useEffect(() => {
    socketRef.current = getSocket()

    const socket = socketRef.current

    // Subscribe to game:created event
    socket.on('game:created', (game: Game) => {
      queryClient.setQueryData<GameResponse>(['games'], (prev) => {
        if (!prev) return prev
        const existingGames = prev.games || []
        if (existingGames.some((g) => g.id === game.id)) {
          return prev
        }
        return {
          ...prev,
          games: [game, ...existingGames],
          count: prev.count + 1,
        }
      })
    })

    // Subscribe to game:ended event
    socket.on('game:ended', ({ gameId }: { gameId: string }) => {
      queryClient.setQueryData<GameResponse>(['games'], (prev) => {
        if (!prev) return prev
        const filteredGames = prev.games?.filter((g) => g.id !== gameId) || []
        return {
          ...prev,
          games: filteredGames,
          count: filteredGames.length,
        }
      })
    })

    // Subscribe to game:cancelled event
    socket.on('game:cancelled', ({ gameId }: { gameId: string }) => {
      queryClient.setQueryData<GameResponse>(['games'], (prev) => {
        if (!prev) return prev
        const filteredGames = prev.games?.filter((g) => g.id !== gameId) || []
        return {
          ...prev,
          games: filteredGames,
          count: filteredGames.length,
        }
      })
    })

    // Subscribe to game:updated event (e.g., when a player joins)
    socket.on('game:updated', (updatedGame: Game) => {
      // Update the games list cache
      queryClient.setQueryData<GameResponse>(['games'], (prev) => {
        if (!prev) return prev
        const existingGames = prev.games || []
        const gameIndex = existingGames.findIndex((g) => g.id === updatedGame.id)

        if (gameIndex === -1) {
          // Game not in list, add it
          return {
            ...prev,
            games: [...existingGames, updatedGame],
            count: prev.count + 1,
          }
        }

        // Update existing game
        const updatedGames = [...existingGames]
        updatedGames[gameIndex] = updatedGame
        return {
          ...prev,
          games: updatedGames,
        }
      })

      // Update the individual game cache (for the Game page)
      queryClient.setQueryData<{ success: boolean; game: Game }>(
        ['game', updatedGame.id],
        (prev) => {
          // If cache doesn't exist yet, create it
          if (!prev) {
            return {
              success: true,
              game: updatedGame,
            }
          }
          return {
            ...prev,
            game: updatedGame,
          }
        }
      )
    })

    // Subscribe to game:log event (real-time log updates)
    socket.on('game:log', (data: { gameId: string; log: GameLog }) => {
      // This is handled by useGameLogs hook, but we can also invalidate cache to refresh
      queryClient.invalidateQueries({ queryKey: ['game', data.gameId] })
    })

    // Don't disconnect on unmount - keep socket alive for other components
    // The socket will be cleaned up when the entire app unmounts or browser closes
    return () => {
      // Remove listeners but keep connection alive
      socket.off('game:created')
      socket.off('game:ended')
      socket.off('game:cancelled')
      socket.off('game:updated')
      socket.off('game:log')
    }
  }, [queryClient])

  const createGame = useCallback((params: CreateGameParams, onSuccess?: (game: Game) => void) => {
    const socket = socketRef.current
    if (!socket) {
      toast.error(i18n.t('errors.socketNotInitialized'))
      return
    }

    setIsCreating(true)
    socket.emit('game:create', params, (res: CreateGameResponse) => {
      setIsCreating(false)

      console.log(res)
      if (res.success && res.game) {
        // The game will be added to the list via the 'game:created' event
        if (onSuccess) {
          onSuccess(res.game)
        }
      } else {
        toast.error(res.error || i18n.t('errors.failedToCreateGame'))
      }
    })
  }, [])

  const joinGame = useCallback((gameId: string, onSuccess?: (game: Game) => void) => {
    const socket = socketRef.current
    if (!socket) {
      toast.error(i18n.t('errors.socketNotInitialized'))
      return
    }

    const lang = i18n.language?.toLowerCase().startsWith('ar') ? 'ar' : 'en'
    socket.emit('game:join', { gameId, lang }, (res: JoinGameResponse) => {
      if (res.success && res.game) {
        // The game will be updated in the list via the 'game:updated' event
        if (onSuccess) {
          onSuccess(res.game)
        }
      } else {
        toast.error(res.error || i18n.t('errors.failedToJoinGame'))
      }
    })
  }, [])

  const startGame = useCallback(
    (gameId: string, onSuccess?: (game: Game) => void, onError?: (error: string) => void) => {
      const socket = socketRef.current
      if (!socket) {
        const error = i18n.t('errors.socketNotInitialized')
        toast.error(error)
        onError?.(error)
        return
      }

      socket.emit(
        'game:start',
        { gameId },
        (res: { success: boolean; game?: Game; error?: string }) => {
          if (res.success && res.game) {
            // The game will be updated via the 'game:updated' event
            if (onSuccess) {
              onSuccess(res.game)
            }
            toast.success(i18n.t('game.gameStarted'))
          } else {
            const error = res.error || i18n.t('errors.failedToStartGame')
            toast.error(error)
            onError?.(error)
          }
        }
      )
    },
    []
  )

  const vote = useCallback(
    (
      gameId: string,
      targetUserId: string | null,
      onSuccess?: (game: Game) => void,
      onError?: (error: string) => void
    ) => {
      const socket = socketRef.current
      if (!socket) {
        const error = i18n.t('errors.socketNotInitialized')
        toast.error(error)
        onError?.(error)
        return
      }

      socket.emit(
        'game:vote',
        { gameId, targetUserId },
        (res: { success: boolean; game?: Game; error?: string }) => {
          if (res.success && res.game) {
            // The game will be updated via the 'game:updated' event
            if (onSuccess) {
              onSuccess(res.game)
            }
          } else {
            const error = res.error || i18n.t('errors.failedToVote')
            toast.error(error)
            onError?.(error)
          }
        }
      )
    },
    []
  )

  return {
    createGame,
    joinGame,
    startGame,
    vote,
    isCreating,
  }
}
