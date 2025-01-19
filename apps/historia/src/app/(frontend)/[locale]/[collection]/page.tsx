import { notFound } from 'next/navigation';
import type { Metadata } from 'next/types';
import { CollectionArchive } from '@/components/CollectionArchive';
import { PageRange } from '@/components/PageRange';
import { Pagination } from '@/components/Pagination';
import configPromise from '@payload-config';
import { CollectionSlug, getPayload } from 'payload';
import {
  getLocalizedCollectionName,
  getOriginalCollectionName,
  pageCollections,
  PageCollectionsType,
} from './pageCollections';

export const dynamic = 'force-static';
export const revalidate = 600;

type Props = {
  params: Promise<{
    locale: string;
    collection: string;
  }>;
};

function isValidCollection(collection: string): collection is PageCollectionsType {
  return pageCollections.includes(collection as any);
}

export default async function Page({ params: paramsPromise }: Props) {
  const payload = await getPayload({ config: configPromise });
  const { locale, collection } = await paramsPromise;

  const originalCollectionName = getOriginalCollectionName(collection, locale);
  console.log('Mapped Collection:', { collection, originalCollectionName, locale });

  if (!isValidCollection(originalCollectionName)) {
    console.warn(`Invalid collection: ${originalCollectionName}`);
    notFound();
  }

  try {
    const docsPage = await payload.find({
      collection: originalCollectionName as CollectionSlug,
      depth: 1,
      limit: 20,
      page: 1,
      overrideAccess: false,
      select: {
        title: true,
        slug: true,
        resourceId: true,
      },
    });

    if (!docsPage.docs?.length) {
      console.warn(`No documents found for collection: ${originalCollectionName}`);
      notFound();
    }

    const capitalizedCollection =
      collection.charAt(0).toUpperCase() + collection.slice(1);

    return (
      <div className="container pt-24 pb-24 prose dark:prose-invert">
        <h1>{capitalizedCollection}</h1>

        <CollectionArchive
          // @ts-expect-error
          docs={docsPage.docs}
          // @ts-expect-error
          relationTo={originalCollectionName}
        />

        {docsPage.totalPages > 1 && (
          <div className="mb-8">
            <Pagination page={docsPage.page!} totalPages={docsPage.totalPages} />
            <PageRange
              collection={originalCollectionName}
              currentPage={docsPage.page}
              limit={20}
              totalDocs={docsPage.totalDocs}
            />
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.warn('Error fetching collection:', error);
    notFound();
  }
}

export async function generateMetadata({
  params: paramsPromise,
}: {
  params: Promise<{
    locale: string;
    collection: string;
  }>;
}): Promise<Metadata> {
  const { collection, locale } = await paramsPromise;

  const originalCollectionName = getOriginalCollectionName(collection, locale);
  const capitalizedCollection =
    originalCollectionName.charAt(0).toUpperCase() + originalCollectionName.slice(1);

  return {
    title: `Historia ${capitalizedCollection}`,
  };
}

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise });
  const locales = process.env.CMS_LOCALES?.split(',') || ['en'];

  const params: Array<{ locale: string; collection: string }> = [];

  const fetchCollectionDocs = async (collection: string) => {
    try {
      const result = await payload.find({
        collection: collection as CollectionSlug,
        depth: 1,
        limit: 1000,
        overrideAccess: false,
        pagination: false,
        select: {
          slug: true,
        },
      });
      return result.docs || [];
    } catch (error) {
      console.error(`Error fetching documents for collection "${collection}":`, error);
      return [];
    }
  };

  for (const locale of locales) {
    for (const collection of pageCollections) {
      const documents = await fetchCollectionDocs(collection);
      if (documents.length) {
        const localizedCollectionName = getLocalizedCollectionName(collection, locale);
        params.push({ locale, collection: localizedCollectionName });
      }
    }
  }

  console.log('Generated Static Params:', params);
  return params;
}
