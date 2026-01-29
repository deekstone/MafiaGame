import { useQuery } from '@tanstack/react-query'
import type { Game } from '../types/game'
import { BACKEND_URL } from '../constants'

interface GameResponse {
  success: boolean
  game: Game
}

async function fetchGame(gameId: string): Promise<GameResponse> {
  const response = await fetch(`${BACKEND_URL}/api/games/${gameId}`, { credentials: 'include' })
  if (!response.ok) {
    throw new Error('Failed to fetch game')
  }
  return response.json()
}

export function useGame(gameId: string | undefined) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['game', gameId],
    queryFn: () => fetchGame(gameId!),
    enabled: !!gameId,
  })

  return {
    game: data?.game || null,
    isLoading,
    error,
  }
}
