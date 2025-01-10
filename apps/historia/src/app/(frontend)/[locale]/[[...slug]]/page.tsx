import configPromise from '@payload-config';
import { getPayload } from 'payload';
import { draftMode } from 'next/headers';
import React, { cache } from 'react';
import { notFound } from 'next/navigation';

import { RenderBlocks } from '@/blocks/RenderBlocks';
import { Hero } from '@/heros/Hero';
import PageClient from './page.client';
import { LivePreviewListener } from '@/components/LivePreviewListener';

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
  const draftModeResult = await draftMode();
  const draft = draftModeResult.isEnabled;
  const params = await paramsPromise;

  console.log('Page params:', params);

  // Extract locale and slug
  const { locale = defaultLocale, slug } = params;

  // Return 404 for invalid locale
  if (!locales.includes(locale)) {
    console.warn(`Invalid locale: ${locale}`);
    notFound();
  }

  // Get the last segment of the URL or 'home' for root
  const currentSlug = slug?.length ? slug[slug.length - 1] : 'home';

  // Fetch the page data for the current locale
  const page = await queryPageBySlug({ slug: currentSlug, locale, draft });

  if (!page) {
    notFound();
  }

  const { title, image, breadcrumbs, story } = page;

  return (
    <>
      <PageClient />
      <LivePreviewListener />

      <article className="pt-16 pb-24 container">
        {breadcrumbs && Array.isArray(breadcrumbs) && breadcrumbs.length > 0 && (
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

const queryPageBySlug = cache(async ({ slug, locale, draft }: { slug: string; locale: string; draft: boolean }) => {
  const payload = await getPayload({ config: configPromise });

  const result = await payload.find({
    collection: 'pages',
    draft,
    limit: 1,
    pagination: false,
    overrideAccess: draft,
    // @ts-expect-error
    locale: locale,
    where: {
      slug: {
        equals: slug,
      },
    },
    select: {
      title: true,
      slug: true,
      image: true,
      contributors: true,
      license: true,
      publishedAt: true,
      parent: true,
      breadcrumbs: true,
      story: true,
    },
  });

  return result.docs?.[0] || null;
});
