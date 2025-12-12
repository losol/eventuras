import React from 'react';

import { Image } from '@eventuras/ratio-ui-next/Image';

import RichText from '@/components/RichText';
import type { ImageBlock as ImageBlockProps, Media } from '@/payload-types';

export const ImageBlock: React.FC<ImageBlockProps> = (props) => {
  const { media, caption } = props;

  if (!media || typeof media === 'string') {
    return null;
  }

  const mediaData = media as Media;

  if (!mediaData.url) {
    return null;
  }

  const hasRichTextCaption = caption && typeof caption === 'object';

  return (
    <figure className="my-8">
      <Image
        src={mediaData.url}
        alt={mediaData.title || ''}
        wrapperClassName="w-full"
        imgClassName="w-full h-auto rounded-lg object-cover"
        rendererProps={{
          width: mediaData.width || 1920,
          height: mediaData.height || 1080,
          sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px',
        }}
      />
      {hasRichTextCaption && (
        <figcaption className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          <RichText data={caption} enableGutter={false} />
        </figcaption>
      )}
    </figure>
  );
};
