'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { formatPrice } from '@eventuras/core/currency';
import { CartLineItem } from '@eventuras/ratio-ui/commerce/CartLineItem';
import { Button } from '@eventuras/ratio-ui/core/Button';
import { NumberField } from '@eventuras/ratio-ui/forms';
import { Drawer } from '@eventuras/ratio-ui/layout/Drawer';

import {
  calculateCart,
  type CartSummary,
} from '@/app/(frontend)/[locale]/checkout/actions';
import { useCart } from '@/lib/cart';
import { fromMinorUnits } from '@/lib/price';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  locale: string;
}

export function CartDrawer({ isOpen, onClose, locale }: CartDrawerProps) {
  const { items, updateCartItem, removeFromCart } = useCart();
  const [cartSummary, setCartSummary] = useState<CartSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCart() {
      if (items.length === 0) {
        setCartSummary(null);
        setLoading(false);
        return;
      }

      const result = await calculateCart(items);

      if (result.success) {
        setCartSummary(result.data);
      }
      setLoading(false);
    }

    if (isOpen) {
      loadCart();
    }
  }, [items, isOpen]);



  return (
    <Drawer isOpen={isOpen} onCancel={onClose}>
      <Drawer.Header as="h2">Handlekurv</Drawer.Header>

      <Drawer.Body>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
            <span className="ml-3 text-gray-600">Laster...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="py-12 text-center">
            <svg
              className="mx-auto mb-4 h-16 w-16 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <p className="mb-4 text-lg font-medium text-gray-900">Handlekurven er tom</p>
            <p className="text-gray-600">Legg til produkter for å komme i gang</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cartSummary?.items.map((item) => (
              <div
                key={item.productId}
                className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4"
              >
                <CartLineItem
                  item={{
                    productId: item.productId,
                    title: item.title,
                    quantity: item.quantity,
                    pricePerUnitIncVat: fromMinorUnits(item.pricePerUnitIncVat, item.currency),
                    vatAmount: fromMinorUnits(item.vatAmount, item.currency),
                    lineTotalIncVat: fromMinorUnits(item.lineTotalIncVat, item.currency),
                    currency: item.currency,
                  }}
                  locale={locale}
                  formatPrice={formatPrice}
                  showQuantityControls
                  onQuantityChange={updateCartItem}
                  onRemove={removeFromCart}
                  testIdPrefix="cartdrawer"
                  QuantityField={NumberField}
                />
              </div>
            ))}
          </div>
        )}
      </Drawer.Body>

      {items.length > 0 && cartSummary && (
        <Drawer.Footer>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
              <span className="text-lg font-semibold text-gray-900 dark:text-white">Total</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatPrice(fromMinorUnits(cartSummary.totalIncVat, cartSummary.currency), cartSummary.currency, locale)}
              </span>
            </div>

            <Link href={`/${locale}/checkout`} onClick={onClose}>
              <Button variant="primary" block>
                Gå til kassen
              </Button>
            </Link>

            <Link href={`/${locale}/products`} onClick={onClose}>
              <Button variant="outline" block>
                Fortsett å handle
              </Button>
            </Link>
          </div>
        </Drawer.Footer>
      )}
    </Drawer>
  );
}
