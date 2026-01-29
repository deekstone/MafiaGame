import type { Meta, StoryObj } from '@storybook/react-vite'
import { StartButton } from './StartButton'

const meta = {
  title: 'Components/StartButton',
  component: StartButton,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    onStart: {
      action: 'started',
      description: 'Callback when start button is clicked',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
    },
  },
} satisfies Meta<typeof StartButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    onStart: () => {
      console.log('Game started')
    },
    disabled: false,
  },
}

export const Disabled: Story = {
  args: {
    onStart: () => {
      console.log('Game started')
    },
    disabled: true,
  },
}
