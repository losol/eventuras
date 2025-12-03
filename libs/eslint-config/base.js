import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import turboPlugin from 'eslint-plugin-turbo';
import tseslint from 'typescript-eslint';
import onlyWarn from 'eslint-plugin-only-warn';
import eventurasPlugin from './rules/index.js';

/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const config = [
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  {
    plugins: {
      turbo: turboPlugin,
    },
    rules: {
      'turbo/no-undeclared-env-vars': 'warn',
    },
  },
  {
    plugins: {
      eventuras: eventurasPlugin,
    },
    rules: {
      'eventuras/no-invalid-testid': 'error',
      'eventuras/no-direct-event-sdk-import': 'error',
    },
  },
  {
    plugins: {
      onlyWarn,
    },
  },
  {
    ignores: [
      'dist/**',
      'test-results/**',
      'coverage/**',
      'build/**',
      'playwright-auth/**',
      'playwright-report/**',
      'out/**',
      'test-results/**',
      '**/migrations/**',
      '**/.next/**',
      '**/next-env.d.ts',
    ],
  },
];
