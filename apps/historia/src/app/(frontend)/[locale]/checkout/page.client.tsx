'use client';

import { useEffect, useState } from 'react';

import { formatPrice } from '@eventuras/core/currency';
import { Logger } from '@eventuras/logger';
import { Button } from '@eventuras/ratio-ui/core/Button';
import { Card } from '@eventuras/ratio-ui/core/Card';
import { Heading } from '@eventuras/ratio-ui/core/Heading';

import { useCart } from '@/lib/cart';
import { fromMinorUnits } from '@/lib/price';

import { calculateCart, type CartSummary } from './actions';
import { createVippsPayment } from './vippsActions';

const logger = Logger.create({
  namespace: 'historia:checkout',
  context: { module: 'CheckoutPageClient' },
});

interface CheckoutPageClientProps {
  locale: string;
}

export function CheckoutPageClient({ locale }: CheckoutPageClientProps) {
  const { items, updateCartItem, removeFromCart, loading: cartLoading, refreshCart } = useCart();
  const [cart, setCart] = useState<CartSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Log cart state for debugging
  useEffect(() => {
    logger.info(
      {
        itemCount: items.length,
        items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        cartLoading,
        loading,
      },
      'Cart state on checkout page'
    );
  }, [items, cartLoading, loading]);

  // Refresh cart on mount to ensure we have the latest data
  useEffect(() => {
    logger.info('Refreshing cart on checkout page mount');
    refreshCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load cart summary from server
  useEffect(() => {
    async function loadCart() {
      if (items.length === 0) {
        setCart(null);
        setLoading(false);
        return;
      }

      const result = await calculateCart(items);

      if (result.success) {
        setCart(result.data);
      } else {
        logger.error({ error: result.error }, 'Failed to load cart');
      }
      setLoading(false);
    }

    loadCart();
  }, [items]);

  const handleVippsCheckout = async () => {
    setSubmitting(true);

    try {
      const result = await createVippsPayment({
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
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

        {items.length === 0 ? (
          <Card>
            <div className="py-12 text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Handlekurven din er tom
              </p>
              <a
                href={`/${locale}`}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline"
              >
                Fortsett å handle
              </a>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <Heading as="h2" padding="pb-4">
                Ordresammendrag
              </Heading>

              {/* Products */}
              <div className="space-y-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                {cart?.items.map((item) => {

                  return (
                    <div key={item.productId} className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {item.title}
                        </p>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {item.quantity} x {formatPrice(fromMinorUnits(item.pricePerUnitIncVat, item.currency), item.currency, locale)} (inkl mva {formatPrice(fromMinorUnits(item.vatAmount, item.currency), item.currency, locale)})
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
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                          {formatPrice(fromMinorUnits(item.lineTotalIncVat, item.currency), item.currency, locale)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          inkl. mva
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Price breakdown */}
            <div className="space-y-3 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Delsum (ekskl. mva)</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {cart && formatPrice(fromMinorUnits(cart.subtotalExVat, cart.currency), cart.currency, locale)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">MVA</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {cart && formatPrice(fromMinorUnits(cart.totalVat, cart.currency), cart.currency, locale)}
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
                {cart && formatPrice(fromMinorUnits(cart.totalIncVat, cart.currency), cart.currency, locale)}
              </span>
            </div>
          </Card>

          <Button
            onClick={handleVippsCheckout}
            loading={submitting}
            block
          >
            Betal med Vipps
          </Button>
        </div>
        )}
      </div>
    </div>
  );
}
