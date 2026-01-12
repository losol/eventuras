import React, { cache } from 'react';
import configPromise from '@payload-config';
import type { Metadata } from 'next';
import { draftMode } from 'next/headers';
import { permanentRedirect, redirect } from 'next/navigation';
import { CollectionSlug, getPayload } from 'payload';

import { Story, StoryBody,StoryHeader } from '@eventuras/ratio-ui/blocks/Story';
import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Lead } from '@eventuras/ratio-ui/core/Lead';
import { Container } from '@eventuras/ratio-ui/layout/Container';
import { Grid } from '@eventuras/ratio-ui/layout/Grid';
import { Image } from '@eventuras/ratio-ui-next/Image';

import { RenderBlocks } from '@/blocks/RenderBlocks';
import { LivePreviewListener } from '@/components/LivePreviewListener';
import { PayloadRedirects } from '@/components/PayloadRedirects';
import { ProductActions } from '@/components/ProductActions';
import RichText from '@/components/RichText';
import type { Product } from '@/payload-types';
import { generateMeta } from '@/utilities/generateMeta';
import { getImageProps } from '@/utilities/image';

import PageClient from './page.client';
import { getLocalizedCollectionName, getOriginalCollectionName, pageCollections,PageCollectionsType } from '../pageCollections';

/**
 * Parse slug in format: {human-readable-slug}--{resourceId}
 */
function parseSlugWithResourceId(combinedSlug: string): { slug: string; resourceId: string } | null {
  const lastDashDashIndex = combinedSlug.lastIndexOf('--');

  if (lastDashDashIndex === -1 || lastDashDashIndex === combinedSlug.length - 2) {
    // No '--' separator found, or it's at the end
    return null;
  }

  const slug = combinedSlug.substring(0, lastDashDashIndex);
  const resourceId = combinedSlug.substring(lastDashDashIndex + 2);

  if (!slug || !resourceId) {
    return null;
  }

  return { slug, resourceId };
}

export async function generateStaticParams() {
  // Skip static generation during build to avoid database queries
  // Pages will be generated on-demand at runtime (ISR)
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return [];
  }

  const payload = await getPayload({ config: configPromise });

  const locales = process.env.NEXT_PUBLIC_CMS_LOCALES?.split(',') || ['en'];

  const params: Array<{
    locale: string;
    collection: string;
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

        // @ts-expect-error - Payload types don't include select fields
        documents.forEach(({ slug, resourceId }) => {
          if (slug && resourceId) {
            const combinedSlug = `${slug}--${resourceId}`;
            console.log(
              `Generating static params for ${locale}/c/${localizedCollectionName}/${combinedSlug}`
            );

            params.push({
              locale,
              collection: localizedCollectionName,
              slug: combinedSlug,
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
    slug: string;
  }>;
};

export default async function Page({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode();
  const props = await paramsPromise;
  const { locale, collection, slug: combinedSlug } = props;

  // Parse the combined slug to extract resourceId
  const parsed = parseSlugWithResourceId(combinedSlug);

  if (!parsed) {
    // Invalid slug format, redirect to 404
    return <PayloadRedirects url={`/${locale}/${collection}/${combinedSlug}`} />;
  }

  const { slug, resourceId } = parsed;

  const originalCollectionName = getOriginalCollectionName(collection, locale);
  const localizedCollectionName = getLocalizedCollectionName(originalCollectionName, locale);

  // Redirect if the provided collection name is not localized
  if (collection !== localizedCollectionName) {
    redirect(`/${locale}/${localizedCollectionName}/${combinedSlug}`);
  }

  const document = await queryDocumentByResourceId({
    collection: originalCollectionName as PageCollectionsType,
    resourceId,
  });

  if (!document) {
    return <PayloadRedirects url={`/${locale}/${localizedCollectionName}/${combinedSlug}`} />;
  }

  // Check for slug mismatch and redirect permanently to the correct URL (308 Permanent Redirect)
  if (document.slug !== slug) {
    const correctCombinedSlug = `${document.slug}--${resourceId}`;
    permanentRedirect(`/${locale}/${localizedCollectionName}/${correctCombinedSlug}`);
  }

  const titleToUse = 'title' in document ? document.title : document.name;
  const isProduct = originalCollectionName === 'products';
  const hasLead = 'lead' in document && document.lead;
  const hasImage = 'image' in document && document.image;
  const imageProps = hasImage ? getImageProps(document.image, isProduct ? 'square600px' : 'standard') : null;

  return (
    <Container>
      <Story as="article">
        <PageClient />

        <PayloadRedirects
          disableNotFound
          url={`/${locale}/${localizedCollectionName}/${combinedSlug}`}
        />

        {draft && <LivePreviewListener />}

        {isProduct && imageProps?.url ? (
          <>
            <StoryHeader>
              <Grid cols={{ sm: 1, md: 2 }} paddingClassName="gap-8">
                <Image
                  src={imageProps.url}
                  alt={imageProps.alt || titleToUse || ''}
                  width={imageProps.width}
                  height={imageProps.height}
                  loading="eager"
                />
                <div className="flex flex-col justify-center gap-4">
                  <Heading as="h1">{titleToUse}</Heading>
                  {hasLead && <Lead>{document.lead}</Lead>}
                  <ProductActions product={document as Product} locale={locale} />
                </div>
              </Grid>
            </StoryHeader>

            <StoryBody>
              {'content' in document && document.content ? <RichText data={document.content} /> : null}
              {'story' in document && document.story ? <RenderBlocks blocks={document.story} /> : null}
            </StoryBody>
          </>
        ) : (
          <>
            <StoryHeader>
              {imageProps?.url && (
                <Image
                  src={imageProps.url}
                  alt={imageProps.alt || titleToUse || ''}
                  width={imageProps.width}
                  height={imageProps.height}
                  loading="eager"
                />
              )}
              <Heading as="h1">{titleToUse}</Heading>
              {hasLead && <Lead>{document.lead}</Lead>}
            </StoryHeader>

            <StoryBody>
              {isProduct && <ProductActions product={document as Product} locale={locale} />}

              {'content' in document && document.content ? <RichText data={document.content} /> : null}
              {'story' in document && document.story ? <RenderBlocks blocks={document.story} /> : null}
            </StoryBody>
          </>
        )}
      </Story>
    </Container>
  );
}


export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { collection, locale, slug: combinedSlug } = await params;

  const parsed = parseSlugWithResourceId(combinedSlug);

  if (!parsed) {
    return {};
  }

  const { resourceId } = parsed;
  const originalCollectionName = getOriginalCollectionName(collection, locale);

  const document = await queryDocumentByResourceId({
    collection: originalCollectionName as PageCollectionsType,
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
