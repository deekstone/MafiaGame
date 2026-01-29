import type { Meta, StoryObj } from '@storybook/react-vite'
import { GameInstructions } from './GameInstructions'

const meta = {
  title: 'Components/GameInstructions',
  component: GameInstructions,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof GameInstructions>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <GameInstructions />,
}
