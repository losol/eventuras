'use client';

import { useRouter } from 'next/navigation';

import { formatPrice } from '@eventuras/core/currency';
import { Button } from '@eventuras/ratio-ui/core/Button';
import { NumberField } from '@eventuras/ratio-ui/forms';

import { useCart } from '@/lib/cart';
import { fromMinorUnits } from '@/lib/price';
import type { Product } from '@/payload-types';

interface ProductActionsProps {
  product: Product;
  locale: string;
}

export function ProductActions({ product, locale }: ProductActionsProps) {
  const { addToCart, updateCartItem, removeFromCart, items } = useCart();
  const router = useRouter();

  const cartItem = items.find((item) => item.productId === product.id);
  const quantityInCart = cartItem?.quantity || 0;

  const handleAddToCart = () => {
    addToCart(product.id, 1);
  };

  const handleGoToCheckout = () => {
    router.push(`/${locale}/checkout`);
  };

  return (
    <div className="my-8 space-y-4">
      {product.price?.amountIncVat && (
        <div>
          <span className="text-3xl font-bold text-gray-900 dark:text-white">
            {formatPrice(
              fromMinorUnits(product.price.amountIncVat, product.price.currency || 'NOK'),
              product.price.currency || 'NOK',
              locale
            )}
          </span>
        </div>
      )}

      {quantityInCart > 0 ? (
        <div className="flex items-center gap-3">
          <NumberField
            value={quantityInCart}
            variant="segmented"
            size="sm"
            minValue={0}
            onChange={(nextQuantity: number) => {
              if (nextQuantity === 0) {
                removeFromCart(product.id);
                return;
              }
              updateCartItem(product.id, nextQuantity);
            }}
            decrementAriaLabel="Fjern en"
            incrementAriaLabel="Legg til en"
            aria-label="Antall"
            testId={`productactions-quantity-${product.id}`}
          />
          <Button onClick={handleGoToCheckout} variant="primary" className="flex-1" padding="px-6 py-3">
            Gå til handlekurv
          </Button>
        </div>
      ) : (
        <Button onClick={handleAddToCart} variant="primary" block padding="px-6 py-3">
          Legg i handlekurv
        </Button>
      )}
    </div>
  );
}
