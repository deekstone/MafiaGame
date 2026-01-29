import type { Meta, StoryObj } from '@storybook/react-vite'
import { FixedHeader } from './FixedHeader'
import { Text } from '../Text'

const meta = {
  title: 'Components/FixedHeader',
  component: FixedHeader,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof FixedHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div>
      <FixedHeader>
        <Text variant="h1">Fixed Header Content</Text>
      </FixedHeader>
      <div className="pt-20 p-8">
        <Text variant="p">Scroll down to see the header stays fixed at the top.</Text>
        {Array.from({ length: 20 }).map((_, i) => (
          <Text key={i} variant="p" className="mb-4">
            Content section {i + 1}
          </Text>
        ))}
      </div>
    </div>
  ),
}

export const WithNavigation: Story = {
  render: () => (
    <div>
      <FixedHeader>
        <div className="flex items-center justify-between">
          <Text variant="h2">Game Title</Text>
          <div className="flex gap-4">
            <Text variant="span">Home</Text>
            <Text variant="span">Games</Text>
            <Text variant="span">Profile</Text>
          </div>
        </div>
      </FixedHeader>
      <div className="pt-20 p-8">
        <Text variant="p">Header with navigation elements.</Text>
      </div>
    </div>
  ),
}
