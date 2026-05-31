---
'@eventuras/api': patch
---

Rename the Norwegian course certificate template from `course-certificate.no.liquid` to `course-certificate.nb.liquid` to use the precise Bokmål BCP 47 tag instead of the `no` macrolanguage. `LiquidCertificateRenderer` now normalises `no`/`nb`/`nn` (and their regional variants) to `nb`, leaving room for a dedicated Nynorsk template later without further code changes.
