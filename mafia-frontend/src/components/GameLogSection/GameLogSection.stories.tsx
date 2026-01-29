import type { Meta, StoryObj } from '@storybook/react-vite'
import { GameLogSection } from './GameLogSection'
import type { GameLogEntry } from '../types/game'

const meta = {
  title: 'Components/GameLogSection',
  component: GameLogSection,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    height: {
      control: 'text',
      description: 'Custom height class for the log container',
    },
  },
} satisfies Meta<typeof GameLogSection>

export default meta
type Story = StoryObj<typeof meta>

const mockLogs: GameLogEntry[] = [
  {
    id: '1',
    message: 'Alice joined the game',
    timestamp: new Date(Date.now() - 1000 * 60 * 10),
    type: 'join',
  },
  {
    id: '2',
    message: 'Bob joined the game',
    timestamp: new Date(Date.now() - 1000 * 60 * 9),
    type: 'join',
  },
  {
    id: '3',
    message: 'Game started!',
    timestamp: new Date(Date.now() - 1000 * 60 * 8),
    type: 'system',
  },
  {
    id: '4',
    message: 'Night phase began',
    timestamp: new Date(Date.now() - 1000 * 60 * 7),
    type: 'phase',
  },
  {
    id: '5',
    message: 'Charlie was killed by the mafia',
    timestamp: new Date(Date.now() - 1000 * 60 * 6),
    type: 'kill',
  },
  {
    id: '6',
    message: 'Day phase began',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    type: 'phase',
  },
  {
    id: '7',
    message: 'Alice voted to lynch Bob',
    timestamp: new Date(Date.now() - 1000 * 60 * 4),
    type: 'vote',
  },
]

export const Empty: Story = {
  args: {
    logs: [],
  },
}

export const WithLogs: Story = {
  args: {
    logs: mockLogs,
  },
}

export const ManyLogs: Story = {
  args: {
    logs: Array.from({ length: 20 }).map((_, i) => ({
      id: String(i + 1),
      message: `Log entry ${i + 1}: Something happened in the game`,
      timestamp: new Date(Date.now() - 1000 * 60 * (20 - i)),
      type: ['join', 'leave', 'kill', 'vote', 'system', 'phase', 'heal'][i % 7] as any,
    })),
  },
}

export const CustomHeight: Story = {
  args: {
    logs: mockLogs,
    height: 'h-60',
  },
}
