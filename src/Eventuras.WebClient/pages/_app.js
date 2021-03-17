import { ChakraProvider } from "@chakra-ui/react";
import { Provider } from "next-auth/client";
import theme from "../theme/index";

const onRedirectCallback = (appState) => {
  Router.replace(appState?.returnTo || "/");
};

function App({ Component, pageProps }) {
  return (
    <Provider
      domain={process.env.AUTH0_DOMAIN}
      clientId={process.env.AUTH0_CLIENT_ID}
      redirectUri={process.env.NEXT_PUBLIC_APPLICATION_URL}
      onRedirectCallback={onRedirectCallback}
      audience="https://eventuras/api"
      scope="openid profile email registrations:read"
    >
      <ChakraProvider theme={theme}>
        <Component {...pageProps} />
      </ChakraProvider>
    </Provider>
  );
}

export default App;
