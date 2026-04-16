---
"@eventuras/ratio-ui": patch
---

Move build/dev tooling from `dependencies` to `devDependencies`:
`@storybook/react`, `@tailwindcss/vite`, `@tailwindcss/postcss`,
`@swc/helpers`, and `ajv`. None are imported in runtime code — they
were incorrectly listed as production dependencies, causing
`npm install @eventuras/ratio-ui` to pull in ~50MB of tooling that
consumers never use.
