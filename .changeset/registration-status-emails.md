---
"@eventuras/api": minor
---

Status-driven registration emails. A registration now gets an email based on its status: a receipt (a copy of the registration and its orders) when confirmed, and a "you're on the waiting list" email when placed on the waiting list. This replaces the single per-event "welcome letter". The `sendWelcomeLetter` field on `POST /v3/registrations` is deprecated and ignored (to be removed in the next API version).
