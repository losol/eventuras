import { notFound } from 'next/navigation';
import type { Metadata } from 'next/types';
import { CollectionArchive } from '@/components/CollectionArchive';
import { PageRange } from '@/components/PageRange';
import { Pagination } from '@/components/Pagination';
import configPromise from '@payload-config';
import { getPayload } from 'payload';
import { Config } from '@/payload-types';

// Centralized collection definitions with strict typing
export const pageCollections = ['articles', 'happenings', 'notes', 'projects'] as const;
type ValidCollection = typeof pageCollections[number];
type Collections = Config['collections'];
export type PageCollectionsType = Extract<keyof Collections, ValidCollection>;

// Type for the response from payload.find()
type PaginatedDocs<T extends PageCollectionsType> = {
  docs: Collections[T][];
  page: number;
  totalPages: number;
  totalDocs: number;
};

export const dynamic = 'force-static';
export const revalidate = 600;

export default async function Page({
  params: { collection, locale }
}: {
  params: { collection: string; locale: string }
}) {
  const payload = await getPayload({ config: configPromise });

  function isValidCollection(collection: string): collection is PageCollectionsType {
    return pageCollections.includes(collection as ValidCollection);
  }

  if (!isValidCollection(collection)) {
    notFound();
  }

  try {
    // Use the specific collection type
    const docsPage = await payload.find({
      collection,
      depth: 1,
      limit: 10,
      page: 1,
      overrideAccess: false,
      select: {
        title: true,
        slug: true,
        resourceId: true,
      },
    });

    if (!docsPage.docs?.length) {
      notFound();
    }

    const capitalizedCollection =
      collection.charAt(0).toUpperCase() + collection.slice(1);

    return (
      <div className="container pt-24 pb-24 prose dark:prose-invert">
        <h1>{capitalizedCollection}</h1>

        <CollectionArchive
          docs={docsPage.docs}
          relationTo={collection}
        />

        {docsPage.totalPages > 1 && (
          <div className="mb-8">
            <Pagination
              page={docsPage.page!}
              totalPages={docsPage.totalPages}
            />
            <PageRange
              collection={collection}
              currentPage={docsPage.page}
              limit={10}
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

export function generateMetadata({
  params: { collection }
}: {
  params: { collection: string }
}): Metadata {

  const capitalizedCollection =
    collection.charAt(0).toUpperCase() + collection.slice(1);

  return {
    title: `Historia ${capitalizedCollection}`,
  };
}
