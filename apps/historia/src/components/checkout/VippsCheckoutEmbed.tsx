'use client';

import { useEffect, useRef, useState } from 'react';

import { Logger } from '@eventuras/logger';

const logger = Logger.create({
  namespace: 'historia:checkout',
  context: { module: 'VippsCheckoutEmbed' },
});

interface VippsCheckoutEmbedProps {
  checkoutFrontendUrl: string;
  token: string;
  language?: string;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

declare global {
  interface Window {
    VippsCheckout?: (config: {
      checkoutFrontendUrl: string;
      iFrameContainerId: string;
      token: string;
      language?: string;
      on?: {
        shipping_option_selected?: (data: unknown) => void;
        total_amount_changed?: (data: unknown) => void;
        customer_information_changed?: (data: unknown) => void;
        session_status_changed?: (data: { status: string }) => void;
      };
    }) => void;
  }
}

export function VippsCheckoutEmbed({
  checkoutFrontendUrl,
  token,
  language = 'no',
  onComplete,
  onError,
}: VippsCheckoutEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load Vipps Checkout SDK
    const script = document.createElement('script');
    script.src = 'https://checkout.vipps.no/vippsCheckoutSDK.js';
    script.async = true;
    script.onload = () => {
      logger.info('Vipps Checkout SDK loaded');
      setScriptLoaded(true);
    };
    script.onerror = () => {
      const err = new Error('Failed to load Vipps Checkout SDK');
      logger.error({ error: err }, 'Failed to load SDK script');
      setError('Kunne ikke laste Vipps Checkout. Prøv igjen senere.');
      onError?.(err);
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [onError]);

  useEffect(() => {
    if (!scriptLoaded || !window.VippsCheckout) return;

    try {
      logger.info(
        { checkoutFrontendUrl, language },
        'Initializing Vipps Checkout',
      );

      window.VippsCheckout({
        checkoutFrontendUrl,
        iFrameContainerId: 'vipps-checkout-frame',
        token,
        language,
        on: {
          shipping_option_selected: (data) => {
            logger.info({ data }, 'Shipping option selected');
          },
          total_amount_changed: (data) => {
            logger.info({ data }, 'Total amount changed');
          },
          customer_information_changed: (data) => {
            logger.info({ data }, 'Customer information changed');
          },
          session_status_changed: (data) => {
            logger.info({ data }, 'Session status changed');
            if (data.status === 'PaymentSuccessful' || data.status === 'PaymentCompleted') {
              onComplete?.();
            }
          },
        },
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      logger.error({ error }, 'Failed to initialize Vipps Checkout');
      onError?.(error);
      // Use setTimeout to avoid setState during render
      setTimeout(() => {
        setError('Kunne ikke starte Vipps Checkout. Prøv igjen.');
      }, 0);
    }
  }, [scriptLoaded, checkoutFrontendUrl, token, language, onComplete, onError]);

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div
        id="vipps-checkout-frame"
        ref={containerRef}
        className="min-h-[600px] w-full"
      />
      {!scriptLoaded && (
        <div className="flex min-h-[600px] items-center justify-center">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-orange-500" />
            <p className="text-sm text-gray-600">Laster Vipps Checkout...</p>
          </div>
        </div>
      )}
    </div>
  );
}
