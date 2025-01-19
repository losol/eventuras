import configPromise from '@payload-config';
import { getPayload } from 'payload';
import { draftMode } from 'next/headers';
import React, { cache } from 'react';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';

import { RenderBlocks } from '@/blocks/RenderBlocks';
import { Hero } from '@/heros/Hero';
import PageClient from './page.client';
import { LivePreviewListener } from '@/components/LivePreviewListener';
import { PagesSelect } from '@/payload-types';
import { getHost } from '@/utilities/getHost';

// Read locales and default locale from environment variables, fallback to en
const locales = process.env.CMS_LOCALES?.split(',') || ['en'];
const defaultLocale = process.env.CMS_DEFAULT_LOCALE || 'en';

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise });

  const pages = await payload.find({
    collection: 'pages',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
      breadcrumbs: true,
    },
  });

  // Generate paths for all locales dynamically
  const paths = locales.flatMap((locale) =>
    pages.docs.map((page) => ({
      locale,
      // Set slug to undefined if it's 'home'
      slug: page.slug === 'home' ? undefined : [page.slug],
    }))
  );

  console.log('Generated paths:', paths);
  return paths;
}

type Args = {
  params: Promise<{
    locale: string;
    slug?: string[];
  }>;
};

export default async function Page({ params: paramsPromise }: Args) {
  const payload = await getPayload({ config: configPromise });
  const draftModeResult = await draftMode();
  const draft = draftModeResult.isEnabled;
  const params = await paramsPromise;

  // Extract locale and slug
  const { locale = defaultLocale, slug } = params;

  // Return 404 for invalid locale
  if (!locales.includes(locale)) {
    console.warn(`Invalid locale: ${locale}`);
    notFound();
  }

  const getHomePage = async (): Promise<string | null> => {
  const domain = await getHost(); // Use your `getHost` utility to fetch the current domain
  const payload = await getPayload({ config: configPromise });

  const website = await payload.find({
    collection: 'websites',
    pagination: false,
    limit: 1,
    where: {
      domains: {
        contains: domain, // Match the current domain
      },
    },
  });

  if (website.docs.length && website.docs[0]?.homePage) {
    return website.docs[0]?.homePage?.id || null;
  }

  console.warn(`No website configuration found for domain: ${domain}`);
  return null;
};

  // Get the last segment of the URL or use `undefined` for root
  let currentSlug = slug?.length ? slug[slug.length - 1] : undefined;

  let page;
  if (!currentSlug) {
    // Fetch the homepage if slug is undefined
    const homePageId = await getHomePage();
    if (!homePageId) {
      console.warn('No homepage found for the current domain.');
      notFound();
    }

    // Query the page using the homepage ID
    page = await queryPage({ id: homePageId, locale, draft });
  } else {
    // Query the page using the slug
    page = await queryPage({ slug: currentSlug, locale, draft });
  }

  if (!page) {
    notFound();
  }

  const { title, image, breadcrumbs, story } = page;

  return (
    <>
      <PageClient />
      <LivePreviewListener />

      <article className="pt-16 pb-24 container">
        {breadcrumbs && Array.isArray(breadcrumbs) && breadcrumbs.length > 1 && (
          <nav aria-label="breadcrumb" className="mb-4">
            <ol className="breadcrumb flex">
              <li className="breadcrumb-item">
                <a href="/">Home</a>
              </li>
              {breadcrumbs.map((breadcrumb, index) => (
                <li key={breadcrumb.id || index} className="breadcrumb-item flex items-center">
                  <span className="mx-2">/</span>
                  {index === breadcrumbs.length - 1 ? (
                    <span>{breadcrumb.label}</span>
                  ) : (
                    <a href={breadcrumb.url!}>{breadcrumb.label}</a>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
        <Hero title={title} image={image} />
        {story && story.length > 0 && <RenderBlocks blocks={story} />}
      </article>
    </>
  );
}

const queryPage = cache(async ({
  id,
  slug,
  locale,
  draft,
  channel,
}: {
  id?: string;
  slug?: string;
  locale: string;
  draft: boolean;
  channel?: string;
}) => {
  const payload = await getPayload({ config: configPromise });

  // Dynamically build the `where` clause
  const where: Record<string, any> = {};

  if (id) {
    where.id = { equals: id };
  }
  if (slug) {
    where.slug = { equals: slug };
  }
  if (channel) {
    where.channels = {
      in: [channel], // Match if the `channel` ID exists in the `channels` array
    };
  }

  // Ensure at least one filter is applied
  if (Object.keys(where).length === 0) {
    console.warn('No valid filter provided for queryPage.');
    return null;
  }

  const result = await payload.find({
    collection: 'pages',
    draft,
    limit: 1,
    depth: 3,
    pagination: false,
    overrideAccess: draft,
    locale,
    where,
    select: contentSelection,
  });

  return result.docs?.[0] || null;
});

export const contentSelection: PagesSelect= {
  title: true,
  slug: true,
  image: true,
  contributors: true,
  license: true,
  publishedAt: true,
  parent: true,
  breadcrumbs: true,
  story: {
    archive: {
      description: true,
      relationTo: true,
      topics: true,
      showImages: true,
      limit: true,
    },
    content: true,
  },
};
