import NextImage from 'next/image';

import {
  Image as RatioImage,
  type ImageProps as RatioImageProps,
  type ImageRendererProps,
} from '../../core/Image';

export type { ImageProps } from '../../core/Image';

const NextImageRenderer = (p: ImageRendererProps) => {
  // Ensure alt is defined for NextImage
  const { alt = '', ...rest } = p;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <NextImage alt={alt} {...(rest as any)} />;
};

export const Image = (props: RatioImageProps) => {
  const imgClassName = props.imgClassName ?? 'h-auto max-w-full';

  return <RatioImage {...props} renderer={NextImageRenderer} imgClassName={imgClassName} />;
};

