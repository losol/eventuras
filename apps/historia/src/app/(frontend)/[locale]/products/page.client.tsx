'use client';

import NextLink from 'next/link';

import { formatPrice } from '@eventuras/core/currency';
import { Card } from '@eventuras/ratio-ui/core/Card';
import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { ProductCard } from '@eventuras/ratio-ui/core/ProductCard';
import { Text } from '@eventuras/ratio-ui/core/Text';
import { Container } from '@eventuras/ratio-ui/layout/Container';
import { Grid } from '@eventuras/ratio-ui/layout/Grid';

import { useCart } from '@/lib/cart';
import { fromMinorUnits } from '@/lib/price';
import type { Product } from '@/payload-types';

interface ProductsPageClientProps {
  products: Product[];
  locale: string;
}

export function ProductsPageClient({ products, locale }: ProductsPageClientProps) {
  const { addToCart } = useCart();

  const handleAddToCart = (productId: string) => {
    addToCart(productId, 1);
  };

  return (
    <Container>
      <Heading as="h1" padding="pt-8 pb-6">
        Products
      </Heading>

      {products.length === 0 ? (
        <Card padding="p-8" className="text-center">
          <Text className="text-lg">No products available</Text>
        </Card>
      ) : (
        <Grid cols={{ sm: 1, md: 2, lg: 3 }} paddingClassName="gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              title={product.title}
              lead={product.lead || undefined}
              price={
                product.price?.amount
                  ? formatPrice(
                      fromMinorUnits(product.price.amount, product.price.currency || 'NOK'),
                      product.price.currency || 'NOK',
                      locale
                    )
                  : undefined
              }
              href={`/${locale}/products/${product.slug}`}
              onAddToCart={() => handleAddToCart(product.id)}
              linkComponent={NextLink}
              testId={`product-card-${product.slug}`}
            />
          ))}
        </Grid>
      )}
    </Container>
  );
}
