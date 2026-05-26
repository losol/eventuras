import type * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { LiveIndicator } from './LiveIndicator';

const meta: Meta<typeof LiveIndicator> = {
  title: 'Core/LiveIndicator (beta)',
  component: LiveIndicator,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Pulsing dot + status label. A thin wrapper around `<Chip><Chip.Dot pulse/>…</Chip>` with a green success-tinted palette. `children` is required so the consumer always wires their own (typically translated) label — no English defaults that might leak through missed i18n.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof LiveIndicator>;

export const Live: Story = {
  render: () => <LiveIndicator status="live">Live</LiveIndicator>,
};

export const Paused: Story = {
  render: () => <LiveIndicator status="paused">Paused</LiveIndicator>,
};

export const I18nPattern: Story = {
  name: 'i18n — translated labels per state',
  parameters: {
    docs: {
      description: {
        story:
          'Pass already-translated labels via `children`. Typical pattern: a translation key per state, computed from the same flag that drives `status`.',
      },
    },
  },
  render: () => (
    <div className="flex gap-2 items-center">
      <LiveIndicator status="live">Tilkoblet</LiveIndicator>
      <LiveIndicator status="paused">Frakoblet</LiveIndicator>
    </div>
  ),
};

export const Reskinned: Story = {
  name: 'Re-skinned via token override',
  parameters: {
    docs: {
      description: {
        story:
          'A container can re-skin both the pulse color (`--live-indicator-dot`) and the chip chrome (`--chip-bg`, `--chip-fg`, `--chip-border`) without touching the component. Useful for amber "reconnecting" or red "error" states.',
      },
    },
  },
  render: () => (
    <div className="flex gap-2 items-center">
      <LiveIndicator>Connected</LiveIndicator>

      <div
        style={
          {
            '--live-indicator-dot': 'var(--warning-solid)',
            '--chip-bg': 'var(--warning-bg)',
            '--chip-fg': 'var(--warning-text)',
            '--chip-border': 'var(--warning-border)',
          } as React.CSSProperties
        }
      >
        <LiveIndicator>Reconnecting</LiveIndicator>
      </div>

      <div
        style={
          {
            '--live-indicator-dot': 'var(--error-solid)',
            '--chip-bg': 'var(--error-bg)',
            '--chip-fg': 'var(--error-text)',
            '--chip-border': 'var(--error-border)',
          } as React.CSSProperties
        }
      >
        <LiveIndicator status="paused">Error</LiveIndicator>
      </div>
    </div>
  ),
};
