import type { Meta, StoryObj } from '@storybook/react-vite'
import { VotingInterface } from './VotingInterface'
import type { Game, PlayerRole } from '../types/game'

const meta = {
  title: 'Components/VotingInterface',
  component: VotingInterface,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    onVote: {
      action: 'voted',
      description: 'Callback when a vote is submitted',
    },
  },
} satisfies Meta<typeof VotingInterface>

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
  dayVotes: [],
}

export const DayPhaseVillager: Story = {
  args: {
    game: mockGame,
    currentUserId: 'user-1',
    currentPlayerRole: 'villager',
    onVote: (targetUserId) => {
      console.log('Vote submitted:', targetUserId)
    },
  },
}

export const DayPhaseDoctor: Story = {
  args: {
    game: { ...mockGame, phase: 'day' },
    currentUserId: 'user-1',
    currentPlayerRole: 'doctor',
    onVote: (targetUserId) => {
      console.log('Vote submitted:', targetUserId)
    },
  },
}

export const NightPhaseMafia: Story = {
  args: {
    game: { ...mockGame, phase: 'night' },
    currentUserId: 'user-1',
    currentPlayerRole: 'mafia',
    onVote: (targetUserId) => {
      console.log('Vote submitted:', targetUserId)
    },
  },
}

export const NightPhaseDoctor: Story = {
  args: {
    game: { ...mockGame, phase: 'night' },
    currentUserId: 'user-1',
    currentPlayerRole: 'doctor',
    onVote: (targetUserId) => {
      console.log('Heal submitted:', targetUserId)
    },
  },
}

export const WithExistingVote: Story = {
  args: {
    game: {
      ...mockGame,
      dayVotes: [{ fromUserId: 'user-1', targetUserId: 'user-2', timestamp: new Date() }],
    },
    currentUserId: 'user-1',
    currentPlayerRole: 'villager',
    onVote: (targetUserId) => {
      console.log('Vote updated:', targetUserId)
    },
  },
}
