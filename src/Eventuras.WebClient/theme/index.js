import { extendTheme } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";

// Version 1: Using objects
const theme = extendTheme({
  styles: {
    global: (props) => ({
      // styles for the `body`
      body: {
        bg: mode("white", "gray.800")(props),
        color: mode("black", "gray.200")(props),
      },
      // styles for the `a`
      a: {
        color: "teal.500",
        _hover: {
          textDecoration: "underline",
        },
      },
    }),
  },
});

export default theme;
