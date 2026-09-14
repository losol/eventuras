---
'@eventuras/web': minor
---

Sending an event notification now goes through a confirmation step that names who receives it. The step resolves recipients from the `eventId` that will actually be sent — the event title and dates are fetched by that id rather than taken from the page — so a form aimed at the wrong event says so instead of echoing the page back. Recipients mirror the API's own rules (requested statuses and types, active users only, reachable on the channel), and sending is blocked when the filter resolves to nobody.

The admin sidebar's event-section links now follow the URL instead of the pinned event in `sessionStorage`. A stale pin could previously point those links at a different event than the one on screen, with no visible difference but a small muted title. The pinned title, participant count and activity log are shown only when the pin matches the event in the URL, and the product summary page pins too, so the pin no longer drifts there.

The sidebar's participant count comes from the event statistics instead of `registrations.length`, which was one page of at most 100 and counted cancellations and the waiting list.
