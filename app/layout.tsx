import 'styles/globals.css';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Eventuras',
  description: 'A life with eventuras',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
