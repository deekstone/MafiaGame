import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { MobileTabNavigation } from './MobileTabNavigation'

const meta = {
  title: 'Components/MobileTabNavigation',
  component: MobileTabNavigation,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    activeTab: {
      control: 'select',
      options: ['chat', 'players'],
      description: 'The currently active tab',
    },
    onTabChange: {
      action: 'tab changed',
      description: 'Callback when tab is changed',
    },
  },
} satisfies Meta<typeof MobileTabNavigation>

export default meta
type Story = StoryObj<typeof meta>

const TabNavigationWrapper = ({ initialTab = 'chat' }: { initialTab?: 'chat' | 'players' }) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'players'>(initialTab)
  return <MobileTabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
}

export const ChatActive: Story = {
  render: () => <TabNavigationWrapper initialTab="chat" />,
}

export const PlayersActive: Story = {
  render: () => <TabNavigationWrapper initialTab="players" />,
}

export const Interactive: Story = {
  render: () => <TabNavigationWrapper />,
}
