import type * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ActionButton } from './ActionButton';
import { Text } from '../Text';

const meta: Meta<typeof ActionButton> = {
  title: 'Core/ActionButton (beta)',
  component: ActionButton,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Compact chrome button for toolbars, close affordances, table-row actions, and other dense surfaces. Composes children freely — works for icon-only, icon + text, or text-only. `ariaLabel` is required when there is no visible text.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ActionButton>;

// Minimal inline icons so stories don't depend on an icon pack
// Decorative icons — aria-hidden + focusable="false" so AT only announces
// the button's accessible name (text label or ariaLabel), not the icon.
const X = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
       aria-hidden="true" focusable="false">
    <path d="M6 6l12 12M18 6 6 18"/>
  </svg>
);
const Pause = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
       aria-hidden="true" focusable="false">
    <rect x="7" y="5" width="3" height="14" rx="0.5"/>
    <rect x="14" y="5" width="3" height="14" rx="0.5"/>
  </svg>
);
const Download = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
       aria-hidden="true" focusable="false">
    <path d="M12 4v12"/><path d="m7 11 5 5 5-5"/><path d="M5 20h14"/>
  </svg>
);

export const IconOnly: Story = {
  name: 'Icon-only — ariaLabel required',
  render: () => <ActionButton ariaLabel="Close"><X /></ActionButton>,
};

export const IconAndText: Story = {
  name: 'Icon + text — bare string child',
  parameters: {
    docs: {
      description: {
        story:
          'A bare string child inherits the button\'s font styling — no `<Text>` wrapper needed for the common case.',
      },
    },
  },
  render: () => (
    <ActionButton>
      <Pause />
      Pause
    </ActionButton>
  ),
};

export const IconAndTextComponent: Story = {
  name: 'Icon + <Text> — typography control',
  parameters: {
    docs: {
      description: {
        story:
          'When you want explicit typography control (size, weight, variant), compose with `<Text as="span">`. The `as="span"` keeps the layout inline; the default `<p>` would be semantically wrong inside a button.',
      },
    },
  },
  render: () => (
    <ActionButton>
      <Pause />
      <Text as="span" weight="medium">Pause</Text>
    </ActionButton>
  ),
};

export const TextOnly: Story = {
  render: () => <ActionButton>Publish</ActionButton>,
};

export const Subtle: Story = {
  render: () => (
    <ActionButton variant="subtle">
      <Pause />
      Pause
    </ActionButton>
  ),
};

export const Solid: Story = {
  render: () => (
    <ActionButton variant="solid">
      <Download />
      Download
    </ActionButton>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex gap-2 items-center">
      <ActionButton ariaLabel="Pause" size="sm"><Pause /></ActionButton>
      <ActionButton ariaLabel="Pause" size="md"><Pause /></ActionButton>
      <ActionButton ariaLabel="Pause" size="lg"><Pause /></ActionButton>
    </div>
  ),
};

export const Toolbar: Story = {
  name: 'Toolbar — mixed variants and contents',
  render: () => (
    <div className="flex gap-1 items-center">
      <ActionButton ariaLabel="Pause"><Pause /></ActionButton>
      <ActionButton ariaLabel="Download log"><Download /></ActionButton>
      <ActionButton ariaLabel="Close panel"><X /></ActionButton>
      <ActionButton variant="solid">
        <Download />
        Export
      </ActionButton>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => <ActionButton ariaLabel="Pause" disabled><Pause /></ActionButton>,
};

export const SquareCorners: Story = {
  name: 'Re-skinned via --action-button-radius',
  parameters: {
    docs: {
      description: {
        story:
          'Override `--action-button-radius` on a container to flip all action buttons inside to sharp corners — useful for retro / brutalist sub-experiences.',
      },
    },
  },
  render: () => (
    <div
      style={{ '--action-button-radius': '0' } as React.CSSProperties}
      className="flex gap-2"
    >
      <ActionButton ariaLabel="Pause"><Pause /></ActionButton>
      <ActionButton variant="subtle">
        <Pause />
        Pause
      </ActionButton>
    </div>
  ),
};
