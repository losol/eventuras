// Image.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Image, type ImageProps, type ImageRendererProps } from './Image';

// ✅ Basic meta
const meta: Meta<ImageProps> = {
  title: 'Core/Image',
  component: Image,
  args: {
    // Default demo image
    src: 'https://picsum.photos/seed/mountains/800/500',
    alt: 'Demo image',
  },
  argTypes: {
    as: { control: 'inline-radio', options: ['img', 'figure'] },
  },
};
export default meta;

type Story = StoryObj<ImageProps>;

// ————————————————————————————————————————————————————————————————
// Default <img> (no figure)
// ————————————————————————————————————————————————————————————————
export const DefaultImg: Story = {
  args: {
    imgClassName: 'h-auto max-w-full rounded-2xl shadow',
  },
};

// ————————————————————————————————————————————————————————————————
// Auto-figure when caption is present
// ————————————————————————————————————————————————————————————————
export const WithCaption: Story = {
  args: {
    caption: 'A calm view over the valley at dusk.',
    wrapperClassName: 'max-w-xl py-6',
    figCaptionClassName: 'mt-2 text-sm text-center text-gray-600',
    imgClassName: 'h-auto w-full rounded-xl',
  },
};

// ————————————————————————————————————————————————————————————————
// Force figure without caption
// ————————————————————————————————————————————————————————————————
export const ForceFigureNoCaption: Story = {
  args: {
    as: 'figure',
    wrapperClassName: 'max-w-lg py-8',
    imgClassName: 'h-auto w-full rounded-md ring-1 ring-black/10',
  },
};

// ————————————————————————————————————————————————————————————————
// Forward intrinsic width/height to renderer
// ————————————————————————————————————————————————————————————————
export const WithDimensions: Story = {
  args: {
    width: 640,
    height: 360,
    imgClassName: 'h-auto rounded-lg border',
  },
};

// ————————————————————————————————————————————————————————————————
// Responsive utility classes on wrapper + image
// ————————————————————————————————————————————————————————————————
export const ResponsiveClasses: Story = {
  args: {
    wrapperClassName: 'mx-auto max-w-[480px] sm:max-w-[640px] md:max-w-[768px] py-6',
    imgClassName: 'h-auto w-full rounded-2xl',
    caption: 'Responsive wrapper width (Tailwind utilities).',
  },
};

// ————————————————————————————————————————————————————————————————
// Custom renderer example (e.g. Next.js <Image/> shim)
// ————————————————————————————————————————————————————————————————
const MockNextImage = (p: ImageRendererProps) => {
  // Pretend to be next/image
  // (keeps the same prop surface as ImageRendererProps)
  return (
    // Use native img underneath for Storybook
    <img
      // Map through common props
      alt={p.alt as string}
      width={p.width as number | undefined}
      height={p.height as number | undefined}
      className={p.className as string | undefined}
      loading="eager"
      decoding="async"
      // Pass-through any extra props
      {...p}
    />
  );
};

export const WithCustomRenderer: Story = {
  args: {
    renderer: MockNextImage,
    rendererProps: { sizes: '(min-width: 768px) 640px, 100vw', priority: true },
    width: 800,
    height: 500,
    imgClassName: 'h-auto w-full rounded-xl',
    caption: 'Rendered with a custom renderer (Mock NextImage).',
  },
};
