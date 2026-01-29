import type { Meta, StoryObj } from '@storybook/react-vite'
import { GameCard } from './GameCard'
import type { Game } from '../types/game'

const meta = {
  title: 'Components/GameCard',
  component: GameCard,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof GameCard>

export default meta
type Story = StoryObj<typeof meta>

const mockGame: Game = {
  id: 'game-1',
  name: 'Epic Mafia Game',
  players: [
    { userId: 'user-1', nickname: 'Alice', alive: true },
    { userId: 'user-2', nickname: 'Bob', alive: true },
    { userId: 'user-3', nickname: 'Charlie', alive: true },
  ],
  maxPlayers: 10,
  status: 'waiting',
  hostId: 'user-1',
  hostNickname: 'Alice',
  createdAt: new Date(Date.now() - 1000 * 60 * 30),
}

export const Waiting: Story = {
  args: {
    game: mockGame,
    currentUserId: 'user-2',
  },
}

export const InProgress: Story = {
  args: {
    game: { ...mockGame, status: 'in-progress' },
    currentUserId: 'user-2',
  },
}

export const Finished: Story = {
  args: {
    game: { ...mockGame, status: 'finished' },
    currentUserId: 'user-2',
  },
}

export const HostView: Story = {
  args: {
    game: mockGame,
    currentUserId: 'user-1',
  },
}

export const Joined: Story = {
  args: {
    game: mockGame,
    currentUserId: 'user-2',
    onJoin: (gameId) => {
      console.log('Join game:', gameId)
    },
  },
}

export const WithOnClick: Story = {
  args: {
    game: mockGame,
    currentUserId: 'user-2',
    onClick: (gameId) => {
      console.log('Game clicked:', gameId)
    },
  },
}

export const Full: Story = {
  args: {
    game: {
      ...mockGame,
      players: Array.from({ length: 10 }).map((_, i) => ({
        userId: `user-${i + 1}`,
        nickname: `Player ${i + 1}`,
        alive: true,
      })),
    },
    currentUserId: 'user-2',
  },
}
