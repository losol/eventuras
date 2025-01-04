'use client';

import { useHeaderTheme } from '@/providers/HeaderTheme';
import React, { useEffect } from 'react';

import { Contributors, Image } from '@/payload-types';
import { Contributors as ContributersComponent } from '@/components/Contributors';

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
  topics,
}) => {
  const { setHeaderTheme } = useHeaderTheme();

  useEffect(() => {
    setHeaderTheme('dark');
  }, [setHeaderTheme]);

const standardImageUrl =
  typeof image?.media === 'object' && image.media && 'sizes' in image.media
    ? image.media.sizes?.standard?.url
    : undefined;
  const caption = image?.caption;

  return (
    <section className="container hero">
      {title && <h1 className="text-4xl md:text-5xl font-bold mb-4">{title}</h1>}
      {lead && <p className="text-lg mb-6 lead">{lead}</p>}

      {standardImageUrl && (
        <div className="relative">
          <img
            src={standardImageUrl}
            alt={caption || title || 'Hero image'}
            className="-z-10 object-cover w-full h-auto"
          />
          {caption && (
            <p className="text-sm mt-2 text-gray-500 text-center italic">{caption}</p>
          )}
        </div>
      )}

      {contributors && <ContributersComponent contributors={contributors} />}
      {publishedAt && (
        <p className="mt-2 text-sm">Published: {new Date(publishedAt).toLocaleDateString()}</p>
      )}
    </section>
  );
};
