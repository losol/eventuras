---
'@eventuras/web': patch
---

The registration CTA in the event hero now has its own test id (`event-registration-button-hero`) so `event-registration-button` uniquely identifies the one in the registration card, and `/api/healthz` reports `gitSha` and `imageTag` so a deploy gate can verify which build is serving without authenticating.
