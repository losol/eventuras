---
'@eventuras/web': minor
---

Admin gets a sidebar shell (ratio-ui `Sidebar` + `NavTree`) with the top-level areas — events, users, orders, registrations, collections, organizations, system — and a drawer with the same navigation on small screens. Opening an event pins it in the sidebar with its sections (participants, communication, products, economy, edit, export); the pin stays while moving between areas and is cleared with the close button. The event admin page now renders one section at a time from `?tab=`; only the five editor tabs keep a tab strip, inside the edit section. First step towards the admin IA prototype; the overview dashboard, export dialog and activity drawer come later.
