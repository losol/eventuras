'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { formatPrice } from '@eventuras/core/currency';
import { Button } from '@eventuras/ratio-ui/core/Button';
import { Drawer } from '@eventuras/ratio-ui/layout/Drawer';

import { getCartProducts } from '@/app/(frontend)/[locale]/checkout/actions';
import { useCart } from '@/lib/cart';
import { calculateCartTotals, fromMinorUnits } from '@/lib/price';
import type { Product } from '@/payload-types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  locale: string;
}

export function CartDrawer({ isOpen, onClose, locale }: CartDrawerProps) {
  const { items, updateCartItem, removeFromCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      if (items.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      const result = await getCartProducts(items.map((item) => item.productId));

      if (result.success) {
        setProducts(result.data);
      }
      setLoading(false);
    }

    if (isOpen) {
      loadProducts();
    }
  }, [items, isOpen]);

  const cartWithProducts = items.map((item) => ({
    ...item,
    product: products.find((p) => p.id === item.productId),
  }));

  // Filter out items without products and calculate totals
  const validCartItems = cartWithProducts.filter((item) => item.product) as Array<{
    productId: string;
    quantity: number;
    product: Product;
  }>;

  const totals = calculateCartTotals(validCartItems);

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
            {cartWithProducts.map((item) => {
              const product = item.product;
              if (!product) return null;

              const priceIncVat = product.price?.amountIncVat || 0;
              const vatAmount = product.price?.vatAmount || 0;
              const currency = product.price?.currency || 'NOK';
              const lineTotalIncVat = priceIncVat * item.quantity;

              return (
                <div
                  key={item.productId}
                  className="flex gap-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">{product.title}</h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {formatPrice(fromMinorUnits(priceIncVat, currency), currency, locale)} (inkl mva{' '}
                      {formatPrice(fromMinorUnits(vatAmount, currency), currency, locale)})
                    </p>

                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={() => updateCartItem(item.productId, item.quantity - 1)}
                        className="rounded-md border border-gray-300 dark:border-gray-600 px-2 py-1 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateCartItem(item.productId, item.quantity + 1)}
                        className="rounded-md border border-gray-300 dark:border-gray-600 px-2 py-1 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Fjern
                    </button>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {formatPrice(fromMinorUnits(lineTotalIncVat, currency), currency, locale)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        inc. VAT
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Drawer.Body>

      {items.length > 0 && (
        <Drawer.Footer>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
              <span className="text-lg font-semibold text-gray-900 dark:text-white">Total</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatPrice(fromMinorUnits(totals.totalIncVat, totals.currency), totals.currency, locale)}
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
