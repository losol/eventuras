---
'@eventuras/api': patch
---

Add a `Certificates:DefaultLocale` setting (defaults to `nb-NO`) bound to `CertificateOptions` so the certificate renderer's default locale can be configured from `appsettings.json` without code changes. The two certificate controllers and the background worker now read it via `IOptions<CertificateOptions>` instead of a hardcoded value.
