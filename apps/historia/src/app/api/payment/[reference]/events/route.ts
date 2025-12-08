import { NextRequest } from 'next/server';
import { getPayload } from 'payload';

import { Logger } from '@eventuras/logger';
import { getPaymentDetails } from '@eventuras/vipps/epayment-v1';

import { getVippsConfig } from '@/lib/vipps/config';
import config from '@/payload.config';

const logger = Logger.create({
  namespace: 'historia:api:payment:events',
  context: { module: 'PaymentEventsSSE' },
});

/**
 * Server-Sent Events endpoint for real-time payment status updates
 *
 * Client connects to this endpoint while waiting for payment completion.
 * The endpoint polls the transaction status and sends updates via SSE.
 *
 * @param params.reference - Payment reference from Vipps
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ reference: string }> }
) {
  const { reference } = await params;

  logger.info({ reference }, 'SSE connection opened for payment status');

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let isActive = true;

      // Keepalive interval to prevent connection timeout
      const keepaliveInterval = setInterval(() => {
        if (!isActive) return;
        try {
          controller.enqueue(encoder.encode(': keepalive\n\n'));
        } catch (error) {
          logger.debug({ reference, error }, 'Failed to send keepalive');
          clearInterval(keepaliveInterval);
        }
      }, 30000);

      // Poll transaction status
      const checkInterval = setInterval(async () => {
        if (!isActive) return;

        try {
          const payloadInstance = await getPayload({ config });

          // Find transaction by payment reference
          const transactions = await payloadInstance.find({
            collection: 'transactions',
            where: {
              paymentReference: {
                equals: reference,
              },
            },
            limit: 1,
          });

          if (transactions.docs.length === 0) {
            logger.debug({ reference }, 'Transaction not found yet, checking payment status');

            // Strategy 1: Check if we have any payment events from webhook
            const events = await payloadInstance.find({
              collection: 'business-events',
              where: {
                and: [
                  {
                    eventType: {
                      equals: 'payment',
                    },
                  },
                  {
                    externalReference: {
                      equals: reference,
                    },
                  },
                ],
              },
              limit: 1,
              sort: '-createdAt',
            });

            if (events.docs.length > 0) {
              const event = events.docs[0];
              const eventData = event.data as Record<string, unknown>;

              logger.info({ reference, eventType: eventData?.name }, 'Found payment event from webhook, sending status update');

              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    status: 'authorized',
                    source: 'webhook',
                  })}\n\n`
                )
              );

              isActive = false;
              clearInterval(keepaliveInterval);
              clearInterval(checkInterval);
              controller.close();
              return;
            }

            // Strategy 2: Poll Vipps API directly
            try {
              const vippsConfig = getVippsConfig();
              const paymentDetails = await getPaymentDetails(vippsConfig, reference);

              // Check if payment is authorized or captured
              const isAuthorized = paymentDetails.state === 'AUTHORIZED';
              const isCaptured = paymentDetails.aggregate.capturedAmount.value > 0;

              if (isAuthorized || isCaptured) {
                logger.info(
                  {
                    reference,
                    state: paymentDetails.state,
                    capturedAmount: paymentDetails.aggregate.capturedAmount.value,
                  },
                  'Payment verified via Vipps API polling, sending status update'
                );

                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({
                      status: isCaptured ? 'captured' : 'authorized',
                      source: 'vipps-api',
                    })}\n\n`
                  )
                );

                isActive = false;
                clearInterval(keepaliveInterval);
                clearInterval(checkInterval);
                controller.close();
                return;
              }

              logger.debug(
                { reference, state: paymentDetails.state },
                'Payment not yet confirmed by Vipps'
              );
            } catch (error) {
              logger.debug({ reference, error }, 'Failed to poll Vipps API, will retry');
            }

            return;
          }

          const transaction = transactions.docs[0];
          const status = transaction.status;

          // Send status update to client
          if (status !== 'pending') {
            logger.info(
              { reference, transactionId: transaction.id, status },
              'Payment status changed, sending update'
            );

            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  status,
                  transactionId: transaction.id,
                  orderId: typeof transaction.order === 'object'
                    ? transaction.order.id
                    : transaction.order,
                })}\n\n`
              )
            );

            // Close connection after sending final status
            isActive = false;
            clearInterval(keepaliveInterval);
            clearInterval(checkInterval);
            controller.close();
          }
        } catch (error) {
          logger.error({ reference, error }, 'Error checking transaction status');

          // Send error to client
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: 'Failed to check status' })}\n\n`
            )
          );

          isActive = false;
          clearInterval(keepaliveInterval);
          clearInterval(checkInterval);
          controller.close();
        }
      }, 2000); // Check every 2 seconds

      // Cleanup after 5 minutes (timeout)
      setTimeout(() => {
        if (!isActive) return;

        logger.info({ reference }, 'SSE connection timeout');

        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ timeout: true })}\n\n`
          )
        );

        isActive = false;
        clearInterval(keepaliveInterval);
        clearInterval(checkInterval);
        controller.close();
      }, 5 * 60 * 1000);

      // Handle client disconnect
      request.signal.addEventListener('abort', () => {
        logger.info({ reference }, 'SSE connection closed by client');
        isActive = false;
        clearInterval(keepaliveInterval);
        clearInterval(checkInterval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  });
}
