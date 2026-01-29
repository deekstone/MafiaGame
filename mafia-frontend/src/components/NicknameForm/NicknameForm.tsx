import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Text } from '../Text'
import { Button } from '../Button'
import { generateAvatarSeed, getAvatarUrl } from '../../utils/avatarUtils'

interface NicknameFormProps {
  onSubmit: (nickname: string, avatarSeed: string) => void
  isLoading?: boolean
}

export function NicknameForm({ onSubmit, isLoading = false }: NicknameFormProps) {
  const { t } = useTranslation()
  const [nickname, setNickname] = useState('')
  const [avatarOptions, setAvatarOptions] = useState<string[]>(() =>
    Array.from({ length: 12 }, () => generateAvatarSeed())
  )
  const [selectedAvatarSeed, setSelectedAvatarSeed] = useState<string>(() => avatarOptions[0]!)

  // Ensure selected seed always exists in the options list
  useEffect(() => {
    if (!avatarOptions.includes(selectedAvatarSeed)) {
      setSelectedAvatarSeed(avatarOptions[0]!)
    }
  }, [avatarOptions, selectedAvatarSeed])

  const previewNickname = useMemo(() => nickname.trim() || 'Player', [nickname])

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (nickname.trim()) {
      onSubmit(nickname.trim(), selectedAvatarSeed)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="nickname" className="block mb-2">
          <Text variant="label">{t('nicknameForm.enterNickname')}</Text>
        </label>
        <input
          id="nickname"
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder={t('nicknameForm.nicknamePlaceholder')}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          required
          disabled={isLoading}
          autoFocus
        />
      </div>

      <div>
        <div className="flex items-center justify-between gap-3 mb-2">
          <Text variant="label" className="block">
            {t('nicknameForm.chooseAvatar')}
          </Text>
          <button
            type="button"
            onClick={() => setAvatarOptions(Array.from({ length: 12 }, () => generateAvatarSeed()))}
            disabled={isLoading}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
          >
            {t('common.shuffle')}
          </button>
        </div>
        <div className="grid grid-cols-6 gap-2">
          {avatarOptions.map((seed) => {
            const isSelected = seed === selectedAvatarSeed
            return (
              <button
                key={seed}
                type="button"
                onClick={() => setSelectedAvatarSeed(seed)}
                disabled={isLoading}
                className={`rounded-lg p-1 border transition-colors ${
                  isSelected
                    ? 'border-blue-500 ring-2 ring-blue-500/30'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                } disabled:opacity-50`}
                aria-label={
                  isSelected ? t('nicknameForm.selectedAvatar') : t('nicknameForm.selectAvatar')
                }
              >
                <img
                  src={getAvatarUrl(previewNickname, seed)}
                  alt={t('nicknameForm.avatarOption')}
                  className="w-10 h-10 rounded-full bg-white dark:bg-gray-700"
                />
              </button>
            )
          })}
        </div>
      </div>

      <Button type="submit" disabled={isLoading || !nickname.trim()} fullWidth>
        {isLoading ? t('common.submitting') : t('common.submit')}
      </Button>
    </form>
  )
}
