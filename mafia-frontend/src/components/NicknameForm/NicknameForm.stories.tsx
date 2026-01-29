import type { Meta, StoryObj } from '@storybook/react-vite'
import { NicknameForm } from './NicknameForm'

const meta = {
  title: 'Components/NicknameForm',
  component: NicknameForm,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    onSubmit: {
      action: 'submitted',
      description: 'Callback when form is submitted',
    },
    isLoading: {
      control: 'boolean',
      description: 'Whether the form is in a loading state',
    },
  },
} satisfies Meta<typeof NicknameForm>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    onSubmit: (nickname: string) => {
      console.log('Nickname submitted:', nickname)
    },
    isLoading: false,
  },
}

export const Loading: Story = {
  args: {
    onSubmit: (nickname: string) => {
      console.log('Nickname submitted:', nickname)
    },
    isLoading: true,
  },
}
