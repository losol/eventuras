

import React from 'react';
import { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from './Card';
import { Image } from '../Image';
import { Box } from '../../layout/Box';
import { Heading } from '../Heading';

const meta: Meta<typeof Card> = {
  title: 'Core/Card',
  component: Card,
  tags: ['autodocs'],
  argTypes: {
    transparent: { control: 'boolean' },
    border: { control: 'select', options: [false, true, 'default', 'strong', 'subtle', 'none'] },
    radius: { control: 'select', options: ['none', 'sm', 'md', 'lg', 'xl', 'full'] },
    shadow: { control: 'select', options: ['none', 'xs', 'sm', 'md'] },
    padding: { control: 'select', options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'] },
    gap: { control: 'select', options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'] },
    hoverEffect: { control: 'boolean' },
    color: {
      control: 'select',
      options: [undefined, 'neutral', 'primary', 'secondary', 'accent', 'success', 'warning', 'error', 'info'],
    },
    backgroundImageUrl: { control: 'text' },
    margin: { control: 'select', options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'] },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    children: (
      <Box>
        <Heading as="h3">Default Card</Heading>
        <p>This is a default card with some content.</p>
      </Box>
    ),
  },
};

/**
 * Transparent fill with an outline — replaces the old `outline` variant.
 * Compose via `variant="transparent" border`.
 */
export const Outline: Story = {
  args: {
    transparent: true,
    border: true,
    children: (
      <Box>
        <Heading as="h3" marginBottom="xs">Outline Card</Heading>
        <p>This card uses `transparent border`.</p>
      </Box>
    ),
  },
};

/**
 * Editorial tile composition — flat (no shadow), roomier padding,
 * tighter radius. Compose via `padding="lg" radius="lg" shadow="none"`.
 * Pair with a `Heading` + paragraph for feature-card grids; pair with
 * `ValueTile` for stat blocks that need a surface.
 */
export const Tile: Story = {
  args: {
    padding: 'lg',
    radius: 'lg',
    shadow: 'none',
    children: (
      <Box>
        <Heading as="h4" marginBottom="xs">Tokens</Heading>
        <p className="text-sm text-(--text-muted)">
          Color scales, typography, spacing, borders — all theme-aware via CSS variables.
        </p>
      </Box>
    ),
  },
};

export const Transparent: Story = {
  args: {
    transparent: true,
    children: (
      <Box>
        <Heading as="h3" marginBottom="xs">Transparent Card</Heading>
        <p>This card has no background or border, just structure and padding.</p>
      </Box>
    ),
  },
};

/**
 * `hoverEffect` adds the canonical interactive treatment — surface
 * lifts to `--card-hover`, border picks up `--primary`, the card
 * translates 1px upward and gains a soft Linseed-tinted glow. Reserve
 * for cards that act as clickable surfaces.
 */
export const WithHoverEffect: Story = {
  args: {
    hoverEffect: true,
    children: (
      <Box>
        <Heading as="h3" marginBottom="xs">Hover me</Heading>
        <p>Surface lifts, border glows, card nudges upward.</p>
      </Box>
    ),
  },
};

/**
 * Tile composition + `hoverEffect` — the editorial hover for grid
 * tiles. The smaller `--shadow-card-hover-tile` glow kicks in when no
 * base shadow is present.
 */
export const TileWithHover: Story = {
  args: {
    padding: 'lg',
    radius: 'lg',
    shadow: 'none',
    hoverEffect: true,
    children: (
      <Box>
        <Heading as="h4" marginBottom="xs">Editorial tile</Heading>
        <p className="text-sm text-(--text-muted)">Quiet by default, comes alive on hover.</p>
      </Box>
    ),
  },
};

export const GridWithImage: Story = {
  args: {
    className: 'grid grid-cols-1 md:grid-cols-2',
    children: (
      <>
        <Image
          src="https://picsum.photos/600/400"
          alt="Sample image"
          imgClassName="w-full h-auto object-cover rounded-lg"
        />
        <Box>
          <Heading as="h3" marginBottom="xs">Grid Layout</Heading>
          <p>This card uses grid layout with an image and content side by side on desktop.</p>
          <p className="mt-2 text-sm text-gray-600">The grid collapses to a single column on mobile.</p>
        </Box>
      </>
    ),
  },
};

export const GridOutline: Story = {
  args: {
    transparent: true,
    border: true,
    className: 'grid grid-cols-1 md:grid-cols-2',
    children: (
      <>
        <Image
          src="https://picsum.photos/600/400?random=1"
          alt="Product image"
          imgClassName="w-full h-auto object-cover rounded-lg"
        />
        <Box>
          <Heading as="h3" marginBottom="xs">Product Card</Heading>
          <p>Outline variant with grid layout.</p>
          <p className="mt-4 text-sm text-gray-600">Perfect for product listings.</p>
        </Box>
      </>
    ),
  },
};

export const GridWithLargeGap: Story = {
  args: {
    className: 'grid grid-cols-1 md:grid-cols-2',
    gap: 'lg',
    children: (
      <>
        <Image
          src="https://picsum.photos/600/400?random=2"
          alt="Hero image"
          imgClassName="w-full h-auto object-cover rounded-lg"
        />
        <Box padding="xl">
          <Heading as="h2" marginBottom="sm">Large Gap</Heading>
          <p>This grid uses a large gap between columns.</p>
          <p className="mt-2 text-sm text-gray-600">gap="lg" provides more breathing room.</p>
        </Box>
      </>
    ),
  },
};

export const GridWithSmallGap: Story = {
  args: {
    className: 'grid grid-cols-1 md:grid-cols-2',
    gap: 'sm',
    transparent: true,
    border: true,
    children: (
      <>
        <Image
          src="https://picsum.photos/600/400?random=3"
          alt="Compact layout"
          imgClassName="w-full h-auto object-cover rounded-lg"
        />
        <Box>
          <Heading as="h3" marginBottom="xs">Small Gap</Heading>
          <p>This grid uses a small gap for a more compact layout.</p>
        </Box>
      </>
    ),
  },
};

export const Dark: Story = {
  args: {
    className: 'bg-neutral-900 text-white',
    children: (
      <Box>
        <Heading as="h3" marginBottom="xs">Dark Card</Heading>
        <p>This is a dark card with white text.</p>
      </Box>
    ),
  },
};

export const WithCustomSpacing: Story = {
  args: {
    padding: 'xl',
    children: (
      <Box>
        <Heading as="h3" marginBottom="xs">Custom Spacing</Heading>
        <p>This card uses extra-large padding.</p>
      </Box>
    ),
  },
};

export const WithBackgroundImage: Story = {
  args: {
    backgroundImageUrl: 'https://picsum.photos/800/400?random=4',
    children: (
      <Box className="text-white">
        <Heading as="h2" marginBottom="xs">Background Image</Heading>
        <p>Card with a background image.</p>
      </Box>
    ),
  },
};

export const CustomPaddingAndMargin: Story = {
  args: {
    padding: 'lg',
    margin: 'sm',
    children: (
      <Box>
        <Heading as="h3" marginBottom="xs">Custom Spacing</Heading>
        <p>Card with custom padding and margin.</p>
      </Box>
    ),
  },
};
