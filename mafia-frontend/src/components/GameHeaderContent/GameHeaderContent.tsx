import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Timer } from '../Timer'
import { getAvatarUrl, getInitials, getAvatarColor } from '../../utils/avatarUtils'
import type { Game } from '../../types/game'
import { Text } from '../Text'
import { useNickname } from '../../hooks/useNickname'

interface GameHeaderContentProps {
  nickname: string | null
  game: Game | null | undefined
  isGameInProgress: boolean
  isHost: boolean
}

export function GameHeaderContent({
  nickname,
  game,
  isGameInProgress,
  isHost,
}: GameHeaderContentProps) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { avatarSeed } = useNickname()

  const getPhaseText = () => {
    if (!isGameInProgress || !game) return null
    const phase = game.phase === 'day' ? t('common.day') : t('common.night')
    const dayNumber = game.dayNumber || 1
    return `${phase} ${dayNumber}`
  }

  const handleBackToLobby = () => {
    navigate({ to: '/' })
  }

  const isRtl = i18n.dir() === 'rtl'

  return (
    <div className="grid grid-cols-3 items-center">
      <div className="flex items-center gap-3">
        <button
          onClick={handleBackToLobby}
          className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 text-gray-700 dark:text-gray-300"
          aria-label={t('lobby.backToLobby')}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5 md:w-6 md:h-6"
          >
            {isRtl ? (
              // Right-pointing chevron for RTL (e.g. Arabic)
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            ) : (
              // Left-pointing chevron for LTR (e.g. English)
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            )}
          </svg>
        </button>
        {nickname && (
          <>
            <div className="relative">
              <img
                src={getAvatarUrl(nickname, avatarSeed)}
                alt={nickname}
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
                  nickname
                )} text-white items-center justify-center font-semibold text-sm hidden`}
              >
                {getInitials(nickname)}
              </div>
            </div>
            <Text variant="span" size="lg" weight="medium">
              {nickname}
            </Text>
          </>
        )}
      </div>
      <Text variant="h1" className="text-center">
        {game?.name || t('common.mafia')}
      </Text>
      <div className="flex items-center justify-end gap-2 md:gap-3">
        {isGameInProgress && game?.phaseEndTime ? (
          <>
            <Text variant="span" size="base" weight="semibold" className="md:text-lg">
              {getPhaseText()}
            </Text>
            <Timer phaseEndTime={game.phaseEndTime} />
          </>
        ) : game ? (
          <div className="text-right">
            <Text variant="p" size="sm" color="secondary" className="md:text-base">
              {t('game.hostedBy')}{' '}
              <Text variant="span" weight="semibold">
                {game.hostNickname || t('common.unknown')}
              </Text>
              {isHost && (
                <Text variant="span" className="ml-2 text-blue-600 dark:text-blue-400">
                  {t('common.you')}
                </Text>
              )}
            </Text>
          </div>
        ) : null}
      </div>
    </div>
  )
}
