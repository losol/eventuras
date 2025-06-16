import { Meta, StoryObj } from '@storybook/react-vite';
import Badge from './Badge';

const meta: Meta<typeof Badge> = {
  title: 'Core/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['neutral', 'info', 'positive', 'negative'],
    },
    block: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Neutral: Story = {
  args: {
    children: 'Neutral badge',
    variant: 'neutral',
  },
};

export const Info: Story = {
  args: {
    children: 'Info badge',
    variant: 'info',
  },
};

export const Positive: Story = {
  args: {
    children: 'Success!',
    variant: 'positive',
  },
};

export const Negative: Story = {
  args: {
    children: 'Error',
    variant: 'negative',
  },
};

export const Block: Story = {
  args: {
    children: 'Block badge',
    variant: 'info',
    block: true,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      <Badge variant="neutral">Neutral badge</Badge>
      <Badge variant="info">Info badge</Badge>
      <Badge variant="positive">Success!</Badge>
      <Badge variant="negative">Error badge</Badge>
    </div>
  ),
};
