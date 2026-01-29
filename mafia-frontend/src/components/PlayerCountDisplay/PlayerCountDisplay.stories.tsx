import type { Meta, StoryObj } from '@storybook/react-vite'
import { PlayerCountDisplay } from './PlayerCountDisplay'

const meta = {
  title: 'Components/PlayerCountDisplay',
  component: PlayerCountDisplay,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    currentPlayers: {
      control: { type: 'number', min: 0, max: 20 },
      description: 'Current number of players',
    },
    maxPlayers: {
      control: { type: 'number', min: 1, max: 20 },
      description: 'Maximum number of players',
    },
    gameStatus: {
      control: 'select',
      options: ['waiting', 'in-progress', 'finished', 'cancelled', undefined],
      description: 'The game status',
    },
  },
} satisfies Meta<typeof PlayerCountDisplay>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    currentPlayers: 5,
    maxPlayers: 10,
  },
}

export const Waiting: Story = {
  args: {
    currentPlayers: 3,
    maxPlayers: 10,
    gameStatus: 'waiting',
  },
}

export const InProgress: Story = {
  args: {
    currentPlayers: 8,
    maxPlayers: 10,
    gameStatus: 'in-progress',
  },
}

export const Finished: Story = {
  args: {
    currentPlayers: 8,
    maxPlayers: 10,
    gameStatus: 'finished',
  },
}

export const Full: Story = {
  args: {
    currentPlayers: 10,
    maxPlayers: 10,
    gameStatus: 'waiting',
  },
}
