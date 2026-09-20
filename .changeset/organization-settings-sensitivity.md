---
'@eventuras/api': minor
'@eventuras/event-sdk': minor
---

Organization settings now carry a sensitivity: `Public`, `Internal` or `Secret`. It says how freely a value may be handed out, and the API reads it when it builds a response — a `Secret` never leaves the server. Callers get `isSet` instead, so the UI can still say whether an integration is configured.

That closes a real hole: `GET /v3/organizations/{id}/settings` returned every value in clear text to any admin of the organization, so the SMTP password, the SendGrid key, the Twilio auth token and both PowerOffice keys could be read straight off the wire. Those five are now `Secret`. `PUT` and `POST` stop echoing a secret back in their response as well. Everything else defaults to `Internal`, which is what the endpoint did before, so no other value changes hands.

Secrets become write-only: you can set one and replace it, never read it back. Internal services are unaffected — they read values through `IOrganizationSettingsAccessorService`, not through this endpoint.

Register a secret with `[OrgSettingSensitivity(OrganizationSettingSensitivity.Secret)]` on the property, or by passing the sensitivity to `RegisterSetting`.

Settings also gained a `uuid`, so one can be referred to from outside — an audit trail, for instance — now that its value may be unreadable. To make that identity stable, clearing a setting no longer deletes its row: the value is set to null and the row, with its uuid, stays. Setting it again keeps the same uuid instead of minting a new one. A setting that has never been set still has no row, and so no uuid; `PUT` with a blank value for one of those stores nothing, as before.

`POST` (batch) now returns the cleared settings alongside the written ones, rather than omitting them, so a caller sees their `isSet` and `uuid`.

Two consequences of keeping the row worth knowing about: `ReadOrganizationSettingsAsync<T>` now skips blank values rather than converting them, which would throw for `int` and `bool` properties; and `PUT`/`POST` with a blank value return the setting rather than an empty value object.
