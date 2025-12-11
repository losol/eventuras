'use client';

import React, { useState } from 'react';
import { toast } from '@payloadcms/ui';

import { shipCompleteOrderAndCapture } from '@/app/actions/shipment';

interface ShipCompleteOrderButtonProps {
  orderId: string;
  orderStatus: string;
}

/**
 * Admin button to ship complete order and capture payment
 * Only shown for orders that are not completed or canceled
 */
export function ShipCompleteOrderButton({
  orderId,
  orderStatus,
}: ShipCompleteOrderButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Don't show button for completed or canceled orders
  if (orderStatus === 'completed' || orderStatus === 'canceled') {
    return null;
  }

  const handleShipAndCapture = async () => {
    if (!confirm('Ship complete order and capture payment?\n\nThis will:\n- Create a full shipment\n- Capture the payment from Vipps\n- Mark the order as completed')) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await shipCompleteOrderAndCapture(orderId);

      if (!result.success) {
        toast.error(result.error.message);
        return;
      }

      toast.success(result.message || 'Order shipped and payment captured!');

      // Refresh the page to show updated status
      window.location.reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to ship order');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleShipAndCapture}
      disabled={isLoading}
      style={{
        padding: '0.75rem 1.5rem',
        backgroundColor: isLoading ? '#94a3b8' : '#10b981',
        color: 'white',
        border: 'none',
        borderRadius: '0.375rem',
        fontSize: '0.875rem',
        fontWeight: '500',
        cursor: isLoading ? 'not-allowed' : 'pointer',
        transition: 'background-color 0.2s',
        marginBottom: '1rem',
      }}
      onMouseEnter={(e) => {
        if (!isLoading) {
          e.currentTarget.style.backgroundColor = '#059669';
        }
      }}
      onMouseLeave={(e) => {
        if (!isLoading) {
          e.currentTarget.style.backgroundColor = '#10b981';
        }
      }}
    >
      {isLoading ? '⏳ Shipping...' : '📦 Ship Complete Order & Capture Payment'}
    </button>
  );
}
