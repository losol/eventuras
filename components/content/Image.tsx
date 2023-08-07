import { default as NextImage } from 'next/image';

import { Text } from '@/components/content';
import { cn } from '@/lib/utils';

export type ImageProps = {
  src: string;
  alt?: string;
  caption?: string | null | undefined;
  imgClassName?: string;
  figureClassName?: string;
  figCaptionClassName?: string;
  width?: number;
  height?: number;
};

const Image = (props: ImageProps) => {
  return (
    <figure className={cn(props.figureClassName ?? 'max-w-lg py-8')}>
      <NextImage
        className={cn(props.imgClassName ?? 'h-auto max-w-full')}
        src={props.src}
        alt={props.alt ?? ''}
        width={props.width}
        height={props.height}
      />
      {props.caption && (
        <figcaption
          className={cn(
            props.figCaptionClassName ?? 'mt-2 text-center text-sm text-gray-500 dark:text-gray-400'
          )}
        >
          <Text>{props.caption}</Text>
        </figcaption>
      )}
    </figure>
  );
};

export default Image;
