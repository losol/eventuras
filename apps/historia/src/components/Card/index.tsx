'use client'
import { cn } from '@/utilities/cn'
import useClickableCard from '@/utilities/useClickableCard'
import Link from 'next/link'
import React, { Fragment } from 'react'

import type { Article, Page, Project, Note } from '@/payload-types'

import { Media } from '@/components/Media'

export type CardDoc =
  | Pick<Article, 'slug' | 'topics' | 'title' | 'lead' | 'image'>
  | Pick<Page, 'slug' | 'title' | 'lead' | 'image'>
  | Pick<Project, 'slug' | 'title' | 'lead' | 'image'>
  | Pick<Note, 'slug' | 'topics' | 'title' | 'image'>

export const Card: React.FC<{
  alignItems?: 'center'
  className?: string
  doc?: CardDoc
  relationTo?: 'articles' | 'pages' | 'projects' | 'notes'
  showTopics?: boolean
  title?: string
}> = (props) => {
  const { card, link } = useClickableCard({})
  const { className, doc, relationTo, showTopics, title: titleFromProps } = props

  const { slug, title } = doc || {};
  const topics = 'topics' in (doc ?? {}) ? doc.topics : undefined;
  const lead = 'lead' in (doc ?? {}) ? doc.lead : undefined;
  const image = 'image' in (doc ?? {}) ? doc.image : undefined;

  const hasTopics = topics && Array.isArray(topics) && topics.length > 0
  const titleToUse = titleFromProps || title
  const sanitizedDescription = lead?.replace(/\s/g, ' '); // replace non-breaking space with white space
  const href = `${relationTo}/${slug}`

  return (
    <article
      className={cn(
        'border border-border rounded-lg overflow-hidden bg-card hover:cursor-pointer',
        className,
      )}
      ref={card.ref}
    >
      <div className="relative w-full ">
        {image && typeof image !== 'string' && <Media resource={image.media!} size="33vw" />}
      </div>
      <div className="p-4">
        {showTopics && hasTopics && (
          <div className="uppercase text-sm mb-4">
            {showTopics && hasTopics && (
              <div>
                {topics?.map((topic, index) => {
                  if (typeof topic === 'object') {
                    const { title: titleFromTopic } = topic

                    const topicTitle = titleFromTopic || 'Untitled topic'

                    const isLast = index === topics.length - 1

                    return (
                      <Fragment key={index}>
                        {topicTitle}
                        {!isLast && <Fragment>, &nbsp;</Fragment>}
                      </Fragment>
                    )
                  }

                  return null
                })}
              </div>
            )}
          </div>
        )}
        {titleToUse && (
          <div className="prose">
            <h3>
              <Link className="not-prose" href={href} ref={link.ref}>
                {titleToUse}
              </Link>
            </h3>
          </div>
        )}
        {lead && <div className="mt-2">{lead && <p>{sanitizedDescription}</p>}</div>}
      </div>
    </article>
  )
}
