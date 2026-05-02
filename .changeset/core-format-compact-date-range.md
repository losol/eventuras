---
"@eventuras/core": minor
---

Add `formatCompactDateRange` to `@eventuras/core/datetime` for dense listings — produces uppercased pill-style labels like `"14. SEP"`, `"14.–16. SEP"`, `"30. AUG–2. SEP"`, or `"30. DEC 2026–2. JAN 2027"` depending on whether the range crosses months or years. Returns an empty string when no start date is supplied.

Pairs with the mono caps tile pattern in event tiles, search result rows, related-event lists, and similar dense displays where the existing `formatDateSpan` (`"14.9.2026 - 16.9.2026"`) is too verbose.
