

import React from 'react';
import { Meta, StoryObj } from '@storybook/react-vite';
import { Card, CardProps } from './Card';
import { Image } from '../Image';
import { Box } from '../../layout/Box';
import { Heading } from '../Heading';

const meta: Meta<typeof Card> = {
  title: 'Core/Card',
  component: Card,
  tags: ['autodocs'],
  argTypes: {
    dark: { control: 'boolean' },
    container: { control: 'boolean' },
    variant: {
      control: 'select',
      options: ['default', 'wide', 'outline', 'transparent'],
    },
    grid: { control: 'boolean' },
    gap: {
      control: 'select',
      options: ['4', '6', '8'],
    },
    hoverEffect: { control: 'boolean' },
    backgroundColorClass: { control: 'text' },
    backgroundImageUrl: { control: 'text' },
    padding: { control: 'text' },
    margin: { control: 'text' },
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
    grid: true,
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
    grid: true,
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
    grid: true,
    gap: '8',
    children: (
      <>
        <Image
          src="https://picsum.photos/600/400?random=2"
          alt="Hero image"
          imgClassName="w-full h-auto object-cover rounded-lg"
        />
        <Box padding="p-8">
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
    grid: true,
    gap: '4',
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
    dark: true,
    children: (
      <Box>
        <Heading as="h3" marginBottom="xs">Dark Card</Heading>
        <p>This is a dark card with white text.</p>
      </Box>
    ),
  },
};

export const WithContainer: Story = {
  args: {
    container: true,
    children: (
      <Box>
        <Heading as="h3" marginBottom="xs">With Container</Heading>
        <p>This card wraps its children in a Container component.</p>
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
    padding: '8',
    margin: '4',
    children: (
      <Box>
        <Heading as="h3" marginBottom="xs">Custom Spacing</Heading>
        <p>Card with custom padding and margin.</p>
      </Box>
    ),
  },
};
