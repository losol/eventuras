/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ['@eventuras/eslint-config/library.js'],
  ignores: ['**/dist/**', '**/node_modules/**', '**/.next/**', '**/build/**'],
};
