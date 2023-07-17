import '../styles/pagination.css';

import { ChakraProvider } from '@chakra-ui/react';
import { UserProvider } from '@context/UserContext';
import { SessionProvider } from "next-auth/react"

import theme from '../theme/index';

function App({ Component, pageProps }) {
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
