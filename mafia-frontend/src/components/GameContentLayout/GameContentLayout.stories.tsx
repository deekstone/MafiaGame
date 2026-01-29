import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { GameContentLayout } from './GameContentLayout'
import type { Game, PlayerRole } from '../types/game'

const meta = {
  title: 'Components/GameContentLayout',
  component: GameContentLayout,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof GameContentLayout>

export default meta
type Story = StoryObj<typeof meta>

const mockGame: Game = {
  id: 'game-1',
  name: 'Test Game',
  players: [
    { userId: 'user-1', nickname: 'Alice', alive: true },
    { userId: 'user-2', nickname: 'Bob', alive: true },
    { userId: 'user-3', nickname: 'Charlie', alive: true },
  ],
  maxPlayers: 10,
  status: 'in-progress',
  hostId: 'user-1',
  phase: 'day',
  dayNumber: 1,
}

const LayoutWrapper = ({ activeTab = 'chat' }: { activeTab?: 'chat' | 'players' }) => {
  const [comments, setComments] = useState([
    {
      id: '1',
      gameId: 'game-1',
      userId: 'user-1',
      nickname: 'Alice',
      message: 'Hello everyone!',
      timestamp: new Date(),
    },
  ])
  const [isSending, setIsSending] = useState(false)

  const handleSendComment = async (message: string) => {
    setIsSending(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    setComments([
      ...comments,
      {
        id: String(comments.length + 1),
        gameId: 'game-1',
        userId: 'user-2',
        nickname: 'Bob',
        message,
        timestamp: new Date(),
      },
    ])
    setIsSending(false)
    return true
  }

  return (
    <GameContentLayout
      activeTab={activeTab}
      comments={comments}
      onSendComment={handleSendComment}
      isSending={isSending}
      players={mockGame.players}
      game={mockGame}
      currentUserId="user-1"
      currentPlayerRole="villager"
    />
  )
}

export const ChatTab: Story = {
  render: () => <LayoutWrapper activeTab="chat" />,
}

export const PlayersTab: Story = {
  render: () => <LayoutWrapper activeTab="players" />,
}
