import { ChakraProvider } from "@chakra-ui/react";
import { Provider } from "next-auth/client";
import { Auth0Provider } from '@auth0/auth0-react';
import theme from "../theme/index";

const onRedirectCallback = (appState) => {
  Router.replace(appState?.returnTo || "/");
};

function App({ Component, pageProps }) {
  return (
    <Auth0Provider
      domain={"eventuras.eu.auth0.com"}
      clientId={"hmSU5P9lJKzszTvcXWVA9hGG1kQxMgTM"}
      redirectUri={process.env.NEXT_PUBLIC_APPLICATION_URL}
      onRedirectCallback={onRedirectCallback}
      audience="https://eventuras/api"
      scope="openid profile email registrations:read"
    >
      <ChakraProvider theme={theme}>
        <Component {...pageProps} />
      </ChakraProvider>
    </Auth0Provider>
  );
}

export default App;
