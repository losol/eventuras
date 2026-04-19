'use client';

import { useState } from 'react';

import { Logger } from '@eventuras/logger';
import { Select } from '@eventuras/ratio-ui/forms';
import { useToast } from '@eventuras/ratio-ui/toast';

import type { OrderDto, PaymentProvider } from '@/lib/eventuras-sdk';
import { paymentMethodLabels } from '@/lib/paymentMethod';

import { patchOrder } from './actions';

const logger = Logger.create({
  namespace: 'web:admin:orders',
  context: { component: 'OrderPaymentMethodSelect' },
});

interface OrderPaymentMethodSelectProps {
  order: OrderDto;
  onUpdate?: (order: OrderDto) => void;
}

const OrderPaymentMethodSelect = ({ order, onUpdate }: OrderPaymentMethodSelectProps) => {
  const toast = useToast();
  // Local state lets the Select stay on the new value while we await patchOrder,
  // and lets us roll back on failure without waiting for the parent to re-render.
  const [selected, setSelected] = useState<PaymentProvider | undefined>(
    order.paymentMethod ?? undefined
  );

  const handleChange = async (next: string) => {
    if (!order.orderId || next === selected) {
      return;
    }

    const previous = selected;
    setSelected(next as PaymentProvider);

    const result = await patchOrder(order.orderId, {
      paymentMethod: next as PaymentProvider,
    });

    if (!result.success) {
      logger.error(
        { error: result.error, orderId: order.orderId },
        'Failed to update payment method'
      );
      toast.error(result.error.message);
      setSelected(previous);
      return;
    }

    logger.info({ orderId: order.orderId, paymentMethod: next }, 'Payment method updated');
    toast.success(result.message ?? 'Payment method updated');
    if (onUpdate) onUpdate(result.data);
  };

  return (
    <Select
      aria-label="Payment method"
      placeholder="Select payment method..."
      options={paymentMethodLabels}
      value={selected}
      onSelectionChange={handleChange}
    />
  );
};

export default OrderPaymentMethodSelect;
