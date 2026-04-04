---
"@eventuras/event-sdk": major
---

Regenerate SDK from v3 API OpenAPI specification.

- `SuperAdmin` role removed from API — only `Admin` and `SystemAdmin` remain
- Deprecated fields removed from response types: `Registration.log`, `Order.log`, `Order.externalInvoiceId`, `Order.paid`
- `EventFormDto.manageRegistrations` and `EventFormDto.externalRegistrationsUrl` still present but ignored by API
- `Certificate.certificateGuid` field preserved (renamed from `CertificateGuid` internally)
- New `uuid` field added to most entity response types
