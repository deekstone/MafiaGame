import type { Meta, StoryObj } from '@storybook/react-vite'
import { GameNameForm } from './GameNameForm'

const meta = {
  title: 'Components/GameNameForm',
  component: GameNameForm,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    onSubmit: {
      action: 'submitted',
      description: 'Callback when form is submitted',
    },
    onCancel: {
      action: 'cancelled',
      description: 'Callback when form is cancelled',
    },
    isLoading: {
      control: 'boolean',
      description: 'Whether the form is in a loading state',
    },
  },
} satisfies Meta<typeof GameNameForm>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    onSubmit: (gameName: string) => {
      console.log('Game name submitted:', gameName)
    },
    onCancel: () => {
      console.log('Form cancelled')
    },
    isLoading: false,
  },
}

export const Loading: Story = {
  args: {
    onSubmit: (gameName: string) => {
      console.log('Game name submitted:', gameName)
    },
    onCancel: () => {
      console.log('Form cancelled')
    },
    isLoading: true,
  },
}
