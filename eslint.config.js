import { config as baseConfig } from '@eventuras/eslint-config/base';

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...baseConfig,
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/.next/**', '**/build/**'],
  },
];
