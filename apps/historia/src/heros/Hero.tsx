'use client';

import React, { useEffect } from 'react';

import { Heading } from '@eventuras/ratio-ui/core/Heading';

import { Contributors as ContributersComponent } from '@/components/Contributors';
import RichText from '@/components/RichText';
import { Contributors, Image } from '@/payload-types';
import { useHeaderTheme } from '@/providers/HeaderTheme';
import { getImageCaption, getImageUrl } from '@/utilities/image';

interface HeroProps {
  title?: string | null;
  lead?: string | null;
  image?: Image | null;
  contributors?: Contributors;
  publishedAt?: string | null;
  topics?: { title?: string }[];
}

export const Hero: React.FC<HeroProps> = ({
  title,
  lead,
  image,
  contributors,
  publishedAt,
}) => {
  const { setHeaderTheme } = useHeaderTheme();

  useEffect(() => {
    setHeaderTheme('dark');
  }, [setHeaderTheme]);

  const imageUrl = getImageUrl(image, 'standard');
  const caption = getImageCaption(image);
  const hasImage = !!imageUrl;

  return (
    <section>
      <div className={hasImage ? 'grid grid-cols-1 md:grid-cols-2 gap-8' : ''}>
        {hasImage && (
          <div className="w-full">
            <img
              src={imageUrl}
              alt={caption?.root.children.toString() || title || ''}
              className="w-full h-auto object-cover rounded-lg"
            />
            {caption && (
              <RichText data={caption} className="text-xs mt-1 text-gray-300 mb-4" />
            )}
          </div>
        )}

        <div className="flex flex-col justify-between">
          {title && <Heading as="h1">{title}</Heading>}
          {lead && <p className="text-lg mb-6 lead">{lead}</p>}

          {contributors && <ContributersComponent contributors={contributors} />}
          {publishedAt && (
            <p className="mt-2 text-sm">Published: {new Date(publishedAt).toLocaleDateString()}</p>
          )}
        </div>
      </div>
    </section>
  );
};
