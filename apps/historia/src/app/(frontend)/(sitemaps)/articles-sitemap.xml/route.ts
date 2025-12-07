import config from '@payload-config';
import { unstable_cache } from 'next/cache';
import { getServerSideSitemap } from 'next-sitemap';
import { getPayload } from 'payload';

import { getLocalizedCollectionName } from '@/app/(frontend)/[locale]/c/[collection]/pageCollections';

const getArticlesSitemap = unstable_cache(
  async () => {
    const payload = await getPayload({ config });
    const SITE_URL =
      process.env.NEXT_PUBLIC_CMS_URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      'https://example.com';

    const locales = process.env.NEXT_PUBLIC_CMS_LOCALES?.split(',') || ['en'];

    const allSitemapEntries = [];

    for (const locale of locales) {
      const results = await payload.find({
        collection: 'articles',
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
      const localizedCollectionName = getLocalizedCollectionName('articles', locale);

      const sitemapEntries = results.docs
        ? results.docs
          .filter((article) => Boolean(article?.slug) && Boolean(article?.resourceId))
          .map((article) => {
            const combinedSlug = `${article.slug}--${article.resourceId}`;
            return {
              loc: `${SITE_URL}/${locale}/${localizedCollectionName}/${combinedSlug}`,
              lastmod: article.updatedAt || dateFallback,
            };
          })
        : [];

      allSitemapEntries.push(...sitemapEntries);
    }

    return allSitemapEntries;
  },
  ['articles-sitemap'],
  {
    tags: ['articles-sitemap'],
  },
);

export async function GET() {
  const sitemap = await getArticlesSitemap();

  return getServerSideSitemap(sitemap);
}
