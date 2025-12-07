import React, { cache } from 'react';
import configPromise from '@payload-config';
import { draftMode } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPayload } from 'payload';

import { RenderBlocks } from '@/blocks/RenderBlocks';
import { LivePreviewListener } from '@/components/LivePreviewListener';
import { Hero } from '@/heros/Hero';
import { PagesSelect } from '@/payload-types';

import PageClient from './page.client';

// Read locales and default locale from environment variables, fallback to 'en'
const locales = process.env.NEXT_PUBLIC_CMS_LOCALES?.split(',') || ['en'];
const defaultLocale = process.env.NEXT_PUBLIC_CMS_DEFAULT_LOCALE || 'en';

// Read domain from environment variable
const serverDomain = process.env.NEXT_PUBLIC_CMS_URL;

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
      resourceId: true,
    },
  });

  if (!pages.docs?.length) {
    console.log('No pages found.');
    return [];
  }

  const paths: Array<{ locale: string; slug: string[] }> = [];

  // Add paths for pages
  for (const locale of locales) {
    for (const page of pages.docs) {
      const slugArray = page.slug ? [page.slug] : [];
      paths.push({ locale, slug: slugArray });
    }
  }

  // Add paths for the homepage
  for (const locale of locales) {
    paths.push({
      locale,
      slug: [],
    });
  }

  console.log('Generated paths:', paths);
  return paths;
}

type Args = {
  params: Promise<{
    locale: string;
    slug?: string[];
  }>;
};

// Page component
export default async function Page({ params: paramsPromise }: Args) {
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

  // Get the last segment of the URL or use `undefined` for root
  const currentSlug = slug?.length ? slug[slug.length - 1] : undefined;

  let page;
  if (!currentSlug) {
    // Handle the homepage logic
    const homePageId = await getHomePageId();
    if (!homePageId) {
      console.warn('No homepage found.');
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
      <article className="pt-16 pb-24 px-4 max-w-6xl mx-auto">
        {breadcrumbs && Array.isArray(breadcrumbs) && breadcrumbs.length > 1 && (
          <nav aria-label="breadcrumb" className="mb-4">
            <ol className="breadcrumb flex">
              <li className="breadcrumb-item">
                <Link href="/">Home</Link>
              </li>
              {breadcrumbs.map((breadcrumb, index) => (
                <li key={breadcrumb.id || index} className="breadcrumb-item flex items-center">
                  <span className="mx-2">/</span>
                  {index === breadcrumbs.length - 1 ? (
                    <span>{breadcrumb.label}</span>
                  ) : (
                    <Link href={breadcrumb.url!}>{breadcrumb.label}</Link>
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

// Get the homepage ID from the environment
import { headers } from 'next/headers';

const getHomePageId = cache(async (): Promise<string | null> => {
  const payload = await getPayload({ config: configPromise });
  const host = (await headers()).get('host');

  if (!host) {
    console.warn('No host header found.');
    return null;
  }

  const website = await payload.find({
    collection: 'websites',
    pagination: false,
    limit: 1,
    where: {
      domains: {
        contains: host,
      },
    },
  });

  if (
    website.docs.length &&
    website.docs[0]?.homePage &&
    typeof website.docs[0].homePage === 'object'
  ) {
    return 'id' in website.docs[0].homePage ? website.docs[0].homePage.id : null;
  }

  console.warn(`No website configuration found for host: ${host}`);
  return null;
});

// Query a page dynamically based on ID or slug
const queryPage = cache(async ({
  id,
  slug,
  locale,
  draft,
}: {
  id?: string;
  slug?: string;
  locale: string;
  draft: boolean;
}) => {
  const payload = await getPayload({ config: configPromise });

  const where: Record<string, any> = {};

  if (id) where.id = { equals: id };
  if (slug) where.slug = { equals: slug };

  if (Object.keys(where).length === 0) {
    console.warn('No valid filter provided for queryPage.');
    return null;
  }

  try {
    const result = await payload.find({
      collection: 'pages',
      draft,
      limit: 1,
      depth: 3,
      pagination: false,
      overrideAccess: draft,
      //@ts-expect-error
      locale,
      where,
      select: contentSelection,
    });

    if (!result.docs?.length) {
      console.warn(`No document found for query: ${JSON.stringify(where)}`);
      return null;
    }

    return result.docs[0];
  } catch (error) {
    console.error(`Error querying page: ${error}`, error);
    return null;
  }
});

// Fields to select when querying pages
const contentSelection: PagesSelect = {
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
    products: {
      products: true,
    },
  },
};
