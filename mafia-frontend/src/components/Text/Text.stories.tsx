import type { Meta, StoryObj } from '@storybook/react-vite'
import { Text } from './Text'

const meta = {
  title: 'Components/Text',
  component: Text,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'label'],
      description: 'The semantic HTML element variant',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'base', 'lg', 'xl', '2xl'],
      description: 'The text size',
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'muted', 'white', 'inherit'],
      description: 'The text color',
    },
    weight: {
      control: 'select',
      options: ['normal', 'medium', 'semibold', 'bold'],
      description: 'The font weight',
    },
    children: {
      control: 'text',
      description: 'The text content',
    },
  },
} satisfies Meta<typeof Text>

export default meta
type Story = StoryObj<typeof meta>

export const Heading1: Story = {
  args: {
    variant: 'h1',
    children: 'Heading 1',
  },
}

export const Heading2: Story = {
  args: {
    variant: 'h2',
    children: 'Heading 2',
  },
}

export const Heading3: Story = {
  args: {
    variant: 'h3',
    children: 'Heading 3',
  },
}

export const Paragraph: Story = {
  args: {
    variant: 'p',
    children: 'This is a paragraph of text. It demonstrates the default paragraph styling.',
  },
}

export const Label: Story = {
  args: {
    variant: 'label',
    children: 'Form Label',
  },
}

export const AllSizes: Story = {
  render: () => (
    <div className="space-y-2">
      <Text size="xs">Extra Small Text</Text>
      <Text size="sm">Small Text</Text>
      <Text size="base">Base Text</Text>
      <Text size="lg">Large Text</Text>
      <Text size="xl">Extra Large Text</Text>
      <Text size="2xl">2X Large Text</Text>
    </div>
  ),
}

export const AllColors: Story = {
  render: () => (
    <div className="space-y-2">
      <Text color="primary">Primary Color</Text>
      <Text color="secondary">Secondary Color</Text>
      <Text color="muted">Muted Color</Text>
      <div className="bg-gray-800 p-2 rounded">
        <Text color="white">White Color</Text>
      </div>
    </div>
  ),
}

export const AllWeights: Story = {
  render: () => (
    <div className="space-y-2">
      <Text weight="normal">Normal Weight</Text>
      <Text weight="medium">Medium Weight</Text>
      <Text weight="semibold">Semibold Weight</Text>
      <Text weight="bold">Bold Weight</Text>
    </div>
  ),
}

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-4">
      <Text variant="h1">Heading 1</Text>
      <Text variant="h2">Heading 2</Text>
      <Text variant="h3">Heading 3</Text>
      <Text variant="h4">Heading 4</Text>
      <Text variant="h5">Heading 5</Text>
      <Text variant="h6">Heading 6</Text>
      <Text variant="p">This is a paragraph with some text content.</Text>
      <Text variant="span">This is a span element.</Text>
      <Text variant="label">This is a label element.</Text>
    </div>
  ),
}
