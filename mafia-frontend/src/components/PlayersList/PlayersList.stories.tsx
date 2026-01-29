import type { Meta, StoryObj } from '@storybook/react-vite'
import { PlayersList } from './PlayersList'
import type { Game, PlayerRole } from '../types/game'

const meta = {
  title: 'Components/PlayersList',
  component: PlayersList,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof PlayersList>

export default meta
type Story = StoryObj<typeof meta>

const mockGame: Game = {
  id: 'game-1',
  name: 'Test Game',
  players: [
    { userId: 'user-1', nickname: 'Alice', alive: true, role: 'villager' },
    { userId: 'user-2', nickname: 'Bob', alive: true, role: 'mafia' },
    { userId: 'user-3', nickname: 'Charlie', alive: true, role: 'doctor' },
    { userId: 'user-4', nickname: 'Diana', alive: false, role: 'villager' },
  ],
  maxPlayers: 10,
  status: 'in-progress',
  hostId: 'user-1',
  phase: 'day',
  dayNumber: 1,
}

export const Default: Story = {
  args: {
    players: mockGame.players,
    game: mockGame,
    currentUserId: 'user-1',
    currentPlayerRole: 'villager',
  },
}

export const Waiting: Story = {
  args: {
    players: mockGame.players,
    game: { ...mockGame, status: 'waiting' },
    currentUserId: 'user-1',
  },
}

export const Finished: Story = {
  args: {
    players: mockGame.players,
    game: { ...mockGame, status: 'finished' },
    currentUserId: 'user-1',
    currentPlayerRole: 'villager',
  },
}

export const WithVoting: Story = {
  args: {
    players: mockGame.players,
    game: mockGame,
    currentUserId: 'user-1',
    currentPlayerRole: 'villager',
    onVote: (targetUserId) => {
      console.log('Vote:', targetUserId)
    },
  },
}

export const Empty: Story = {
  args: {
    players: [],
  },
}
