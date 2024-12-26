'use client'

import { useHeaderTheme } from '@/providers/HeaderTheme'
import React, { useEffect } from 'react'

import { Media } from '@/components/Media'
import { Contributor } from '@/payload-types';
import { Contributors } from '@/components/Contributors';

interface HeroProps {
  title?: string | null
  lead?: string | null
  image?: {
    media?: {
      sizes?: {
        standard?: {
          url: string;
        };
      };
    };
    caption?: string | null;
  } | null;
  contributors?: Contributor[]
  publishedAt?: string | null
  topics?: { title?: string }[]
}

export const Hero: React.FC<HeroProps> = ({
  title,
  lead,
  image,
  contributors,
  publishedAt,
  topics,
}) => {
  const { setHeaderTheme } = useHeaderTheme()

  useEffect(() => {
    setHeaderTheme('dark')
  }, [setHeaderTheme])

  const standardImageUrl = image?.media?.sizes?.standard?.url;
  const caption = image?.caption;

  return (
    <section className='container'>
      {title && <h1 className="text-4xl md:text-5xl font-bold mb-4">{title}</h1>}
      {lead && <p className="text-lg mb-6">{lead}</p>}

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

      {contributors && <Contributors contributors={contributors} />}
      {publishedAt && (
        <p className="mt-2 text-sm">Published: {new Date(publishedAt).toLocaleDateString()}</p>
      )}
    </section>
  )
}
