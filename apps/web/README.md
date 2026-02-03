# Eventuras/web - Eventuras frontend

This is the front end for Eventuras event management system.

## Getting Started

First, ensure the backend api is running.

If developing locally copy .env-local to .env and fill in the blanks (ask or lookup secrets on auth0).

For production environment these variables should as environment variables.

## Development

To start development server

```bash
pnpm install
turbo dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## UI Components and Storybook

When developing components, feel free to add stories, and use storybook to develop them.
To start storybook run

```bash
npm run storybook
```

## Logging

Use `import { Logger } from '@eventuras/logger'` for Logging - it internally uses debugger and you can assign namespaces to filter out unwanted logs.
Using console.log will throw an eslint error - which means for commits no console.log(or any use of console) will be allowed.

## API swagger documentation

<https://api.example.com/swagger/index.html>

## API documentation

Check out [api documentation](src/utils/api/README.md)

## Precommit hook

In package.json there is a lint-staged section which shows all the actions taken on staged files.
Unfortunately tsc ignores tsconfig (see why section of <https://github.com/gustavopch/tsc-files>). So we use tsc-files to do these checks. Unfortunately it generates tsconfig.\*.tsbuildinfo files, but these should be automatically removed.

## Code style

We are open to most standards, as long as there is one. We were inspired by [joshchus setup](https://dev.to/joshchu/how-to-setup-prettier-eslint-husky-and-lint-staged-with-a-nextjs-and-typescript-project-i7b)

## Translations

We use next-intl as our translation library.

### i18n-ally

This is a plugin for visual code which makes it easier to see the translations inline and to edit them inline - there is also, through the command palette the option to auto-add keys for labels which haven't been translated yet. To effectively use the plugin, after installing add these settings to your user settings:

```json
    "i18n-ally.displayLanguage": "en-US",
    "i18n-ally.localesPaths": [
        "apps/web/locales"
    ],
    "i18n-ally.sourceLanguage": "en-US",
    "i18n-ally.namespace": true,
    "i18n-ally.enabledParsers": [
        "json"
    ],
    "i18n-ally.enabledFrameworks": [
        "next-translate"
    ],
    "i18n-ally.pathMatcher": "{locale}/{namespace}.json",
    "i18n-ally.extract.keyMaxLength": 50,
    "i18n-ally.dirStructure": "dir",
    "i18n-ally.sortKeys": true,
    "i18n-ally.annotationDelimiter": "-",
    "i18n-ally.languageTagSystem": "bcp47",
    "i18n-ally.fullReloadOnChanged": true,
    "i18n-ally.keystyle": "nested"
```

## Testing

### Cloudflare tunnels

An easy way to test the solution on a mobile device is to use cloudflare tunnels. This will allow you to access the app on your mobile device through a tunnel to your local machine. To do this, install cloudflared (`brew install cloudflared`) from <https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation> and then run `cloudflared tunnel --url http://localhost:3000`.

### End-to-end testing with Playwright

We have configured initial playwright tests which can be run interactively(you need a browser available on your machine) or on the command line(@see package.json for scripts, command line runs headless browsers, requires external dependency installs @see playwright docs). Make sure to fill out env variables(check the template and ask around for username/password). These will silently error out as they are not included in the Environment wrapper, as the app can run perfectly fine without a test user set up.

Run `npx playwright install` to install the correct version of playwright for your machine. This will install the correct version of chromium. Make sure eventuras is running - `npx next dev`, and then run `npm run test:playwright:ui` to run the tests.

Any future playwright end-to-end tests should go into the playwright-e2e folder. [Further reading here](playwright-e2e-/README.md).
