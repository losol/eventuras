import { Meta, StoryObj } from '@storybook/react-vite';
import type { BorderProps } from './types';
import { buildBorderClasses } from './classBuilders';

const radii = [
  { name: 'sm', token: '--radius-sm' },
  { name: 'default', token: '--radius' },
  { name: 'lg', token: '--radius-lg' },
  { name: 'xl', token: '--radius-xl' },
  { name: 'full', token: '9999px' },
];

const AllBorders = () => (
  <div className="p-6 max-w-5xl">
    <h2 className="text-lg font-bold mb-1">Border Tokens</h2>
    <p className="text-sm text-text-muted mb-6">Border radius scale.</p>

    <h3 className="text-sm font-semibold mb-3">Radius</h3>
    <div className="flex gap-6 items-end">
      {radii.map(({ name, token }) => (
        <div key={name} className="flex flex-col items-center gap-2">
          <div
            className="h-20 w-20"
            style={{
              borderRadius: token.startsWith('--') ? `var(${token})` : token,
              backgroundColor: 'var(--color-primary-400)',
              border: '2px solid var(--color-primary-600)',
            }}
          />
          <span className="text-xs font-mono text-text-subtle">
            {token.startsWith('--') ? token : 'rounded-full'}
          </span>
          <span className="text-xs text-text-muted">{name}</span>
        </div>
      ))}
    </div>

    <h3 className="text-sm font-semibold mt-8 mb-3">Border Colors</h3>
    <div className="flex gap-4">
      <div className="flex flex-col items-center gap-2">
        <div
          className="h-16 w-32 rounded-lg"
          style={{ border: '2px solid var(--border-1)' }}
        />
        <span className="text-xs font-mono text-text-subtle">--border-1</span>
        <span className="text-xs text-text-muted">Default</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <div
          className="h-16 w-32 rounded-lg"
          style={{ border: '2px solid var(--border-2)' }}
        />
        <span className="text-xs font-mono text-text-subtle">--border-2</span>
        <span className="text-xs text-text-muted">Emphasis</span>
      </div>
    </div>
  </div>
);

const meta: Meta = {
  title: 'Tokens/Borders',
};

export default meta;
type Story = StoryObj;

export const Overview: Story = {
  render: () => <AllBorders />,
};

/* ------------------------------------------------------------------ */
/*  ADR-0001: BorderProps API                                         */
/* ------------------------------------------------------------------ */

const BorderBox = ({ label, props }: { label: string; props: BorderProps }) => (
  <div className="flex flex-col items-center gap-2">
    <div className={`h-20 w-32 bg-neutral-50 dark:bg-neutral-900 ${buildBorderClasses(props)}`} />
    <span className="text-xs font-mono text-text-subtle text-center">{label}</span>
  </div>
);

const BorderPropsDemo = () => (
  <div className="p-6 max-w-5xl">
    <h2 className="text-lg font-bold mb-1">BorderProps API</h2>
    <p className="text-sm text-text-muted mb-6">
      Typed border props: <code className="bg-neutral-100 dark:bg-neutral-800 px-1 rounded">border</code>,{' '}
      <code className="bg-neutral-100 dark:bg-neutral-800 px-1 rounded">borderColor</code>,{' '}
      <code className="bg-neutral-100 dark:bg-neutral-800 px-1 rounded">radius</code>.
    </p>

    {/* Border variants */}
    <h3 className="text-sm font-semibold mb-3">Variants</h3>
    <div className="flex gap-6 mb-8 flex-wrap">
      <BorderBox label='border={true}' props={{ border: true, radius: 'md' }} />
      <BorderBox label='border="default"' props={{ border: 'default', radius: 'md' }} />
      <BorderBox label='border="strong"' props={{ border: 'strong', radius: 'md' }} />
      <BorderBox label='border="subtle"' props={{ border: 'subtle', radius: 'md' }} />
    </div>

    {/* Border colors */}
    <h3 className="text-sm font-semibold mb-3">Colors</h3>
    <div className="flex gap-4 mb-8 flex-wrap">
      {(['default', 'subtle', 'strong', 'primary', 'success', 'warning', 'error', 'info'] as const).map(color => (
        <BorderBox
          key={color}
          label={`borderColor="${color}"`}
          props={{ border: true, borderColor: color, radius: 'md' }}
        />
      ))}
    </div>

    {/* Radius scale */}
    <h3 className="text-sm font-semibold mb-3">Radius</h3>
    <div className="flex gap-6 flex-wrap">
      {(['none', 'sm', 'md', 'lg', 'xl', 'full'] as const).map(r => (
        <BorderBox
          key={r}
          label={`radius="${r}"`}
          props={{ border: true, radius: r }}
        />
      ))}
    </div>
  </div>
);

export const PropAPI: Story = {
  name: 'BorderProps API',
  render: () => <BorderPropsDemo />,
};
