import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  "stories": [
    '../src/**/*.mdx',
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
    '@storybook/addon-themes',
    '@storybook/addon-vitest'
  ],
  "framework": {
    "name": '@storybook/react-vite',
    "options": {}
  },
  core: {
    disableTelemetry: true,
    disableWhatsNewNotifications: true,
  },
};
export default config;
