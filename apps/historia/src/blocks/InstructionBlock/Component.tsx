import React from 'react';

import RichText from '@/components/RichText';
import type { InstructionBlock as InstructionBlockType, Media } from '@/payload-types';

export const InstructionBlock: React.FC<InstructionBlockType> = ({ title, image, content }) => {
  const media = image?.media;
  const hasMedia = media && typeof media === 'object';
  const mediaData = hasMedia ? (media as Media) : null;
  const hasRichTextCaption = image?.caption && typeof image.caption === 'object';

  return (
    <div className="instruction-block">
      <h4 className="instruction-title">{title}</h4>
      {mediaData?.url && (
        <figure>
          <img src={mediaData.url} alt={mediaData.title || title} />
          {hasRichTextCaption && image?.caption && (
            <figcaption>
              <RichText data={image.caption} />
            </figcaption>
          )}
        </figure>
      )}
      {content && (
        <div className="instruction-content">
          <RichText data={content} />
        </div>
      )}
    </div>
  );
};
