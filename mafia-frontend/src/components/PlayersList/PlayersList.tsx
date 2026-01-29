import { useTranslation } from 'react-i18next'
import type { Player, Game, PlayerRole } from '../../types/game'
import { Text } from '../Text'
import { Button } from '../Button'
import { getAvatarUrl, getAvatarColor, getInitials } from '../../utils/avatarUtils'

interface PlayersListProps {
  players: Player[]
  game?: Game
  currentUserId?: string
  currentPlayerRole?: PlayerRole
  onVote?: (targetUserId: string | null) => void
}

export function PlayersList({
  players,
  game,
  currentUserId,
  currentPlayerRole,
  onVote,
}: PlayersListProps) {
  const { t } = useTranslation()
  const isGameInProgress = game?.status === 'in-progress'
  const isGameFinished = game?.status === 'finished'

  // Find current player
  const currentPlayer = game?.players.find((p) => p.userId === currentUserId)

  // Check if current user can vote in current phase
  const canVote =
    isGameInProgress &&
    currentUserId &&
    currentPlayerRole &&
    currentPlayer?.alive &&
    ((game.phase === 'day' &&
      (currentPlayerRole === 'villager' || currentPlayerRole === 'doctor')) ||
      (game.phase === 'night' && (currentPlayerRole === 'mafia' || currentPlayerRole === 'doctor')))

  // Check if current user has voted for a specific player
  const hasVotedFor = (targetUserId: string | null) => {
    if (!game || !currentUserId) return false

    if (game.phase === 'day') {
      const vote = game.dayVotes?.find((v) => v.fromUserId === currentUserId)
      return vote?.targetUserId === targetUserId
    } else {
      if (currentPlayerRole === 'doctor') {
        return (
          game.doctorHeal?.fromUserId === currentUserId &&
          game.doctorHeal?.targetUserId === targetUserId
        )
      } else {
        const vote = game.nightVotes?.find((v) => v.fromUserId === currentUserId)
        return vote?.targetUserId === targetUserId
      }
    }
  }

  const getRoleBadge = (role?: string) => {
    if (!role) return null
    const colors: Record<string, string> = {
      mafia: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      doctor: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      villager: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    }
    const roleKey = role as 'mafia' | 'doctor' | 'villager'
    const label = t(`roles.${roleKey}`)
    return (
      <span
        className={`px-2 py-1 rounded text-xs font-semibold ${
          colors[role] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {label}
      </span>
    )
  }

  return (
    <section className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 md:p-6 flex flex-col min-h-0 h-full">
      <Text variant="h2" className="mb-4">
        {t('game.players')}
      </Text>
      <div className="space-y-3 md:max-h-96 overflow-y-auto flex-1 min-h-0">
        {players.length === 0 ? (
          <Text variant="p" size="sm" color="muted" className="text-center py-8">
            {t('game.noPlayersYet')}
          </Text>
        ) : (
          players.map((player) => {
            const isDead = player.alive === false

            return (
              <div
                key={player.userId}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  isDead
                    ? 'bg-gray-200 dark:bg-gray-900 border-gray-300 dark:border-gray-700 opacity-60'
                    : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                }`}
              >
                <div className="shrink-0 relative">
                  <img
                    src={getAvatarUrl(player.nickname, player.avatarSeed)}
                    alt={player.nickname}
                    className={`w-10 h-10 rounded-full border-2 bg-white ${
                      isDead
                        ? 'border-gray-400 dark:border-gray-600 grayscale'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    onError={(e) => {
                      // Hide image and show initials fallback
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      const fallback = target.parentElement?.querySelector('.avatar-fallback')
                      if (fallback) {
                        ;(fallback as HTMLElement).style.display = 'flex'
                      }
                    }}
                  />
                  <div
                    className={`avatar-fallback w-10 h-10 rounded-full border-2 ${
                      isDead
                        ? 'border-gray-400 dark:border-gray-600 grayscale'
                        : 'border-gray-300 dark:border-gray-600'
                    } ${getAvatarColor(player.nickname)} text-white items-center justify-center font-semibold text-sm hidden`}
                  >
                    {getInitials(player.nickname)}
                  </div>
                  {isDead && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl">💀</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Text
                      variant="p"
                      size="sm"
                      weight="medium"
                      color={isDead ? 'muted' : 'primary'}
                      className={isDead ? 'line-through' : ''}
                    >
                      {player.nickname}
                      {currentUserId && player.userId === currentUserId && (
                        <Text variant="span" size="sm" color="muted" className="ml-1">
                          {t('common.youLower')}
                        </Text>
                      )}
                      {game?.hostId === player.userId && game?.hostId !== currentUserId && (
                        <Text variant="span" size="sm" color="muted" className="ml-1">
                          {t('common.host')}
                        </Text>
                      )}
                    </Text>
                    {player.role &&
                      ((currentUserId && player.userId === currentUserId) ||
                        isGameFinished ||
                        isDead) &&
                      getRoleBadge(player.role)}
                  </div>
                  {isDead && (
                    <Text variant="p" size="xs" color="muted" className="mt-1">
                      {t('common.dead')}
                    </Text>
                  )}
                </div>
                {canVote &&
                  player.alive &&
                  player.userId !== currentUserId &&
                  onVote &&
                  (hasVotedFor(player.userId) ? (
                    <Text
                      variant="span"
                      size="xs"
                      weight="medium"
                      className="text-green-600 dark:text-green-400 shrink-0"
                    >
                      {t('common.voted')}
                    </Text>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onVote(player.userId)}
                      touchFriendly
                      className="shrink-0"
                    >
                      {t('common.vote')}
                    </Button>
                  ))}
              </div>
            )
          })
        )}
      </div>
    </section>
  )
}
