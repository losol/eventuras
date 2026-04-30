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
    <Navbar bgColor="bg-slate-900" className="surface-dark">
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
      <Navbar sticky bgColor="bg-slate-900" className="surface-dark">
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

/**
 * Glass navbar floating over a hero section. `overlay` anchors it to the
 * viewport top without reserving layout space; `glass` gives the translucent
 * dark bg + backdrop-blur; the `surface-dark` className makes the text readable over the image.
 * The nav scrolls away with the page (unlike `sticky`, which stays pinned).
 */
export const OverlayGlass: Story = {
  render: () => (
    <div className="relative">
      <Navbar overlay glass className="surface-dark">
        <Navbar.Brand>
          <a href="/" className="text-lg tracking-tight no-underline">
            Eventuras
          </a>
        </Navbar.Brand>
        <Navbar.Content className="justify-end">
          <a href="/login" className="hover:underline">
            Log in
          </a>
        </Navbar.Content>
      </Navbar>
      <section className="flex min-h-[60vh] items-center justify-center bg-linear-to-br from-slate-700 via-slate-900 to-black">
        <h1 className="text-4xl text-white">Hero with a glass navbar on top</h1>
      </section>
    </div>
  ),
};

