'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Logger } from '@eventuras/logger';
import { useToast } from '@eventuras/toast';

const logger = Logger.create({
  namespace: 'historia:payment',
  context: { module: 'PaymentStatusSSE' },
});

interface PaymentStatusProps {
  reference: string;
  onStatusChange?: (status: string) => void;
}

interface PaymentStatusUpdate {
  status: string;
  transactionId?: string;
  orderId?: string;
  error?: string;
  timeout?: boolean;
}

/**
 * Client component that uses Server-Sent Events (SSE) to listen for
 * payment status updates in real-time.
 *
 * Connects to /api/payment/[reference]/events endpoint which polls
 * the transaction status and sends updates via SSE.
 */
export function PaymentStatusSSE({
  reference,
  onStatusChange,
}: PaymentStatusProps) {
  const router = useRouter();
  const toast = useToast();
  const [status, setStatus] = useState<string>('pending');
  const eventSourceRef = useRef<EventSource | null>(null);
  const isConnectedRef = useRef(false);

  useEffect(() => {
    console.log('[PaymentStatusSSE] Component mounted, reference:', reference);

    // Prevent duplicate connections
    if (isConnectedRef.current) {
      console.log('[PaymentStatusSSE] Already connected, skipping');
      return;
    }
    isConnectedRef.current = true;

    logger.info({ reference }, 'Opening SSE connection for payment status');
    console.log('[PaymentStatusSSE] Creating EventSource to:', `/api/payment/${reference}/events`);

    // Create EventSource connection
    const eventSource = new EventSource(`/api/payment/${reference}/events`);
    eventSourceRef.current = eventSource;
    console.log('[PaymentStatusSSE] EventSource created');

    eventSource.onopen = () => {
      logger.debug({ reference }, 'SSE connection opened');
      console.log('[PaymentStatusSSE] Connection opened');
    };

    eventSource.onmessage = (event) => {
      try {
        const data: PaymentStatusUpdate = JSON.parse(event.data);

        logger.info({ reference, data }, 'Received payment status update');

        // Handle timeout
        if (data.timeout) {
          logger.warn({ reference }, 'SSE connection timeout');
          toast.info('Payment status check timed out. Please refresh the page.');
          eventSource.close();
          return;
        }

        // Handle error
        if (data.error) {
          logger.error({ reference, error: data.error }, 'Payment status error');
          toast.error(data.error);
          setStatus('error');
          onStatusChange?.('error');
          eventSource.close();
          return;
        }

        // Handle status update
        if (data.status) {
          setStatus(data.status);
          onStatusChange?.(data.status);

          // Handle successful payment
          if (data.status === 'captured' || data.status === 'completed') {
            logger.info({ reference, orderId: data.orderId }, 'Payment successful');
            toast.success('Betaling fullført!');
            eventSource.close();
          }

          // Handle failed payment
          if (data.status === 'failed' || data.status === 'cancelled') {
            logger.warn({ reference, status: data.status }, 'Payment failed');
            toast.error('Betaling feilet');
            eventSource.close();
          }
        }
      } catch (error) {
        logger.error({ reference, error }, 'Failed to parse SSE message');
      }
    };

    eventSource.onerror = (error) => {
      logger.error({ reference, error }, 'SSE connection error');
      console.error('[PaymentStatusSSE] Connection error:', error);
      eventSource.close();

      // Don't show error toast if we already have a status
      if (status === 'pending') {
        toast.error('Mistet forbindelse til server. Vennligst last siden på nytt.');
      }
    };

    // Cleanup on unmount
    return () => {
      logger.debug({ reference }, 'Closing SSE connection');
      console.log('[PaymentStatusSSE] Cleanup - closing connection');
      eventSource.close();
      isConnectedRef.current = false;
    };
  }, [reference, onStatusChange, router, toast, status]);

  return (
    <div className="text-sm text-gray-600 dark:text-gray-400">
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
        <span>
          Venter på betaling...
          {status !== 'pending' && ` (Status: ${status})`}
        </span>
      </div>
    </div>
  );
}
