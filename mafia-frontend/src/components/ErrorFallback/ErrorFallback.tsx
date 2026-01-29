import { useTranslation } from 'react-i18next'
import { Text } from '../Text'
import { Button } from '../Button'

interface ErrorFallbackProps {
  error: Error
  onReset: () => void
}

export function ErrorFallback({ error, onReset }: ErrorFallbackProps) {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <Text variant="h2" weight="bold" className="text-red-600 dark:text-red-400 mb-4">
          {t('errors.failedToLoadGames')}
        </Text>
        <Text variant="p" color="secondary" className="mb-4">
          {error.message || t('errors.unexpectedErrorLoadingGames')}
        </Text>
        <Button onClick={onReset} fullWidth>
          {t('common.tryAgain')}
        </Button>
      </div>
    </div>
  )
}
