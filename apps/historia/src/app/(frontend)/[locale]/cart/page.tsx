import { CartPageClient } from './page.client';

interface CartPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function CartPage({ params }: CartPageProps) {
  const { locale } = await params;
  return <CartPageClient locale={locale} />;
}
