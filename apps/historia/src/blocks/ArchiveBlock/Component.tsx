import type { ArchiveBlock as ArchiveBlockProps, Article } from '@/payload-types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import RichText from '@/components/RichText'

import { CollectionArchive } from '@/components/CollectionArchive'

export const ArchiveBlock: React.FC<
  ArchiveBlockProps & {
    id?: string
  }
> = async (props) => {
  const { id, introContent, limit: limitFromProps, populateBy, selectedDocs, topics } = props

  const limit = limitFromProps || 3

  let articles: Article[] = []

  if (populateBy === 'collection') {
    const payload = await getPayload({ config: configPromise })

    const flattenedTopics = topics?.map((topic) => {
      if (typeof topic === 'object') return topic.id
      else return topic
    })

    const fetchedArticles = await payload.find({
      collection: 'articles',
      depth: 1,
      limit,
      ...(flattenedTopics && flattenedTopics.length > 0
        ? {
            where: {
              topics: {
                in: flattenedTopics,
              },
            },
          }
        : {}),
    })

    articles = fetchedArticles.docs
  } else {
    if (selectedDocs?.length) {
      const filteredSelectedArticles = selectedDocs.map((article) => {
        if (typeof article.value === 'object') return article.value
      }) as Article[]

      articles = filteredSelectedArticles
    }
  }

  return (
    <div className="my-16" id={`block-${id}`}>
      {introContent && (
        <div className="container mb-16">
          <RichText className="ml-0 max-w-[48rem]" data={introContent} enableGutter={false} />
        </div>
      )}
      <CollectionArchive articles={articles} />
    </div>
  )
}
