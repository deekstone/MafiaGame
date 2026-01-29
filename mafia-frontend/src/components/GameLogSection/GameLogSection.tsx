import { useTranslation } from 'react-i18next'
import type { GameLogEntry, GameLogType } from '../../types/game'
import { Text } from '../Text'

interface GameLogSectionProps {
  logs: GameLogEntry[]
  height?: string
}

function getLogColorClasses(type?: GameLogType): string {
  switch (type) {
    case 'join':
      return 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800'
    case 'leave':
      return 'bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800'
    case 'kill':
      return 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800'
    case 'vote':
      return 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800'
    case 'system':
      return 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
    case 'phase':
      return 'bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800'
    case 'heal':
      return 'bg-teal-50 dark:bg-teal-900/30 border-teal-200 dark:border-teal-800'
    default:
      return 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
  }
}

export function GameLogSection({ logs, height = 'h-40' }: GameLogSectionProps) {
  const { t } = useTranslation()

  return (
    <section className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
      <Text variant="h2" className="mb-4">
        {t('game.gameLog')}
      </Text>
      <div className={`space-y-2 ${height} overflow-y-auto`}>
        {logs.length === 0 ? (
          <Text variant="p" size="sm" color="muted" className="text-center py-8">
            {t('game.noLogEntries')}
          </Text>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className={`p-3 rounded-lg border flex flex-row ${getLogColorClasses(log.type)}`}
            >
              <Text variant="p" size="sm" className="flex-1">
                {log.message}
              </Text>
              <Text variant="p" size="xs" color="muted" className="mt-1">
                {log.timestamp.toLocaleTimeString()}
              </Text>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
