import '../styles/pagination.css';

import { ChakraProvider } from '@chakra-ui/react';
import { UserProvider } from '@context/UserContext';
import { Provider as NextAuthProvider } from 'next-auth/client';

import theme from '../theme/index';

function App({ Component, pageProps }) {
  return (
    <NextAuthProvider session={pageProps.session}>
      <ChakraProvider theme={theme}>
        <UserProvider>
          <Component {...pageProps} />
        </UserProvider>
      </ChakraProvider>
    </NextAuthProvider>
  );
}

export default App;
