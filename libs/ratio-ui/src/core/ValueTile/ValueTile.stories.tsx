import type { Meta, StoryObj } from '@storybook/react-vite';

import { Card } from '../Card';
import { ValueTile } from './ValueTile';

const meta: Meta<typeof ValueTile> = {
  title: 'Core/ValueTile',
  component: ValueTile,
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'radio',
      options: ['vertical', 'horizontal'],
    },
    number: { control: 'text' },
    label: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof ValueTile>;

/** Convenience API — `number` + `label`, matches the prior `NumberCard`. */
export const Basic: Story = {
  args: {
    number: 42,
    label: 'Total events',
  },
};

/** `undefined` renders an em-dash for the loading state. */
export const Loading: Story = {
  args: {
    number: undefined,
    label: 'Loading…',
  },
};

/** Compound API — `ValueTile.Value` + `ValueTile.Caption` with rich markup. */
export const RichValue: Story = {
  render: () => (
    <ValueTile>
      <ValueTile.Value>
        <em className="text-(--accent)">240+</em> articles
      </ValueTile.Value>
      <ValueTile.Caption>Across reading, writing, research, and craft</ValueTile.Caption>
    </ValueTile>
  ),
};

/**
 * Horizontal orientation — value and caption baseline-aligned in a row.
 * Useful for inline data displays where the caption qualifies the value.
 */
export const Horizontal: Story = {
  args: {
    orientation: 'horizontal',
    number: 89,
    label: 'active events',
  },
};

/** A grid of stat blocks — Hero side-panel pattern. */
export const Grid: Story = {
  render: () => (
    <div className="grid gap-7 max-w-sm border-l border-(--border-2) pl-10">
      <ValueTile>
        <ValueTile.Value>
          <em className="text-(--accent)">240+</em> articles
        </ValueTile.Value>
        <ValueTile.Caption>Across reading, writing, research, and craft</ValueTile.Caption>
      </ValueTile>
      <ValueTile>
        <ValueTile.Value>
          12 <em className="text-(--accent)">collections</em>
        </ValueTile.Value>
        <ValueTile.Caption>Editorial reading lists curated by topic</ValueTile.Caption>
      </ValueTile>
      <ValueTile>
        <ValueTile.Value>
          1 <em className="text-(--accent)">subscription</em>
        </ValueTile.Value>
        <ValueTile.Caption>Open access, free for the curious, supported by patrons</ValueTile.Caption>
      </ValueTile>
    </div>
  ),
};

/**
 * Wrapped in `Card` for a surfaced dashboard tile. The dashboard pattern
 * pairs `Card variant="outline"` with the convenience API.
 */
export const InsideCard: Story = {
  render: () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl">
      <Card variant="outline" className="text-center">
        <ValueTile number={156} label="Total events" className="items-center" />
      </Card>
      <Card variant="outline" className="text-center">
        <ValueTile number={2341} label="Registrations" className="items-center" />
      </Card>
      <Card variant="outline" className="text-center">
        <ValueTile number={89} label="Active events" className="items-center" />
      </Card>
      <Card variant="outline" className="text-center">
        <ValueTile number={undefined} label="Loading…" className="items-center" />
      </Card>
    </div>
  ),
};
