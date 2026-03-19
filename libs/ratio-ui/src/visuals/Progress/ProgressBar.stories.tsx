import type { Meta, StoryObj } from '@storybook/react';
import { ProgressBar } from './ProgressBar';

const meta: Meta<typeof ProgressBar> = {
  title: 'Visuals/ProgressBar',
  component: ProgressBar,
  parameters: { layout: 'padded' },
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100 } },
    max: { control: 'number' },
    color: { control: 'color' },
    height: { control: 'number' },
    label: { control: 'text' },
    showValue: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof ProgressBar>;

export const Default: Story = {
  args: {
    value: 52,
    max: 70,
    color: '#188097',
    label: 'Your score',
  },
};

export const Tall: Story = {
  args: {
    value: 80,
    max: 100,
    color: 'var(--color-success-600, #16a34a)',
    height: 14,
    label: 'Progress',
  },
};

export const NoLabel: Story = {
  args: {
    value: 30,
    max: 100,
    height: 6,
  },
};

export const Full: Story = {
  args: {
    value: 100,
    max: 100,
    color: 'var(--color-success-600, #16a34a)',
    label: 'Complete',
  },
};

export const Empty: Story = {
  args: {
    value: 0,
    max: 100,
    label: 'Not started',
  },
};
