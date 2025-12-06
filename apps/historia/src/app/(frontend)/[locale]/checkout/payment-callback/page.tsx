'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { Logger } from '@eventuras/logger';

import { useCart } from '@/lib/cart';

import {
  createOrderFromPayment,
  verifyVippsPayment,
} from './actions';

const logger = Logger.create({
  namespace: 'historia:payment',
  context: { module: 'PaymentCallback' },
});

export default function PaymentCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { items, clearCart } = useCart();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing payment...');
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    const reference = searchParams.get('reference');

    if (!reference) {
      logger.error('No payment reference in callback URL');
      // Wrap in setTimeout to avoid setState in render
      setTimeout(() => {
        setStatus('error');
        setMessage('Invalid payment callback - no reference found');
      }, 0);
      return;
    }

    async function processPayment() {
      if (!reference) return;

      try {
        logger.info({ reference }, 'Payment callback received');

        // Step 1: Verify payment with Vipps
        const paymentResult = await verifyVippsPayment(reference);

        if (!paymentResult.success) {
          logger.error(
            { reference, error: paymentResult.error },
            'Payment verification failed',
          );
          setStatus('error');
          setMessage(paymentResult.error.message);
          return;
        }

        const paymentDetails = paymentResult.data;

        // Check if payment is successful
        if (paymentDetails.state !== 'AUTHORIZED') {
          logger.warn(
            { reference, state: paymentDetails.state },
            'Payment not authorized',
          );
          setStatus('error');
          setMessage(`Payment ${paymentDetails.state.toLowerCase()}. Please try again.`);
          return;
        }

        // Step 2: Create order and transaction
        // TODO: Get actual user ID and email from auth session
        const userId = 'temp-user-id'; // Replace with actual user ID from session
        const userEmail =
          paymentDetails.profile?.email || 'temp@example.com'; // From Vipps profile

        const orderResult = await createOrderFromPayment({
          paymentReference: reference,
          items: items,
          paymentDetails: paymentDetails,
          userId,
          userEmail,
        });

        if (!orderResult.success) {
          logger.error(
            { reference, error: orderResult.error },
            'Order creation failed',
          );
          setStatus('error');
          setMessage('Failed to create order. Please contact support.');
          return;
        }

        logger.info(
          { reference, orderId: orderResult.data.orderId },
          'Order created successfully',
        );

        // Step 3: Clear cart
        clearCart();

        // Step 4: Show success
        setOrderId(orderResult.data.orderId);
        setStatus('success');
        setMessage('Your order has been confirmed!');
      } catch (error) {
        logger.error({ reference, error }, 'Unexpected error processing payment');
        setStatus('error');
        setMessage('An unexpected error occurred. Please contact support.');
      }
    }

    processPayment();
  }, [searchParams, items, clearCart]);

  return (
    <div className="container mx-auto max-w-2xl px-4 py-16">
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8 text-center">
        {status === 'loading' && (
          <>
            <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-gray-200 dark:border-gray-700 border-t-blue-600 dark:border-t-blue-400" />
            <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
              Processing Payment
            </h1>
            <p className="text-gray-600 dark:text-gray-400">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
              <svg
                className="h-8 w-8 text-green-600 dark:text-green-400"
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
            <h1 className="mb-2 text-2xl font-bold text-green-600 dark:text-green-400">
              Payment Successful!
            </h1>
            <p className="mb-6 text-gray-600 dark:text-gray-400">{message}</p>
            {orderId && (
              <p className="mb-6 text-sm text-gray-500 dark:text-gray-500">
                Order ID: {orderId}
              </p>
            )}
            <div className="space-y-2">
              <button
                onClick={() => router.push('/no/products')}
                className="block w-full rounded-md bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 transition-colors"
              >
                Continue Shopping
              </button>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                You will receive a confirmation email shortly.
              </p>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <svg
                className="h-8 w-8 text-red-600 dark:text-red-400"
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
            <h1 className="mb-2 text-2xl font-bold text-red-600 dark:text-red-400">
              Payment Failed
            </h1>
            <p className="mb-6 text-gray-600 dark:text-gray-400">{message}</p>
            <div className="space-y-2">
              <button
                onClick={() => router.push('/no/cart')}
                className="block w-full rounded-md bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 transition-colors"
              >
                Return to Cart
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
