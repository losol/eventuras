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

## Site settings: occasions

The hosted site-settings JSON (`SITE_SETTINGS_URL`) may carry an `occasions` block under
`site` for days the site marks — mourning, Pride, Christmas, New Year, Constitution Day. The
app validates it entry by entry (invalid entries are logged and dropped, never fatal), resolves
what is active per request in the site's time zone, and sets `data-occasion` on `<html>` — plus
ratio-ui's `data-motion="none"` switch during mourning. Nothing is styled yet: per ratio-ui's
`docs/occasions.md` the app owns one CSS block per occasion on the `ratio-navbar` / `ratio-hero`
hooks and feeds the motif/wash slots from config; that, and announcements (`Announcement`),
follow once ratio-ui 2.20 is published.

```json
{
  "site": {
    "theme": "bureau",
    "occasions": {
      "timeZone": "Europe/Oslo",
      "override": {
        "id": "mourning",
        "from": "2026-08-29",
        "until": "2026-09-14",
        "theme": "ink",
        "colorScheme": "dark"
      },
      "schedule": [
        { "id": "constitution-day", "from": "05-16", "until": "05-17" },
        { "id": "christmas", "from": "12-15", "until": "12-26" },
        { "id": "new-year", "from": "12-31", "until": "01-01" },
        { "id": "pride", "from": "2026-06-19", "until": "2026-06-28" }
      ]
    }
  }
}
```

- `id`: any lowercase slug (`^[a-z0-9]+(-[a-z0-9]+)*$`, ≤ 40 chars). Which ids get styling is decided in ratio-ui; an unknown id passes through and styles nothing. `mourning` is the one id the app itself reacts to (motion off)
- `from`/`until`: inclusive; `YYYY-MM-DD` for a one-off, `MM-DD` for a yearly window (may wrap the year end)
- Resolution: `override` (inside its window) → first matching `schedule` entry → none
- `theme`: a named ratio-ui palette (`bureau`, `ink`, …) on `data-theme` while the occasion is active; absent = the standard theme
- `colorScheme`: `light` or `dark`, forced while the occasion is active. Rendered server-side as `data-color-scheme`; the stored preference is ignored and the theme toggle is hidden. The user's own choice returns untouched when the occasion ends
- `site.theme` / `site.colorScheme` (outside `occasions`): the same, always on — a site that is `bureau`, or dark by design

Theming is two axes, per ratio-ui's contract: `data-theme` is the palette and belongs to the server (site or occasion), `data-color-scheme` is light/dark and is the user's toggle unless forced. Colours, CSS and motifs never come from JSON.

Run the unit tests with `pnpm test`.

## Testing

### Cloudflare tunnels

An easy way to test the solution on a mobile device is to use cloudflare tunnels. This will allow you to access the app on your mobile device through a tunnel to your local machine. To do this, install cloudflared (`brew install cloudflared`) from <https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation> and then run `cloudflared tunnel --url http://localhost:3000`.

### End-to-end testing with Playwright

We have configured initial playwright tests which can be run interactively(you need a browser available on your machine) or on the command line(@see package.json for scripts, command line runs headless browsers, requires external dependency installs @see playwright docs). Make sure to fill out env variables(check the template and ask around for username/password). These will silently error out as they are not included in the Environment wrapper, as the app can run perfectly fine without a test user set up.

Run `npx playwright install` to install the correct version of playwright for your machine. This will install the correct version of chromium. Make sure eventuras is running - `npx next dev`, and then run `npm run test:playwright:ui` to run the tests.

Any future playwright end-to-end tests should go into the playwright-e2e folder. [Further reading here](playwright-e2e-/README.md).
