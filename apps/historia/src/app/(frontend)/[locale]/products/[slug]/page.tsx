import configPromise from '@payload-config';
import { notFound } from 'next/navigation';
import { getPayload } from 'payload';

import { RenderBlocks } from '@/blocks/RenderBlocks';
import { ProductActions } from '@/components/ProductActions';

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
    depth: 2,
  });

  const product = docs[0];

  if (!product) {
    notFound();
  }

  return (
    <>
      <ProductActions product={product} locale={locale} />
      {product.story ? <RenderBlocks blocks={product.story} /> : null}
    </>
  );
}
