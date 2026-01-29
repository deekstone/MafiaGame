import type { Meta, StoryObj } from '@storybook/react-vite'
import { RoleDisplay } from './RoleDisplay'

const meta = {
  title: 'Components/RoleDisplay',
  component: RoleDisplay,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    role: {
      control: 'select',
      options: ['mafia', 'doctor', 'villager'],
      description: 'The player role',
    },
  },
} satisfies Meta<typeof RoleDisplay>

export default meta
type Story = StoryObj<typeof meta>

export const Mafia: Story = {
  args: {
    role: 'mafia',
  },
}

export const Doctor: Story = {
  args: {
    role: 'doctor',
  },
}

export const Villager: Story = {
  args: {
    role: 'villager',
  },
}

export const AllRoles: Story = {
  render: () => (
    <div className="space-y-4">
      <RoleDisplay role="mafia" />
      <RoleDisplay role="doctor" />
      <RoleDisplay role="villager" />
    </div>
  ),
}
