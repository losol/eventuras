import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar } from './Avatar';

const meta: Meta<typeof Avatar> = {
  title: 'Core/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const Initials: Story = {
  args: {
    name: 'Leo Losen',
    size: 'md',
  },
};

export const SingleWordName: Story = {
  args: {
    name: 'Ola',
    size: 'md',
  },
};

export const ManualInitials: Story = {
  args: {
    name: 'Leo van der Losen',
    initials: 'lv',
    size: 'md',
  },
};

export const WithImage: Story = {
  args: {
    name: 'Ada Lovelace',
    src: 'https://i.pravatar.cc/100?img=1',
    size: 'md',
  },
};

/**
 * Documents what a 404 image looks like with the current implementation:
 * the browser paints its default broken-image indicator inside the
 * `<img>` box. The component does not silently fall back to the
 * initials on load failure — pass URLs you've already verified, or
 * skip `src` entirely.
 */
export const BrokenImageDoesNotSilentlyFallBack: Story = {
  args: {
    name: 'Leo Losen',
    src: 'https://example.invalid/this-will-404.jpg',
    size: 'md',
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      <div className="flex flex-col items-center gap-1">
        <Avatar name="Leo Losen" size="sm" />
        <span className="text-xs text-(--text-muted)">sm — 30px</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <Avatar name="Leo Losen" size="md" />
        <span className="text-xs text-(--text-muted)">md — 40px</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <Avatar name="Leo Losen" size="lg" />
        <span className="text-xs text-(--text-muted)">lg — 44px</span>
      </div>
    </div>
  ),
};

export const InsideMenuTrigger: Story = {
  render: () => (
    <button
      type="button"
      className="inline-flex items-center gap-2.5 pl-1 pr-4 py-1 rounded-full border border-border-2 bg-card text-(--text) hover:border-(--primary) transition-colors"
    >
      <Avatar name="Leo Losen" size="sm" />
      <span className="text-sm">leo@losen.com</span>
    </button>
  ),
};
