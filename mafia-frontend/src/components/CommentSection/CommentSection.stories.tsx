import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { CommentSection } from './CommentSection'

const meta = {
  title: 'Components/CommentSection',
  component: CommentSection,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CommentSection>

export default meta
type Story = StoryObj<typeof meta>

const CommentSectionWrapper = ({ initialComments = [] }: { initialComments?: any[] }) => {
  const [comments, setComments] = useState(initialComments)
  const [isSending, setIsSending] = useState(false)

  const handleSendComment = async (message: string) => {
    setIsSending(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    setComments([
      ...comments,
      {
        id: String(comments.length + 1),
        gameId: 'game-1',
        userId: 'user-1',
        nickname: 'Current User',
        message,
        timestamp: new Date(),
      },
    ])
    setIsSending(false)
    return true
  }

  return (
    <CommentSection
      comments={comments}
      onSendComment={handleSendComment}
      isSending={isSending}
    />
  )
}

export const Empty: Story = {
  render: () => <CommentSectionWrapper />,
}

export const WithComments: Story = {
  render: () => (
    <CommentSectionWrapper
      initialComments={[
        {
          id: '1',
          gameId: 'game-1',
          userId: 'user-1',
          nickname: 'Alice',
          message: 'Hello everyone!',
          timestamp: new Date(Date.now() - 1000 * 60 * 5),
        },
        {
          id: '2',
          gameId: 'game-1',
          userId: 'user-2',
          nickname: 'Bob',
          message: 'Hey Alice! How are you?',
          timestamp: new Date(Date.now() - 1000 * 60 * 3),
        },
        {
          id: '3',
          gameId: 'game-1',
          userId: 'user-3',
          nickname: 'Charlie',
          message: 'This is a longer comment to test how the component handles multiple lines of text.',
          timestamp: new Date(Date.now() - 1000 * 60 * 1),
        },
      ]}
    />
  ),
}

export const ManyComments: Story = {
  render: () => (
    <CommentSectionWrapper
      initialComments={Array.from({ length: 15 }).map((_, i) => ({
        id: String(i + 1),
        gameId: 'game-1',
        userId: `user-${i + 1}`,
        nickname: `Player ${i + 1}`,
        message: `This is comment number ${i + 1}`,
        timestamp: new Date(Date.now() - 1000 * 60 * (15 - i)),
      }))}
    />
  ),
}
