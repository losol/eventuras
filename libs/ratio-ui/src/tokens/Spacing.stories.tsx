import { Meta, StoryObj } from '@storybook/react-vite';
import type { Space } from './spacing';
import { buildSpacingClasses } from './spacing';

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

/* ------------------------------------------------------------------ */
/*  Semantic spacing scale (Space type)                               */
/* ------------------------------------------------------------------ */

const semanticSteps: { value: Space; css: string; tailwind: string }[] = [
  { value: 'none', css: '—',          tailwind: 'p-0 / gap-0' },
  { value: 'xs',   css: '--space-xs', tailwind: 'p-xs / gap-xs' },
  { value: 'sm',   css: '--space-s',  tailwind: 'p-sm / gap-sm' },
  { value: 'md',   css: '--space-m',  tailwind: 'p-md / gap-md' },
  { value: 'lg',   css: '--space-l',  tailwind: 'p-lg / gap-lg' },
  { value: 'xl',   css: '--space-xl', tailwind: 'p-xl / gap-xl' },
];

const SemanticScale = () => (
  <div className="p-6 max-w-5xl">
    <h2 className="text-lg font-bold mb-1">Semantic Spacing Scale</h2>
    <p className="text-sm text-text-muted mb-6">
      The 6-step <code className="bg-neutral-100 dark:bg-neutral-800 px-1 rounded">Space</code> type
      used by <code className="bg-neutral-100 dark:bg-neutral-800 px-1 rounded">SpacingProps</code> (padding, margin, gap).
      Backed by fluid CSS tokens.
    </p>

    {/* Visual scale */}
    <div className="space-y-3 mb-8">
      {semanticSteps.map(({ value, css, tailwind }) => (
        <div key={value} className="flex items-center gap-4">
          <span className="text-xs font-mono text-text-subtle w-10 shrink-0">{value}</span>
          <span className="text-xs font-mono text-text-subtle w-24 shrink-0">{css}</span>
          <div
            className="h-6 rounded bg-primary-400"
            style={{ width: value === 'none' ? '2px' : `var(--spacing-${value})` }}
          />
          <span className="text-[10px] font-mono text-text-subtle">{tailwind}</span>
        </div>
      ))}
    </div>

    {/* Gap demo */}
    <h3 className="text-sm font-semibold mb-3">Gap demo</h3>
    <p className="text-xs text-text-muted mb-3">
      Each row uses <code className="bg-neutral-100 dark:bg-neutral-800 px-1 rounded">buildSpacingClasses({'{ gap: value }'})</code>.
    </p>
    <div className="space-y-4">
      {semanticSteps.map(({ value }) => (
        <div key={value} className="flex items-center">
          <span className="text-xs font-mono text-text-subtle w-10 shrink-0">{value}</span>
          <div className={`flex ${buildSpacingClasses({ gap: value })}`}>
            <div className="h-8 w-8 rounded bg-primary-300" />
            <div className="h-8 w-8 rounded bg-primary-400" />
            <div className="h-8 w-8 rounded bg-primary-500" />
          </div>
        </div>
      ))}
    </div>

    {/* Padding demo */}
    <h3 className="text-sm font-semibold mt-8 mb-3">Padding demo</h3>
    <div className="space-y-3">
      {semanticSteps.filter(s => s.value !== 'none').map(({ value }) => (
        <div key={value} className="flex items-center gap-4">
          <span className="text-xs font-mono text-text-subtle w-10 shrink-0">{value}</span>
          <div className={`inline-block bg-primary-100 dark:bg-primary-900 rounded border border-primary-300 ${buildSpacingClasses({ padding: value })}`}>
            <div className="h-6 w-20 rounded bg-primary-400 text-[10px] font-mono text-white flex items-center justify-center">
              content
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const SemanticSpacing: Story = {
  name: 'Semantic Scale (Space type)',
  render: () => <SemanticScale />,
};
