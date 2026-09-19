---
"@eventuras/api": patch
---

`GET /v3/events` without a date filter now keeps events that are still running, and keeps every event for one day after it ends. It previously required the start date to be today or later, so a multi-day course dropped out of the public listing the day after it started. The default now includes any event that starts or ends on or after yesterday; an event without an end date still ends on its start date.
