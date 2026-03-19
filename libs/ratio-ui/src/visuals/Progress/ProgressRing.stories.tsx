import type { Meta, StoryObj } from '@storybook/react';
import { ProgressRing } from './ProgressRing';

const meta: Meta<typeof ProgressRing> = {
  title: 'Visuals/ProgressRing',
  component: ProgressRing,
  parameters: { layout: 'centered' },
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100 } },
    max: { control: 'number' },
    color: { control: 'color' },
    size: { control: 'number' },
    strokeWidth: { control: 'number' },
  },
};

export default meta;
type Story = StoryObj<typeof ProgressRing>;

export const Default: Story = {
  args: {
    value: 72,
    max: 100,
    size: 120,
    strokeWidth: 8,
  },
  render: (args) => (
    <ProgressRing {...args}>
      <span className="text-2xl font-bold">{args.value}</span>
      <span className="text-xs text-gray-500">of {args.max}</span>
    </ProgressRing>
  ),
};

export const CustomScore: Story = {
  args: {
    value: 50.4,
    max: 70,
    color: '#188097',
    size: 100,
    strokeWidth: 7,
  },
  render: (args) => (
    <ProgressRing {...args}>
      <span className="text-xl font-bold">{args.value}</span>
      <span className="text-xs text-gray-500">of {args.max}</span>
    </ProgressRing>
  ),
};

export const Small: Story = {
  args: {
    value: 85,
    max: 100,
    color: 'var(--color-success-600, #16a34a)',
    size: 64,
    strokeWidth: 5,
  },
  render: (args) => (
    <ProgressRing {...args}>
      <span className="text-sm font-bold">{args.value}%</span>
    </ProgressRing>
  ),
};

export const ZeroValue: Story = {
  args: {
    value: 0,
    max: 100,
    size: 120,
    strokeWidth: 8,
  },
  render: (args) => (
    <ProgressRing {...args}>
      <span className="text-2xl font-bold text-gray-400">0</span>
    </ProgressRing>
  ),
};

export const Full: Story = {
  args: {
    value: 100,
    max: 100,
    color: 'var(--color-success-600, #16a34a)',
    size: 120,
    strokeWidth: 8,
  },
  render: (args) => (
    <ProgressRing {...args}>
      <span className="text-2xl font-bold">100%</span>
    </ProgressRing>
  ),
};

const scoreData = [
  { label: 'Wellbeing', value: 52, max: 70, color: '#188097' },
  { label: 'Activity', value: 11.5, max: 22.5, color: '#7c3aed' },
  { label: 'Social', value: 8, max: 24, color: '#ca8a04' },
  { label: 'Purpose', value: 15, max: 25, color: '#059669' },
];

export const ScoreCard: Story = {
  render: () => (
    <div className="rounded-xl bg-white p-8 shadow dark:bg-gray-900">
      <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
        {scoreData.map(({ label, value, max, color }) => (
          <div key={label} className="flex flex-col items-center gap-3">
            <ProgressRing value={value} max={max} color={color} size={130} strokeWidth={9} label={label}>
              <span className="text-2xl font-bold" style={{ color }}>{value}</span>
              <span className="text-xs text-gray-400">of {max}</span>
            </ProgressRing>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{label}</span>
          </div>
        ))}
      </div>
    </div>
  ),
};
