---
"@eventuras/web": minor
---

The public events page can show past courses: `/events?archive=true` lists events that have ended, newest first, fifty per page with previous/next links, and the upcoming list links to it. The archive starts where the API's upcoming list stops, so a course is never in both lists at once. A page number past the end lands on the last page.
