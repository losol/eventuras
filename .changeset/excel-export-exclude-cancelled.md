---
'@eventuras/api': patch
'@eventuras/web': patch
---

Excel participant lists no longer include cancelled registrations. The registrations endpoint accepts a `Statuses` query parameter (exposing the service layer's existing status filter), and the admin Excel export requests every status except `Cancelled`.
