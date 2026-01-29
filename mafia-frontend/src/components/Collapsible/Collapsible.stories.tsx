import type { Meta, StoryObj } from '@storybook/react-vite'
import { Collapsible } from './Collapsible'

const meta = {
  title: 'Components/Collapsible',
  component: Collapsible,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'The title displayed in the header',
    },
    defaultCollapsed: {
      control: 'boolean',
      description: 'Whether the collapsible starts in a collapsed state',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes for the container',
    },
    headerClassName: {
      control: 'text',
      description: 'Additional CSS classes for the header',
    },
    contentClassName: {
      control: 'text',
      description: 'Additional CSS classes for the content area',
    },
    children: {
      control: false,
      description: 'The content to display when expanded',
    },
  },
} satisfies Meta<typeof Collapsible>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'Collapsible Section',
    defaultCollapsed: true,
    children: (
      <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <p className="text-gray-700 dark:text-gray-300">
          This is the content inside the collapsible section. It can contain any React elements.
        </p>
      </div>
    ),
  },
}

export const Collapsed: Story = {
  args: {
    title: 'Collapsed by Default',
    defaultCollapsed: true,
    children: (
      <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <p className="text-gray-700 dark:text-gray-300">
          This section starts collapsed. Click the button to expand it.
        </p>
      </div>
    ),
  },
}

export const WithLongContent: Story = {
  args: {
    title: 'Section with Long Content',
    defaultCollapsed: false,
    children: (
      <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg space-y-4">
        <p className="text-gray-700 dark:text-gray-300">
          This collapsible section contains longer content to demonstrate how it handles multiple
          paragraphs and elements.
        </p>
        <p className="text-gray-700 dark:text-gray-300">
          You can add as much content as needed. The collapsible will expand and collapse smoothly
          with a transition animation.
        </p>
        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
          <li>First item in a list</li>
          <li>Second item in a list</li>
          <li>Third item in a list</li>
        </ul>
      </div>
    ),
  },
}

export const WithCustomStyling: Story = {
  args: {
    title: 'Custom Styled Collapsible',
    defaultCollapsed: false,
    className: 'border border-gray-300 dark:border-gray-700 rounded-lg p-4',
    headerClassName: 'pb-2 border-b border-gray-200 dark:border-gray-700',
    contentClassName: 'pt-4',
    children: (
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-blue-900 dark:text-blue-100">
          This collapsible has custom styling applied through className props.
        </p>
      </div>
    ),
  },
}

export const WithComplexContent: Story = {
  args: {
    title: 'Game Instructions',
    defaultCollapsed: false,
    children: (
      <div className="mt-4 space-y-3">
        <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">How to Play</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            The game consists of day and night phases. During the day, players discuss and vote.
            During the night, special roles perform their actions.
          </p>
        </div>
        <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Roles</h3>
          <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 list-disc list-inside">
            <li>Mafia: Try to eliminate all town members</li>
            <li>Town: Find and eliminate the mafia</li>
            <li>Special roles: Have unique abilities</li>
          </ul>
        </div>
      </div>
    ),
  },
}
