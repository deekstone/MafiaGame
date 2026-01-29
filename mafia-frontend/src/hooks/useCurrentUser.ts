import { useQuery } from '@tanstack/react-query'
import { BACKEND_URL } from '../constants'

export interface CurrentUser {
  id: string
  nickname: string | null
  avatarSeed: string | null
}

interface CurrentUserResponse {
  success: boolean
  user: CurrentUser
}

async function fetchCurrentUser(): Promise<CurrentUserResponse> {
  const response = await fetch(`${BACKEND_URL}/api/user/me`, { credentials: 'include' })
  if (!response.ok) {
    throw new Error('Failed to fetch current user')
  }
  return response.json()
}

export function useCurrentUser() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['currentUser'],
    queryFn: fetchCurrentUser,
  })

  return {
    user: data?.user || null,
    isLoading,
    error,
  }
}
