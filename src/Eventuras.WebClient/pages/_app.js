import { ChakraProvider } from "@chakra-ui/react";
import { Provider as NextAuthProvider } from "next-auth/client";
import theme from "../theme/index";
import { UserProvider } from "../context/UserContext";

function App({Component, pageProps}) {
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
