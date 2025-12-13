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
      let pollCount = 0;
      let currentInterval = 2000; // Start with 2 seconds
      const MAX_POLLS = 50; // Safety limit: ~8 minutes at max interval

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

      // Dynamic polling function with backoff
      const schedulePoll = () => {
        if (!isActive) return;

        setTimeout(async () => {
          await pollPaymentStatus();
          schedulePoll(); // Schedule next poll
        }, currentInterval);
      };

      // Poll transaction status
      const pollPaymentStatus = async () => {
        if (!isActive) return;

        pollCount++;

        // Safety check: stop polling if we've exceeded maximum attempts
        if (pollCount > MAX_POLLS) {
          logger.warn(
            { reference, pollCount },
            'Maximum poll count exceeded, stopping polling'
          );

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ timeout: true, reason: 'max_polls_exceeded' })}\n\n`
            )
          );

          isActive = false;
          clearInterval(keepaliveInterval);
          controller.close();
          return;
        }

        // Implement backoff strategy:
        // 0-10s: poll every 2s (5 attempts)
        // 10-60s: poll every 5s (10 attempts)
        // 60s+: poll every 10s (remaining time)
        if (pollCount === 5) {
          currentInterval = 5000;
          logger.debug({ reference, newInterval: '5s' }, 'Increasing poll interval');
        } else if (pollCount === 15) {
          currentInterval = 10000;
          logger.debug({ reference, newInterval: '10s' }, 'Increasing poll interval');
        }

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

                controller.close();
                return;
              }

              // Check if payment failed
              const isAborted = paymentDetails.state === 'ABORTED';
              const isExpired = paymentDetails.state === 'EXPIRED';
              const isTerminated = paymentDetails.state === 'TERMINATED';

              if (isAborted || isExpired || isTerminated) {
                logger.info(
                  {
                    reference,
                    state: paymentDetails.state,
                  },
                  'Payment failed, sending failure status update'
                );

                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({
                      status: 'failed',
                      failureReason: paymentDetails.state.toLowerCase(),
                      source: 'vipps-api',
                    })}\n\n`
                  )
                );

                isActive = false;
                clearInterval(keepaliveInterval);

                controller.close();
                return;
              }

              logger.debug(
                { reference, state: paymentDetails.state },
                'Payment not yet confirmed by Vipps'
              );
            } catch (error) {
              // Check if this is a transient Vipps API error that should be retried silently
              const errorMessage = error instanceof Error ? error.message : String(error);
              const isTransientError =
                errorMessage.includes('423') || // Resource locked
                errorMessage.includes('500') || // Internal server error
                errorMessage.includes('502') || // Bad gateway
                errorMessage.includes('503') || // Service unavailable
                errorMessage.includes('504');   // Gateway timeout

              if (isTransientError) {
                // Only log transient errors at debug level to avoid flooding logs
                logger.debug(
                  { reference, error: errorMessage },
                  'Vipps API transient error, will retry'
                );
              } else {
                // Log other errors at debug level too, but with different message
                logger.debug({ reference, error }, 'Failed to poll Vipps API, will retry');
              }
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
          controller.close();
        }
      };

      // Start polling
      schedulePoll();

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
        controller.close();
      }, 5 * 60 * 1000);

      // Handle client disconnect
      request.signal.addEventListener('abort', () => {
        logger.info({ reference }, 'SSE connection closed by client');
        isActive = false;
        clearInterval(keepaliveInterval);
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
