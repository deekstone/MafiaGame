import type { Meta, StoryObj } from '@storybook/react-vite'
import { StatusBadge } from './StatusBadge'

const meta = {
  title: 'Components/StatusBadge',
  component: StatusBadge,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['waiting', 'in-progress', 'finished', 'cancelled'],
      description: 'The game status',
    },
  },
} satisfies Meta<typeof StatusBadge>

export default meta
type Story = StoryObj<typeof meta>

export const Waiting: Story = {
  args: {
    status: 'waiting',
  },
}

export const InProgress: Story = {
  args: {
    status: 'in-progress',
  },
}

export const Finished: Story = {
  args: {
    status: 'finished',
  },
}

export const Cancelled: Story = {
  args: {
    status: 'cancelled',
  },
}

export const AllStatuses: Story = {
  render: () => (
    <div className="flex gap-4 items-center">
      <StatusBadge status="waiting" />
      <StatusBadge status="in-progress" />
      <StatusBadge status="finished" />
      <StatusBadge status="cancelled" />
    </div>
  ),
}
