# Spec: status-driven registration notifications

## Background

Today a single "welcome letter" is sent from `CreateRegistrationAsync`
([RegistrationManagementService.cs](../../apps/api/src/Eventuras.Services/Registrations/RegistrationManagementService.cs)):

- It fires on **create**, gated on `registration.Status != WaitingList` — but a
  registration only becomes `WaitingList` at create time if the whole **event**
  is in `WaitingList` status.
- Admin flow is create (status `Verified` → welcome letter sent) **then** set
  `WaitingList` via PATCH. So a participant the admin puts on the waiting list
  still receives a "you're registered" confirmation. ← the reported bug.
- The body is a free-text per-event field (`EventInfo.WelcomeLetter`) — no order
  details, easy to leave empty/stale.

Status changes via PATCH (`UpdateRegistrationAsync`) send nothing.

## Goal

The email a participant receives is decided by the registration's **final
status**, not by event status at create time:

| Status                | Email                                                        |
| --------------------- | ------------------------------------------------------------ |
| `Verified`            | Registration receipt: copy of the registration + all orders |
| `WaitingList`         | "You're on the waiting list" for the event                  |
| `Draft`               | none                                                         |
| `Cancelled`           | none (cancellation email is a separate concern)             |

No PDF — HTML email bodies only.

## Design

### Template engine — reuse DocComposer (Fluid/Liquid)

The certificate emails already use `FluidEmailComposer` from
[Eventuras.Libs.DocComposer](../../apps/api/src/Eventuras.Libs.DocComposer),
rendering embedded `.liquid` templates per locale
(see `CertificateDeliveryEmailRenderer`). Reuse the same engine — no new
dependency, no PDF.

- Add a `RegistrationEmailRenderer` mirroring `CertificateDeliveryEmailRenderer`:
  a model record → `ComposeAsync(templateName, model, locale)` → `RenderedEmail`
  (subject + HTML body).
- Templates as embedded resources per locale (`nb`, `nn`, `en`):
  - `registration-receipt.<locale>.liquid`
  - `registration-waitlist.<locale>.liquid`
- Model carries: event (title, dates, location), participant, and the orders
  (line items: product, qty, unit price, line total; order total).

### Trigger — on status transition, not on create

Centralize in one place that maps a status transition to the right email, so it
is correct regardless of create-then-patch ordering and so orders exist first:

- `Draft/none → Verified` ⇒ receipt
- `→ WaitingList` ⇒ waitlist email
- Wire it into the status-transition path (`UpdateRegistrationAsync` /
  `PatchRegistration`) and the create path, both funneling through the mapper.
- **Idempotency:** only send on an actual status change (compare before/after —
  the audit-delta already loaded in `UpdateRegistrationAsync`), so repeated
  saves or re-selecting the same status don't re-send.

### Removing the welcome letter

- Retire the `EventInfo.WelcomeLetter` auto-send (and the `SendWelcomeLetter`
  create option) in favour of the status-driven receipt. Keep the field
  readable for one release if any event relies on custom copy, but stop
  auto-sending it on create.

## Immediate stopgap (optional, until the above lands)

Add a "Send confirmation" checkbox to the admin **add participant** dialog
(default on); uncheck it when adding someone straight to the waiting list, which
passes `SendWelcomeLetter=false`. Low effort, no backend change. Superseded by
the redesign.

## Open decisions

1. Orders in the receipt: HTML table in the body (recommended) — confirmed no PDF.
2. Should `Attended`/`Finished`/`NotAttended`/`Cancelled` transitions send
   anything? (assumed no for now.)
3. Do we keep per-event custom copy (a Liquid snippet slot in the template) or
   go fully standardized?

## Implementation steps

1. `RegistrationEmailRenderer` + model record (event + participant + orders).
2. Embedded `.liquid` templates (receipt + waitlist) for nb/nn/en.
3. A `RegistrationNotificationService` mapping status → email, with idempotency.
4. Wire create + status-transition paths through it; stop the welcome-letter
   auto-send.
5. Tests: transition → correct email (or none), orders rendered, idempotent.
