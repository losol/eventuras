---
'@eventuras/e2e': patch
---

The org-admin persona is optional again. It was required when the Playwright config loaded, so every environment running the suite without `E2E_ORGADMIN_EMAIL` failed before a single test ran — including the image smoke test, which turned main's end-to-end build red, and the staging run, whose realm does not seed that account at all.

Only the development realm seeds `orgadmin@example.com`, so the persona is now used where it exists and skipped where it does not: its login setup, its org grant and the three specs that pin it all skip with a stated reason when the variable is unset. With the variable, as the AppHost writes it, they run as before.
