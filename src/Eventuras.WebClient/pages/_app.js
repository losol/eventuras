import { ChakraProvider } from "@chakra-ui/react";
import { Auth0Provider } from '@auth0/auth0-react';
import Router from 'next/router';
import theme from "../theme/index";
import { config } from '../src/config';

const onRedirectCallback = (appState) => {
  // Use Next.js's Router.replace method to replace the url
  Router.replace(appState?.returnTo || '/');
};

function App({ Component, pageProps }) {
  return (
    <Auth0Provider
      domain={config.auth.REACT_DOMAIN}
      clientId={config.auth.REACT_CLIENT_ID}
      redirectUri={typeof window !== 'undefined' && window.location.origin}
      onRedirectCallback={onRedirectCallback}
    >
      <ChakraProvider theme={theme}>
        <Component {...pageProps} />
      </ChakraProvider>
    </Auth0Provider>
  );
}

export default App;
