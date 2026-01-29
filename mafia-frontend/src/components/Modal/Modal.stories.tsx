import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Modal } from './Modal'
import { Button } from '../Button'
import { Text } from '../Text'

const meta = {
  title: 'Components/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    isOpen: {
      control: 'boolean',
      description: 'Whether the modal is open',
    },
    title: {
      control: 'text',
      description: 'The modal title',
    },
    onClose: {
      action: 'closed',
      description: 'Callback when modal is closed',
    },
  },
} satisfies Meta<typeof Modal>

export default meta
type Story = StoryObj<typeof meta>

const ModalWrapper = ({
  isOpen: initialOpen = false,
  title,
  children,
}: {
  isOpen?: boolean
  title?: string
  children?: React.ReactNode
}) => {
  const [isOpen, setIsOpen] = useState(initialOpen)
  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={title}>
        {children}
      </Modal>
    </>
  )
}

export const Default: Story = {
  render: () => (
    <ModalWrapper>
      <Text variant="p">This is a simple modal with some content.</Text>
    </ModalWrapper>
  ),
}

export const WithTitle: Story = {
  render: () => (
    <ModalWrapper title="Modal Title">
      <Text variant="p">This modal has a title.</Text>
    </ModalWrapper>
  ),
}

export const WithContent: Story = {
  render: () => (
    <ModalWrapper title="Confirmation">
      <div className="space-y-4">
        <Text variant="p">Are you sure you want to perform this action?</Text>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => {}}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => {}}>
            Confirm
          </Button>
        </div>
      </div>
    </ModalWrapper>
  ),
}

export const LongContent: Story = {
  render: () => (
    <ModalWrapper title="Long Content Modal">
      <div className="space-y-4">
        <Text variant="p">
          This modal contains a lot of content to demonstrate how it handles scrolling and overflow.
        </Text>
        {Array.from({ length: 10 }).map((_, i) => (
          <Text key={i} variant="p" size="sm">
            Paragraph {i + 1}: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </Text>
        ))}
      </div>
    </ModalWrapper>
  ),
}
