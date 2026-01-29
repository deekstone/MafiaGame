import { useTranslation } from 'react-i18next'
import { Text } from '../Text'
import { getAvatarUrl, getInitials, getAvatarColor } from '../../utils/avatarUtils'
import { useOnlinePlayers } from '../../hooks/useOnlinePlayers'
import { useCurrentUser } from '../../hooks/useCurrentUser'

export function OnlinePlayersList() {
  const { t } = useTranslation()
  const { players, count, isLoading } = useOnlinePlayers()
  const { user: currentUser } = useCurrentUser()

  return (
    <section className="flex-1 min-w-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <Text variant="h2" className="mb-4">
        {t('onlinePlayers.title', { count })}
      </Text>
      {isLoading ? (
        <Text variant="p" color="muted" className="text-center py-8">
          {t('onlinePlayers.loading')}
        </Text>
      ) : players.length === 0 ? (
        <Text variant="p" color="muted" className="text-center py-8">
          {t('onlinePlayers.noPlayers')}
        </Text>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {players.map((player) => {
            const isCurrentUser = player.userId === currentUser?.id
            return (
              <div
                key={player.userId}
                className={`flex items-center gap-3 p-2 rounded-lg ${
                  isCurrentUser
                    ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                } transition-colors`}
              >
                <div className="relative shrink-0">
                  <img
                    src={getAvatarUrl(player.nickname, player.avatarSeed)}
                    alt={player.nickname}
                    className="w-10 h-10 rounded-full border-2 border-gray-300 dark:border-gray-600"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      const fallback = target.parentElement?.querySelector('.avatar-fallback')
                      if (fallback) {
                        ;(fallback as HTMLElement).style.display = 'flex'
                      }
                    }}
                  />
                  <div
                    className={`avatar-fallback w-10 h-10 rounded-full border-2 border-gray-300 dark:border-gray-600 ${getAvatarColor(
                      player.nickname
                    )} text-white items-center justify-center font-semibold text-sm hidden`}
                  >
                    {getInitials(player.nickname)}
                  </div>
                </div>
                <Text
                  variant="span"
                  size="base"
                  weight={isCurrentUser ? 'semibold' : 'normal'}
                  className="flex-1"
                >
                  {player.nickname}
                  {isCurrentUser && (
                    <Text variant="span" size="sm" color="muted" className="ml-2">
                      {t('common.you')}
                    </Text>
                  )}
                </Text>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
