'use client'
import { cn } from '@/utilities/cn'
import useClickableCard from '@/utilities/useClickableCard'
import Link from 'next/link'
import React, { Fragment } from 'react'

import type { Article, Page, Project, Note, Happening, Person, Organization } from '@/payload-types'

import { Media } from '@/components/Media'

export const Card: React.FC<{
  className?: string
  doc?: Article | Happening | Page | Person | Organization | Project | Note
  relationTo?: 'articles' | 'happenings' | 'pages' | 'persons' | 'organizations' | 'projects' | 'notes'
  showTopics?: boolean
  title?: string
}> = (props) => {
  const { card, link } = useClickableCard({})
  const { className, doc, relationTo } = props

  const { slug } = doc || {}

  const href = `${relationTo}/${doc?.resourceId}/${slug}`

  return (
    <article
      className={cn(
        'border border-border rounded-lg overflow-hidden bg-card hover:cursor-pointer',
        className,
      )}
      ref={card.ref}
    >
      {doc?.image && typeof doc.image === 'object' &&
      <div className="relative w-full ">
        <Media resource={doc.image.media!} size="33vw" />
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
