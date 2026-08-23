---
'@eventuras/web': minor
---

The event admin gets an overview section (now the default when opening an event): key facts — registered/max with waiting list, dates with duration, venue, revenue with draft-order count — plus the five latest registrations with status and order total, and the four latest notifications, each linking on to its full section. Order revenue maths is shared with the economy section via `computeOrderStatistics`, which now also counts refunded orders (shown as its own tile in the economy section) and leaves cancelled and refunded orders out of the revenue total.
