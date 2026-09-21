---
'@eventuras/web': minor
---

A person's name in admin now opens a user drawer: their personal details, their registrations and their orders in the organization, newest first, each linking on to the event or order. It is one drawer in the admin shell, so the same name opens it from the user list, the participant list, the event dashboard, the product delivery summary, the order and registration lists, and the registration details. Following a link out of it closes it.

The participant list's user icon and the user list's "View" button are gone; the name does the job, and editing the user is in the drawer's footer.

The detail pages for users, orders, certificates and collections lost their white header band in dark mode. It came from `dark:bg-black`, a variant that doesn't exist in ratio-ui's stylesheet, so only `bg-white` ever applied.
