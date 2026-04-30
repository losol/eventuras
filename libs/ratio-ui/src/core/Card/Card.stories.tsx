

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
    variant: {
      control: 'select',
      options: ['default', 'wide', 'outline', 'transparent', 'tile'],
    },
    gap: {
      control: 'select',
      options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'],
    },
    hoverEffect: { control: 'boolean' },
    color: {
      control: 'select',
      options: [undefined, 'neutral', 'primary', 'secondary', 'accent', 'success', 'warning', 'error', 'info'],
    },
    backgroundImageUrl: { control: 'text' },
    padding: { control: 'select', options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'] },
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

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: (
      <Box>
        <Heading as="h3" marginBottom="xs">Outline Card</Heading>
        <p>This card uses the outline variant with a border.</p>
      </Box>
    ),
  },
};

/**
 * Editorial tile — quieter border, roomier padding (`p-6`), modern
 * surface tokens. Pair with a `Heading` + paragraph for feature-card
 * grids; pair with `ValueTile` for stat blocks that need a surface.
 */
export const Tile: Story = {
  args: {
    variant: 'tile',
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
    variant: 'transparent',
    children: (
      <Box>
        <Heading as="h3" marginBottom="xs">Transparent Card</Heading>
        <p>This card has no background or border, just structure and padding.</p>
      </Box>
    ),
  },
};

export const Wide: Story = {
  args: {
    variant: 'wide',
    children: (
      <Box>
        <Heading as="h3" marginBottom="xs">Wide Card</Heading>
        <p>This card uses the wide variant with minimum height.</p>
      </Box>
    ),
  },
};

export const WithHoverEffect: Story = {
  args: {
    hoverEffect: true,
    children: (
      <Box>
        <Heading as="h3" marginBottom="xs">Hover Me!</Heading>
        <p>This card has a hover effect. Try hovering over it.</p>
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
    variant: 'outline',
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
    variant: 'outline',
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
