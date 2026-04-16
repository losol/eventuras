import type { Meta, StoryObj } from '@storybook/react-vite';
import { Navbar } from './Navbar';

const meta: Meta<typeof Navbar> = {
  title: 'Core/Navbar',
  component: Navbar,
  tags: ['autodocs'],
  parameters: {
    noPadding: true,
  },
};
export default meta;
type Story = StoryObj<typeof Navbar>;

export const BrandAndContent: Story = {
  render: () => (
    <Navbar sticky>
      <Navbar.Brand>
        <a href="/" className="flex items-center gap-2 text-lg tracking-tight no-underline">
          <span className="inline-block h-6 w-6 rounded bg-primary-500" />{' '}
          Eventuras
        </a>
      </Navbar.Brand>
      <Navbar.Content>
        <a href="/events" className="hover:underline">Events</a>
        <a href="/about" className="hover:underline">About</a>
        <div className="ml-auto flex gap-2">
          <button type="button" className="btn-primary">Sign up</button>
        </div>
      </Navbar.Content>
    </Navbar>
  ),
};

export const BrandOnly: Story = {
  render: () => (
    <Navbar bgColor="bg-slate-900" bgDark>
      <Navbar.Brand>
        <a href="/" className="text-lg tracking-tight no-underline text-white">
          Ignis
        </a>
      </Navbar.Brand>
    </Navbar>
  ),
};

export const ContentOnly: Story = {
  render: () => (
    <Navbar bgColor="bg-amber-100">
      <Navbar.Content>
        <a href="/admin/events" className="hover:underline">Events</a>
        <a href="/admin/users" className="hover:underline">Users</a>
        <a href="/admin/settings" className="hover:underline">Settings</a>
      </Navbar.Content>
    </Navbar>
  ),
};

export const DoubleNavbar: Story = {
  render: () => (
    <div>
      <Navbar sticky bgColor="bg-slate-900" bgDark>
        <Navbar.Brand>
          <a href="/" className="text-lg tracking-tight no-underline text-white">Eventuras</a>
        </Navbar.Brand>
        <Navbar.Content>
          <div className="ml-auto">
            <button type="button" className="text-sm text-white/70 hover:text-white">Sign out</button>
          </div>
        </Navbar.Content>
      </Navbar>
      <Navbar bgColor="bg-slate-700" className="text-dark">
        <Navbar.Content>
          <a href="/admin/events" className="hover:underline">Events</a>
          <a href="/admin/users" className="hover:underline">Users</a>
        </Navbar.Content>
      </Navbar>
    </div>
  ),
};

/** Legacy API — still works, renders identically to the old Navbar. */
export const LegacyTitle: Story = {
  args: {
    title: 'Eventuras Inc.',
    sticky: true,
  },
};

/** Legacy API with children. */
export const LegacyWithChildren: Story = {
  render: (args) => (
    <Navbar {...args}>
      <a href="/about" className="px-3">About</a>
      <button type="button" className="btn-primary ml-2">Sign up</button>
    </Navbar>
  ),
  args: { title: 'Acme Inc.' },
};
