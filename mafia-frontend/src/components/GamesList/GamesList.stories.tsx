import type { Meta, StoryObj } from '@storybook/react-vite'
import { GamesList } from './GamesList'
import type { Game } from '../types/game'

const meta = {
  title: 'Components/GamesList',
  component: GamesList,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof GamesList>

export default meta
type Story = StoryObj<typeof meta>

const mockGames: Game[] = [
  {
    id: 'game-1',
    name: 'Epic Mafia Game',
    players: [
      { userId: 'user-1', nickname: 'Alice', alive: true },
      { userId: 'user-2', nickname: 'Bob', alive: true },
    ],
    maxPlayers: 10,
    status: 'waiting',
    hostId: 'user-1',
    hostNickname: 'Alice',
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: 'game-2',
    name: 'Quick Game',
    players: [
      { userId: 'user-3', nickname: 'Charlie', alive: true },
      { userId: 'user-4', nickname: 'Diana', alive: true },
      { userId: 'user-5', nickname: 'Eve', alive: true },
    ],
    maxPlayers: 8,
    status: 'in-progress',
    hostId: 'user-3',
    hostNickname: 'Charlie',
    createdAt: new Date(Date.now() - 1000 * 60 * 60),
  },
  {
    id: 'game-3',
    name: 'Finished Game',
    players: [
      { userId: 'user-6', nickname: 'Frank', alive: true },
    ],
    maxPlayers: 10,
    status: 'finished',
    hostId: 'user-6',
    hostNickname: 'Frank',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
]

export const Empty: Story = {
  args: {
    games: [],
    onCreateGame: () => {
      console.log('Create game')
    },
    currentUserId: 'user-1',
  },
}

export const WithGames: Story = {
  args: {
    games: mockGames,
    onCreateGame: () => {
      console.log('Create game')
    },
    onJoinGame: (gameId) => {
      console.log('Join game:', gameId)
    },
    currentUserId: 'user-1',
  },
}

export const Creating: Story = {
  args: {
    games: mockGames,
    onCreateGame: () => {
      console.log('Create game')
    },
    isCreating: true,
    currentUserId: 'user-1',
  },
}
