import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import i18n from '../i18n'
import type { GameResponse } from '../types/game'
import { GameInstructions } from '../components/GameInstructions'
import { GamesList } from '../components/GamesList'
import { OnlinePlayersList } from '../components/OnlinePlayersList'
import { Modal } from '../components/Modal'
import { NicknameForm } from '../components/NicknameForm'
import { GameNameForm } from '../components/GameNameForm'
import { PageLayout } from '../components/PageLayout'
import { SettingsModal } from '../components/SettingsModal'
import { useGameSocket } from '../hooks/useGameSocket'
import { useNickname } from '../hooks/useNickname'
import { useCurrentUser } from '../hooks/useCurrentUser'
import { BACKEND_URL } from '../constants'
import { audioManager } from '../utils/audioManager'
import { getAvatarUrl, getInitials, getAvatarColor } from '../utils/avatarUtils'
import { Text } from '../components/Text'

async function fetchGames(): Promise<GameResponse> {
  const response = await fetch(`${BACKEND_URL}/api/games`, { credentials: 'include' })
  if (!response.ok) {
    throw new Error(i18n.t('errors.failedToFetchGames'))
  }
  return response.json()
}

export function Lobby() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { createGame, joinGame, isCreating } = useGameSocket()
  const {
    nickname,
    avatarSeed,
    hasNickname,
    setNickname,
    isLoading: isNicknameLoading,
    isChecking,
  } = useNickname()
  const { user: currentUser } = useCurrentUser()
  const [showGameNameModal, setShowGameNameModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)

  const { data: games } = useQuery({
    queryKey: ['games'],
    queryFn: fetchGames,
  })

  const handleNicknameSubmit = async (nickname: string, selectedAvatarSeed: string) => {
    const success = await setNickname(nickname, selectedAvatarSeed)
    if (success) {
      // Modal will close automatically when hasNickname becomes true
    }
  }

  const handleCreateGameClick = () => {
    audioManager.unlock()
    setShowGameNameModal(true)
  }

  const handleGameNameSubmit = (gameName: string) => {
    setShowGameNameModal(false)
    createGame(
      {
        name: gameName,
        maxPlayers: 10,
      },
      (newGame) => {
        navigate({ to: '/game/$gameId', params: { gameId: newGame.id } })
      }
    )
  }

  const handleGameNameCancel = () => {
    setShowGameNameModal(false)
  }

  const handleJoinGame = (gameId: string) => {
    audioManager.unlock()
    joinGame(gameId, (game) => {
      navigate({ to: '/game/$gameId', params: { gameId: game.id } })
    })
  }

  const handleGameClick = (gameId: string) => {
    audioManager.unlock()
    navigate({ to: '/game/$gameId', params: { gameId } })
  }

  const showNicknameModal = !isChecking && !hasNickname

  return (
    <PageLayout
      headerContent={
        <div className="grid grid-cols-3 items-center">
          <div className="flex items-center gap-3">
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
            {t('common.mafia')}
          </Text>
          <div className="flex justify-end">
            <button
              onClick={() => setShowSettingsModal(true)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label={t('lobby.settingsAria')}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
          </div>
        </div>
      }
    >
      <div className="mb-8">
        <GameInstructions />
      </div>
      <div className="flex flex-col md:flex-row gap-8 justify-center">
        <GamesList
          games={games?.games ?? []}
          onCreateGame={handleCreateGameClick}
          onJoinGame={handleJoinGame}
          onGameClick={handleGameClick}
          isCreating={isCreating}
          currentUserId={currentUser?.id}
        />
        <OnlinePlayersList />
      </div>

      <Modal isOpen={showNicknameModal} onClose={() => {}} title={t('lobby.welcome')}>
        <NicknameForm onSubmit={handleNicknameSubmit} isLoading={isNicknameLoading} />
      </Modal>

      <Modal
        isOpen={showGameNameModal}
        onClose={handleGameNameCancel}
        title={t('lobby.createNewGame')}
      >
        <GameNameForm
          onSubmit={handleGameNameSubmit}
          onCancel={handleGameNameCancel}
          isLoading={isCreating}
        />
      </Modal>

      <SettingsModal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} />
    </PageLayout>
  )
}
