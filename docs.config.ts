// Developer docs, collected and built by lectio (`npx lectio-docs build` → dist/).
export default {
  // Collected manifest + markdown land here (gitignored); the static site is dist/.
  output: '.lectio',

  sources: [
    // Main documentation.
    { glob: 'docs/**/*.{md,mdx}', target: '/' },

    // Library READMEs → /libraries, titled/described from each package.json.
    {
      glob: 'libs/*/README.md',
      target: '/libraries',
      titleFromPackageJson: true,
      descriptionFromPackageJson: true,
      sectionTitle: 'Libraries',
    },

    // Library sub-docs (e.g. component docs, custom rules).
    { glob: 'libs/*/docs/**/*.md', target: '/libraries' },

    // App-level docs.
    { glob: 'apps/web/docs/**/*.md', target: '/apps/web', sectionTitle: 'Web App' },

    // E2E test documentation.
    { glob: 'tests/e2e/README.md', target: '/testing', sectionTitle: 'Testing' },
    { glob: 'tests/e2e/GMAIL_SETUP.md', target: '/testing' },
    { glob: 'tests/e2e/specs/shared/API_TESTING.md', target: '/testing' },

    // Contributing & project-level docs.
    { glob: 'CONTRIBUTING.md', target: '/' },
  ],

  // "Edit this page" links resolve to this repo.
  editUrl: 'https://github.com/losol/eventuras/edit/main/{path}',

  site: {
    title: 'Eventuras Developer Docs',
    githubUrl: 'https://github.com/losol/eventuras',
  },
};
