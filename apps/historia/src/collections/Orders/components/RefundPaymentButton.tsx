'use client';

import React, { useState } from 'react';
import { toast, useAuth } from '@payloadcms/ui';

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

  // Only show button for completed orders
  if (orderStatus !== 'completed') {
    return null;
  }

  const handleRefund = async () => {
    if (
      !confirm(
        'Refund this payment?\n\nThis will:\n- Refund the full captured amount via Vipps\n- Return money to the customer\n- Mark the transaction as refunded\n\nThis action cannot be undone.'
      )
    ) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await refundOrderPayment(orderId, user?.id as string);

      if (!result.success) {
        toast.error(result.error.message);
        return;
      }

      toast.success(result.message || 'Payment refunded successfully!');

      // Refresh the page to show updated status
      window.location.reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to refund payment');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleRefund}
      disabled={isLoading}
      style={{
        padding: '0.75rem 1.5rem',
        backgroundColor: isLoading ? '#94a3b8' : '#f59e0b',
        color: 'white',
        border: 'none',
        borderRadius: '0.375rem',
        fontSize: '0.875rem',
        fontWeight: '500',
        cursor: isLoading ? 'not-allowed' : 'pointer',
        transition: 'background-color 0.2s',
        marginBottom: '1rem',
        marginRight: '0.5rem',
      }}
      onMouseEnter={(e) => {
        if (!isLoading) {
          e.currentTarget.style.backgroundColor = '#d97706';
        }
      }}
      onMouseLeave={(e) => {
        if (!isLoading) {
          e.currentTarget.style.backgroundColor = '#f59e0b';
        }
      }}
    >
      {isLoading ? 'Refunding...' : 'Refund Payment'}
    </button>
  );
}
