import { defineWorkspace } from 'vitest/config';
import { storybookTest } from '@storybook/addon-vitest/plugin';

export default defineWorkspace([
  {
    extends: 'vite.config.ts',
    plugins: [
      storybookTest({
        storybookScript: 'pnpm run storybook -- --ci',
      }),
    ],
    test: {
      name: 'storybook',
      browser: {
        enabled: true,
        headless: true,
        name: 'chromium',
        provider: 'playwright',
      },
      setupFiles: ['.storybook/vitest.setup.ts'],
    },
  },
]);
