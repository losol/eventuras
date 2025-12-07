'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { VippsButton } from '@eventuras/ratio-ui/core/Button';
import { Card } from '@eventuras/ratio-ui/core/Card';
import { Heading } from '@eventuras/ratio-ui/core/Heading';

import { useCart } from '@/lib/cart';
import { formatPrice } from '@/lib/format-price';
import type { Product } from '@/payload-types';

import { getCartProducts } from './actions';
import { createVippsPayment } from './vippsActions';

interface CheckoutPageClientProps {
  locale: string;
}

export function CheckoutPageClient({ locale }: CheckoutPageClientProps) {
  const router = useRouter();
  const { items, updateCartItem, removeFromCart, loading: cartLoading } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Load products
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

    loadProducts();
  }, [items]);

  // Redirect if cart is empty (but wait for both cart and products to load)
  useEffect(() => {
    if (!cartLoading && !loading && items.length === 0) {
      router.push(`/${locale}/cart`);
    }
  }, [cartLoading, loading, items.length, locale, router]);

  const cartWithProducts = items.map((item) => ({
    ...item,
    product: products.find((p) => p.id === item.productId),
  }));

  // Calculate total - price.amount is in NOK, convert to øre for Vipps
  const totalInCents = cartWithProducts.reduce((sum, item) => {
    const price = item.product?.price?.amount || 0;
    return sum + price * item.quantity * 100;
  }, 0);

  const handleVippsCheckout = async () => {
    setSubmitting(true);

    try {
      const result = await createVippsPayment({
        amount: totalInCents,
        currency: 'NOK',
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        products,
        userLanguage: locale,
      });

      if (!result.success) {
        alert(`Betalingsfeil: ${result.error.message}`);
        setSubmitting(false);
        return;
      }

      // Redirect to Vipps
      if (result.data.redirectUrl) {
        window.location.assign(result.data.redirectUrl);
      } else {
        alert('Ingen redirect URL mottatt');
        setSubmitting(false);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('En uventet feil oppstod');
      setSubmitting(false);
    }
  };

  if (loading || cartLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">Laster...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto max-w-4xl px-4 py-6 sm:py-8">
        {/* Header */}
        <Heading as="h1" padding="pb-6">
          Kasse
        </Heading>

        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <Heading as="h2" padding="pb-4">
              Ordresammendrag
            </Heading>

            {/* Products */}
            <div className="space-y-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
              {cartWithProducts.map((item) => {
                const product = item.product;
                if (!product) return null;

                const price = product.price?.amount || 0;
                const total = price * item.quantity;

                return (
                  <div key={item.productId} className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {product.title}
                      </p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {formatPrice(price, 'NOK', locale)} per stk
                      </p>

                      {/* Quantity controls */}
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (item.quantity > 1) {
                              updateCartItem(item.productId, item.quantity - 1);
                            } else {
                              removeFromCart(item.productId);
                            }
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          aria-label="Reduser antall"
                        >
                          {item.quantity === 1 ? (
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          ) : (
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          )}
                        </button>
                        <span className="min-w-[2rem] text-center text-sm font-medium text-gray-900 dark:text-white">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCartItem(item.productId, item.quantity + 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          aria-label="Øk antall"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                      {formatPrice(total, 'NOK', locale)}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Price breakdown */}
            <div className="space-y-3 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Delsum (ekskl. mva)</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatPrice((totalInCents / 100) / 1.25, 'NOK', locale)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">MVA (25%)</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatPrice((totalInCents / 100) - (totalInCents / 100) / 1.25, 'NOK', locale)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Frakt</span>
                <span className="text-gray-600 dark:text-gray-400">Beregnes senere</span>
              </div>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-base font-semibold text-gray-900 dark:text-white">Total</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatPrice(totalInCents / 100, 'NOK', locale)}
              </span>
            </div>
          </Card>

          <VippsButton
            onClick={handleVippsCheckout}
            loading={submitting}
            locale={locale}
            block
            testId="vipps-checkout-button"
          />



        </div>
      </div>
    </div>
  );
}
