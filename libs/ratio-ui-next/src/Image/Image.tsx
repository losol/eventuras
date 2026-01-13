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

  // If `src` is an absolute URL, Next.js will use the image optimizer endpoint
  // (`/_next/image?url=...`) unless `unoptimized` is set.
  // In containerized deployments the optimizer allowlist is baked at build time,
  // so allowing arbitrary runtime domains requires skipping optimization.
  const src = (rest as { src?: unknown }).src;
  const shouldSkipOptimization =
    typeof src === 'string' && (src.startsWith('http://') || src.startsWith('https://'));


  return (
    <NextImage
      alt={alt}
      className={className}
      {...(rest as any)}
      unoptimized={(rest as any).unoptimized ?? shouldSkipOptimization}
    />
  );
};

export const Image = (props: RatioImageProps) => {
  const imgClassName = props.imgClassName ?? 'h-auto max-w-full rounded-lg';

  return <RatioImage {...props} renderer={NextImageRenderer} imgClassName={imgClassName} />;
};
