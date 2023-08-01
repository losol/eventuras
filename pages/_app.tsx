import { ChakraProvider, Container } from '@chakra-ui/react';
import { createStandaloneToast } from '@chakra-ui/toast';
import { OpenAPI } from '@losol/eventuras';
import { Layout } from 'components';
import { UserProvider } from 'context';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { SessionProvider } from 'next-auth/react';
import theme from 'styles/theme';

OpenAPI.BASE = `${process.env.NEXT_PUBLIC_APPLICATION_URL}/api/eventuras`;

function App({ Component, pageProps }: AppProps) {
  const { ToastContainer } = createStandaloneToast();

  return (
    <SessionProvider session={pageProps.session}>
      <ToastContainer />
      <ChakraProvider theme={theme}>
        <UserProvider>
          <Head>
            <title>Eventuras</title>
            <link rel="icon" href="/favicon.ico" />
          </Head>
          <Layout>
            <Container>
              <Component {...pageProps} />
            </Container>
          </Layout>
        </UserProvider>
      </ChakraProvider>
    </SessionProvider>
  );
}

export default App;
