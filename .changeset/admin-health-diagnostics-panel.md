---
"@eventuras/web": patch
---

Surface backend health diagnostics in admin: the `/admin/system` page reads the API's admin-only `/health/diagnostics` and renders each check as a ratio Panel (red on problems), and the `/admin` dashboard shows a warning banner — linking on to the details — whenever a check is not Healthy. Starts with pending database migrations.
