import type * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Chip } from './Chip';

const meta: Meta<typeof Chip> = {
  title: 'Core/Chip (beta)',
  component: Chip,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Theme-scope-aware tag primitive. Colors and radius come from CSS tokens (`--chip-bg`, `--chip-fg`, `--chip-border`, `--chip-radius`) so an ancestor can re-skin chips inside its scope. Pairs with `Badge` — Badge carries semantic status, Chip is a neutral primitive that adopts its surrounding palette. Typography (mono, uppercase) is not on Chip — apply via className or compose with a typography primitive.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Chip>;

// Shared utility string for "tag style" — mono uppercase with tighter padding.
// Once Text gains mono/uppercase props, this can be replaced with
// `<Chip><Text mono uppercase>…</Text></Chip>`.
const TAG_CLASS = 'font-mono uppercase tracking-widest font-bold px-2 py-0.5';

export const Default: Story = {
  render: () => <Chip>v2.4</Chip>,
};

export const Tag: Story = {
  name: 'Tag style — via className',
  parameters: {
    docs: {
      description: {
        story:
          'For the dense "env tag" look (mono, uppercase, tighter padding), apply utility classes via `className`. Chip itself stays focused on chip shape — typography is a separate concern.',
      },
    },
  },
  render: () => (
    <div className="flex gap-2">
      <Chip className={TAG_CLASS}>prod</Chip>
      <Chip className={TAG_CLASS}>staging</Chip>
      <Chip className={TAG_CLASS}>local</Chip>
    </div>
  ),
};

export const WithDot: Story = {
  name: 'Composing — Chip.Dot before / after text',
  parameters: {
    docs: {
      description: {
        story:
          'Chip is a flex row with `gap-1.5`, so children render side-by-side. Use `<Chip.Dot/>` for the conventional currentColor dot, or compose any icon before/after the label.',
      },
    },
  },
  render: () => (
    <div className="flex gap-2 items-center">
      <Chip>
        <Chip.Dot />
        active
      </Chip>
      <Chip className={TAG_CLASS}>
        <Chip.Dot />
        live
      </Chip>
      <Chip className={TAG_CLASS}>
        connected
        <Chip.Dot />
      </Chip>
    </div>
  ),
};

export const Outline: Story = {
  name: 'Outline — transparent + border',
  parameters: {
    docs: {
      description: {
        story:
          'Outline has no fill — just `--chip-border` outline and `--chip-fg` text. To tint per-chip, wrap in a container that overrides those tokens with the semantic status palette.',
      },
    },
  },
  render: () => (
    <div className="flex gap-2 items-center">
      <Chip variant="outline">draft</Chip>
      <div
        style={
          {
            '--chip-fg': 'var(--info-text)',
            '--chip-border': 'var(--info-border)',
          } as React.CSSProperties
        }
      >
        <Chip variant="outline" className={TAG_CLASS}>info</Chip>
      </div>
      <div
        style={
          {
            '--chip-fg': 'var(--success-text)',
            '--chip-border': 'var(--success-border)',
          } as React.CSSProperties
        }
      >
        <Chip variant="outline" className={TAG_CLASS}>success</Chip>
      </div>
      <div
        style={
          {
            '--chip-fg': 'var(--warning-text)',
            '--chip-border': 'var(--warning-border)',
          } as React.CSSProperties
        }
      >
        <Chip variant="outline" className={TAG_CLASS}>warn</Chip>
      </div>
      <div
        style={
          {
            '--chip-fg': 'var(--error-text)',
            '--chip-border': 'var(--error-border)',
          } as React.CSSProperties
        }
      >
        <Chip variant="outline" className={TAG_CLASS}>error</Chip>
      </div>
    </div>
  ),
};

export const ThemeScopeOverride: Story = {
  name: 'Theme-scope override — full chip palette',
  parameters: {
    docs: {
      description: {
        story:
          'The canonical way to tint chips: a container overrides `--chip-bg`, `--chip-fg`, and `--chip-border` so every chip inside adopts the local palette. Used by themed surfaces (Console, dark panels, etc.) to re-skin pills without touching the component.',
      },
    },
  },
  render: () => (
    <div
      style={
        {
          padding: '24px',
          background: 'oklch(0.165 0.030 234)',
          '--chip-bg': 'rgba(255, 255, 255, 0.08)',
          '--chip-fg': 'oklch(0.785 0.028 82)',
          '--chip-border': 'oklch(0.330 0.058 230)',
        } as React.CSSProperties
      }
    >
      <Chip className={TAG_CLASS}>prod</Chip>
    </div>
  ),
};

export const SquareCorners: Story = {
  name: 'Sharp corners via --chip-radius',
  parameters: {
    docs: {
      description: {
        story:
          'Override `--chip-radius` on a container to flip all chips inside to sharp corners — useful for retro / brutalist sub-experiences. The component name is shape-agnostic precisely because shape is themable.',
      },
    },
  },
  render: () => (
    <div
      style={{ '--chip-radius': '0' } as React.CSSProperties}
      className="flex gap-2"
    >
      <Chip className={TAG_CLASS}>prod</Chip>
      <Chip>v2.4</Chip>
    </div>
  ),
};
