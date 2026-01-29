import { Text } from '../Text'

interface PlayerCountDisplayProps {
  currentPlayers: number
  maxPlayers: number
  gameStatus?: 'waiting' | 'in-progress' | 'finished' | 'cancelled'
}

export function PlayerCountDisplay({
  currentPlayers,
  maxPlayers,
  gameStatus,
}: PlayerCountDisplayProps) {
  const getStatusLabel = () => {
    if (gameStatus === 'in-progress') {
      return (
        <Text
          variant="span"
          size="lg"
          weight="semibold"
          className="text-green-600 dark:text-green-400"
        >
          Game Started!
        </Text>
      )
    }
    if (gameStatus === 'finished') {
      return (
        <Text variant="span" size="lg" weight="semibold" className="text-red-600 dark:text-red-400">
          Game Ended
        </Text>
      )
    }
    return null
  }

  return (
    <div className="flex-1 text-center">
      <Text variant="h1" className="mb-4">
        {currentPlayers}/{maxPlayers} players joined
      </Text>
      {getStatusLabel() && <div className="mb-2">{getStatusLabel()}</div>}
    </div>
  )
}
