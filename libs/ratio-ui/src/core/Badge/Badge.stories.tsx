import { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from './Badge';

const meta: Meta<typeof Badge> = {
  title: 'Core/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['neutral', 'info', 'success', 'warning', 'error'],
    },
    variant: {
      control: 'inline-radio',
      options: ['filled', 'subtle'],
    },
    block: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Neutral: Story = {
  args: {
    children: 'Neutral',
    status: 'neutral',
  },
};

export const Info: Story = {
  args: {
    children: 'Info',
    status: 'info',
  },
};

export const Success: Story = {
  args: {
    children: 'Success',
    status: 'success',
  },
};

export const Warning: Story = {
  args: {
    children: 'Warning',
    status: 'warning',
  },
};

export const ErrorStatus: Story = {
  args: {
    children: 'Error',
    status: 'error',
  },
};

export const AllStatuses: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      <Badge status="neutral">Neutral</Badge>
      <Badge status="info">Info</Badge>
      <Badge status="success">Success</Badge>
      <Badge status="warning">Warning</Badge>
      <Badge status="error">Error</Badge>
    </div>
  ),
};

export const Subtle: Story = {
  args: {
    children: 'Course',
    status: 'neutral',
    variant: 'subtle',
  },
};

export const SubtleAllStatuses: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      <Badge variant="subtle" status="neutral">Course</Badge>
      <Badge variant="subtle" status="info">Online</Badge>
      <Badge variant="subtle" status="success">Available</Badge>
      <Badge variant="subtle" status="warning">Few seats</Badge>
      <Badge variant="subtle" status="error">Full</Badge>
    </div>
  ),
};

export const Definition: Story = {
  args: {
    children: 'REG-001',
    definition: true,
    label: 'ID',
    status: 'neutral',
  },
};

export const SubtleDefinition: Story = {
  args: {
    children: 'REG-001',
    definition: true,
    label: 'ID',
    status: 'neutral',
    variant: 'subtle',
  },
};
