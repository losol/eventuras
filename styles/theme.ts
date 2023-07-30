import { extendTheme, StyleFunctionProps } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';

// Version 1: Using objects
const theme = extendTheme({
  styles: {
    global: (props: StyleFunctionProps) => ({
      // styles for the `body`
      body: {
        bg: mode('gray.100', 'gray.800')(props),
        color: mode('black', 'gray.200')(props),
      },
      // styles for the `a`
      a: {
        color: 'teal.500',
        // TODO: Check is this the best style option in Chakra
        '&.chakra-card:hover': {
          transitionProperty: 'box-shadow',
          transitionDuration: '0.2s',
          boxShadow: 'md',
        }
      },
    }),
  },
});

export default theme;
