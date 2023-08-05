import { default as NextImage } from 'next/image';

export type ImageProps = {
  src: string;
  alt?: string;
  caption?: string | null | undefined;
  className?: string;
  width?: number;
  height?: number;
};

const Image = (props: ImageProps) => {
  return (
    <figure className="max-w-lg py-8">
      <NextImage
        className={props.className ?? 'h-auto max-w-full rounded-lg'}
        src={props.src}
        alt={props.alt ?? ''}
        width={props.width}
        height={props.height}
      />
      {props.caption && (
        <figcaption className="mt-2 text-sm text-center text-gray-500 dark:text-gray-400">
          <p>{props.caption}</p>
        </figcaption>
      )}
    </figure>
  );
};

export default Image;
