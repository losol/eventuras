import type { Meta, StoryObj } from '@storybook/react';
import { Blockquote } from './Blockquote';

const meta = {
  title: 'Core/Blockquote',
  component: Blockquote,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Blockquote>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'The only way to do great work is to love what you do.',
  },
};

export const WithCite: Story = {
  args: {
    children: 'The only way to do great work is to love what you do.',
    cite: 'https://en.wikipedia.org/wiki/Steve_Jobs',
  },
};

export const LongQuote: Story = {
  args: {
    children:
      'In a world where technology shapes our daily lives, it is essential to remember that behind every innovation lies human creativity, collaboration, and the collective pursuit of progress. We build not just for ourselves, but for the communities we serve.',
  },
};

export const WithAttribution: Story = {
  args: {
    children: (
      <>
        The future belongs to those who believe in the beauty of their dreams.
        <footer className="mt-2 text-sm font-normal not-italic opacity-75">
          — Eleanor Roosevelt
        </footer>
      </>
    ),
  },
};

export const CustomClassName: Story = {
  args: {
    children: 'A custom styled blockquote',
    className: 'text-center p-6',
  },
};
