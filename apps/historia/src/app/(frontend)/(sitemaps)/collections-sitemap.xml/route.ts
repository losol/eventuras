import config from '@payload-config';
import { unstable_cache } from 'next/cache';
import { getServerSideSitemap } from 'next-sitemap';
import { getPayload } from 'payload';

import { getLocalizedCollectionName, pageCollections } from '@/app/(frontend)/[locale]/c/[collection]/pageCollections';

const getCollectionsSitemap = unstable_cache(
  async () => {
    const payload = await getPayload({ config });
    const SITE_URL =
      process.env.NEXT_PUBLIC_CMS_URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      'https://example.com';

    const locales = process.env.NEXT_PUBLIC_CMS_LOCALES?.split(',') || ['en'];

    const allSitemapEntries = [];

    for (const locale of locales) {
      for (const collection of pageCollections) {
        try {
          const results = await payload.find({
            collection,
            overrideAccess: false,
            draft: false,
            depth: 0,
            limit: 1000,
            pagination: false,
            where: {
              _status: {
                equals: 'published',
              },
            },
            select: {
              slug: true,
              resourceId: true,
              updatedAt: true,
            },
          });

          const dateFallback = new Date().toISOString();
          const localizedCollectionName = getLocalizedCollectionName(collection, locale);

          const sitemapEntries = results.docs
            ? results.docs
              .filter((doc: any) => Boolean(doc?.slug) && Boolean(doc?.resourceId))
              .map((doc: any) => {
                const combinedSlug = `${doc.slug}--${doc.resourceId}`;
                return {
                  loc: `${SITE_URL}/${locale}/${localizedCollectionName}/${combinedSlug}`,
                  lastmod: doc.updatedAt || dateFallback,
                };
              })
            : [];

          allSitemapEntries.push(...sitemapEntries);
        } catch (error) {
          console.error(`Failed to generate sitemap for collection "${collection}" in locale "${locale}":`, error);
        }
      }
    }

    return allSitemapEntries;
  },
  ['collections-sitemap'],
  {
    tags: ['collections-sitemap'],
  },
);

export async function GET() {
  const sitemap = await getCollectionsSitemap();

  return getServerSideSitemap(sitemap);
}
