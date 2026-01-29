import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { BACKEND_URL } from '../constants'

interface SetNicknameResponse {
  success: boolean
  avatarSeed?: string
  error?: string
}

interface GetNicknameResponse {
  success: boolean
  nickname?: string
  avatarSeed?: string
  error?: string
}

export function useNickname() {
  const [nickname, setNicknameState] = useState<string | null>(null)
  const [avatarSeed, setAvatarSeedState] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  // Fetch nickname from backend on mount
  useEffect(() => {
    const fetchNickname = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/user/nickname`, {
          method: 'GET',
          credentials: 'include',
        })

        if (response.ok) {
          const data: GetNicknameResponse = await response.json()
          if (data.success && data.nickname) {
            setNicknameState(data.nickname)
            setAvatarSeedState(data.avatarSeed || null)
          }
        }
      } catch (error) {
        // Silently fail - user might not have a nickname yet
        console.error('Failed to fetch nickname:', error)
      } finally {
        setIsChecking(false)
      }
    }

    fetchNickname()
  }, [])

  const setNickname = async (newNickname: string, newAvatarSeed?: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      const response = await fetch(`${BACKEND_URL}/api/user/nickname`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ nickname: newNickname, avatarSeed: newAvatarSeed }),
      })

      const data: SetNicknameResponse = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to set nickname')
      }

      // Fetch the nickname from backend after setting it
      const getResponse = await fetch(`${BACKEND_URL}/api/user/nickname`, {
        method: 'GET',
        credentials: 'include',
      })

      if (getResponse.ok) {
        const getData: GetNicknameResponse = await getResponse.json()
        if (getData.success && getData.nickname) {
          setNicknameState(getData.nickname)
          setAvatarSeedState(getData.avatarSeed || null)
        }
      }

      toast.success('Nickname set successfully!')
      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to set nickname'
      toast.error(errorMessage)
      return false
    } finally {
      setIsLoading(false)
    }
  }
  return {
    nickname,
    avatarSeed,
    setNickname,
    isLoading,
    isChecking,
    hasNickname: nickname !== null,
  }
}
