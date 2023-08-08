import 'styles/globals.css';

import { OpenAPI } from '@losol/eventuras';
import { Notifications } from '@mantine/notifications';
import { ThemeContextProvider, UserProvider } from 'context';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { SessionProvider } from 'next-auth/react';

OpenAPI.BASE = `${process.env.NEXT_PUBLIC_APPLICATION_URL}/api/eventuras`;
export default function App({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      <ThemeContextProvider>
        <Notifications />
        <UserProvider>
          <Head>
            <title>Eventuras</title>
            <link rel="icon" href="/favicon.ico" />
          </Head>
          <Component {...pageProps} />
        </UserProvider>
      </ThemeContextProvider>
    </SessionProvider>
  );
}
