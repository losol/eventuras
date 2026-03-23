import { Meta, StoryObj } from '@storybook/react-vite';

const fontSizes = [
  { name: 'xs', label: 'Extra Small' },
  { name: 'sm', label: 'Small' },
  { name: 'base', label: 'Base' },
  { name: 'lg', label: 'Large' },
  { name: 'xl', label: 'Extra Large' },
  { name: '2xl', label: '2XL' },
  { name: '3xl', label: '3XL' },
  { name: '4xl', label: '4XL' },
  { name: '5xl', label: '5XL' },
  { name: '6xl', label: '6XL' },
];

const fonts = [
  { name: 'sans', css: 'var(--font-sans)', role: 'Body text (--font-body)' },
  { name: 'serif', css: 'var(--font-serif)', role: 'Display headings (--font-display)' },
  { name: 'mono', css: 'var(--font-mono)', role: 'Code' },
];

const AllTypography = () => (
  <div className="p-6 max-w-5xl">
    <h2 className="text-lg font-bold mb-1">Typography Tokens</h2>
    <p className="text-sm text-text-muted mb-6">
      Fluid type scale powered by <code className="bg-neutral-100 dark:bg-neutral-800 px-1 rounded">clamp()</code> — scales smoothly between viewport sizes.
    </p>

    <h3 className="text-sm font-semibold mb-3">Font Families</h3>
    <div className="space-y-4 mb-8">
      {fonts.map(({ name, css, role }) => (
        <div key={name} className="flex items-baseline gap-4">
          <span className="text-xs font-mono text-text-subtle w-16 shrink-0">--font-{name}</span>
          <span className="text-xl" style={{ fontFamily: css }}>
            The quick brown fox jumps over the lazy dog
          </span>
          <span className="text-xs text-text-subtle shrink-0">{role}</span>
        </div>
      ))}
    </div>

    <h3 className="text-sm font-semibold mb-3">Type Scale</h3>
    <div className="space-y-3">
      {fontSizes.map(({ name, label }) => (
        <div key={name} className="flex items-baseline gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-2">
          <span className="text-xs font-mono text-text-subtle w-24 shrink-0">--font-size-{name}</span>
          <span style={{ fontSize: `var(--font-size-${name})` }}>
            {label} — Aa Bb Cc 123
          </span>
        </div>
      ))}
    </div>

    <h3 className="text-sm font-semibold mt-8 mb-3">Heading Hierarchy</h3>
    <div className="space-y-2 [&_h1]:mt-0 [&_h2]:mt-0 [&_h3]:mt-0 [&_h4]:mt-0 [&_h5]:mt-0 [&_h6]:mt-0">
      <h1>Heading 1 — Display serif</h1>
      <h2>Heading 2 — Display serif</h2>
      <h3>Heading 3 — Display serif</h3>
      <h4>Heading 4 — Body sans</h4>
      <h5>Heading 5 — Body sans</h5>
      <h6>Heading 6 — Body sans</h6>
    </div>
  </div>
);

const meta: Meta = {
  title: 'Tokens/Typography',
};

export default meta;
type Story = StoryObj;

export const Overview: Story = {
  render: () => <AllTypography />,
};
