---
"@eventuras/core": patch
---

Fix `formatCompactDateRange` so locales that already include a trailing period after the day (like nb-NO rendering `14.`) don't end up with a double period before the en-dash. The same-month branch now extracts the locale-formatted `day` part via `Intl.DateTimeFormat.formatToParts(...)` instead of taking the full `{ day: 'numeric' }` string (which silently includes the locale's trailing punctuation).

Before (nb-NO): `14..–16. SEP`
After (nb-NO): `14.–16. SEP`

Locales using non-Latin digits (e.g. Arabic) still get their localized digit forms — only the trailing punctuation is stripped.
