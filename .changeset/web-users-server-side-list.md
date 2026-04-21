---
"@eventuras/web": minor
---

refactor(web): align admin/users with registrations patterns

- Server-side pagination on `/admin/users` via `?page=` URL param
  (replaces the client-side 10-row window that didn't scale).
- Server-side search via `?q=` forwarded to the SDK's `Query`
  parameter; debounced input resets `?page=` on a new search.
- `createUser`, `updateUser`, and `updateUserProfile` run API errors
  through `formatApiError` + `readCorrelationIdFromResponse`, matching
  the registrations actions for operational debugging parity.
- Pagination input hardened against `NaN` / out-of-range URL values.
- Adds `common.labels.search` in both locales.
