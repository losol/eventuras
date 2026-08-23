---
'@eventuras/web': minor
---

The Excel export of an event's registrations is now a dialog opened from the participant list ("Eksporter til Excel") instead of its own admin tab: pick the registration statuses to include (with counts per status), see how many registrations that is, download, and get the filename back. The file is named after the event slug. The download logic lives in a `useExcelExport` hook; the old plain Excel buttons (participant list toolbar, the Advanced editor tab) are gone, so the dialog is the one way to export.
