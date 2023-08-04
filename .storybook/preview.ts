import type { Preview } from '@storybook/react';
import '../styles/globals.css';

import { withThemeByClassName } from '@storybook/addon-styling';

const themes = {
  clearable: false,
  list: [
    {
      name: 'Light',
      class: [],
      color: '#ff0000',
      default: true,
    },
    {
      name: 'Dark',
      class: ['dark'],
      color: '#000000',
    },
  ],
};

export const parameters = {
  themes: { themes },
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    expanded: true,
    hideNoControlsWarning: true,
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
    docs: {
      toc: true,
    },
  },
};

export const decorators = [
  withThemeByClassName({
    themes: {
      light: '',
      dark: 'dark',
    },
    defaultTheme: 'dark',
  }),
];
