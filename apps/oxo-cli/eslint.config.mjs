import {includeIgnoreFile} from '@eslint/compat'
import oclif from 'eslint-config-oclif'
import prettier from 'eslint-config-prettier'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

const gitignorePath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '.gitignore')

export default [
  includeIgnoreFile(gitignorePath),
  ...oclif,
  prettier,
  {
    // Disable import/no-unresolved for @eventuras/* workspace packages
    // ESLint's import resolver doesn't handle package.json subpath exports well
    rules: {
      'import/no-unresolved': [
        'error',
        {
          ignore: ['^@eventuras/'],
        },
      ],
    },
  },
  {
    // Disable mocha rules for Vitest test files
    files: ['**/*.test.ts', '**/*.spec.ts'],
    rules: {
      'mocha/no-exclusive-tests': 'off',
      'mocha/no-skipped-tests': 'off',
      'mocha/no-top-level-hooks': 'off',
    },
  },
]
