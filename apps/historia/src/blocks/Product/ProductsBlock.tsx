'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

import { formatPrice } from '@eventuras/core/currency';
import { Logger } from '@eventuras/logger';
import { Button } from '@eventuras/ratio-ui/core/Button';
import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Section } from '@eventuras/ratio-ui/core/Section';
import { Text } from '@eventuras/ratio-ui/core/Text';
import { ImageCard, Link } from '@eventuras/ratio-ui-next';
import { useToast } from '@eventuras/toast';

import RichText from '@/components/RichText';
import { useLocale } from '@/hooks/useLocale';
import { useSessionCart } from '@/lib/cart/use-session-cart';
import { fromMinorUnits } from '@/lib/price';
import type { Product as ProductType } from '@/payload-types';
import { getImageUrl } from '@/utilities/image';

const logger = Logger.create({
  namespace: 'historia:blocks:product',
  context: { module: 'ProductBlock' },
});

interface ProductBlockProps {
  products?: (string | ProductType)[];
  showImage?: boolean;
}

export const ProductsBlock: React.FC<ProductBlockProps> = (props) => {
  const router = useRouter();
  const toast = useToast();
  const { addToCart } = useSessionCart();
  const [addingProductId, setAddingProductId] = React.useState<string | null>(null);
  const locale = useLocale();

  if (!props?.products || !Array.isArray(props.products) || props.products.length === 0) {
    logger.warn({ props }, 'No products provided or invalid products array');
    return null;
  }

  // Filter out string IDs and keep only populated products
  const products = props.products.filter(
    (p): p is ProductType => typeof p === 'object' && p !== null
  );

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
    <Section id="products">
      {products.map((product) => {
        const imageUrl = getImageUrl(product.image, 'standard');
        const showImage = props.showImage !== false && imageUrl;

        const isAdding = addingProductId === product.id;

        return (
          <ImageCard
            key={product.id}
            gap="lg"
            imageSrc={showImage ? imageUrl : undefined}
            imageAlt={product.title || 'Product image'}
          >
              <Heading as="h3" padding="py-0 pt-0">{product.title}</Heading>

              {product.lead && <Text className="mt-2">{product.lead}</Text>}

                {product.description && (
                  <div className="mt-4">
                    <RichText data={product.description} enableGutter={false} />
                  </div>
                )}

                {product.price?.amountIncVat != null && (
                  <Text className="text-3xl font-bold">
                    {formatPrice(
                      fromMinorUnits(
                        product.price.amountIncVat,
                        product.price.currency || 'NOK',
                      ),
                      product.price.currency || 'NOK',
                      locale,
                    )}
                  </Text>
                )}

                {/* Action Buttons */}
                <div className="mt-6 flex flex-col gap-3">
                  {product.slug && product.resourceId && (
                    <Link href={`/${locale}/c/produkter/${product.slug}--${product.resourceId}`}>
                      Les mer
                    </Link>
                  )}
                  <Button
                    onClick={() => handleOrder(product)}
                    disabled={isAdding}
                    variant="primary"
                    block
                    padding="px-6 py-3"
                  >
                    {isAdding ? 'Legger til...' : 'Bestill'}
                  </Button>
                </div>
          </ImageCard>
  );
      })}
    </Section>
  );
};
