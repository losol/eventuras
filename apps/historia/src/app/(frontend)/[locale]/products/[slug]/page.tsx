import configPromise from '@payload-config';
import { notFound } from 'next/navigation';
import { getPayload } from 'payload';

import { ProductDetailClient } from './page.client';

interface ProductPageProps {
  params: Promise<{
    slug: string;
    locale: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug, locale } = await params;

  // Extract resourceId if present (format: slug--resourceId)
  const [slugPart, resourceId] = slug.split('--');

  const payload = await getPayload({ config: configPromise });

  const { docs } = await payload.find({
    collection: 'products',
    where: {
      and: [
        {
          slug: {
            equals: slugPart,
          },
        },
        ...(resourceId
          ? [
              {
                resourceId: {
                  equals: resourceId,
                },
              },
            ]
          : []),
      ],
    },
    limit: 1,
    locale: locale as 'en' | 'no',
  });

  const product = docs[0];

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} locale={locale} />;
}
