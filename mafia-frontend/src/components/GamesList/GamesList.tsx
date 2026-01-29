import { useTranslation } from 'react-i18next'
import type { Game } from '../../types/game'
import { GameCard } from '../GameCard'
import { Text } from '../Text'
import { Button } from '../Button'

interface GamesListProps {
  games: Game[]
  onCreateGame: () => void
  onJoinGame?: (gameId: string) => void
  onGameClick?: (gameId: string) => void
  isCreating?: boolean
  currentUserId?: string | null
}

export function GamesList({
  games,
  onCreateGame,
  onJoinGame,
  onGameClick,
  isCreating = false,
  currentUserId,
}: GamesListProps) {
  const { t } = useTranslation()

  return (
    <section className="flex-1 min-w-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="mb-4">
        <Button onClick={onCreateGame} disabled={isCreating} size="lg" fullWidth withShadow>
          {isCreating ? t('gamesList.creatingGame') : t('gamesList.createNewGame')}
        </Button>
      </div>
      <Text variant="h2" className="mb-4">
        {t('gamesList.availableGames')}
      </Text>
      {games.length === 0 ? (
        <Text variant="p" color="muted" className="text-center py-8">
          {t('gamesList.noGames')}
        </Text>
      ) : (
        <div className="space-y-3">
          {games?.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onJoin={onJoinGame}
              onClick={onGameClick}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}
    </section>
  )
}
