'use client'
import { cn } from '@/utilities/cn'
import useClickableCard from '@/utilities/useClickableCard'
import Link from 'next/link'
import React, { Fragment } from 'react'

import type { Article } from '@/payload-types'

import { Media } from '@/components/Media'

export type CardArticleData = Pick<Article, 'slug' | 'topics' | 'meta' | 'title'>

export const Card: React.FC<{
  alignItems?: 'center'
  className?: string
  doc?: CardArticleData
  relationTo?: 'articles'
  showTopics?: boolean
  title?: string
}> = (props) => {
  const { card, link } = useClickableCard({})
  const { className, doc, relationTo, showTopics, title: titleFromProps } = props

  const { slug, topics, meta, title } = doc || {}
  const { description, image: metaImage } = meta || {}

  const hasTopics = topics && Array.isArray(topics) && topics.length > 0
  const titleToUse = titleFromProps || title
  const sanitizedDescription = description?.replace(/\s/g, ' ') // replace non-breaking space with white space
  const href = `/${relationTo}/${slug}`

  return (
    <article
      className={cn(
        'border border-border rounded-lg overflow-hidden bg-card hover:cursor-pointer',
        className,
      )}
      ref={card.ref}
    >
      <div className="relative w-full ">
        {!metaImage && <div className="">No image</div>}
        {metaImage && typeof metaImage !== 'string' && <Media resource={metaImage} size="33vw" />}
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
        {description && <div className="mt-2">{description && <p>{sanitizedDescription}</p>}</div>}
      </div>
    </article>
  )
}
