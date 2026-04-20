---
"@eventuras/web": minor
"@eventuras/api": minor
"@eventuras/event-sdk": minor
---

feat(web): show business-events Timeline on admin registration/order pages

Admins browsing `/admin/registrations/{id}` or `/admin/orders/{id}`
now see an "Activity" section at the bottom with a vertical timeline
of the resource's BusinessEvents — status changes, cancellations,
invoicing, etc. — fetched server-side via
`GET /v3/business-events?subjectType=&subjectUuid=`. The new
`<BusinessEventsTimeline>` server component maps each
`BusinessEventDto` onto a `<Timeline.Item>` from
`@eventuras/ratio-ui/core/Timeline`, with:

- formatted `createdAt` timestamp
- the event's human-readable `message` as the title
- dot colour derived from the event type suffix (`.created` →
  success, `.cancelled`/`.refunded` → warning, `.invoiced` → info)
- optional actor (short Uuid for now; name resolution is a follow-up)
- metadata rendered as a collapsed JSON block when present

Also exposes `Uuid` on `OrderDto` so the SDK has the subject key
available without an extra lookup; `RegistrationDto.uuid` already
existed. Access is enforced server-side by the endpoint's admin
policy and org-membership check — the component itself does not
re-validate.
