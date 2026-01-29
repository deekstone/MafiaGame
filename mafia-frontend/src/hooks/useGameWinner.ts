import { useEffect, useState } from 'react'
import type { Game } from '../types/game'

export function useGameWinner(game: Game | null) {
  const isGameFinished = game?.status === 'finished'
  const winner = game?.winner || null
  const [showWinnerModal, setShowWinnerModal] = useState(false)

  // Show modal when game finishes and winner is determined
  useEffect(() => {
    if (isGameFinished && winner) {
      setShowWinnerModal(true)
    } else {
      setShowWinnerModal(false)
    }
  }, [isGameFinished, winner])

  return {
    winner: winner as 'villagers' | 'mafia' | null,
    showWinnerModal,
    closeWinnerModal: () => setShowWinnerModal(false),
  }
}
