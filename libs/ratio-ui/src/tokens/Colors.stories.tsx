import { Meta, StoryObj } from '@storybook/react-vite';

type ScaleConfig = {
  label: string;
  steps: number[];
  /** Tailwind bg classes keyed by step — needed because dynamic class names aren't scanned */
  bg: Record<number, string>;
};

/* Tailwind classes must be written out statically so the scanner picks them up */
const scales: Record<string, ScaleConfig> = {
  primary: {
    label: 'Primary — Ocean Teal',
    steps: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
    bg: {
      50: 'bg-primary-50', 100: 'bg-primary-100', 200: 'bg-primary-200', 300: 'bg-primary-300',
      400: 'bg-primary-400', 500: 'bg-primary-500', 600: 'bg-primary-600', 700: 'bg-primary-700',
      800: 'bg-primary-800', 900: 'bg-primary-900', 950: 'bg-primary-950',
    },
  },
  secondary: {
    label: 'Secondary — Sunny Yellow',
    steps: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
    bg: {
      50: 'bg-secondary-50', 100: 'bg-secondary-100', 200: 'bg-secondary-200', 300: 'bg-secondary-300',
      400: 'bg-secondary-400', 500: 'bg-secondary-500', 600: 'bg-secondary-600', 700: 'bg-secondary-700',
      800: 'bg-secondary-800', 900: 'bg-secondary-900', 950: 'bg-secondary-950',
    },
  },
  accent: {
    label: 'Accent — Warm Terracotta',
    steps: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
    bg: {
      50: 'bg-accent-50', 100: 'bg-accent-100', 200: 'bg-accent-200', 300: 'bg-accent-300',
      400: 'bg-accent-400', 500: 'bg-accent-500', 600: 'bg-accent-600', 700: 'bg-accent-700',
      800: 'bg-accent-800', 900: 'bg-accent-900', 950: 'bg-accent-950',
    },
  },
  neutral: {
    label: 'Neutral',
    steps: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
    bg: {
      50: 'bg-neutral-50', 100: 'bg-neutral-100', 200: 'bg-neutral-200', 300: 'bg-neutral-300',
      400: 'bg-neutral-400', 500: 'bg-neutral-500', 600: 'bg-neutral-600', 700: 'bg-neutral-700',
      800: 'bg-neutral-800', 900: 'bg-neutral-900', 950: 'bg-neutral-950',
    },
  },
  success: {
    label: 'Success — Mint Green',
    steps: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
    bg: {
      50: 'bg-success-50', 100: 'bg-success-100', 200: 'bg-success-200', 300: 'bg-success-300',
      400: 'bg-success-400', 500: 'bg-success-500', 600: 'bg-success-600', 700: 'bg-success-700',
      800: 'bg-success-800', 900: 'bg-success-900', 950: 'bg-success-950',
    },
  },
  warning: {
    label: 'Warning — Amber',
    steps: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
    bg: {
      50: 'bg-warning-50', 100: 'bg-warning-100', 200: 'bg-warning-200', 300: 'bg-warning-300',
      400: 'bg-warning-400', 500: 'bg-warning-500', 600: 'bg-warning-600', 700: 'bg-warning-700',
      800: 'bg-warning-800', 900: 'bg-warning-900', 950: 'bg-warning-950',
    },
  },
  error: {
    label: 'Error — Coral Red',
    steps: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
    bg: {
      50: 'bg-error-50', 100: 'bg-error-100', 200: 'bg-error-200', 300: 'bg-error-300',
      400: 'bg-error-400', 500: 'bg-error-500', 600: 'bg-error-600', 700: 'bg-error-700',
      800: 'bg-error-800', 900: 'bg-error-900', 950: 'bg-error-950',
    },
  },
  info: {
    label: 'Info — Sky Blue',
    steps: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
    bg: {
      50: 'bg-info-50', 100: 'bg-info-100', 200: 'bg-info-200', 300: 'bg-info-300',
      400: 'bg-info-400', 500: 'bg-info-500', 600: 'bg-info-600', 700: 'bg-info-700',
      800: 'bg-info-800', 900: 'bg-info-900', 950: 'bg-info-950',
    },
  },
  support: {
    label: 'Support — Sage Green',
    steps: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
    bg: {
      50: 'bg-support-50', 100: 'bg-support-100', 200: 'bg-support-200', 300: 'bg-support-300',
      400: 'bg-support-400', 500: 'bg-support-500', 600: 'bg-support-600', 700: 'bg-support-700',
      800: 'bg-support-800', 900: 'bg-support-900', 950: 'bg-support-950',
    },
  },
};

const Swatch = ({ name, step, bgClass }: { name: string; step: number; bgClass: string }) => (
  <div className="flex flex-col items-center gap-1">
    <div className={`h-12 w-full rounded border border-neutral-300 dark:border-neutral-700 ${bgClass}`} />
    <span className="text-xs font-mono text-text-muted">{step}</span>
    <span className="text-[10px] font-mono text-text-subtle">{name}-{step}</span>
  </div>
);

const ColorScale = ({ name, config }: { name: string; config: ScaleConfig }) => (
  <div className="mb-8">
    <h3 className="text-sm font-semibold mb-2">{config.label}</h3>
    <div className="grid grid-cols-11 gap-1">
      {config.steps.map((step) => (
        <Swatch key={step} name={name} step={step} bgClass={config.bg[step] ?? ''} />
      ))}
    </div>
  </div>
);

/* Opacity demo — static class names for Tailwind scanner */
const OpacityDemo = () => (
  <div className="mb-8">
    <h3 className="text-sm font-semibold mb-2">Opacity Modifiers</h3>
    <p className="text-xs text-text-muted mb-3">
      With oklch in <code className="bg-neutral-100 dark:bg-neutral-800 px-1 rounded">@theme</code>,
      opacity modifiers like <code className="bg-neutral-100 dark:bg-neutral-800 px-1 rounded">bg-primary-500/50</code> work at build time.
    </p>
    <div className="flex gap-2 items-end">
      <div className="flex flex-col items-center gap-1">
        <div className="h-12 w-16 rounded bg-primary-500" />
        <span className="text-xs font-mono text-text-muted">100%</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <div className="h-12 w-16 rounded bg-primary-500/75" />
        <span className="text-xs font-mono text-text-muted">75%</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <div className="h-12 w-16 rounded bg-primary-500/50" />
        <span className="text-xs font-mono text-text-muted">50%</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <div className="h-12 w-16 rounded bg-primary-500/25" />
        <span className="text-xs font-mono text-text-muted">25%</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <div className="h-12 w-16 rounded bg-primary-500/10" />
        <span className="text-xs font-mono text-text-muted">10%</span>
      </div>
    </div>
  </div>
);

const AllColors = () => (
  <div className="p-6 max-w-5xl">
    <h2 className="text-lg font-bold mb-1">Color Tokens</h2>
    <p className="text-sm text-text-muted mb-6">
      Color scales defined in oklch. Supports Tailwind v4 opacity modifiers.
    </p>
    <OpacityDemo />
    {Object.entries(scales).map(([name, config]) => (
      <ColorScale key={name} name={name} config={config} />
    ))}
  </div>
);

const meta: Meta = {
  title: 'Tokens/Colors',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const Palette: Story = {
  render: () => <AllColors />,
};
