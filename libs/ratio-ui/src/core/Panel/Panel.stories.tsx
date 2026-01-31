import type { Meta, StoryObj } from '@storybook/react';
import { Panel } from './Panel';
import { Stack } from '../../layout/Stack/Stack';

const meta = {
  title: 'Core/Panel',
  component: Panel,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['alert', 'callout', 'notice'],
    },
    intent: {
      control: 'select',
      options: ['info', 'success', 'warning', 'error', 'neutral'],
    },
  },
} satisfies Meta<typeof Panel>;

export default meta;
type Story = StoryObj<typeof meta>;

// Alert variant examples
export const AlertInfo: Story = {
  args: {
    variant: 'alert',
    intent: 'info',
    children: 'This is an informational message. Your session will expire in 5 minutes.',
  },
};

export const AlertSuccess: Story = {
  args: {
    variant: 'alert',
    intent: 'success',
    children: 'Success! Your account has been created successfully.',
  },
};

export const AlertWarning: Story = {
  args: {
    variant: 'alert',
    intent: 'warning',
    children: 'Warning: Your password will expire soon. Please update it.',
  },
};

export const AlertError: Story = {
  args: {
    variant: 'alert',
    intent: 'error',
    children: 'Error: Invalid credentials. Please try again.',
  },
};

// Callout variant examples
export const CalloutInfo: Story = {
  args: {
    variant: 'callout',
    intent: 'info',
    children: '💡 Pro tip: Use keyboard shortcuts to navigate faster',
  },
};

export const CalloutSuccess: Story = {
  args: {
    variant: 'callout',
    intent: 'success',
    children: '✓ All systems operational',
  },
};

// Notice variant examples
export const NoticeWarning: Story = {
  args: {
    variant: 'notice',
    intent: 'warning',
    children: '⚠️ System maintenance scheduled for tonight at 2 AM',
  },
};

export const NoticeNeutral: Story = {
  args: {
    variant: 'notice',
    intent: 'neutral',
    children: 'This is a neutral notice for general information',
  },
};

// All variants showcase
export const AllVariants = {
  render: () => (
    <Stack gap="lg">
      <Panel variant="alert" intent="info">
        Alert variant with info intent
      </Panel>
      <Panel variant="alert" intent="success">
        Alert variant with success intent
      </Panel>
      <Panel variant="alert" intent="warning">
        Alert variant with warning intent
      </Panel>
      <Panel variant="alert" intent="error">
        Alert variant with error intent
      </Panel>
      <Panel variant="alert" intent="neutral">
        Alert variant with neutral intent
      </Panel>

      <Panel variant="callout" intent="info">
        Callout variant with info intent
      </Panel>
      <Panel variant="callout" intent="success">
        Callout variant with success intent
      </Panel>

      <Panel variant="notice" intent="warning">
        Notice variant with warning intent
      </Panel>
      <Panel variant="notice" intent="neutral">
        Notice variant with neutral intent
      </Panel>
    </Stack>
  ),
};

export const LongMessage: Story = {
  args: {
    variant: 'alert',
    intent: 'info',
    children: 'This is a longer message that demonstrates how the Panel component handles multiple lines of text. It should wrap nicely and maintain proper spacing throughout the message. You can use this for detailed explanations or instructions.',
  },
};
