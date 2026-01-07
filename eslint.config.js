import { config as baseConfig } from '@eventuras/eslint-config/base';

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...baseConfig,
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/.next/**', '**/build/**'],
  },
  {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
    rules: {
      // Disable Mocha rules for Vitest/other test frameworks
      'mocha/no-skipped-tests': 'off',
      'mocha/no-top-level-hooks': 'off',
    },
  },
];
