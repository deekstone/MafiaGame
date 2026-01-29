import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getSocket } from '../utils/socket'
import { BACKEND_URL } from '../constants'

interface OnlinePlayer {
  userId: string
  nickname: string
  avatarSeed: string
}

interface OnlinePlayersResponse {
  success: boolean
  players: OnlinePlayer[]
  count: number
}

async function fetchOnlinePlayers(): Promise<OnlinePlayersResponse> {
  const response = await fetch(`${BACKEND_URL}/api/user/online-players`, {
    credentials: 'include',
  })
  if (!response.ok) {
    throw new Error('Failed to fetch online players')
  }
  return response.json()
}

export function useOnlinePlayers() {
  const queryClient = useQueryClient()

  // Fetch initial data via REST API
  const { data, isLoading, error } = useQuery({
    queryKey: ['online-players'],
    queryFn: fetchOnlinePlayers,
    refetchInterval: 30000, // Refetch every 30 seconds as fallback
  })

  // Listen to real-time socket updates
  useEffect(() => {
    const socket = getSocket()

    // Listen for online players updates
    const handleOnlinePlayersUpdate = (update: OnlinePlayersResponse) => {
      queryClient.setQueryData<OnlinePlayersResponse>(['online-players'], update)
    }

    socket.on('lobby:online-players', handleOnlinePlayersUpdate)

    // Request initial data via socket as well (for faster updates)
    socket.emit('lobby:get-online-players', (response: OnlinePlayersResponse) => {
      if (response.success) {
        queryClient.setQueryData<OnlinePlayersResponse>(['online-players'], response)
      }
    })

    return () => {
      socket.off('lobby:online-players', handleOnlinePlayersUpdate)
    }
  }, [queryClient])

  return {
    players: data?.players ?? [],
    count: data?.count ?? 0,
    isLoading,
    error,
  }
}
