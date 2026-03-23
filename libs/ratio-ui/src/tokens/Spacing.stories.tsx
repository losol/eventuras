import { Meta, StoryObj } from '@storybook/react-vite';

const spacingSteps = [
  { name: '3xs', label: '3XS' },
  { name: '2xs', label: '2XS' },
  { name: 'xs', label: 'XS' },
  { name: 's', label: 'S' },
  { name: 'm', label: 'M' },
  { name: 'l', label: 'L' },
  { name: 'xl', label: 'XL' },
  { name: '2xl', label: '2XL' },
  { name: '3xl', label: '3XL' },
];

const AllSpacing = () => (
  <div className="p-6 max-w-5xl">
    <h2 className="text-lg font-bold mb-1">Spacing Tokens</h2>
    <p className="text-sm text-text-muted mb-6">
      Fluid spacing scale powered by <code className="bg-neutral-100 dark:bg-neutral-800 px-1 rounded">clamp()</code> — adapts to viewport width.
    </p>

    <div className="space-y-3">
      {spacingSteps.map(({ name, label }) => (
        <div key={name} className="flex items-center gap-4">
          <span className="text-xs font-mono text-text-subtle w-20 shrink-0">--space-{name}</span>
          <span className="text-xs text-text-muted w-8 shrink-0 text-right">{label}</span>
          <div
            className="h-6 rounded bg-primary-400"
            style={{ width: `var(--space-${name})` }}
          />
        </div>
      ))}
    </div>

    <h3 className="text-sm font-semibold mt-8 mb-3">Spacing Demo</h3>
    <p className="text-xs text-text-muted mb-3">
      Boxes with increasing gap using each spacing token.
    </p>
    <div className="space-y-4">
      {spacingSteps.map(({ name, label }) => (
        <div key={name} className="flex items-center">
          <span className="text-xs font-mono text-text-subtle w-20 shrink-0">gap: {label}</span>
          <div className="flex" style={{ gap: `var(--space-${name})` }}>
            <div className="h-8 w-8 rounded bg-primary-300" />
            <div className="h-8 w-8 rounded bg-primary-400" />
            <div className="h-8 w-8 rounded bg-primary-500" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const meta: Meta = {
  title: 'Tokens/Spacing',
};

export default meta;
type Story = StoryObj;

export const Overview: Story = {
  render: () => <AllSpacing />,
};
