---
'@eventuras/api': patch
---

Render the certificate-delivery email through DocComposer/`IEmailComposer` instead of the hardcoded Norwegian `Subject = "Kursbevis for {Title}"` and `TextBody = "Her er kursbeviset! Gratulere!"` strings in `CertificateBackgroundWorker`. Adds `certificate-delivery.{nb,en}.liquid` embedded templates, a `CertificateDeliveryEmailModel` record, and a small `CertificateDeliveryEmailRenderer` that wraps `FluidEmailComposer` and pulls subject from `<title>` plus a derived plain-text alternative. The outgoing email now also includes an HTML body (it was text-only before).
