import { redirect } from 'next/navigation';

import { CheckoutPageClient } from './page-embedded.client';

interface CheckoutPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { locale } = await params;

  return <CheckoutPageClient locale={locale} />;
}
