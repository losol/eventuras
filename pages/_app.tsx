import { ChakraProvider } from '@chakra-ui/react';
import { UserProvider } from 'context';
import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import theme from 'styles/theme';
import { OpenAPI } from '@losol/eventuras';

OpenAPI.BASE = 'http://localhost:3000/api/eventuras';

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
