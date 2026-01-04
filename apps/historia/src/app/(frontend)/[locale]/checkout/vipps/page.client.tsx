'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { Logger } from '@eventuras/logger';
import { Error } from '@eventuras/ratio-ui/blocks/Error';
import { Button } from '@eventuras/ratio-ui/core/Button';
import { Card } from '@eventuras/ratio-ui/core/Card';
import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { List } from '@eventuras/ratio-ui/core/List';
import { Loading } from '@eventuras/ratio-ui/core/Loading';
import { Text } from '@eventuras/ratio-ui/core/Text';
import { Container } from '@eventuras/ratio-ui/layout/Container';
import { useToast } from '@eventuras/toast';

import { PaymentStatusSSE } from '@/components/payment/PaymentStatusSSE';
import { useSessionCart } from '@/lib/cart/use-session-cart';

import { checkExistingOrder, processPaymentAndCreateOrder } from './actions';
import { createPaymentFailureEvent } from './businessEvents';

const logger = Logger.create({
  namespace: 'historia:payment',
  context: { module: 'VippsCheckout' },
});

interface OrderDetails {
  orderId: string;
  userEmail: string;
  shippingAddress?: {
    addressLine1?: string;
    addressLine2?: string;
    postalCode?: string;
    city?: string;
    country?: string;
  };
}

type PageState = 'waiting' | 'processing' | 'success' | 'error';

/**
 * Unified Vipps checkout page
 *
 * Handles the complete payment flow:
 * 1. User returns from Vipps → Shows "waiting" state with SSE
 * 2. SSE detects payment confirmed → Switches to "processing" (creates order)
 * 3. Order created successfully → Shows "success" state
 * 4. Any error → Shows "error" state
 */
export default function VippsCheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const toast = useToast();
  const { clearCart } = useSessionCart();

  const [state, setState] = useState<PageState>('waiting');
  const [message, setMessage] = useState('');
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const processingRef = useRef(false);

  const reference = searchParams.get('reference');

  // Check if order already exists on mount (handles page revisits)
  useEffect(() => {
    if (!reference) return;

    let mounted = true;

    const checkOrder = async () => {
      logger.info({ reference }, 'Checking for existing order on mount');

      const result = await checkExistingOrder(reference);

      if (!mounted) return;

      // Handle unauthorized access
      if (!result.success) {
        logger.warn({ reference, error: result.error }, 'Unauthorized access to payment');
        setState('error');
        setMessage('Du har ikke tilgang til denne betalingen.');
        return;
      }

      if (result.data.exists) {
        logger.info(
          { reference, orderId: result.data.orderId },
          'Order already exists, skipping SSE'
        );

        // Clear cart
        clearCart();

        // Show success immediately
        setOrderDetails({
          orderId: result.data.orderId!,
          userEmail: result.data.userEmail || '',
          shippingAddress: result.data.shippingAddress,
        });

        setState('success');
        // Don't toast on revisit - user already knows order exists
      } else {
        logger.info({ reference }, 'No existing order, starting SSE monitoring');
      }
    };

    checkOrder();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference]);

  // Handle payment status change from SSE
  // CRITICAL: useCallback to prevent EventSource recreation on every render
  const handlePaymentStatusChange = React.useCallback(async (status: string) => {
    // Log to both console and logger to ensure visibility
    console.log('🔔 [CLIENT] handlePaymentStatusChange called with status:', status);
    console.log('🔔 [CLIENT] reference:', reference);
    console.log('🔔 [CLIENT] Current state:', { currentState: state, processingFlag: processingRef.current });

    logger.info({ reference, status, currentState: state }, '🔔 Payment status changed via SSE');

    // Only process if payment is captured/authorized
    if (status === 'captured' || status === 'authorized') {
      console.log('✅ [CLIENT] Status is captured/authorized, will process');

      // Prevent duplicate processing
      if (processingRef.current) {
        console.log('⚠️ [CLIENT] Already processing, skipping');
        logger.warn({ reference }, 'Already processing payment');
        return;
      }

      console.log('🚀 [CLIENT] Setting processing flag and calling server action');
      processingRef.current = true;

      setState('processing');
      setMessage('Oppretter ordre...');

      try {
        console.log('📞 [CLIENT] Calling processPaymentAndCreateOrder with reference:', reference);

        // Call server action to process payment and create order
        const orderResult = await processPaymentAndCreateOrder(reference!);

        console.log('📬 [CLIENT] Received response from server action:', orderResult);

        if (!orderResult.success) {
          logger.error(
            { reference, error: orderResult.error },
            'Order creation failed',
          );
          setState('error');
          // Show user-friendly message, log technical details
          const userMessage = orderResult.error.message.includes('Cart is empty')
            ? 'Handlekurven er tom. Vennligst start en ny bestilling.'
            : orderResult.error.message.includes('not found')
              ? 'Noen produkter er ikke lenger tilgjengelige. Vennligst start en ny bestilling.'
              : orderResult.error.message.includes('amount')
                ? 'Betalingsbeløpet stemmer ikke. Vennligst kontakt support med referanse: ' + reference
                : 'Kunne ikke opprette ordre. Vennligst kontakt support hvis beløpet er trukket.';
          setMessage(userMessage);
          toast.error(userMessage);
          return;
        }

        logger.info(
          { reference, orderId: orderResult.data.orderId },
          'Order created successfully',
        );

        // Clear cart
        clearCart();

        // Show success
        setOrderDetails({
          orderId: orderResult.data.orderId,
          userEmail: orderResult.data.userEmail,
          shippingAddress: orderResult.data.shippingAddress,
        });

        setState('success');
        // Success state is clear from UI, no need for toast
      } catch (error) {
        logger.error({ reference, error }, 'Unexpected error creating order');
        setState('error');
        setMessage('En uventet feil oppstod. Vennligst kontakt support med referanse: ' + reference);
        // Error already shown in UI, only toast for critical issues
      }
    } else if (status.startsWith('failed:')) {
      // Parse failure reason from status string
      const failureReason = status.split(':')[1];

      logger.warn(
        { reference, status, failureReason },
        'Payment failed with reason'
      );

      // Create business event for analytics
      createPaymentFailureEvent(reference!, failureReason).catch((error) => {
        logger.error({ reference, failureReason, error }, 'Failed to create business event');
        // Don't show error to user - this is analytics only
      });

      // Map failure reasons to user-friendly messages
      let userMessage = 'Betalingen ble avbrutt eller feilet.';

      switch (failureReason) {
        case 'aborted':
          userMessage = 'Betalingen ble avbrutt. Dette kan skyldes avslått kort, utilstrekkelige midler eller andre kortproblemer.';
          break;
        case 'expired':
          userMessage = 'Betalingssesjonen har utløpt. Vennligst prøv igjen.';
          break;
        case 'terminated':
          userMessage = 'Betalingen ble avsluttet. Vennligst prøv igjen.';
          break;
      }

      setState('error');
      setMessage(userMessage + ' Ingen beløp er trukket.');
    } else if (status === 'failed' || status === 'cancelled') {
      logger.warn({ reference, status }, 'Payment failed without specific reason');

      // Create business event for analytics (no specific reason)
      createPaymentFailureEvent(reference!, 'unknown').catch((error) => {
        logger.error({ reference, error }, 'Failed to create business event');
      });

      setState('error');
      setMessage('Betalingen ble avbrutt eller feilet. Ingen beløp er trukket.');
    }
  }, [reference, clearCart, toast]);

  // Validate reference on mount
  if (!reference) {
    return (
      <Container padding="px-4 py-16">
        <div className="mx-auto max-w-2xl">
          <Card>
            <Error tone="error" type="generic">
              <Error.Title>Ugyldig betalingsreferanse</Error.Title>
              <Error.Description>
                Betalingsreferansen mangler eller er ugyldig.
              </Error.Description>
              <Error.Actions>
                <Button onClick={() => router.push('/no')} variant="primary">
                  Tilbake til forsiden
                </Button>
              </Error.Actions>
            </Error>
          </Card>
        </div>
      </Container>
    );
  }

  return (
    <Container padding="px-4 py-16">
      <div className="mx-auto max-w-2xl">
        <Card>
          {/* WAITING STATE - Waiting for payment confirmation */}
          {state === 'waiting' && (
            <div className="text-center py-8">
              <Heading as="h1" className="mb-4">
                Venter på bekreftelse
              </Heading>

              <Text className="mb-6 text-gray-600 dark:text-gray-400">
                Vi venter på bekreftelse fra Vipps. Dette tar vanligvis bare noen sekunder.
              </Text>

              {/* SSE Component */}
              <PaymentStatusSSE
                reference={reference}
                onStatusChange={handlePaymentStatusChange}
              />

              {/* Loading spinner */}
              <div className="mt-6 flex justify-center">
                <Loading />
              </div>
            </div>
          )}

          {/* PROCESSING STATE - Creating order */}
          {state === 'processing' && (
            <div className="text-center">
              <div className="mx-auto mb-4 flex justify-center">
                <Loading />
              </div>
              <Heading as="h1" className="mb-2 text-2xl font-bold">
                Oppretter ordre
              </Heading>
              <Text className="text-gray-600 dark:text-gray-400">{message}</Text>
            </div>
          )}

          {/* SUCCESS STATE - Order created */}
          {state === 'success' && orderDetails && (
            <>


              <Heading as="h1" className="mb-2">
                Takk for din bestilling!
              </Heading>

              {/* Order number */}
              <div className="mb-8">
                <Text>
                  Ordrenummer:{' '}
                  <span className="font-mono font-medium">
                    {orderDetails.orderId}
                  </span>
                </Text>
              </div>

              {/* What happens next */}
              <div className="mb-8 text-left">
                <Heading as="h2">
                  Hva skjer nå?
                </Heading>
                <Text>
                  Vi sender deg en e-post om ordren din. Ordren er ikke endelig før den er bekreftet.
                </Text>
              </div>
            </>
          )}

          {/* ERROR STATE */}
          {state === 'error' && (
            <Error tone="error" type="generic">
              <Error.Title>Betaling feilet</Error.Title>
              <Error.Description>{message}</Error.Description>
              <Error.Actions>
                <Button onClick={() => router.push('/no/checkout')} variant="primary">
                  Prøv igjen
                </Button>
                <Button onClick={() => router.push('/no')} variant="outline">
                  Tilbake til forsiden
                </Button>
              </Error.Actions>
            </Error>
          )}
        </Card>
      </div>
    </Container>
  );
}
