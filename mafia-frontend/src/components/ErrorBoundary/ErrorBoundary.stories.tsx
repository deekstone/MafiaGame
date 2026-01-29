import type { Meta, StoryObj } from '@storybook/react-vite'
import { ErrorBoundary } from './ErrorBoundary'
import { Button } from '../Button'
import { Text } from '../Text'

const meta = {
  title: 'Components/ErrorBoundary',
  component: ErrorBoundary,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ErrorBoundary>

export default meta
type Story = StoryObj<typeof meta>

const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('This is a test error for the ErrorBoundary component')
  }
  return <Text variant="p">No error occurred</Text>
}

export const Default: Story = {
  render: () => (
    <ErrorBoundary>
      <ThrowError shouldThrow={false} />
    </ErrorBoundary>
  ),
}

export const WithError: Story = {
  render: () => (
    <ErrorBoundary>
      <ThrowError shouldThrow={true} />
    </ErrorBoundary>
  ),
}

export const WithCustomFallback: Story = {
  render: () => (
    <ErrorBoundary
      fallback={(error, resetError) => (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <Text variant="h3" className="text-red-600 dark:text-red-400 mb-2">
            Custom Error Display
          </Text>
          <Text variant="p" size="sm" className="text-red-800 dark:text-red-200 mb-4">
            {error.message}
          </Text>
          <Button variant="danger" onClick={resetError}>
            Reset
          </Button>
        </div>
      )}
    >
      <ThrowError shouldThrow={true} />
    </ErrorBoundary>
  ),
}
