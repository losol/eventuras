---
'@eventuras/api': patch
---

The development realm gained a second account, `orgadmin@example.com`, holding `Admin` and deliberately not `SystemAdmin`.

Until now the realm seeded one user with both roles, and `E2E_ADMIN_EMAIL` and `E2E_SYSTEMADMIN_EMAIL` both pointed at it — the suite's "admin" and "systemadmin" personas were the same account. That is enough to show a system admin may do something, but never that an organization's own admin may not, so anything gated on that distinction could not be tested, and a test asserting a refusal would have passed for the wrong reason.

The bootstrap step that grants org membership now covers both personas, so the new one is a real organization admin whose refusals say something about org-level rights rather than about not being a member. Three tests pin the persona itself: it is an org admin, it is refused a SystemAdmin-only endpoint, and it is a different account from the systemadmin persona.

`personas.ts` documented the personas as members of `eventuras-admins` and `eventuras-systemadmins` groups. The realm has no groups; the comment is corrected.

Recreate the Keycloak container to pick the new user up — `start-dev --import-realm` imports only when the realm is not already there.
