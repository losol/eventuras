'use client';

import { useRouter } from 'next/navigation';

import { formatPrice } from '@eventuras/core/currency';
import { Button } from '@eventuras/ratio-ui/core/Button';
import { Text } from '@eventuras/ratio-ui/core/Text';

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

  const handleDecreaseQuantity = () => {
    if (quantityInCart > 1) {
      updateCartItem(product.id, quantityInCart - 1);
    } else {
      removeFromCart(product.id);
    }
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
          <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
            <button
              onClick={handleDecreaseQuantity}
              className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Fjern en"
            >
              <Text className="text-xl font-semibold">−</Text>
            </button>
            <div className="px-6 py-3 border-x border-gray-300 dark:border-gray-600">
              <Text className="font-semibold">{quantityInCart}</Text>
            </div>
            <button
              onClick={handleAddToCart}
              className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Legg til en"
            >
              <Text className="text-xl font-semibold">+</Text>
            </button>
          </div>
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
