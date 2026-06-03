---
"@eventuras/api": minor
---

Send a product's own sales account to PowerOffice when the product is first created there. The per-product `salesAccount` now flows through the invoice line; when a product has none, the integration keeps falling back to the organization default (`POWER_OFFICE_DEFAULT_SALES_ACCOUNT`). Existing PowerOffice products are still never modified.
