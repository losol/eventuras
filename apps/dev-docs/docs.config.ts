import { defineDocsConfig } from '@eventuras/docs-framework';

export default defineDocsConfig({
  output: './content',
  sources: [
    // Main documentation (currently in docs/)
    {
      glob: 'docs/**/*.{md,mdx}',
      target: '/',
    },

    // Library READMEs → /libraries section
    {
      glob: 'libs/*/README.md',
      target: '/libraries',
      titleFromPackageJson: true,
      descriptionFromPackageJson: true,
      sectionTitle: 'Libraries',
    },

    // Library sub-docs (e.g. ratio-ui component docs, eslint custom rules)
    {
      glob: 'libs/*/docs/**/*.md',
      target: '/libraries',
    },

    // App-level docs
    {
      glob: 'apps/web/docs/**/*.md',
      target: '/apps/web',
      sectionTitle: 'Web App',
    },

    // E2E test documentation
    {
      glob: 'tests/e2e/README.md',
      target: '/testing',
      sectionTitle: 'Testing',
    },
    {
      glob: 'tests/e2e/GMAIL_SETUP.md',
      target: '/testing',
    },
    {
      glob: 'tests/e2e/specs/shared/API_TESTING.md',
      target: '/testing',
    },

    // Contributing & project-level docs
    {
      glob: 'CONTRIBUTING.md',
      target: '/',
    },
  ],
});
