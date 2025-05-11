'use client'
import { cn } from '@/utilities/cn'
import useClickableCard from '@/utilities/useClickableCard'
import Link from 'next/link'
import React from 'react'

import type { Article, Page, Project, Note, Happening, Person, Organization } from '@/payload-types'

import { Media } from '@/components/Media'
import { usePathname } from "next/navigation";
import { getDocUrl } from '@/app/(frontend)/[locale]/c/[collection]/pageCollections';

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
    <article
      className={cn(
        'border border-border rounded-lg overflow-hidden bg-card hover:cursor-pointer',
        className,
      )}
      ref={card.ref}
    >
      {showImages && doc?.image && typeof doc.image === 'object' && doc.image.media &&
      <div className="relative w-full ">
        <Media resource={doc.image.media} size="33vw" />
      </div>
      }

      <div className="p-4">

          <div className="prose">
            <h3>
              <Link className="not-prose" href={href} ref={link.ref}>
                {'title' in doc! ? doc.title : doc?.name}
              </Link>
            </h3>
          </div>

        {doc && 'lead' in doc && doc.lead && <div className="mt-2">{doc.lead}</div>}
      </div>
    </article>
  )
}
