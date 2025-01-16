import type { Metadata } from 'next';
import { PayloadRedirects } from '@/components/PayloadRedirects';
import configPromise from '@payload-config';
import { getPayload } from 'payload';
import { draftMode } from 'next/headers';
import React, { cache } from 'react';

import { pageCollections, PageCollectionsType } from '../../pageCollections';
import { Hero } from '@/heros/Hero';
import { generateMeta } from '@/utilities/generateMeta';
import PageClient from './page.client';
import { LivePreviewListener } from '@/components/LivePreviewListener';
import { RenderBlocks } from '@/blocks/RenderBlocks';
import RichText from '@/components/RichText';
import { redirect } from 'next/navigation';

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
        if (slug) {
          params.push({
            locale,
            collection,
            resourceId,
            slug,
          });
        }
      });
    }
  }

  return params;
}

type Args = {
  params: Promise<{
    locale: string;
    collection: string;
    resourceId: string;
    slug: string;
  }>;
};

export default async function Page({ params: paramsPromise }: Args) {

  const { isEnabled: draft } = await draftMode();
  const props = await paramsPromise;
  const { locale, collection, resourceId, slug } = props;

  // Validate the collection
  if (!pageCollections.includes(collection as PageCollectionsType)) {
    return <PayloadRedirects url={`/${locale}/${collection}/${resourceId}/${slug}`} />;
  }

  const document = await queryDocumentByResourceId({
    collection: collection as PageCollectionsType,
    resourceId,
  });

   // Check for slug mismatch and redirect if necessary
  if (document.slug !== slug) {
    redirect(`/${locale}/${collection}/${resourceId}/${document.slug}`);
  }

  const titleToUse = 'title' in document ? document.title : document.name;


  if (!document) {
    return <PayloadRedirects url={`/${locale}/${collection}/${resourceId}/${slug}`} />;
  }

  return (
    <article className="container pt-16 pb-16 prose dark:prose-invert px-0">
      <PageClient />

      <PayloadRedirects disableNotFound url={`/${locale}/${collection}/${resourceId}/${slug}`} />

      {draft && <LivePreviewListener />}

      {'lead' in document && document.lead
        ? <Hero title={titleToUse} image={document.image} lead={document.lead} />
        : <Hero title={titleToUse} image={document.image} />}

      {'content' in document && document.content ? <RichText data={document.content} /> : null}
      {'story' in document && document.story ? <RenderBlocks blocks={document.story} /> : null}


    </article>
  );
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { collection, resourceId } = await params;

  if (!pageCollections.includes(collection as PageCollectionsType)) {
    return {};
  }

  const document = await queryDocumentByResourceId({
    collection: collection as PageCollectionsType,
    resourceId,
  });

  return generateMeta({ doc: document });
}

// Query document by collection, resourceId, and slug
const queryDocumentByResourceId = cache(
  async ({ collection, resourceId }: { collection: PageCollectionsType; resourceId: string; }) => {
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
      },
    });

    return result.docs?.[0] ?? null;
  }
);
