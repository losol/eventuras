'use client';

import React from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';

import { formatPrice } from '@eventuras/core/currency';
import { Logger } from '@eventuras/logger';
import { Button } from '@eventuras/ratio-ui/core/Button';
import { Card } from '@eventuras/ratio-ui/core/Card';
import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Text } from '@eventuras/ratio-ui/core/Text';
import { useToast } from '@eventuras/toast';

import RichText from '@/components/RichText';
import { useLocale } from '@/hooks/useLocale';
import { useSessionCart } from '@/lib/cart/use-session-cart';
import { fromMinorUnits } from '@/lib/price';
import type { Product as ProductType } from '@/payload-types';

const logger = Logger.create({
  namespace: 'historia:blocks:product',
  context: { module: 'ProductBlock' },
});

interface ProductBlockProps {
  products?: (string | ProductType)[];
}

export const ProductsBlock: React.FC<ProductBlockProps> = (props) => {
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();
  const { addToCart } = useSessionCart();
  const [addingProductId, setAddingProductId] = React.useState<string | null>(null);
  const locale = useLocale();

  // Debug logging
  logger.info({
    hasProducts: !!props?.products,
    isArray: Array.isArray(props?.products),
    length: props?.products?.length,
    products: props?.products
  }, 'ProductsBlock render');

  if (!props?.products || !Array.isArray(props.products) || props.products.length === 0) {
    logger.warn({ props }, 'No products provided or invalid products array');
    return null;
  }

  // Filter out string IDs and keep only populated products
  const products = props.products.filter(
    (p): p is ProductType => typeof p === 'object' && p !== null
  );

  logger.info({
    totalProducts: props.products.length,
    populatedProducts: products.length
  }, 'Filtered products');

  if (products.length === 0) {
    logger.warn({ rawProducts: props.products }, 'No valid products to display - all are string IDs');
    return null;
  }

  const handleOrder = async (product: ProductType) => {
    if (!product.id) {
      logger.error({ product }, 'Product ID is missing');
      toast.error('Unable to add product to cart');
      return;
    }

    setAddingProductId(product.id);
    logger.info({ productId: product.id }, 'Adding product to cart');

    try {
      const result = await addToCart(product.id, 1);

      if (result.success) {
        logger.info(
          { productId: product.id, cartItemCount: result.data.items.length },
          'Product added to cart successfully'
        );
        toast.success('Product added to cart!');

        // Navigate to checkout page with locale
        router.push(`/${locale}/checkout`);
      } else {
        logger.error(
          { error: result.error, productId: product.id },
          'Failed to add product to cart'
        );
        toast.error(result.error?.message || 'Failed to add product to cart');
      }
    } catch (error) {
      logger.error({ error, productId: product.id }, 'Error adding product to cart');
      toast.error('An unexpected error occurred');
    } finally {
      setAddingProductId(null);
    }
  };

  return (
    <div className="my-16 space-y-8">
      {products.map((product) => {
        const hasImage =
          product.image &&
          typeof product.image === 'object' &&
          'url' in product.image &&
          product.image.url &&
          typeof product.image.url === 'string';

        const isAdding = addingProductId === product.id;

        return (
          <Card key={product.id} padding="p-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Product Image */}
              {hasImage &&
              product.image &&
              typeof product.image === 'object' &&
              'url' in product.image ? (
                <div className="relative aspect-square overflow-hidden rounded-lg">
                  <Image
                    src={product.image.url as string}
                    alt={product.title || 'Product image'}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : null}

              {/* Product Details */}
              <div className="flex flex-col justify-between">
                <div>
                  <Heading as="h3">
                    {product.title}
                  </Heading>

                  {product.lead && (
                    <Text className="mt-2">{product.lead}</Text>
                  )}

                  {product.description && (
                    <div className="mt-4">
                      <RichText data={product.description} enableGutter={false} />
                    </div>
                  )}

                  {product.price?.amountIncVat != null && (
                    <div className="mt-4">
                      <Text className="text-3xl font-bold">
                        {formatPrice(
                          fromMinorUnits(
                            product.price.amountIncVat,
                            product.price.currency || 'NOK'
                          ),
                          product.price.currency || 'NOK',
                          locale
                        )}
                      </Text>
                    </div>
                  )}
                </div>

                {/* Order Button */}
                <div className="mt-6">
                  <Button
                    onClick={() => handleOrder(product)}
                    disabled={isAdding}
                    variant="primary"
                    block
                    padding="px-6 py-3"
                  >
                    {isAdding ? 'Adding...' : 'Order'}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
