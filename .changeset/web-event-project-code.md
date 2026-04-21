---
"@eventuras/web": minor
---

feat(web): add Project Code field to event advanced settings

`EventInfo.ProjectCode` has been round-tripped through the API and
forwarded to PowerOffice on invoicing, but the field was missing from
the Next.js admin since the Razor/MVC port (the old
`EventInfoViewModel` was removed back in Oct 2023 and the input was
never re-added). Any event created or edited after that had
`projectCode = null`, and generated PowerOffice invoices had no
project/accounting code. Adds a `projectCode` TextField to the event
editor's Advanced tab; existing form wiring (defaultValues +
updateEvent) carries it through with no other changes.
