---
"@eventuras/core": minor
"@eventuras/web": patch
---

feat(core): add `formatApiError` under `@eventuras/core/errors`

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
