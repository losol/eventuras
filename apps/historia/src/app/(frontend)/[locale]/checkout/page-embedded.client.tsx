'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Logger } from '@eventuras/logger';
import { Error } from '@eventuras/ratio-ui/blocks/Error';
import { Button } from '@eventuras/ratio-ui/core/Button';
import { Container } from '@eventuras/ratio-ui/layout/Container';
import { Section } from '@eventuras/ratio-ui/layout/Section';
import { useToast } from '@eventuras/toast';

import { VippsCheckoutEmbed } from '@/components/checkout/VippsCheckoutEmbed';
import { useSessionCart } from '@/lib/cart/use-session-cart';
import type { Product } from '@/payload-types';

import { getCartProducts } from './actions';
import { createVippsCheckout } from './vippsActions';

const logger = Logger.create({
  namespace: 'historia:checkout',
  context: { module: 'CheckoutPageClient' },
});

interface CheckoutPageClientProps {
  locale: string;
}

export function CheckoutPageClient({ locale }: CheckoutPageClientProps) {
  const router = useRouter();
  const toast = useToast();
  const { items, clearCart } = useSessionCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkoutSession, setCheckoutSession] = useState<{
    checkoutFrontendUrl: string;
    token: string;
    reference: string;
  } | null>(null);

  // Load products
  useEffect(() => {
    async function loadProducts() {
      const productIds = items.map((item) => item.productId);
      const result = await getCartProducts(productIds);

      if (result.success) {
        logger.info({ count: result.data.length }, 'Products loaded successfully');
        setProducts(result.data);
      } else {
        logger.error({ error: result.error }, 'Failed to load products');
        toast.error('Kunne ikke laste produkter');
        setProducts([]);
      }

      setLoading(false);
      setProductsLoaded(true);
    }

    // Only load once
    if (items.length > 0 && !productsLoaded) {
      void loadProducts();
    } else if (items.length === 0) {
      // Use setTimeout to avoid setState during render
      setTimeout(() => setLoading(false), 0);
    }
  }, [items, toast, productsLoaded]);

  // Create Vipps Checkout session on mount
  useEffect(() => {
    async function createSession() {
      if (items.length === 0 || products.length === 0) return;

      try {
        logger.info({ itemCount: items.length }, 'Creating Vipps Checkout session');

        const totalInCents = items.reduce((sum, item) => {
          const product = products.find((p) => p.id === item.productId);
          if (!product || !product.price?.amount) return sum;
          return sum + Math.round(product.price.amount * 100) * item.quantity;
        }, 0);

        const result = await createVippsCheckout({
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
          logger.error({ error: result.error }, 'Failed to create checkout session');
          setCheckoutError(result.error.message);
          toast.error('Kunne ikke starte checkout. Prøv igjen.');
          return;
        }

        logger.info({ reference: result.data.reference }, 'Checkout session created');
        setCheckoutSession(result.data);
      } catch (error) {
        logger.error({ error }, 'Error creating checkout session');
        const errorMessage = error instanceof Error ? error.message : 'Ukjent feil';
        setCheckoutError(errorMessage);
        toast.error('Noe gikk galt. Prøv igjen senere.');
      }
    }

    // Only try once - stop if we have error or session
    if (!loading && products.length > 0 && !checkoutSession && !checkoutError) {
      void createSession();
    }
  }, [items, products, loading, locale, checkoutSession, checkoutError, toast]);

  const handleCheckoutComplete = () => {
    logger.info('Checkout completed successfully');
    clearCart();
    toast.success('Betaling fullført!');
    router.push(`/${locale}/checkout/vipps-callback?reference=${checkoutSession?.reference}`);
  };

  const handleCheckoutError = (error: Error) => {
    logger.error({ error }, 'Checkout error');
    toast.error('Noe gikk galt med betalingen. Prøv igjen.');
  };

  // Empty cart
  if (!loading && items.length === 0) {
    return (
      <Section>
        <Container>
          <div className="py-16 text-center">
            <h1 className="mb-4 text-2xl font-bold">Handlekurven er tom</h1>
            <p className="mb-8 text-gray-600">
              Legg til produkter i handlekurven for å fortsette.
            </p>
            <a
              href={`/${locale}`}
              className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
            >
              Gå til forsiden
            </a>
          </div>
        </Container>
      </Section>
    );
  }

  // Loading state
  if (loading) {
    return (
      <Section>
        <Container>
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
            <span className="ml-3 text-gray-600">Laster...</span>
          </div>
        </Container>
      </Section>
    );
  }

  // Don't render if products aren't loaded yet
  if (items.length > 0 && products.length === 0) {
    return (
      <Section>
        <Container>
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
            <span className="ml-3 text-gray-600">Henter produkter...</span>
          </div>
        </Container>
      </Section>
    );
  }

  return (
    <Section>
      <Container>
        <div className="py-8">
          <h1 className="mb-6 text-3xl font-bold">Checkout</h1>

          {checkoutError ? (
            <Error type="server-error" tone="error">
              <Error.Title>Kunne ikke starte checkout</Error.Title>
              <Error.Description>{checkoutError}</Error.Description>
              <Error.Actions>
                <Button
                  onClick={() => {
                    setCheckoutError(null);
                    window.location.reload();
                  }}
                  variant="primary"
                >
                  Prøv igjen
                </Button>
              </Error.Actions>
            </Error>
          ) : checkoutSession ? (
            <VippsCheckoutEmbed
              checkoutFrontendUrl={checkoutSession.checkoutFrontendUrl}
              token={checkoutSession.token}
              language={locale}
              onComplete={handleCheckoutComplete}
              onError={handleCheckoutError}
            />
          ) : (
            <div className="flex min-h-[600px] items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
              <div className="text-center">
                <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-orange-500" />
                <p className="text-sm text-gray-600">Starter checkout...</p>
              </div>
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
}
