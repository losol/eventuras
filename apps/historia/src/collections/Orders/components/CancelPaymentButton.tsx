'use client';

import React, { useState } from 'react';
import { toast, useAuth } from '@payloadcms/ui';
import { useRouter } from 'next/navigation';

import { cancelOrderPayment } from '@/app/actions/cancelPayment';

interface CancelPaymentButtonProps {
  orderId: string;
  orderStatus: string;
}

/**
 * Admin button to cancel authorized payment
 * Only shown for orders that have authorized payment and are not completed/shipped
 */
export function CancelPaymentButton({ orderId, orderStatus }: CancelPaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  // Only show button for orders that can be cancelled (pending, not completed/canceled)
  if (orderStatus === 'completed' || orderStatus === 'canceled') {
    return null;
  }

  const handleCancel = async () => {
    if (!user || !user.id) {
      toast.error('You must be logged in to cancel a payment.');
      return;
    }

    if (
      !confirm(
        'Cancel this payment?\n\nThis will:\n- Cancel the authorized payment in Vipps\n- Mark the order as canceled\n- Release the reserved amount\n\nThis action cannot be undone.'
      )
    ) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await cancelOrderPayment(orderId, String(user.id));

      if (!result.success) {
        toast.error(result.error.message);
        return;
      }

      toast.success(result.message || 'Payment cancelled successfully!');

      // Refresh the page to show updated status
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to cancel payment');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCancel}
      disabled={isLoading}
      className={[
        'px-6 py-3 mb-4 mr-2 rounded-md text-sm font-medium text-white transition-colors',
        isLoading
          ? 'bg-slate-400 cursor-not-allowed'
          : 'bg-red-500 hover:bg-red-700 cursor-pointer',
      ].join(' ')}
    >
      {isLoading ? 'Cancelling...' : 'Cancel Payment'}
    </button>
  );
}
