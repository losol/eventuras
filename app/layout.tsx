import '@/style/global.css';

import { authOptions } from 'app/api/auth/[...nextauth]/route';
import { Metadata } from 'next';
import { getServerSession } from 'next-auth/next';

import { siteConfig } from '@/config/site';

import { Layout } from '../components/layout';
import Providers from './Providers';

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
  icons: {
    icon: '/favicon.ico',
    //shortcut: "/favicon-16x16.png",
    //apple: "/apple-touch-icon.png",
  },
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default async function RootLayout({ children }: RootLayoutProps) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers session={session}>
          <Layout>{children}</Layout>
        </Providers>
      </body>
    </html>
  );
}
