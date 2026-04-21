---
"@eventuras/api": minor
---

feat(api): populate actorUserUuid on business events

`RegistrationManagementService`, `OrderManagementService`, and
`InvoicingService` now take `IHttpContextAccessor` and pull
`User.GetUserId()` off the current request to populate
`actorUserUuid` on every emitted BusinessEvent
(`registration.status.changed`, `registration.type.changed`,
`order.status.changed`). Actor is `null` for unauthenticated or
background paths — no change in behavior for those.
