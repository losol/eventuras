import type { Metadata } from 'next';

import Providers from './Providers';

import '@eventuras/ratio-ui/ratio-ui.css';

export const metadata: Metadata = {
  title: {
    template: '%s | Idem Admin',
    default: 'Idem Admin',
  },
  description: 'Idem Identity Provider Administration',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
