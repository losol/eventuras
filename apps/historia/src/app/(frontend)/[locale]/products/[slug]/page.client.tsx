'use client';

import Image from 'next/image';

import { Button } from '@eventuras/ratio-ui/core/Button';
import { Card } from '@eventuras/ratio-ui/core/Card';
import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Text } from '@eventuras/ratio-ui/core/Text';
import { Container } from '@eventuras/ratio-ui/layout/Container';
import { Link } from '@eventuras/ratio-ui-next';

import { useCart } from '@/lib/cart';
import { formatPrice } from '@/lib/format-price';
import type { Product } from '@/payload-types';

interface ProductDetailClientProps {
  product: Product;
  locale: string;
}

export function ProductDetailClient({ product, locale }: ProductDetailClientProps) {
  const { addToCart, items } = useCart();

  const handleAddToCart = () => {
    addToCart(product.id, 1);
  };

  const cartItem = items.find((item) => item.productId === product.id);
  const quantityInCart = cartItem?.quantity || 0;

  const hasImage =
    product.image &&
    typeof product.image === 'object' &&
    'url' in product.image &&
    product.image.url &&
    typeof product.image.url === 'string';

  return (
    <Container>
      <div className="mb-6">
        <Link href={`/${locale}/products`}>← Back to Products</Link>
      </div>

      <div className={hasImage ? 'grid gap-8 md:grid-cols-2' : 'max-w-2xl'}>
        {/* Product Image - only show if exists */}
        {hasImage && product.image && typeof product.image === 'object' && 'url' in product.image ? (
          <div className="relative aspect-square">
            <Image
              src={product.image.url as string}
              alt={product.title || ''}
              fill
              className="rounded-lg border border-gray-200 dark:border-gray-700 object-cover"
            />
          </div>
        ) : null}

        {/* Product Details */}
        <div className="space-y-6">
          <Heading as="h1">{product.title}</Heading>

          {product.lead && (
            <Text className="text-lg text-gray-700 dark:text-gray-300">{product.lead}</Text>
          )}

          {product.price?.amount && (
            <div>
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                {formatPrice(product.price.amount, product.price.currency || 'NOK', locale)}
              </span>
            </div>
          )}

          <div className="space-y-4">
            <Button onClick={handleAddToCart} variant="primary" block padding="px-6 py-3">
              Add to Cart
            </Button>

            {quantityInCart > 0 && (
              <Card
                padding="p-4"
                className="text-center bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
              >
                <Text className="text-sm text-green-800 dark:text-green-300">
                  {quantityInCart} {quantityInCart === 1 ? 'item' : 'items'} in cart
                </Text>
                <Link
                  href={`/${locale}/cart`}
                  className="mt-2 inline-block text-sm text-green-700 dark:text-green-400 underline"
                >
                  View Cart
                </Link>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Container>
  );
}
