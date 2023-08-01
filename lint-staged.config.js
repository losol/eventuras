module.exports = {
  // from https://dev.to/joshchu/how-to-setup-prettier-eslint-husky-and-lint-staged-with-a-nextjs-and-typescript-project-i7b
  // this will check Typescript files
  '**/*.(ts|tsx)': () => 'yarn tsc --noEmit',

  // This will lint and format TypeScript and                                             //JavaScript files
  '**/*.(ts|tsx|js)': filenames => [
    `yarn eslint --fix ${filenames.join(' ')}`,
    `yarn prettier --write ${filenames.join(' ')}`,
  ],

  // this will Format MarkDown and JSON
  '**/*.(md|json)': filenames => `yarn prettier --write ${filenames.join(' ')}`,
};
