---
'@eventuras/api': minor
'@eventuras/event-sdk': minor
---

`POST /v3/registrations` accepts the participant's selected products in `products`. They are ordered together with the event's mandatory products, before the confirmation email is sent, so the receipt lists the whole order. Previously the only way to add selected products was a second request, which arrived after the email had already gone out with the mandatory products alone. Waiting-list registrations order nothing, exactly as before.
