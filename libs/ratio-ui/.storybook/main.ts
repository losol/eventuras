import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  "stories": [
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    '../src/**/*.docs.mdx'
  ],
  "addons": [
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
    '@storybook/addon-onboarding',
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
