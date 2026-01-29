import type React from 'react'
import { useTranslation } from 'react-i18next'
import type { Game } from '../../types/game'
import { StatusBadge } from '../StatusBadge'
import { Text } from '../Text'
import { Button } from '../Button'

interface GameCardProps {
  game: Game
  onJoin?: (gameId: string) => void
  onClick?: (gameId: string) => void
  currentUserId?: string | null
}

export function GameCard({ game, onJoin, onClick, currentUserId }: GameCardProps) {
  const { t } = useTranslation()

  const handleJoinClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onJoin) {
      onJoin(game.id)
    }
  }

  const handleCardClick = () => {
    if (onClick) {
      onClick(game.id)
    }
  }

  const isHost = currentUserId && game.hostId ? game.hostId === currentUserId : false
  const isJoined = currentUserId
    ? game.players?.some((p) => p.userId === currentUserId) || false
    : false
  const playerCount = game.players?.length || 0
  const maxPlayers = game.maxPlayers || 10

  const formatDate = (date?: Date | string) => {
    if (!date) return null
    const dateObj = typeof date === 'string' ? new Date(date) : date
    const now = new Date()
    const diffMs = now.getTime() - dateObj.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return t('gameCard.justNow')
    if (diffMins < 60) return t('gameCard.minsAgo', { count: diffMins })
    if (diffHours < 24) return t('gameCard.hoursAgo', { count: diffHours })
    if (diffDays < 7) return t('gameCard.daysAgo', { count: diffDays })
    return dateObj.toLocaleDateString()
  }

  const createdTime = formatDate(game.createdAt)

  return (
    <div
      onClick={handleCardClick}
      className={`border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
        onClick ? 'cursor-pointer' : ''
      } ${isHost ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''}`}
    >
      <div className="flex justify-between items-start mb-2 gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Text variant="h3" className="truncate">
              {game.name}
            </Text>
            {isHost && (
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 whitespace-nowrap">
                {t('gameCard.yourGame')}
              </span>
            )}
            {isJoined && !isHost && (
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 whitespace-nowrap">
                {t('gameCard.joined')}
              </span>
            )}
          </div>
          {game.hostNickname && (
            <Text variant="p" size="xs" color="muted">
              {t('gameCard.host', { name: game.hostNickname })}
            </Text>
          )}
        </div>
        <StatusBadge status={game.status} />
      </div>

      <div className="flex justify-between items-center mt-3 gap-2">
        <div className="flex flex-col gap-1">
          <Text variant="p" size="sm" color="secondary">
            {t('gameCard.players')}{' '}
            <Text variant="span" size="sm" weight="medium">
              {playerCount}/{maxPlayers}
            </Text>
          </Text>
          {createdTime && (
            <Text variant="p" size="xs" color="muted">
              {createdTime}
            </Text>
          )}
        </div>
        {onJoin && game.status === 'waiting' && !isJoined && (
          <Button
            variant="success"
            size="sm"
            onClick={handleJoinClick}
            className="whitespace-nowrap"
          >
            {t('common.join')}
          </Button>
        )}
        {game.status === 'waiting' && isJoined && (
          <Text
            variant="span"
            size="sm"
            color="muted"
            weight="medium"
            className="whitespace-nowrap"
          >
            {t('gameCard.inGame')}
          </Text>
        )}
      </div>
    </div>
  )
}
