'use client';

import { useEffect, useState } from 'react';

import { formatPrice } from '@eventuras/core/currency';
import { Logger } from '@eventuras/logger';
import { CartLineItem } from '@eventuras/ratio-ui/commerce/CartLineItem';
import { OrderSummary } from '@eventuras/ratio-ui/commerce/OrderSummary';
import { Button } from '@eventuras/ratio-ui/core/Button';
import { Card } from '@eventuras/ratio-ui/core/Card';
import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Loading } from '@eventuras/ratio-ui/core/Loading';
import { NumberField } from '@eventuras/ratio-ui/forms';
import { Container } from '@eventuras/ratio-ui/layout/Container';
import { useToast } from '@eventuras/toast';
import type { PaymentDetails } from '@eventuras/vipps/epayment-v1';

import { useCart } from '@/lib/cart';
import { fromMinorUnits } from '@/lib/price';

import {
  calculateCart,
  type CartSummary,
  checkPendingPayment,
  createVippsPayment,
  validateCartProducts,
} from './actions';

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
  const [pendingPayment, setPendingPayment] = useState<PaymentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

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

  // Validate cart products on mount and remove invalid ones
  useEffect(() => {
    async function validateAndCleanCart() {
      if (items.length === 0) return;

      const result = await validateCartProducts(items);

      if (result.success && result.data.invalidProductIds.length > 0) {
        const invalidCount = result.data.invalidProductIds.length;

        logger.warn(
          {
            invalidProductIds: result.data.invalidProductIds,
            invalidCount,
          },
          'Removing invalid products from cart'
        );

        // Remove invalid products from cart
        for (const productId of result.data.invalidProductIds) {
          removeFromCart(productId);
        }

        // Show notification to user
        toast.info(
          `${invalidCount} product${invalidCount > 1 ? 's' : ''} ${invalidCount > 1 ? 'are' : 'is'} no longer available and ${invalidCount > 1 ? 'have' : 'has'} been removed from your cart.`
        );
      }
    }

    validateAndCleanCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refresh cart on mount to ensure we have the latest data
  useEffect(() => {
    logger.info('Refreshing cart on checkout page mount');
    refreshCart();

    // Check for pending payment
    async function checkPending() {
      const result = await checkPendingPayment();
      if (result.success && result.data) {
        logger.info(
          {
            reference: result.data.reference,
            state: result.data.state,
          },
          'Found pending payment'
        );
        setPendingPayment(result.data);
      }
    }

    checkPending();
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
      <Loading />
    );
  }

  return (
  <Container className='p-3'>
        {/* Header */}
        <Heading as="h1" padding="pb-6">
          Kasse
        </Heading>

        {/* Pending Payment Notice */}
        {pendingPayment && (
          <Card className="mb-6 border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-900/10">
            <div className="flex items-start gap-3">
              <svg className="h-6 w-6 flex-shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="flex-1">
                <Heading as="h3" padding="pt-0 pb-2" className="text-amber-800 dark:text-amber-200">
                  Du har en påbegynt betaling
                </Heading>
                <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
                  Vi fant en eksisterende betaling for denne handlekurven.
                  {pendingPayment.state === 'CREATED' && ' Betalingen er ikke fullført ennå.'}
                  {pendingPayment.state === 'AUTHORIZED' && ' Betalingen er godkjent og venter på behandling.'}
                </p>
                <div className="flex gap-2">
                  <a
                    href={`/${locale}/checkout/vipps?reference=${pendingPayment.reference}`}
                    className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                  >
                    Sjekk betalingsstatus
                  </a>
                  <Button
                    onClick={() => setPendingPayment(null)}
                    variant="outline"
                  >
                    Ignorer og opprett ny
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

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
            {cart && (
              <OrderSummary
                summary={{
                  items: cart.items.map(item => ({
                    productId: item.productId,
                    title: item.title,
                    quantity: item.quantity,
                    pricePerUnitIncVat: fromMinorUnits(item.pricePerUnitIncVat, item.currency),
                    vatAmount: fromMinorUnits(item.vatAmount, item.currency),
                    lineTotalIncVat: fromMinorUnits(item.lineTotalIncVat, item.currency),
                    currency: item.currency,
                  })),
                  subtotalExVat: fromMinorUnits(cart.subtotalExVat, cart.currency),
                  totalVat: fromMinorUnits(cart.totalVat, cart.currency),
                  totalIncVat: fromMinorUnits(cart.totalIncVat, cart.currency),
                  currency: cart.currency,
                }}
                locale={locale}
                formatPrice={formatPrice}
                title="Ordresammendrag"
                showVatBreakdown
              >
                {cart.items.map((item) => (
                  <CartLineItem
                    key={item.productId}
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
                    testIdPrefix="checkout"
                    QuantityField={NumberField}
                  />
                ))}
              </OrderSummary>
            )}

          <Button
            onClick={handleVippsCheckout}
            loading={submitting}
            block
          >
            Kjøp nå med Vipps
          </Button>
        </div>
      )}
    </Container>
  );
}
