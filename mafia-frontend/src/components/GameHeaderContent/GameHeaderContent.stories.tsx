import type { Meta, StoryObj } from '@storybook/react-vite'
import { GameHeaderContent } from './GameHeaderContent'
import type { Game } from '../types/game'

const meta = {
  title: 'Components/GameHeaderContent',
  component: GameHeaderContent,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof GameHeaderContent>

export default meta
type Story = StoryObj<typeof meta>

const mockGame: Game = {
  id: 'game-1',
  name: 'Epic Mafia Game',
  players: [],
  maxPlayers: 10,
  status: 'waiting',
  hostId: 'user-1',
  hostNickname: 'Alice',
}

export const Waiting: Story = {
  args: {
    nickname: 'Player1',
    game: mockGame,
    isGameInProgress: false,
    isHost: false,
  },
}

export const InProgress: Story = {
  args: {
    nickname: 'Player1',
    game: {
      ...mockGame,
      status: 'in-progress',
      phase: 'day',
      dayNumber: 1,
      phaseEndTime: new Date(Date.now() + 5 * 60 * 1000),
    },
    isGameInProgress: true,
    isHost: false,
  },
}

export const AsHost: Story = {
  args: {
    nickname: 'Alice',
    game: mockGame,
    isGameInProgress: false,
    isHost: true,
  },
}

export const NightPhase: Story = {
  args: {
    nickname: 'Player1',
    game: {
      ...mockGame,
      status: 'in-progress',
      phase: 'night',
      dayNumber: 1,
      phaseEndTime: new Date(Date.now() + 3 * 60 * 1000),
    },
    isGameInProgress: true,
    isHost: false,
  },
}

export const NoNickname: Story = {
  args: {
    nickname: null,
    game: mockGame,
    isGameInProgress: false,
    isHost: false,
  },
}
