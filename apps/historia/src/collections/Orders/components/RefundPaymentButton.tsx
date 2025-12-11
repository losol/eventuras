'use client';

import React, { useState } from 'react';
import { toast, useAuth } from '@payloadcms/ui';
import { useRouter } from 'next/navigation';

import { refundOrderPayment } from '@/app/actions/refundPayment';

interface RefundPaymentButtonProps {
  orderId: string;
  orderStatus: string;
}

/**
 * Admin button to refund captured payment
 * Only shown for completed orders
 */
export function RefundPaymentButton({ orderId, orderStatus }: RefundPaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  // Only show button for completed orders
  if (orderStatus !== 'completed') {
    return null;
  }

  const handleRefund = async () => {
    if (!user || !user.id) {
      toast.error('You must be logged in to refund a payment.');
      return;
    }

    if (
      !confirm(
        'Refund this payment?\n\nThis will:\n- Refund the full captured amount via Vipps\n- Return money to the customer\n- Mark the transaction as refunded\n\nThis action cannot be undone.'
      )
    ) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await refundOrderPayment(orderId, String(user.id));

      if (!result.success) {
        toast.error(result.error.message);
        return;
      }

      toast.success(result.message || 'Payment refunded successfully!');

      // Refresh the page to show updated status
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to refund payment');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleRefund}
      disabled={isLoading}
      className={[
        'px-6 py-3 mb-4 mr-2 rounded-md text-white text-sm font-medium transition-colors duration-200',
        isLoading
          ? 'bg-slate-400 cursor-not-allowed'
          : 'bg-amber-500 hover:bg-amber-600 cursor-pointer',
      ].join(' ')}
    >
      {isLoading ? 'Refunding...' : 'Refund Payment'}
    </button>
  );
}
