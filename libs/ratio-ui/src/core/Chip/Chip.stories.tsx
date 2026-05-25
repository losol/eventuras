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
  name: 'Outline — currentColor tint',
  parameters: {
    docs: {
      description: {
        story:
          'The outline variant uses `currentColor` for both border and a faint background tint (via the shared `--alpha-2` token). Set `color` on the chip — or an ancestor — to tint it to any status.',
      },
    },
  },
  render: () => (
    <div className="flex gap-2 items-center">
      <span style={{ color: 'var(--info-solid)' }}>
        <Chip variant="outline" className={TAG_CLASS}>info</Chip>
      </span>
      <span style={{ color: 'var(--success-solid)' }}>
        <Chip variant="outline" className={TAG_CLASS}>success</Chip>
      </span>
      <span style={{ color: 'var(--warning-solid)' }}>
        <Chip variant="outline" className={TAG_CLASS}>warn</Chip>
      </span>
      <span style={{ color: 'var(--error-solid)' }}>
        <Chip variant="outline" className={TAG_CLASS}>error</Chip>
      </span>
    </div>
  ),
};

export const Filled: Story = {
  render: () => (
    <div className="flex gap-2 items-center">
      <span style={{ color: 'var(--info-solid)' }}>
        <Chip variant="filled">info</Chip>
      </span>
      <span style={{ color: 'var(--success-solid)' }}>
        <Chip variant="filled">success</Chip>
      </span>
    </div>
  ),
};

export const ThemeScopeOverride: Story = {
  name: 'Theme-scope override',
  parameters: {
    docs: {
      description: {
        story:
          'A container can override the chip tokens locally — useful for themed surfaces where the chip should follow the local palette rather than the app theme.',
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
