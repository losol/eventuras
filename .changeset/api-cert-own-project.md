---
'@eventuras/api': patch
---

Move the certificate stack from `Eventuras.Services` into a dedicated `Eventuras.Services.Certificates` project (with its own `Eventuras.Services.Certificates.Tests` test project), matching the pattern already used for `Eventuras.Services.Converto`, `Eventuras.Services.PowerOffice`, and other satellite integrations. The 21 cert source files, the `CertificateBackgroundWorker`, the embedded Liquid templates, and the 3 cert tests all moved; `Eventuras.Services` no longer references `Eventuras.Libs.DocComposer` or `Microsoft.Extensions.FileProviders.Embedded`. `AddCertificateServices()` is now called from `Eventuras.WebApi`'s service-collection extension instead of from `AddCoreServices()` so `Services` itself stops depending on cert-specific infrastructure. Pure mechanical refactor — no behavior change.
