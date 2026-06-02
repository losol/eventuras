# @eventuras/core

## 0.4.0

### Minor Changes

- a6ac019: Add `@eventuras/core/useragents` subpath export with an `isBot(userAgent)` helper. Patterns are vendored from [omrilotan/isbot](https://github.com/omrilotan/isbot) (public domain / Unlicense), compiled once at module load into a single regex, and work in browser, edge, and server runtimes without an extra npm dependency. Refresh `libs/core/src/useragents/patterns.json` from upstream when new crawlers start polluting events.

### Patch Changes

- 8e09062: Default `formatDate`/`formatDateSpan`/`formatCompactDateRange` to `Europe/Oslo` time zone so SSR (server clock, typically UTC) and client hydration (user device) produce identical date strings. Fixes React hydration error #418 on event pages for users whose device time zone differs from the server's. Override via the new `timeZone` option (or `timeZone` argument on `formatCompactDateRange`) when a different zone is needed.

## 0.3.1

### Patch Changes

- ac349ed: Fix `formatCompactDateRange` so locales that already include a trailing period after the day (like nb-NO rendering `14.`) don't end up with a double period before the en-dash. The same-month branch now extracts the locale-formatted `day` part via `Intl.DateTimeFormat.formatToParts(...)` instead of taking the full `{ day: 'numeric' }` string (which silently includes the locale's trailing punctuation).

  Before (nb-NO): `14..–16. SEP`
  After (nb-NO): `14.–16. SEP`

  Locales using non-Latin digits (e.g. Arabic) still get their localized digit forms — only the trailing punctuation is stripped.

## 0.3.0

### Minor Changes

- 71d4644: Add `formatCompactDateRange` to `@eventuras/core/datetime` for dense listings — produces uppercased pill-style labels like `"14. SEP"`, `"14.–16. SEP"`, `"30. AUG–2. SEP"`, or `"30. DEC 2026–2. JAN 2027"` depending on whether the range crosses months or years. Returns an empty string when no start date is supplied.

  Pairs with the mono caps tile pattern in event tiles, search result rows, related-event lists, and similar dense displays where the existing `formatDateSpan` (`"14.9.2026 - 16.9.2026"`) is too verbose.

## 0.2.0

### Minor Changes

- a2e6ba0: feat(core): add `formatApiError` under `@eventuras/core/errors`

  Extracts a shared `formatApiError(raw, fallback)` helper that turns SDK
  error payloads into a human-readable string. Handles:
  - Plain string bodies (the SDK falls back to the text body when the
    response isn't JSON).
  - ASP.NET Problem Details (RFC 7807) with `errors: { Field: [msgs] }`
    — surfaces per-field validation feedback.
  - Problem Details `detail` and `title` fields (previously `detail` was
    ignored so callers saw the generic fallback even when the backend
    provided a clear explanation).
  - Legacy shapes with `body.message`, `message`, and `statusText`.

  Replaces the inline copy that landed in `apps/web` for event updates
  and extends the same handling to `updateRegistration` and
  `patchRegistration` server actions so admins see the actual API error
  instead of `"Failed to update registration"`.

## 0.1.1

### Patch Changes

- 7c9fe79: chore: update dependencies

## 0.1.0

### Minor Changes

- Initial release with regex validation patterns and datetime utilities
  - **Regex patterns:**
    - internationalPhoneNumber
    - letters
    - lettersAndSpace
    - lettersSpaceAndHyphen
  - **DateTime utilities:**
    - formatDate
    - formatDateSpan
