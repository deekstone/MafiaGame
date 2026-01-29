import { CommentSection } from '../CommentSection'
import { PlayersList } from '../PlayersList'
import type { CommentEntry } from '../../types/game'
import type { Player, Game, PlayerRole } from '../../types/game'

interface GameContentLayoutProps {
  activeTab: 'chat' | 'players'
  comments: CommentEntry[]
  onSendComment: (message: string) => Promise<boolean>
  isSending: boolean
  players: Player[]
  game?: Game
  currentUserId?: string
  currentPlayerRole?: PlayerRole
  onVote?: (targetUserId: string | null) => void
}

export function GameContentLayout({
  activeTab,
  comments,
  onSendComment,
  isSending,
  players,
  game,
  currentUserId,
  currentPlayerRole,
  onVote,
}: GameContentLayoutProps) {
  return (
    <>
      {/* Mobile Tabbed Content */}
      <div className="md:hidden flex flex-col" style={{ minHeight: 'calc(100vh - 20rem)' }}>
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col min-h-0">
            <CommentSection
              comments={comments}
              onSendComment={onSendComment}
              isSending={isSending}
            />
          </div>
        )}
        {activeTab === 'players' && (
          <div className="flex-1 flex flex-col min-h-0">
            <PlayersList
              players={players}
              game={game}
              currentUserId={currentUserId}
              currentPlayerRole={currentPlayerRole}
              onVote={onVote}
            />
          </div>
        )}
      </div>

      {/* Desktop Side-by-Side Layout */}
      <div className="hidden md:flex md:flex-row gap-6 mt-6">
        <CommentSection comments={comments} onSendComment={onSendComment} isSending={isSending} />
        <PlayersList
          players={players}
          game={game}
          currentUserId={currentUserId}
          currentPlayerRole={currentPlayerRole}
          onVote={onVote}
        />
      </div>
    </>
  )
}
