import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { Game, PlayerRole } from '../../types/game'
import { Text } from '../Text'
import { Button } from '../Button'

interface VotingInterfaceProps {
  game: Game
  currentUserId: string
  currentPlayerRole?: PlayerRole
  onVote: (targetUserId: string | null) => void
}

export function VotingInterface({
  game,
  currentUserId,
  currentPlayerRole,
  onVote,
}: VotingInterfaceProps) {
  const { t } = useTranslation()
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null)

  // Find current player
  const currentPlayer = game.players.find((p) => p.userId === currentUserId)

  // Get alive players (excluding self)
  const alivePlayers = game.players.filter((p) => p.alive && p.userId !== currentUserId)

  // Check if player can vote in current phase
  const canVote =
    game.status === 'in-progress' &&
    currentPlayer?.alive &&
    ((game.phase === 'day' &&
      (currentPlayerRole === 'villager' || currentPlayerRole === 'doctor')) ||
      (game.phase === 'night' && (currentPlayerRole === 'mafia' || currentPlayerRole === 'doctor')))

  // Check if player has already voted
  const hasVoted =
    game.phase === 'day'
      ? game.dayVotes?.some((v) => v.fromUserId === currentUserId)
      : currentPlayerRole === 'doctor'
        ? game.doctorHeal?.fromUserId === currentUserId
        : game.nightVotes?.some((v) => v.fromUserId === currentUserId)

  // Get current vote
  useEffect(() => {
    if (game.phase === 'day') {
      const vote = game.dayVotes?.find((v) => v.fromUserId === currentUserId)
      setSelectedTarget(vote?.targetUserId || null)
    } else {
      if (currentPlayerRole === 'doctor') {
        setSelectedTarget(game.doctorHeal?.targetUserId || null)
      } else {
        const vote = game.nightVotes?.find((v) => v.fromUserId === currentUserId)
        setSelectedTarget(vote?.targetUserId || null)
      }
    }
  }, [game, currentUserId, currentPlayerRole])

  if (!canVote) {
    return null
  }

  const handleVote = () => {
    onVote(selectedTarget)
  }

  const getActionText = () => {
    if (game.phase === 'day') {
      return t('voting.voteToLynch')
    } else if (currentPlayerRole === 'mafia') {
      return t('voting.voteToKill')
    } else if (currentPlayerRole === 'doctor') {
      return t('voting.chooseToHeal')
    }
    return t('common.vote')
  }

  const getInstructionText = () => {
    if (game.phase === 'day') {
      return t('voting.chooseWhoToLynch')
    } else if (currentPlayerRole === 'mafia') {
      return t('voting.chooseWhoToKill')
    } else if (currentPlayerRole === 'doctor') {
      return t('voting.chooseWhoToHeal')
    }
    return t('voting.chooseTarget')
  }

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-4">
      <Text variant="h3" size="xl" className="mb-4">
        {getInstructionText()}
      </Text>
      <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
        <label className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">
          <input
            type="radio"
            name="target"
            value=""
            checked={selectedTarget === null}
            onChange={() => setSelectedTarget(null)}
            className="mr-3"
          />
          <Text variant="span">{t('voting.abstain')}</Text>
        </label>
        {alivePlayers.map((player) => (
          <label
            key={player.userId}
            className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
          >
            <input
              type="radio"
              name="target"
              value={player.userId}
              checked={selectedTarget === player.userId}
              onChange={() => setSelectedTarget(player.userId)}
              className="mr-3"
            />
            <Text variant="span">{player.nickname}</Text>
          </label>
        ))}
      </div>
      <Button onClick={handleVote} fullWidth>
        {hasVoted ? t('voting.updateVote') : getActionText()}
      </Button>
    </div>
  )
}
