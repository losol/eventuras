import React from 'react';

import {
  ImageCard as RatioImageCard,
  type ImageCardProps as RatioImageCardProps,
} from '@eventuras/ratio-ui/layout/ImageCard';
import { NextImageRenderer } from '../Image';

export type ImageCardProps = RatioImageCardProps;

/**
 * ImageCard for Next.js - automatically uses Next.js Image component
 *
 * @example
 * ```tsx
 * <ImageCard
 *   imageSrc={imageUrl}
 *   imageAlt="Product"
 * >
 *   <div>Content</div>
 * </ImageCard>
 * ```
 */
export const ImageCard: React.FC<ImageCardProps> = (props) => {
  return <RatioImageCard {...props} imageRenderer={NextImageRenderer} />;
};
