import NextImage from 'next/image';

// Import core Image component from ratio-ui
import {
  Image as RatioImage,
  type ImageProps as RatioImageProps,
  type ImageRendererProps,
} from '@eventuras/ratio-ui/core/Image';

export type { ImageProps } from '@eventuras/ratio-ui/core/Image';

export const NextImageRenderer = (p: ImageRendererProps) => {
  // Ensure alt is defined for NextImage
  const { alt = '', className, ...rest } = p;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <NextImage alt={alt} className={className} {...(rest as any)} />;
};

export const Image = (props: RatioImageProps) => {
  const imgClassName = props.imgClassName ?? 'h-auto max-w-full rounded-lg';

  return <RatioImage {...props} renderer={NextImageRenderer} imgClassName={imgClassName} />;
};
