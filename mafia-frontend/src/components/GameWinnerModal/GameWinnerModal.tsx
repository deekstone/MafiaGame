import { useTranslation } from 'react-i18next'
import { Modal } from '../Modal'
import { Text } from '../Text'
import { Button } from '../Button'

interface GameWinnerModalProps {
  isOpen: boolean
  onClose: () => void
  winner: 'villagers' | 'mafia' | null
}

export function GameWinnerModal({ isOpen, onClose, winner }: GameWinnerModalProps) {
  const { t } = useTranslation()
  if (!winner) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('game.gameOver')}>
      <div className="text-center">
        <Text variant="p" size="xl" weight="bold" className="mb-4">
          {winner === 'villagers' ? t('game.villagersWon') : t('game.mafiaWon')}
        </Text>
        <Button onClick={onClose} size="lg" touchFriendly className="w-full md:w-auto">
          {t('common.close')}
        </Button>
      </div>
    </Modal>
  )
}
