import { useTranslation } from 'react-i18next'
import { Modal } from '../Modal'
import { Button } from '../Button'
import { Text } from '../Text'
import { useTheme } from '../../hooks/useTheme'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { t, i18n } = useTranslation()
  const { theme, toggleTheme } = useTheme()
  const isArabic = i18n.language?.startsWith('ar')

  const switchLanguage = () => {
    const next = isArabic ? 'en' : 'ar'
    i18n.changeLanguage(next)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('settings.title')}>
      <div className="space-y-6">
        <div>
          <Text variant="h3" className="mb-1">
            {t('settings.theme')}
          </Text>
          <Text variant="p" color="secondary" size="sm" className="mb-2">
            {t('settings.themeDescription')}
          </Text>
          <div className="flex items-center gap-3 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <div className="flex-1">
              <Text variant="p" weight="medium" className="mb-1">
                {theme === 'dark' ? t('settings.darkMode') : t('settings.lightMode')}
              </Text>
              <Text variant="p" color="secondary" size="sm">
                {t('settings.currentlyUsingTheme', {
                  theme: theme === 'dark' ? t('settings.darkMode') : t('settings.lightMode'),
                })}
              </Text>
            </div>
            <Button onClick={toggleTheme} variant="primary">
              {theme === 'dark' ? t('settings.switchToLight') : t('settings.switchToDark')}
            </Button>
          </div>
        </div>

        <div>
          <Text variant="h3" className="mb-1">
            {t('settings.language')}
          </Text>
          <Text variant="p" color="secondary" size="sm" className="mb-2">
            {t('settings.languageDescription')}
          </Text>
          <div className="flex items-center gap-3 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <div className="flex-1">
              <Text variant="p" weight="medium" className="mb-1">
                {isArabic ? t('settings.arabic') : t('settings.english')}
              </Text>
              <Text variant="p" color="secondary" size="sm">
                {t('settings.currentlyUsingLanguage', {
                  lang: isArabic ? t('settings.arabic') : t('settings.english'),
                })}
              </Text>
            </div>
            <Button onClick={switchLanguage} variant="primary">
              {isArabic ? t('settings.switchToEnglish') : t('settings.switchToArabic')}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
