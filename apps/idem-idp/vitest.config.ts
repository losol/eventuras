import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',

    // Load environment variables for tests
    env: {
      NODE_ENV: 'development', // Use development config for tests (http://localhost:3200)
      IDEM_DATABASE_URL: process.env.IDEM_DATABASE_URL || '',
    },

    // Pattern to find test files (colocated with source)
    include: ['src/**/*.{test,spec}.{ts,tsx}'],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.spec.ts',
'src/db/migrate-*.ts',
      ],
    },

    // Test timeout
    testTimeout: 10000,

    // Setup files
    setupFiles: ['./src/test/setup.ts'],
  },
});
