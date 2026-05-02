# @eventuras/core

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
