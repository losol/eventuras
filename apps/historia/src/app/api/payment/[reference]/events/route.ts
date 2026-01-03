import { NextRequest } from 'next/server';
import { getPayload } from 'payload';

import { Logger } from '@eventuras/logger';

import config from '@/payload.config';

const logger = Logger.create({
  namespace: 'historia:api:payment:events',
  context: { module: 'PaymentEventsSSE' },
});

/**
 * Server-Sent Events endpoint for real-time payment status updates
 *
 * Client connects to this endpoint while waiting for payment completion.
 * The endpoint polls transactions (not business-events) to detect status changes.
 *
 * Architecture:
 * - Transactions are the source of truth (created by webhook)
 * - Business-events are audit logs only (not polled for state)
 * - SSE polls transactions.status to detect payment completion
 *
 * Flow:
 * 1. Poll transactions by paymentReference
 * 2. If transaction found with authorized/captured status:
 *    - If has order: notify client (payment already processed)
 *    - If no order: notify client to trigger order creation (orphaned transaction)
 * 3. If transaction not found yet: continue polling (webhook not arrived)
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
            logger.debug({ reference, pollCount }, 'Transaction not found yet, continuing to poll');

            // No transaction yet - webhook hasn't arrived or hasn't been processed
            // Continue polling
            return;
          }

          const transaction = transactions.docs[0];

          // Check if transaction has successful status (authorized or captured)
          if (transaction.status === 'authorized' || transaction.status === 'captured') {
            // Check if transaction already has an order
            if (transaction.order) {
              logger.info(
                {
                  reference,
                  transactionId: transaction.id,
                  orderId: transaction.order,
                  status: transaction.status
                },
                'Transaction already linked to order, notifying client'
              );

              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    status: transaction.status,
                    hasOrder: true,
                    orderId: typeof transaction.order === 'string' ? transaction.order : transaction.order.id,
                  })}\n\n`
                )
              );

              isActive = false;
              clearInterval(keepaliveInterval);
              controller.close();
              return;
            }

            // Transaction exists but no order yet - webhook arrived before user returned
            // Trigger client-side order creation (SSE has session access)
            logger.info(
              {
                reference,
                transactionId: transaction.id,
                status: transaction.status,
                pollCount
              },
              'Orphaned transaction detected - sending signal to client to create order'
            );

            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  status: transaction.status,
                  source: 'webhook',
                })}\n\n`
              )
            );

            isActive = false;
            clearInterval(keepaliveInterval);
            controller.close();
            return;
          }

          // Transaction exists but status is not authorized/captured yet
          if (transaction.status === 'failed') {
            logger.info(
              { reference, transactionId: transaction.id, status: transaction.status },
              'Transaction failed, sending failure status'
            );

            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  status: 'failed',
                  source: 'transaction',
                })}\n\n`
              )
            );

            isActive = false;
            clearInterval(keepaliveInterval);
            controller.close();
            return;
          }

          // Transaction exists but still pending - continue polling
          logger.debug(
            { reference, transactionId: transaction.id, status: transaction.status, pollCount },
            'Transaction pending, continuing to poll'
          );
        } catch (error) {
          logger.error(
            {
              error,
              errorName: error instanceof Error ? error.name : 'Unknown',
              errorMessage: error instanceof Error ? error.message : String(error),
              stack: error instanceof Error ? error.stack : undefined,
              reference,
              pollCount,
              currentInterval,
            },
            'Error polling payment status'
          );

          // Don't close connection on error, just continue polling
        }
      };

      // Start polling immediately
      await pollPaymentStatus();
      schedulePoll();

      // Cleanup on client disconnect
      request.signal.addEventListener('abort', () => {
        logger.info({ reference, pollCount }, 'SSE connection closed by client');
        isActive = false;
        clearInterval(keepaliveInterval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
