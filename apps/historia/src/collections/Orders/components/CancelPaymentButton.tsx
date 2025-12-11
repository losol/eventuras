'use client';

import React, { useState } from 'react';
import { toast, useAuth } from '@payloadcms/ui';

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

  // Only show button for orders that can be cancelled (pending, not completed/canceled)
  if (orderStatus === 'completed' || orderStatus === 'canceled') {
    return null;
  }

  const handleCancel = async () => {
    if (
      !confirm(
        'Cancel this payment?\n\nThis will:\n- Cancel the authorized payment in Vipps\n- Mark the order as canceled\n- Release the reserved amount\n\nThis action cannot be undone.'
      )
    ) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await cancelOrderPayment(orderId, user?.id as string);

      if (!result.success) {
        toast.error(result.error.message);
        return;
      }

      toast.success(result.message || 'Payment cancelled successfully!');

      // Refresh the page to show updated status
      window.location.reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to cancel payment');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCancel}
      disabled={isLoading}
      style={{
        padding: '0.75rem 1.5rem',
        backgroundColor: isLoading ? '#94a3b8' : '#ef4444',
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
          e.currentTarget.style.backgroundColor = '#dc2626';
        }
      }}
      onMouseLeave={(e) => {
        if (!isLoading) {
          e.currentTarget.style.backgroundColor = '#ef4444';
        }
      }}
    >
      {isLoading ? 'Cancelling...' : 'Cancel Payment'}
    </button>
  );
}
