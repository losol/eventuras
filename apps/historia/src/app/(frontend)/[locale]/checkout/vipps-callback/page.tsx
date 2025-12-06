'use client';

import { useEffect, useRef, useState } from 'react';
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

import { useSessionCart } from '@/lib/cart/use-session-cart';

import {
  createOrderFromPayment,
  getVippsSessionDetails,
} from './actions';

const logger = Logger.create({
  namespace: 'historia:payment',
  context: { module: 'PaymentCallback' },
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

export default function PaymentCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useSessionCart();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing payment...');
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const processingRef = useRef(false);

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

    // Prevent duplicate processing
    if (processingRef.current) {
      return;
    }
    processingRef.current = true;

    async function processPayment() {
      if (!reference) return;

      try {
        logger.info({ reference }, 'Payment callback received');

        // Step 1: Get complete session details from Vipps (includes userInfo.email)
        const sessionResult = await getVippsSessionDetails(reference);

        if (!sessionResult.success) {
          logger.error(
            { reference, error: sessionResult.error },
            'Session lookup failed',
          );
          setStatus('error');
          setMessage(sessionResult.error.message);
          return;
        }

        const sessionDetails = sessionResult.data;

        // Check if payment is successful
        if (sessionDetails.paymentDetails?.state !== 'AUTHORIZED') {
          logger.warn(
            { reference, state: sessionDetails.paymentDetails?.state },
            'Payment not authorized',
          );
          setStatus('error');
          setMessage(`Payment ${sessionDetails.sessionState.toLowerCase()}. Please try again.`);
          return;
        }

        // Step 2: Create order and transaction
        // Cart items and user details come from encrypted session
        // Email comes from sessionDetails.userInfo.email
        const orderResult = await createOrderFromPayment({
          paymentReference: reference,
          sessionDetails: sessionDetails,
        });

        if (!orderResult.success) {
          logger.error(
            { reference, error: orderResult.error },
            'Order creation failed',
          );
          setStatus('error');
          setMessage(orderResult.error.message);
          return;
        }

        logger.info(
          { reference, orderId: orderResult.data.orderId },
          'Order created successfully',
        );

        // Step 3: Clear cart
        clearCart();

        // Step 4: Show success
        setOrderDetails({
          orderId: orderResult.data.orderId,
          userEmail: sessionDetails.userInfo?.email || sessionDetails.shippingDetails?.email || '',
          shippingAddress: sessionDetails.shippingDetails ? {
            addressLine1: sessionDetails.shippingDetails.streetAddress,
            postalCode: sessionDetails.shippingDetails.postalCode,
            city: sessionDetails.shippingDetails.city,
            country: sessionDetails.shippingDetails.country,
          } : undefined,
        });
        setStatus('success');
        setMessage('Your order has been confirmed!');
      } catch (error) {
        logger.error({ reference, error }, 'Unexpected error processing payment');
        setStatus('error');
        setMessage('An unexpected error occurred. Please contact support.');
      }
    }

    processPayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <Container padding="px-4 py-16">
      <div className="mx-auto max-w-2xl">
        <Card>
          {status === 'loading' && (
            <div className="text-center">
              <div className="mx-auto mb-4 flex justify-center">
                <Loading />
              </div>
              <Heading as="h1" className="mb-2 text-2xl font-bold">
                Behandler betaling
              </Heading>
              <Text className="text-gray-600 dark:text-gray-400">{message}</Text>
            </div>
          )}

        {status === 'success' && orderDetails && (
          <>
            {/* Title */}
            <Heading as="h1">
              Takk for din bestilling!
            </Heading>

            {/* Subtitle */}
            <Text>
              Din betaling er fullført.
            </Text>

            {/* Order number */}
            <div className="mb-8 text-center">
              <Text className="text-sm text-gray-500 dark:text-gray-500">
                Ordrenummer: <span className="font-mono font-medium text-gray-900 dark:text-white">{orderDetails.orderId}</span>
              </Text>
            </div>

            {/* What happens next */}
            <Card backgroundColorClass="bg-green-50 dark:bg-green-900/10" className="mb-8">
              <Heading as="h2" className="mb-4 text-lg font-semibold" padding="pt-0 pb-0">
                Hva skjer nå?
              </Heading>
              <List variant="unstyled">
                <List.Item variant="check" className="mb-3">
                  <Text className="text-gray-700 dark:text-gray-300">
                    Du vil motta en bekreftelse på e-post
                  </Text>
                </List.Item>

                <List.Item variant="check" className="mb-3">
                  <Text className="text-gray-700 dark:text-gray-300">
                    Du får tilgang til dine digitale produkter umiddelbart
                  </Text>
                </List.Item>

                <List.Item variant="check" className="mb-3">
                  <Text className="text-gray-700 dark:text-gray-300">
                    Kvittering er sendt til din e-postadresse
                  </Text>
                </List.Item>
              </List>
            </Card>

            {/* Shipping address if physical products */}
            {orderDetails.shippingAddress && (
              <Card className="mb-8 border border-gray-200 dark:border-gray-700">
                <Heading as="h2" className="mb-3 text-sm font-semibold" padding="pt-0 pb-0">
                  Leveringsadresse
                </Heading>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {orderDetails.shippingAddress.addressLine1 && (
                    <Text>{orderDetails.shippingAddress.addressLine1}</Text>
                  )}
                  {orderDetails.shippingAddress.addressLine2 && (
                    <Text>{orderDetails.shippingAddress.addressLine2}</Text>
                  )}
                  {(orderDetails.shippingAddress.postalCode || orderDetails.shippingAddress.city) && (
                    <Text>
                      {orderDetails.shippingAddress.postalCode} {orderDetails.shippingAddress.city}
                    </Text>
                  )}
                  {orderDetails.shippingAddress.country && (
                    <Text className="uppercase">{orderDetails.shippingAddress.country}</Text>
                  )}
                </div>
              </Card>
            )}

            {/* Action buttons */}
            <div className="space-y-3">
              <Button
                onClick={() => router.push('/no/products')}
                variant="primary"
                block
                className="font-medium"
              >
                Gå til forsiden
              </Button>
            </div>
          </>
        )}

        {status === 'error' && (
          <Error tone="error" type="generic">
            <Error.Title>Betaling feilet</Error.Title>
            <Error.Description>{message}</Error.Description>
            <Error.Actions>
              <Button
                onClick={() => router.push('/no')}
                variant="primary"
              >
                Tilbake til siden
              </Button>
            </Error.Actions>
          </Error>
        )}
        </Card>
      </div>
    </Container>
  );
}
