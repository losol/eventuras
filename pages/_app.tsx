import { ChakraProvider } from '@chakra-ui/react';
import { UserProvider } from 'context';
import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import theme from 'styles/theme';
import { OpenAPI } from '@losol/eventuras';

OpenAPI.BASE = `${process.env.NEXT_PUBLIC_APPLICATION_URL}/api/eventuras`;

function App({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      <ChakraProvider theme={theme}>
        <UserProvider>
          <Component {...pageProps} />
        </UserProvider>
      </ChakraProvider>
    </SessionProvider>
  );
}

export default App;
