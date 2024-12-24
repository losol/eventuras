'use client'

import { useHeaderTheme } from '@/providers/HeaderTheme'
import React, { useEffect } from 'react'

import { Media } from '@/components/Media'
import { Contributor } from '@/payload-types';
import { Contributors } from '@/components/Contributors';

interface HeroProps {
  title?: string
  lead?: string
  image?: string | object
  contributors?: Contributor[]
  publishedAt?: string
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

  return (
    <section className='container'>
      {title && <h1 className="text-4xl md:text-5xl font-bold mb-4">{title}</h1>}
      {lead && <p className="text-lg mb-6">{lead}</p>}

      {image && typeof image === 'object' && (
          <Media priority imgClassName="-z-10" resource={image} />
        )}

        {contributors && <Contributors contributors={contributors} />}
        {publishedAt && (
          <p className="mt-2 text-sm">Published: {new Date(publishedAt).toLocaleDateString()}</p>
        )}
    </section>
  )
}
