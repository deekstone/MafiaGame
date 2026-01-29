import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Text } from '../Text'
import { Button } from '../Button'

interface GameNameFormProps {
  onSubmit: (gameName: string) => void
  onCancel: () => void
  isLoading?: boolean
}

export function GameNameForm({ onSubmit, onCancel, isLoading = false }: GameNameFormProps) {
  const { t } = useTranslation()
  const [gameName, setGameName] = useState('')

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (gameName.trim()) {
      onSubmit(gameName.trim())
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="gameName" className="block mb-2">
          <Text variant="label" size="sm" weight="medium" color="secondary">
            {t('gameNameForm.enterGameName')}
          </Text>
        </label>
        <input
          id="gameName"
          type="text"
          value={gameName}
          onChange={(e) => setGameName(e.target.value)}
          placeholder={t('gameNameForm.gameNamePlaceholder')}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          required
          disabled={isLoading}
          autoFocus
        />
      </div>
      <div className="flex gap-3">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading} fullWidth>
          {t('common.cancel')}
        </Button>
        <Button type="submit" disabled={isLoading || !gameName.trim()} fullWidth>
          {isLoading ? t('lobby.creatingGame') : t('lobby.createGame')}
        </Button>
      </div>
    </form>
  )
}
