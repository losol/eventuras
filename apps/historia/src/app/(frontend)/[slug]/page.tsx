import type { Metadata } from 'next'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'

import type { Page as PageType } from '@/payload-types'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { Hero } from '@/heros/Hero'
import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { Topics } from '@/components/Topics';

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const pages = await payload.find({
    collection: 'pages',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  const params = pages.docs.map(({ slug }) => ({ slug }))
  return params
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = 'home' } = await paramsPromise

  const page = await queryPageBySlug({ slug })

  if (!page && slug === 'home') {
    return (
      <article className="pt-16 pb-24">
        <div className="text-center">
          <h1>No Home Page Found</h1>
          <p>Please create a home page in the CMS.</p>
        </div>
      </article>
    )
  }

  if (!page) {
    return (
      <article className="pt-16 pb-24">
        <div className="text-center">
          <h1>Page Not Found</h1>
        </div>
      </article>
    )
  }


  const { title, lead, story, topics } = page
  const heroImage = page.featuredImage?.image?.sizes?.standard;

  return (
    <article className="pt-16 pb-24">
      <PageClient />
      {draft && <LivePreviewListener />}
      <Hero title={title} lead={lead} image={heroImage} contributors={page.contributors} publishedAt={page.publishedAt} />
      <RenderBlocks blocks={story} />
      <Topics topics={topics} />
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }): Promise<Metadata> {
  const { slug = 'home' } = await paramsPromise
  const page = await queryPageBySlug({ slug })

  return generateMeta({ doc: page })
}

const queryPageBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'pages',
    draft,
    limit: 1,
    pagination: false,
    overrideAccess: draft,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})
