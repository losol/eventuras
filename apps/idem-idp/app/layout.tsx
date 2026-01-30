import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Idem IdP',
  description: 'Eventuras Identity Provider',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
