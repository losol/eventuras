import { Suspense } from 'react';
import { redirect } from 'next/navigation';

import { Logger } from '@eventuras/logger';
import { Error } from '@eventuras/ratio-ui/blocks/Error';
import { Button } from '@eventuras/ratio-ui/core/Button';
import { Card } from '@eventuras/ratio-ui/core/Card';
import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Loading } from '@eventuras/ratio-ui/core/Loading';
import { Text } from '@eventuras/ratio-ui/core/Text';
import { Container } from '@eventuras/ratio-ui/layout/Container';

import { checkExistingOrder, processPaymentAndCreateOrder } from './actions';
import VippsCheckoutPage from './page.client';

const logger = Logger.create({
  namespace: 'historia:payment',
  context: { module: 'VippsCheckoutPageWrapper' },
});

/**
 * Server-side checkout page that handles order creation before rendering.
 *
 * Flow:
 * 1. Check if order already exists → Show success
 * 2. Try to create order from payment → Show success
 * 3. Payment not ready yet → Show client component with SSE fallback
 *
 * This approach ensures orders are created even if JavaScript fails on mobile.
 */
export default async function VippsCheckoutPageWrapper({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string }>;
}) {
  const params = await searchParams;
  const reference = params.reference;

  logger.info({ reference }, '🚀 Server-side checkout page load');

  // Validate reference
  if (!reference) {
    logger.warn('No payment reference in URL');
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
                <Button href="/no" variant="primary">
                  Tilbake til forsiden
                </Button>
              </Error.Actions>
            </Error>
          </Card>
        </div>
      </Container>
    );
  }

  // SERVER-SIDE ORDER CHECK AND CREATION
  try {
    logger.info({ reference }, 'Checking for existing order (server-side)');

    const existingOrderResult = await checkExistingOrder(reference);

    // If order already exists, show success immediately
    if (existingOrderResult.success && existingOrderResult.data.exists) {
      logger.info(
        { reference, orderId: existingOrderResult.data.orderId },
        '✅ Order already exists - showing success page (server-side)'
      );

      return (
        <Container padding="px-4 py-16">
          <div className="mx-auto max-w-2xl">
            <Card>
              <Heading as="h1" className="mb-2">
                Takk for din bestilling!
              </Heading>

              <div className="mb-8">
                <Text>
                  Ordrenummer:{' '}
                  <span className="font-mono font-medium">
                    {existingOrderResult.data.orderId}
                  </span>
                </Text>
              </div>

              <div className="mb-8 text-left">
                <Heading as="h2">Hva skjer nå?</Heading>
                <Text>
                  Vi sender deg en e-post om ordren din. Ordren er ikke endelig før den er bekreftet.
                </Text>
              </div>
            </Card>
          </div>
        </Container>
      );
    }

    // Try to create order server-side
    logger.info({ reference }, 'No order exists - attempting server-side creation');

    const createResult = await processPaymentAndCreateOrder(reference);

    if (createResult.success) {
      logger.info(
        { reference, orderId: createResult.data.orderId },
        '✅ Order created successfully (server-side) - showing success page'
      );

      return (
        <Container padding="px-4 py-16">
          <div className="mx-auto max-w-2xl">
            <Card>
              <Heading as="h1" className="mb-2">
                Takk for din bestilling!
              </Heading>

              <div className="mb-8">
                <Text>
                  Ordrenummer:{' '}
                  <span className="font-mono font-medium">
                    {createResult.data.orderId}
                  </span>
                </Text>
              </div>

              <div className="mb-8 text-left">
                <Heading as="h2">Hva skjer nå?</Heading>
                <Text>
                  Vi sender deg en e-post om ordren din. Ordren er ikke endelig før den er bekreftet.
                </Text>
              </div>
            </Card>
          </div>
        </Container>
      );
    }

    // Server-side creation failed - likely payment not confirmed yet
    // Fall back to client-side SSE polling
    logger.info(
      { reference, error: createResult.error },
      '⏳ Payment not ready yet - showing client component with SSE'
    );

  } catch (error) {
    logger.error(
      { reference, error },
      '⚠️ Server-side check failed - falling back to client-side'
    );
  }

  // FALLBACK: Show client component with SSE polling
  // This handles cases where payment is not confirmed yet when user returns
  return (
    <Suspense
      fallback={
        <Container padding="px-4 py-16">
          <div className="mx-auto max-w-2xl">
            <Card>
              <div className="flex justify-center py-12">
                <Loading />
              </div>
            </Card>
          </div>
        </Container>
      }
    >
      <VippsCheckoutPage />
    </Suspense>
  );
}
