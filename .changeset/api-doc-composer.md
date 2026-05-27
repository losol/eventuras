---
'@eventuras/api': patch
---

Add `Eventuras.Libs.DocComposer` for rendering localized Liquid templates with Fluid. Provides a core `IDocumentComposer` for HTML output (intended for emails, certificates, invoices) and a thin `IEmailComposer` wrapper that derives subject and plain-text body.
