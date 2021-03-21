import { ChakraProvider } from "@chakra-ui/react";
import { Provider as NextAuthProvider } from "next-auth/client";
import theme from "../theme/index";

function App({ Component, pageProps }) {
  return (
    <NextAuthProvider session={pageProps.session}>
      <ChakraProvider theme={theme}>
        <Component {...pageProps} />
      </ChakraProvider>
    </NextAuthProvider>
  );
}

export default App;
