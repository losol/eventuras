import { config } from '@eventuras/eslint-config/base';

export default [
  ...config,
  {
    ignores: ['.homeybuild/**'],
  },
];
