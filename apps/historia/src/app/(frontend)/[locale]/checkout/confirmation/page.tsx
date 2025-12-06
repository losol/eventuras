import { Suspense } from 'react';

import { ConfirmationPageClient } from './page.client';

interface ConfirmationPageProps {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    reference?: string;
  }>;
}

export default async function ConfirmationPage({
  params,
  searchParams,
}: ConfirmationPageProps) {
  const { locale } = await params;
  const { reference } = await searchParams;

  return (
    <Suspense fallback={<div>Laster...</div>}>
      <ConfirmationPageClient locale={locale} reference={reference} />
    </Suspense>
  );
}
