import { useTranslation } from 'react-i18next'

interface MobileTabNavigationProps {
  activeTab: 'chat' | 'players'
  onTabChange: (tab: 'chat' | 'players') => void
}

export function MobileTabNavigation({ activeTab, onTabChange }: MobileTabNavigationProps) {
  const { t } = useTranslation()

  return (
    <div className="md:hidden mt-4">
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => onTabChange('chat')}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors duration-200 shadow-lg ${
            activeTab === 'chat'
              ? 'bg-blue-600 text-white dark:bg-blue-600 dark:text-white'
              : 'bg-white text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
          }`}
        >
          {t('game.chat')}
        </button>
        <button
          onClick={() => onTabChange('players')}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors duration-200 shadow-lg ${
            activeTab === 'players'
              ? 'bg-blue-600 text-white dark:bg-blue-600 dark:text-white'
              : 'bg-white text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
          }`}
        >
          {t('game.players')}
        </button>
      </div>
    </div>
  )
}
