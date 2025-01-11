import type { Metadata } from 'next';
import { PayloadRedirects } from '@/components/PayloadRedirects';
import configPromise from '@payload-config';
import { getPayload } from 'payload';
import { draftMode } from 'next/headers';
import React, { cache } from 'react';

import { pageCollections, PageCollectionsType } from '../../page';
import { Hero } from '@/heros/Hero';
import { generateMeta } from '@/utilities/generateMeta';
import PageClient from './page.client';
import { LivePreviewListener } from '@/components/LivePreviewListener';
import { RenderBlocks } from '@/blocks/RenderBlocks';

// Generate static params for all valid collections
export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise });

  const locales = process.env.CMS_LOCALES?.split(',') || ['en']; // Default to 'en' if not set
  const params: { locale: string; collection: string; resourceId: string; slug: string }[] = [];

  for (const locale of locales) {
    for (const collection of pageCollections) {
      const docs = await payload.find({
        collection,
        draft: false,
        limit: 1000,
        overrideAccess: false,
        pagination: false,
        select: {
          slug: true,
          resourceId: true,
        },
      });

      docs.docs.forEach(({ slug, resourceId }) => {
        console.log(`Generating static params for ${locale}/${collection}/${resourceId}/${slug}`);
        params.push({
          locale,
          collection,
          resourceId,
          slug,
        });
      });
    }
  }

  return params;
}

type Args = {
  params: {
    locale: string;
    collection: string;
    resourceId: string;
    slug: string;
  };
};

export default async function Page(propsPromise: Args) {
  // Resolve the params promise

  const { isEnabled: draft } = await draftMode();
  const props = await propsPromise.params;
  const { locale, collection, resourceId, slug } = props;

  // Validate the collection
  if (!pageCollections.includes(collection as PageCollectionsType)) {
    return <PayloadRedirects url={`/${locale}/${collection}/${resourceId}/${slug}`} />;
  }

  const document = await queryDocumentBySlugAndId({
    collection: collection as PageCollectionsType,
    resourceId,
    slug,
  });

  if (!document) {
    return <PayloadRedirects url={`/${locale}/${collection}/${resourceId}/${slug}`} />;
  }

  return (
    <article className="pt-16 pb-16">
      <PageClient />

      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={`/${locale}/${collection}/${resourceId}/${slug}`} />

      {draft && <LivePreviewListener />}

      <Hero title={document.title} image={document.image} />

      <div className="flex flex-col items-center gap-4 pt-8">
        {/* <section className="container" id="story-section">
          {document.story ? <RenderBlocks blocks={document.story} /> : null}
        </section> */}
      </div>
    </article>
  );
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { collection, resourceId, slug } = params;

  if (!pageCollections.includes(collection as PageCollectionsType)) {
    return {};
  }

  const document = await queryDocumentBySlugAndId({
    collection: collection as PageCollectionsType,
    resourceId,
    slug,
  });

  return generateMeta({ doc: document });
}

// Query document by collection, resourceId, and slug
const queryDocumentBySlugAndId = cache(
  async ({ collection, resourceId, slug }: { collection: PageCollectionsType; resourceId: string; slug: string }) => {
    const { isEnabled: draft } = await draftMode();
    const payload = await getPayload({ config: configPromise });

    const result = await payload.find({
      collection,
      draft,
      limit: 1,
      overrideAccess: draft,
      pagination: false,
      where: {
        resourceId: {
          equals: resourceId,
        },
        slug: {
          equals: slug,
        },
      },
    });

    return result.docs?.[0] || null;
  }
);
