import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ mode }) => ({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/setup.ts'],
    include: ['src/**/*.{test,spec}.{js,ts}'],
    env: loadEnv(mode, process.cwd(), ''),
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/types.ts',
      ],
    },
    testTimeout: 15000, // 15 seconds for API calls
    hookTimeout: 15000,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
}));
