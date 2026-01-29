import { useEffect, useRef } from 'react'
import { audioManager } from '../utils/audioManager'

/**
 * Custom hook to play clock ticking sound for the last 5 seconds of each day/night phase
 */
export function useClockTickingSound(
  phaseEndTime: Date | string | undefined,
  isGameInProgress: boolean
) {
  const hasPlayedRef = useRef<boolean>(false)
  const stopTimeoutRef = useRef<number | null>(null)

  const stopAudio = () => {
    audioManager.stopClockTicking()
    if (stopTimeoutRef.current !== null) {
      clearTimeout(stopTimeoutRef.current)
      stopTimeoutRef.current = null
    }
  }

  useEffect(() => {
    if (!isGameInProgress || !phaseEndTime) {
      stopAudio()
      hasPlayedRef.current = false
      return
    }

    const endTime = phaseEndTime instanceof Date ? phaseEndTime : new Date(phaseEndTime)

    const checkTimeAndPlay = () => {
      const now = new Date()
      const remainingSeconds = Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 1000))

      // Trigger only once when entering the last 5 seconds window
      if (remainingSeconds <= 5 && remainingSeconds > 0 && !hasPlayedRef.current) {
        hasPlayedRef.current = true

        audioManager
          .playClockTicking()
          .then(() => {
            const playDuration = Math.min(5000, remainingSeconds * 1000)
            stopTimeoutRef.current = window.setTimeout(() => {
              stopAudio()
            }, playDuration)
          })
          .catch((error) => {
            console.debug('Could not play clock ticking sound:', error)
          })
      }

      // Reset when phase ends or when we're no longer in the last-5s window
      if (remainingSeconds === 0 || remainingSeconds > 5) {
        hasPlayedRef.current = false
        stopAudio()
      }
    }

    // Run immediately
    checkTimeAndPlay()

    const interval = setInterval(checkTimeAndPlay, 1000)

    return () => {
      clearInterval(interval)
      stopAudio()
      hasPlayedRef.current = false
    }
  }, [phaseEndTime, isGameInProgress])
}
