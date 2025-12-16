'use client'
import React from 'react'
import Link from 'next/link'
import { usePathname } from "next/navigation";

import { Card as RatioCard } from '@eventuras/ratio-ui/core/Card';

import { getDocUrl } from '@/app/(frontend)/[locale]/c/[collection]/pageCollections';
import { Media } from '@/components/Media'
import type { Article, Happening, Note, Organization, Page, Person, Project } from '@/payload-types'
import { cn } from '@/utilities/cn'
import useClickableCard from '@/utilities/useClickableCard'

export const Card: React.FC<{
  className?: string
  doc?: Article | Happening | Page | Person | Organization | Project | Note
  relationTo?: 'articles' | 'happenings' | 'pages' | 'persons' | 'projects' | 'notes'
  showTopics?: boolean
  showImages?: boolean
  title?: string
}> = (props) => {
  const { card, link } = useClickableCard({})
  const { className, doc, relationTo, showImages = true } = props

  // the first part of the pathname is the locale
  const locale = usePathname().split('/')[1]

  if (!doc || !doc?.slug) {
    return null
  }

  const href = getDocUrl({
    locale,
    collection: relationTo!,
    resourceId: doc?.resourceId,
    slug: doc?.slug,
  });

  return (
    <RatioCard
      as="article"
      hoverEffect
      className={cn(
        'border border-border overflow-hidden cursor-pointer h-full flex flex-col',
        className,
      )}
      padding="p-0"
    >
      <div ref={card.ref as React.RefObject<HTMLDivElement>} className="h-full flex flex-col">
        {showImages && doc?.image && typeof doc.image === 'object' && doc.image.media &&
        <div className="relative w-full">
          <Media resource={doc.image.media} size="33vw" />
        </div>
        }

        <div className="p-4 flex-1">
          <div className="prose">
            <h3>
              <Link className="not-prose" href={href} ref={link.ref}>
                {'title' in doc! ? doc.title : doc?.name}
              </Link>
            </h3>
          </div>

          {doc && 'lead' in doc && doc.lead && <div className="mt-2">{doc.lead}</div>}
        </div>
      </div>
    </RatioCard>
  )
}
