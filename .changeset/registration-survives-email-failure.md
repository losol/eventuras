---
'@eventuras/api': patch
---

A registration is no longer lost when its confirmation email cannot be sent. The send failure used to escape and fail the whole request with a 500, so the participant was told the registration failed while it sat saved in the database. The failure is now recorded on the registration's audit trail as `registration.notification.failed`, alongside the error, so the message can be found and sent again.
