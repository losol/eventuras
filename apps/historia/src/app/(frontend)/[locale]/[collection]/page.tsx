// src/app/(frontend)/[locale]/[collection]/page.tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next/types';
import { CollectionArchive } from '@/components/CollectionArchive';
import { PageRange } from '@/components/PageRange';
import { Pagination } from '@/components/Pagination';
import configPromise from '@payload-config';
import { getPayload } from 'payload';
import { pageCollections, PageCollectionsType } from './pageCollections';

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
  const { collection } = await paramsPromise;

  if (!isValidCollection(collection)) {
    notFound();
  }

  try {
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
          // @ts-expect-error
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

export async function generateMetadata({
  params: paramsPromise,
}: {
  params: Promise<{
    locale: string;
    collection: string;
  }>;
}): Promise<Metadata> {
  const { collection } = await paramsPromise;

  const capitalizedCollection =
    collection.charAt(0).toUpperCase() + collection.slice(1);

  return {
    title: `Historia ${capitalizedCollection}`,
  };
}
