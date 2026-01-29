import type { Meta, StoryObj } from '@storybook/react-vite'
import { Timer } from './Timer'

const meta = {
  title: 'Components/Timer',
  component: Timer,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    phaseEndTime: {
      control: 'date',
      description: 'The end time for the current phase',
    },
  },
} satisfies Meta<typeof Timer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    phaseEndTime: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
  },
}

export const LowTime: Story = {
  args: {
    phaseEndTime: new Date(Date.now() + 8 * 1000), // 8 seconds from now
  },
}

export const LongTime: Story = {
  args: {
    phaseEndTime: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
  },
}

export const NoTime: Story = {
  args: {
    phaseEndTime: undefined,
  },
}
