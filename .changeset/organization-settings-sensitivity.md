---
'@eventuras/api': minor
'@eventuras/event-sdk': minor
---

Organization settings now carry a sensitivity: `Public`, `Internal` or `Secret`. It says how freely a value may be handed out, and the API reads it when it builds a response — a `Secret` never leaves the server. Callers get `isSet` instead, so the UI can still say whether an integration is configured.

That closes a real hole: `GET /v3/organizations/{id}/settings` returned every value in clear text to any admin of the organization, so the SMTP password, the SendGrid key, the Twilio auth token and both PowerOffice keys could be read straight off the wire. Those five are now `Secret`. `PUT` and `POST` stop echoing a secret back in their response as well. Everything else defaults to `Internal`, which is what the endpoint did before, so no other value changes hands.

Secrets become write-only: you can set one and replace it, never read it back. Internal services are unaffected — they read values through `IOrganizationSettingsAccessorService`, not through this endpoint.

Register a secret with `[OrgSettingSensitivity(OrganizationSettingSensitivity.Secret)]` on the property, or by passing the sensitivity to `RegisterSetting`.
