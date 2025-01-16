import type { Metadata } from 'next';
import { PayloadRedirects } from '@/components/PayloadRedirects';
import configPromise from '@payload-config';
import { CollectionSlug, getPayload } from 'payload';
import { draftMode } from 'next/headers';
import React, { cache } from 'react';

import { getLocalizedCollectionName, getOriginalCollectionName, pageCollections, PageCollectionsType } from '../../pageCollections';
import { Hero } from '@/heros/Hero';
import { generateMeta } from '@/utilities/generateMeta';
import PageClient from './page.client';
import { LivePreviewListener } from '@/components/LivePreviewListener';
import { RenderBlocks } from '@/blocks/RenderBlocks';
import RichText from '@/components/RichText';
import { redirect } from 'next/navigation';

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise });

  const locales = process.env.CMS_LOCALES?.split(',') || ['en'];

  const params: Array<{
    locale: string;
    collection: string;
    resourceId: string;
    slug: string;
  }> = [];

  const fetchCollectionDocs = async (collection: string) => {
    const result = await payload.find({
      collection: collection as CollectionSlug,
      draft: false,
      limit: 1000,
      overrideAccess: false,
      pagination: false,
      select: { slug: true, resourceId: true },
    });

    return result.docs || [];
  };

  for (const locale of locales) {
    for (const collection of pageCollections) {
      try {
        const documents = await fetchCollectionDocs(collection);

        const localizedCollectionName = getLocalizedCollectionName(collection, locale);

        // @ts-expect-error
        documents.forEach(({ slug, resourceId }) => {
          if (slug && resourceId) {
            console.log(
              `Generating localized static params for ${locale}/${localizedCollectionName}/${resourceId}/${slug}`
            );

            params.push({
              locale,
              collection: localizedCollectionName,
              resourceId,
              slug,
            });
          }
        });
      } catch (error) {
        console.error(`Failed to fetch documents for collection "${collection}" in locale "${locale}":`, error);
      }
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

  const originalCollectionName = getOriginalCollectionName(collection, locale);
  const localizedCollectionName = getLocalizedCollectionName(originalCollectionName, locale);

  // Redirect if the provided collection name is not localized
  if (collection !== localizedCollectionName) {
    redirect(`/${locale}/${localizedCollectionName}/${resourceId}/${slug}`);
  }

  const document = await queryDocumentByResourceId({
    collection: originalCollectionName as PageCollectionsType,
    resourceId,
  });

  if (!document) {
    return <PayloadRedirects url={`/${locale}/${localizedCollectionName}/${resourceId}/${slug}`} />;
  }

  // Check for slug mismatch and redirect to the correct URL
  if (document.slug !== slug) {
    redirect(`/${locale}/${localizedCollectionName}/${resourceId}/${document.slug}`);
  }

  const titleToUse = 'title' in document ? document.title : document.name;

  return (
    <article className="container pt-16 pb-16 prose dark:prose-invert px-0">
      <PageClient />

      <PayloadRedirects
        disableNotFound
        url={`/${locale}/${localizedCollectionName}/${resourceId}/${slug}`}
      />

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
