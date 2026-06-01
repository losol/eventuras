---
'@eventuras/api': minor
---

Switch course certificate rendering from the Razor `CertificateRenderer` (with `Templates/Certificates/CourseCertificate.cshtml`) to `LiquidCertificateRenderer`. `ICertificateRenderer` gains a required `locale` parameter on both `RenderToHtmlAsStringAsync` and `RenderToPdfAsStreamAsync` (breaking). Existing call sites hardcode `"nb"` with a TODO until real locale plumbing (Accept-Language / user preference / org default) lands in a follow-up.
