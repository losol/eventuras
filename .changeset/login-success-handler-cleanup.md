---
"@eventuras/web": patch
---

`LoginSuccessHandler` cleanup:

- Wrap the immediate `checkAuth()` call so a rejection logs at error
  level instead of becoming an unhandled promise rejection.
- Drop the per-page-load debug log when the `?login=success` parameter
  isn't present — the silent path is the common case and the noise
  showed up everywhere when debug filters were on.
- Use a single `URL` object for both reading and cleaning the query
  parameter.
- Document why the `hasChecked` ref exists (StrictMode dev double-fire)
  and replace the dated `useSearchParams` comment with the actual
  reason (avoiding a Suspense boundary in the layout).
