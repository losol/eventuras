---
'@eventuras/web': minor
---

The admin system page is split by role. Every admin sees the state of the installation — the health checks, and a new version section naming the running build of the web app and the API (version, commit, build time, image tag). The rest is SystemAdmin-only and labelled as such: the organization settings, and the diagnostics buttons that deliberately raise errors.

The page no longer prints `POWER_OFFICE_APP_KEY` in clear text. It lists every registered setting grouped by section and reads the API's own `sensitivity`, so a secret is shown as a secret and its value never reaches the browser. Whether one is configured comes from `isSet` rather than being inferred from a blank value — once the value is withheld, an empty one means nothing.

Both have a fallback for a deployment where the web app is ahead of the API: a credential-looking name still counts as a secret, and an absent `isSet` falls back to the value. Without them a version skew would print a credential in clear text, or report every configured secret as missing.

`triggerErrorTest` had no role check of its own and `triggerWebServerError` accepted any org Admin; both now require SystemAdmin, matching who can see the buttons.
