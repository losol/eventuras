'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Logger } from '@eventuras/logger';
import { useToast } from '@eventuras/toast';

import { VippsCheckoutEmbed } from '@/components/checkout/VippsCheckoutEmbed';
import { useCart } from '@/lib/cart';
import { formatPrice } from '@/lib/format-price';
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
  const { items, clearCart } = useCart();
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
    router.push(`/${locale}/checkout/confirmation?reference=${checkoutSession?.reference}`);
  };

  const handleCheckoutError = (error: Error) => {
    logger.error({ error }, 'Checkout error');
    toast.error('Noe gikk galt med betalingen. Prøv igjen.');
  };

  // Empty cart
  if (!loading && items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
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
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <div className="flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
          <span className="ml-3 text-gray-600">Laster...</span>
        </div>
      </div>
    );
  }

  // Don't render if products aren't loaded yet
  if (items.length > 0 && products.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <div className="flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
          <span className="ml-3 text-gray-600">Henter produkter...</span>
        </div>
      </div>
    );
  }

  // Calculate total - guard against products not being loaded yet
  const totalInCents = Array.isArray(products) ? items.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId);
    if (!product || !product.price?.amount) return sum;
    return sum + Math.round(product.price.amount * 100) * item.quantity;
  }, 0) : 0;
  const totalWithVat = totalInCents / 100;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Checkout</h1>
        <p className="mt-2 text-gray-600">
          Fullfør kjøpet ditt med Vipps
        </p>
      </div>

      {/* Compact Order Summary at Top */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Din handlekurv</h2>
            <div className="text-right">
              <div className="text-sm text-gray-600">
                {items.length} {items.length === 1 ? 'produkt' : 'produkter'}
              </div>
              <div className="text-xl font-bold">{formatPrice(totalWithVat)}</div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4">
          <div className="space-y-3">
            {Array.isArray(products) && items.map((item) => {
              const product = products.find((p) => p.id === item.productId);
              if (!product) return null;

              const price = product.price?.amount || 0;
              const total = price * item.quantity;

              return (
                <div key={item.productId} className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{product.title}</p>
                    <p className="text-sm text-gray-500">
                      {item.quantity} × {formatPrice(price)}
                    </p>
                  </div>
                  <p className="font-medium text-gray-900">{formatPrice(total)}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-4 rounded-lg bg-blue-50 p-3">
            <p className="text-xs text-blue-800">
              💡 <strong>Digitale produkter:</strong> Ingen frakt. Du får tilgang umiddelbart etter kjøp.
            </p>
          </div>
        </div>
      </div>

      {/* Vipps Checkout Embed */}
      <div>
        {checkoutError ? (
          <div className="flex min-h-[600px] items-center justify-center rounded-lg border border-red-200 bg-red-50">
            <div className="text-center max-w-md p-8">
              <div className="mb-4 text-red-600">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-red-900">Kunne ikke starte checkout</h3>
              <p className="text-sm text-red-700 mb-4">{checkoutError}</p>
              <button
                onClick={() => {
                  setCheckoutError(null);
                  window.location.reload();
                }}
                className="rounded-lg bg-red-600 px-6 py-2 text-white hover:bg-red-700"
              >
                Prøv igjen
              </button>
            </div>
          </div>
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
    </div>
  );
}
