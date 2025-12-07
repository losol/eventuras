import type { Meta, StoryObj } from '@storybook/react-vite';
import { Navbar, NavbarProps } from './Navbar';

const meta: Meta<typeof Navbar> = {
  title: 'Core/Navbar',
  component: Navbar,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof Navbar>;

export const Default: Story = {
  args: { title: 'Eventuras Inc.' },
};

/** Dark background + white text */
export const DarkBg: Story = {
  args: {
    title: 'Eventuras Inc.',
    bgDark: true,
    bgColor: 'bg-slate-900',
  } satisfies NavbarProps,
};

/** With right‑side links / buttons */
export const WithChildren: Story = {
  render: (args) => (
    <Navbar {...args}>
      {/* Any React node(s) */}
      <a href="/about" className="px-3">
        About
      </a>
      <button className="btn-primary ml-2">Sign up</button>
    </Navbar>
  ),
  args: { title: 'Acme Inc.' },
};

