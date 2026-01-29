import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { GameWinnerModal } from './GameWinnerModal'
import { Button } from '../Button'

const meta = {
  title: 'Components/GameWinnerModal',
  component: GameWinnerModal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof GameWinnerModal>

export default meta
type Story = StoryObj<typeof meta>

const ModalWrapper = ({ winner }: { winner: 'villagers' | 'mafia' | null }) => {
  const [isOpen, setIsOpen] = useState(true)
  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Winner Modal</Button>
      <GameWinnerModal isOpen={isOpen} onClose={() => setIsOpen(false)} winner={winner} />
    </>
  )
}

export const VillagersWin: Story = {
  render: () => <ModalWrapper winner="villagers" />,
}

export const MafiaWins: Story = {
  render: () => <ModalWrapper winner="mafia" />,
}

export const NoWinner: Story = {
  render: () => <ModalWrapper winner={null} />,
}
