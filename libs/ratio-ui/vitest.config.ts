import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

// Storybook play tests run in real Chromium via Playwright. They're useful
// locally and in Storybook UI but require a browser binary, so we opt out
// of running them during CI builds to keep `pnpm test` fast and dependency-free.
const isCI = process.env.CI === 'true';

export default defineConfig({
  test: {
    passWithNoTests: true,
    ...(isCI
      ? {}
      : {
          projects: [
            {
              extends: './vite.config.ts',
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
                  provider: playwright(),
                  instances: [{ browser: 'chromium' }],
                },
              },
            },
          ],
        }),
  },
});
