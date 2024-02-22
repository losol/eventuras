/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ['@eventuras/eslint-config/package.js'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.lint.json',
  },
};
