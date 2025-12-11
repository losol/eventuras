'use client';

import React, { useState } from 'react';
import { toast } from '@payloadcms/ui';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();

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
      router.refresh();
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
      className={[
        'mb-4 px-6 py-3 rounded-md text-sm font-medium text-white transition-colors',
        isLoading
          ? 'bg-slate-400 cursor-not-allowed'
          : 'bg-emerald-500 hover:bg-emerald-600 cursor-pointer',
        'disabled:bg-slate-400 disabled:cursor-not-allowed',
      ].join(' ')}
    >
      {isLoading ? '⏳ Shipping...' : '📦 Ship Complete Order & Capture Payment'}
    </button>
  );
}
