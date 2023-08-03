import { OpenAPI } from '@losol/eventuras';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { UserProvider } from 'context';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { SessionProvider } from 'next-auth/react';

OpenAPI.BASE = `${process.env.NEXT_PUBLIC_APPLICATION_URL}/api/eventuras`;

function App({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      <MantineProvider withGlobalStyles withNormalizeCSS>
        <Notifications />
        <UserProvider>
          <Head>
            <title>Eventuras</title>
            <link rel="icon" href="/favicon.ico" />
          </Head>
          <Component {...pageProps} />
        </UserProvider>
      </MantineProvider>
    </SessionProvider>
  );
}

export default App;
