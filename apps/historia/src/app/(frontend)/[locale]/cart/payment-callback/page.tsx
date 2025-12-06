'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { Logger } from '@eventuras/logger';

const logger = Logger.create({
  namespace: 'historia:payment',
  context: { module: 'PaymentCallback' },
});

export default function PaymentCallbackPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing payment...');

  useEffect(() => {
    const reference = searchParams.get('reference');

    if (!reference) {
      logger.error('No payment reference in callback URL');
      // Use setTimeout to avoid setState in render
      setTimeout(() => {
        setStatus('error');
        setMessage('Invalid payment callback - no reference found');
      }, 0);
      return;
    }

    logger.info({ reference }, 'Payment callback received');

    // TODO: Implement payment verification
    // 1. Fetch payment details from Vipps API
    // 2. Verify payment status
    // 3. Create order with shipping details
    // 4. Send confirmation email

    // Placeholder
    setTimeout(() => {
      setStatus('success');
      setMessage('Payment received! Processing your order...');
    }, 2000);
  }, [searchParams]);

  return (
    <div className="container mx-auto max-w-2xl px-4 py-16">
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
        {status === 'loading' && (
          <>
            <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
            <h1 className="mb-2 text-2xl font-bold">Processing Payment</h1>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="mb-2 text-2xl font-bold text-green-600">Payment Successful!</h1>
            <p className="mb-6 text-gray-600">{message}</p>
            <div className="space-y-2">
              <Link
                href="/no/products"
                className="block rounded-md bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
              >
                Continue Shopping
              </Link>
              <p className="text-sm text-gray-500">
                You will receive a confirmation email shortly.
              </p>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <svg
                className="h-8 w-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="mb-2 text-2xl font-bold text-red-600">Payment Failed</h1>
            <p className="mb-6 text-gray-600">{message}</p>
            <div className="space-y-2">
              <Link
                href="/no/cart"
                className="block rounded-md bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
              >
                Return to Cart
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
