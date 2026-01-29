import { useTranslation } from 'react-i18next'
import type { GameStatus } from '../../types/game'

interface StatusBadgeProps {
  status: GameStatus
}

const STATUS_KEYS: Record<GameStatus, string> = {
  waiting: 'status.waiting',
  'in-progress': 'status.inProgress',
  finished: 'status.finished',
  cancelled: 'status.cancelled',
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { t } = useTranslation()

  const getStatusColor = (s: GameStatus): string => {
    switch (s) {
      case 'waiting':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'in-progress':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'finished':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(status)}`}>
      {t(STATUS_KEYS[status] ?? 'status.waiting')}
    </span>
  )
}
