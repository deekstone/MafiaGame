import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Text } from '../Text'
import { Modal } from '../Modal'

export function GameInstructions() {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-block w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <Text variant="h2" className="mb-0">
            {t('gameInstructions.title')}
          </Text>
          <svg
            className="w-5 h-5 text-gray-500 dark:text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={t('gameInstructions.title')}>
        <div className="space-y-4 text-gray-700 dark:text-gray-300">
          <div>
            <Text variant="h3" className="mb-2">
              {t('gameInstructions.howToPlay')}
            </Text>
            <Text variant="p" size="sm" className="leading-relaxed">
              {t('gameInstructions.intro')}
            </Text>
          </div>
          <div>
            <Text variant="h3" className="mb-2">
              {t('gameInstructions.roles')}
            </Text>
            <ul className="text-sm space-y-2 list-disc list-inside">
              <li>
                <Text variant="span" size="sm" weight="bold">
                  {t('gameInstructions.mafiaRole')}{' '}
                </Text>
                {t('gameInstructions.mafiaDesc')}
              </li>
              <li>
                <Text variant="span" size="sm" weight="bold">
                  {t('gameInstructions.doctorRole')}{' '}
                </Text>
                {t('gameInstructions.doctorDesc')}
              </li>
              <li>
                <Text variant="span" size="sm" weight="bold">
                  {t('gameInstructions.villagerRole')}{' '}
                </Text>
                {t('gameInstructions.villagerDesc')}
              </li>
            </ul>
            <Text variant="p" size="sm" className="mt-2 leading-relaxed">
              <Text variant="span" size="sm" weight="bold">
                {t('gameInstructions.roleDistribution')}{' '}
              </Text>
              {t('gameInstructions.roleDistributionDesc')}
            </Text>
          </div>
          <div>
            <Text variant="h3" className="mb-2">
              {t('gameInstructions.gamePhases')}
            </Text>
            <ul className="text-sm space-y-2 list-disc list-inside">
              <li>
                <Text variant="span" size="sm" weight="bold">
                  {t('gameInstructions.dayPhase')}{' '}
                </Text>
                {t('gameInstructions.dayPhaseDesc')}
              </li>
              <li>
                <Text variant="span" size="sm" weight="bold">
                  {t('gameInstructions.nightPhase')}{' '}
                </Text>
                {t('gameInstructions.nightPhaseDesc')}
              </li>
              <li>{t('gameInstructions.phaseTransition')}</li>
            </ul>
          </div>
          <div>
            <Text variant="h3" className="mb-2">
              {t('gameInstructions.votingRules')}
            </Text>
            <ul className="text-sm space-y-2 list-disc list-inside">
              <li>{t('gameInstructions.votingRule1')}</li>
              <li>{t('gameInstructions.votingRule2')}</li>
              <li>{t('gameInstructions.votingRule3')}</li>
              <li>{t('gameInstructions.votingRule4')}</li>
            </ul>
          </div>
          <div>
            <Text variant="h3" className="mb-2">
              {t('gameInstructions.winningConditions')}
            </Text>
            <ul className="text-sm space-y-2 list-disc list-inside">
              <li>
                <Text variant="span" size="sm" weight="bold">
                  {t('gameInstructions.villagersWin')}{' '}
                </Text>
                {t('gameInstructions.villagersWinDesc')}
              </li>
              <li>
                <Text variant="span" size="sm" weight="bold">
                  {t('gameInstructions.mafiaWins')}{' '}
                </Text>
                {t('gameInstructions.mafiaWinsDesc1')}
              </li>
              <li>
                <Text variant="span" size="sm" weight="bold">
                  {t('gameInstructions.mafiaWins')}{' '}
                </Text>
                {t('gameInstructions.mafiaWinsDesc2')}
              </li>
            </ul>
          </div>
        </div>
      </Modal>
    </>
  )
}
