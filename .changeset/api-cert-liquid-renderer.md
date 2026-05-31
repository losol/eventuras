---
'@eventuras/api': patch
---

Add `LiquidCertificateRenderer` (standalone, not yet registered) along with `CourseCertificateModel` and `CourseCertificateModelMapper`. Renderer composes the embedded Liquid templates from PR #1502 with `CertificateViewModel` data and produces HTML + PDF via `IPdfRenderService`. Wiring into `ICertificateRenderer` follows in the next PR.
