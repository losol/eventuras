import configPromise from '@payload-config';
import { getPayload } from 'payload';

import { ProductsPageClient } from './page.client';

interface ProductsPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function ProductsPage({ params }: ProductsPageProps) {
  const { locale } = await params;
  const payload = await getPayload({ config: configPromise });

  const { docs: products } = await payload.find({
    collection: 'products',
    limit: 50,
    where: {
      _status: {
        equals: 'published',
      },
    },
  });

  return <ProductsPageClient products={products} locale={locale} />;
}
