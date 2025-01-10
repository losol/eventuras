import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import PageClient from './page.client'

export default async function Page() {
  const payload = await getPayload({ config: configPromise })

  const notes = await payload.find({
    collection: 'notes',
    depth: 1,
    limit: 20,
    overrideAccess: false,
    select: {
      title: true,
      slug: true,
    },
  })

  return (
    <div className="pt-24 pb-24">
      <PageClient />
      <div className="container mb-16">
        <div className="prose dark:prose-invert max-w-none">
          <h1>Notes</h1>
        </div>
      </div>

      <CollectionArchive docs={notes.docs} relationTo='notes' />

      <div className="container">
        {notes.totalPages > 1 && notes.page && (
          <Pagination page={notes.page} totalPages={notes.totalPages} />
        )}
      </div>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: `Historia Notes`,
  }
}
