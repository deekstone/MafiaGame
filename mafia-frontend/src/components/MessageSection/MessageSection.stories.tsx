import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { MessageSection } from './MessageSection'

const meta = {
  title: 'Components/MessageSection',
  component: MessageSection,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof MessageSection>

export default meta
type Story = StoryObj<typeof meta>

const MessageSectionWrapper = ({ initialMessages = [] }: { initialMessages?: any[] }) => {
  const [messages, setMessages] = useState(initialMessages)

  const handleAddMessage = (text: string) => {
    setMessages([
      ...messages,
      {
        id: String(messages.length + 1),
        text,
        timestamp: new Date(),
      },
    ])
  }

  return <MessageSection messages={messages} onAddMessage={handleAddMessage} />
}

export const Empty: Story = {
  render: () => <MessageSectionWrapper />,
}

export const WithMessages: Story = {
  render: () => (
    <MessageSectionWrapper
      initialMessages={[
        {
          id: '1',
          text: 'First message',
          timestamp: new Date(Date.now() - 1000 * 60 * 5),
        },
        {
          id: '2',
          text: 'Second message with more content',
          timestamp: new Date(Date.now() - 1000 * 60 * 3),
        },
        {
          id: '3',
          text: 'Third message',
          timestamp: new Date(Date.now() - 1000 * 60 * 1),
        },
      ]}
    />
  ),
}
