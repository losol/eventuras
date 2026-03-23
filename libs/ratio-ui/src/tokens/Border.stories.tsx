import { Meta, StoryObj } from '@storybook/react-vite';

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
