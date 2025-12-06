'use client';

import { useState } from 'react';

import { VippsButton } from '@eventuras/ratio-ui/core/Button';

interface VippsExpressButtonProps {
  amount: number;
  currency: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  locale: string;
}

export function VippsExpressButton({
  amount,
  currency,
  items,
  locale,
}: VippsExpressButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleVippsExpress = async () => {
    setLoading(true);
    try {
      // TODO: Implement Vipps Express payment flow
      // 1. Create payment with shipping options
      // 2. Redirect to Vipps/MobilePay app
      // 3. Handle callback with user details and selected shipping
      console.log('Initiating Vipps Express checkout', {
        amount,
        currency,
        items,
      });

      // Placeholder - will be implemented with actual Vipps API
      alert('Vipps Express checkout coming soon!');
    } catch (error) {
      console.error('Vipps Express error:', error);
      alert('Failed to initiate Vipps Express checkout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <VippsButton
      onClick={handleVippsExpress}
      loading={loading}
      locale={locale}
      block
      testId="vipps-express-checkout"
      ariaLabel="Pay with Vipps Express Checkout"
    />
  );
}
