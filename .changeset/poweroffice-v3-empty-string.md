---
"@eventuras/api": patch
---

fix(poweroffice): null out empty strings before calling Go SDK v3

PowerOffice Go v3 rejects empty strings in optional fields with a
validation error. Normalize `""` to `null` for VAT number, email and
address fields when creating a customer.
