import React, { ComponentType } from 'react';

import { Card } from '../../core/Card';
import { Image, ImageRendererProps } from '../../core/Image';

export interface ImageCardProps {
  /**
   * Gap between image and content columns
   */
  gap?: 'sm' | 'md' | 'lg';
  /**
   * Card padding
   */
  padding?: string;
  /**
   * Custom className for the grid container
   */
  className?: string;
  /**
   * Image URL (if using built-in image rendering)
   */
  imageSrc?: string;
  /**
   * Image alt text
   */
  imageAlt?: string;
  /**
   * Custom image renderer (e.g., Next.js Image)
   */
  imageRenderer?: ComponentType<ImageRendererProps>;
  /**
   * Custom image class name
   */
  imageClassName?: string;
  /**
   * Custom media element (overrides image props if provided)
   */
  media?: React.ReactNode;
  /**
   * The content element
   */
  children: React.ReactNode;
}

const gapClasses = {
  sm: 'gap-4',
  md: 'gap-6',
  lg: 'gap-8',
};

/**
 * ImageCard - A card with optional image and content in a responsive grid
 *
 * Displays a single column on mobile, and two columns on md+ screens when an image is present.
 * Perfect for product cards, feature cards, etc.
 *
 * @example
 * ```tsx
 * // Using built-in image rendering with Next.js Image
 * import NextImage from 'next/image';
 *
 * <ImageCard
 *   imageSrc={imageUrl}
 *   imageAlt="Product"
 *   imageRenderer={NextImage}
 * >
 *   <div>
 *     <h3>Product Title</h3>
 *     <p>Product description</p>
 *   </div>
 * </ImageCard>
 *
 * // Or with custom media
 * <ImageCard media={<img src={imageUrl} alt="Product" />}>
 *   <div>Content</div>
 * </ImageCard>
 *
 * // Without image
 * <ImageCard>
 *   <div>Content only</div>
 * </ImageCard>
 * ```
 */
export const ImageCard: React.FC<ImageCardProps> = ({
  gap = 'md',
  padding = 'p-6',
  className = '',
  imageSrc,
  imageAlt = '',
  imageRenderer,
  imageClassName = 'w-full h-auto object-cover rounded-lg',
  media,
  children,
}) => {
  const gapClass = gapClasses[gap];

  // Determine what to render in the media slot
  let mediaContent: React.ReactNode = null;

  if (media) {
    // Custom media provided - use it directly
    mediaContent = media;
  } else if (imageSrc) {
    // Use built-in Image component
    mediaContent = (
      <Image
        src={imageSrc}
        alt={imageAlt}
        imgClassName={imageClassName}
        renderer={imageRenderer}
        rendererProps={
          imageRenderer
            ? {
                width: 600,
                height: 600,
                sizes: '(max-width: 768px) 100vw, 50vw',
              }
            : undefined
        }
      />
    );
  }

  const hasImage = !!mediaContent;
  const gridCols = hasImage ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1';

  return (
    <Card padding={padding}>
      <div className={`grid ${gridCols} ${gapClass} ${className}`}>
        {hasImage && <div className="w-full">{mediaContent}</div>}
        <div className="flex flex-col justify-between">{children}</div>
      </div>
    </Card>
  );
};
