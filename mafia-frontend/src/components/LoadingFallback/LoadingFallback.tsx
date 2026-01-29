import { useTranslation } from 'react-i18next'
import { Text } from '../Text'

export function LoadingFallback() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center">
        <Text variant="h2" className="mb-4">
          {t('loading.mafiaGame')}
        </Text>
        <Text variant="p" color="muted">
          {t('loading.loadingGames')}
        </Text>
      </div>
    </div>
  )
}
