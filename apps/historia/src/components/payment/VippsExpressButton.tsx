'use client';

import { useState } from 'react';

import { VippsButton } from '@eventuras/ratio-ui/core/Button';

import { createVippsExpressPayment } from '@/app/(frontend)/[locale]/cart/vippsActions';
import type { Product } from '@/payload-types';

interface VippsExpressButtonProps {
  amount: number;
  currency: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  products?: Product[]; // Optional: for order summary
  locale: string;
}

export function VippsExpressButton({
  amount,
  currency,
  items,
  products,
  locale,
}: VippsExpressButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleVippsExpress = async () => {
    setLoading(true);
    try {
      const result = await createVippsExpressPayment({
        amount,
        currency,
        items,
        products,
        userLanguage: locale,
      });

      if (!result.success) {
        console.error('Vipps payment failed:', result.error.message);
        alert(`Payment failed: ${result.error.message}`);
        setLoading(false);
        return;
      }

      // Redirect to Vipps
      if (result.data.redirectUrl) {
        console.log('Redirecting to Vipps:', result.data.redirectUrl);
        window.location.href = result.data.redirectUrl;
      } else {
        console.error('No redirect URL received from Vipps');
        alert('No redirect URL received from Vipps');
        setLoading(false);
      }
    } catch (error) {
      console.error('Vipps Express error:', error);
      alert('An unexpected error occurred');
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
