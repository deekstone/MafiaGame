import { useParams } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { StartButton } from '../components/StartButton'
import { GameLogSection } from '../components/GameLogSection'
import { PageLayout } from '../components/PageLayout'
import { GameHeaderContent } from '../components/GameHeaderContent'
import { MobileTabNavigation } from '../components/MobileTabNavigation'
import { GameContentLayout } from '../components/GameContentLayout'
import { GameWinnerModal } from '../components/GameWinnerModal'
import { useCurrentUser } from '../hooks/useCurrentUser'
import { useGame } from '../hooks/useGame'
import { useGameLogs } from '../hooks/useGameLogs'
import { useComments } from '../hooks/useComments'
import { useGameSocket } from '../hooks/useGameSocket'
import { useGameWinner } from '../hooks/useGameWinner'
import { useClockTickingSound } from '../hooks/useClockTickingSound'
import { usePhaseTransitionSounds } from '../hooks/usePhaseTransitionSounds'
import { useNickname } from '../hooks/useNickname'

export function Game() {
  const params = useParams({ strict: false })
  const gameId = params.gameId as string | undefined

  // Initialize socket listeners to receive game:updated events
  const { startGame, vote } = useGameSocket()

  const { user: currentUser } = useCurrentUser()
  const { nickname } = useNickname()
  const { game } = useGame(gameId)
  const logs = useGameLogs(gameId)
  const { comments, sendComment, isSending } = useComments(gameId)

  // Track which kill logs have been shown as toasts
  const shownKillLogIds = useRef<Set<string>>(new Set())

  // Show toast for new kill logs
  useEffect(() => {
    // Don't show toasts if the game has ended
    if (game?.status === 'finished') {
      return
    }

    logs.forEach((log) => {
      if (log.type === 'kill' && !shownKillLogIds.current.has(log.id)) {
        shownKillLogIds.current.add(log.id)
        toast(log.message, {
          position: 'top-center',
          duration: 5000,
          style: {
            background: '#dc2626',
            color: '#fff',
            fontSize: '16px',
            fontWeight: '600',
            padding: '16px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          },
        })
      }
    })
  }, [logs, game?.status])

  const hostId = game?.hostId || null
  const currentUserId = currentUser?.id || null
  const isHost = currentUserId && hostId ? hostId === currentUserId : false

  // Find current player to get their role
  const currentPlayer = game?.players.find((p) => p.userId === currentUserId)
  const currentPlayerRole = currentPlayer?.role

  const isGameInProgress = game?.status === 'in-progress'
  const { winner, showWinnerModal, closeWinnerModal } = useGameWinner(game)

  // Play clock ticking sound for the last 5 seconds of each phase
  useClockTickingSound(game?.phaseEndTime, isGameInProgress)

  // Play sounds when phase transitions occur
  usePhaseTransitionSounds(game?.phase, isGameInProgress)

  const handleStartGame = async () => {
    if (!gameId) return
    startGame(gameId)
  }

  const handleVote = async (targetUserId: string | null) => {
    if (!gameId) return
    vote(gameId, targetUserId)
  }

  // Tab state for mobile view
  const [activeTab, setActiveTab] = useState<'chat' | 'players'>('chat')

  console.log(game)

  return (
    <PageLayout
      headerContent={
        <GameHeaderContent
          nickname={nickname}
          game={game}
          isGameInProgress={isGameInProgress}
          isHost={isHost}
        />
      }
    >
      {isHost && game?.status === 'waiting' && (
        <StartButton
          onStart={handleStartGame}
          // disabled={!canStart}
        />
      )}

      <GameLogSection logs={logs} height="h-40" />

      <MobileTabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      <GameContentLayout
        activeTab={activeTab}
        comments={comments}
        onSendComment={sendComment}
        isSending={isSending}
        players={game?.players || []}
        game={game || undefined}
        currentUserId={currentUserId || undefined}
        currentPlayerRole={currentPlayerRole}
        onVote={handleVote}
      />

      <GameWinnerModal isOpen={showWinnerModal} onClose={closeWinnerModal} winner={winner} />
    </PageLayout>
  )
}
