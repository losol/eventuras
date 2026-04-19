---
"@eventuras/api": minor
"@eventuras/web": minor
---

feat: BusinessEvent → Organization link (audit/tenant tracking)

The `BusinessEvent` append-only log is now tenant-aware:

- New `OrganizationUuid` column on `BusinessEvents`, with a FK to
  `Organizations.Uuid` (`OnDelete: Restrict` — archive orgs rather
  than delete through the audit trail). `Organization.Uuid` promoted
  to alternate key to serve as the FK target, with the previous
  `IX_Organizations_Uuid` unique index dropped to avoid a duplicate
  uniqueness structure.
- `IBusinessEventService.ListEventsAsync(orgUuid, subject, paging)`
  returns paged events for a given `(organization, subject)`, newest
  first, with `Uuid` as a stable tie-breaker for deterministic
  pagination under equal timestamps.
- `IBusinessEventService.AddEvent(...)` now accepts an optional
  `organizationUuid`. All existing call sites
  (`RegistrationsController.PatchRegistration`/`CancelRegistration`,
  `OrdersController.PatchOrder`,
  `OrderManagementService.CancelOrderAsync`,
  `InvoicingService.CreateInvoiceAsync`) resolve the tenant from the
  resource's registration → event → organization via the new
  `IRegistrationRetrievalService.GetOrganizationUuidAsync`, so audit
  data reflects the resource's actual owner rather than the
  `Eventuras-Org-Id` request header. `PatchRegistration` only
  resolves the tenant when `Status` or `Type` actually changed,
  avoiding an unnecessary 400 for no-op patches without the header.

The `web` bump tracks that the admin UI can now consume the new
audit data once the frontend wiring lands.
