import { redirect } from 'next/navigation';

import { CheckoutPageClient } from './page.client';
import { getCartProducts } from '../actions';

interface CheckoutPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { locale } = await params;

  return <CheckoutPageClient locale={locale} />;
}
