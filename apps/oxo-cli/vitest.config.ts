import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.*',
      ],
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
    // Required for @oclif/test compatibility with Vitest
    // See: https://oclif.io/docs/testing#vitest
    disableConsoleIntercept: true,
    environment: 'node',
    globals: true,
    hookTimeout: 15_000,
    include: ['src/**/*.{test,spec}.{js,ts}'],
    testTimeout: 15_000, // 15 seconds for CLI commands and API calls
  },
});
