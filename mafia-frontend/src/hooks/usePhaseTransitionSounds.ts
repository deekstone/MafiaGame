import { useEffect, useRef } from 'react'
import { audioManager } from '../utils/audioManager'
import type { GamePhase } from '../types/game'

export function usePhaseTransitionSounds(phase: GamePhase | undefined, isGameInProgress: boolean) {
  const previousPhaseRef = useRef<GamePhase | undefined>(undefined)
  const nightAmbienceTimeoutRef = useRef<number | null>(null)

  const stopNightAmbience = () => {
    audioManager.stopNightAmbience()
    if (nightAmbienceTimeoutRef.current !== null) {
      clearTimeout(nightAmbienceTimeoutRef.current)
      nightAmbienceTimeoutRef.current = null
    }
  }

  useEffect(() => {
    if (!isGameInProgress) {
      stopNightAmbience()
      previousPhaseRef.current = undefined
      return
    }

    const previousPhase = previousPhaseRef.current
    const currentPhase = phase

    // Night -> Day : play rooster
    if (previousPhase === 'night' && currentPhase === 'day') {
      stopNightAmbience()

      audioManager.playRoosterCrowing().catch((error) => {
        console.debug('Could not play rooster crowing sound:', error)
      })
    }

    // Any -> Night : play night ambience once
    if (currentPhase === 'night' && previousPhase !== 'night') {
      audioManager
        .playNightAmbience()
        .then(() => {
          nightAmbienceTimeoutRef.current = window.setTimeout(() => {
            stopNightAmbience()
          }, 3000)
        })
        .catch((error) => {
          console.debug('Could not play night ambience sound:', error)
        })
    }

    if (currentPhase !== undefined) {
      previousPhaseRef.current = currentPhase
    }
  }, [phase, isGameInProgress])

  useEffect(() => {
    return () => {
      stopNightAmbience()
    }
  }, [])
}
