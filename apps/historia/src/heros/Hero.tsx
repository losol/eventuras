'use client';

import React, { useEffect } from 'react';

import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Box } from '@eventuras/ratio-ui/layout/Box';
import { Section } from '@eventuras/ratio-ui/layout/Section';
import { Image as UIImage } from '@eventuras/ratio-ui-next/Image';

import { Contributors as ContributersComponent } from '@/components/Contributors';
import RichText from '@/components/RichText';
import { Contributors, Image } from '@/payload-types';
import { useHeaderTheme } from '@/providers/HeaderTheme';
import { getImageProps } from '@/utilities/image';

interface HeroProps {
  title?: string | null;
  lead?: string | null;
  image?: Image | null;
  contributors?: Contributors;
  publishedAt?: string | null;
  topics?: { title?: string; }[];
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

  const imageProps = getImageProps(image, 'landscape');

  return (
    <Section gap="lg" className={imageProps.url ? 'grid grid-cols-1 md:grid-cols-2' : undefined}>
      {imageProps.url && (
        <Box>
          <UIImage
            src={imageProps.url}
            alt={imageProps.alt || title || ''}
            width={imageProps.width}
            height={imageProps.height}
            loading="eager"
          />
          {imageProps.caption && (
            <RichText data={imageProps.caption} className="text-xs mt-1 text-gray-300 mb-4" />
          )}
        </Box>
      )}

      <Box className="flex flex-col justify-between">
        {title && <Heading as="h1">{title}</Heading>}
        {lead && <p className="text-lg mb-6 lead">{lead}</p>}

        {contributors && <ContributersComponent contributors={contributors} />}
        {publishedAt && (
          <p className="mt-2 text-sm">Published: {new Date(publishedAt).toLocaleDateString()}</p>
        )}
      </Box>
    </Section>
  );
};
