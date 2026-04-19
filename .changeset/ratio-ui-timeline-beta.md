---
"@eventuras/ratio-ui": minor
---

feat(core): add `Timeline` component (beta)

New compound component `Timeline` + `Timeline.Item` under
`@eventuras/ratio-ui/core/Timeline` for rendering chronological event
lists — audit logs, order history, registration activity, and the
upcoming BusinessEvent feed.

```tsx
import { Timeline } from '@eventuras/ratio-ui/core/Timeline';

<Timeline>
  <Timeline.Item
    timestamp="2026-04-19 10:22"
    title="Order created"
    status="success"
    actor="Ada Lovelace"
  />
  <Timeline.Item
    timestamp="2026-04-19 10:25"
    title="Payment method updated"
    actor="Ada Lovelace"
  >
    Changed from Email invoice to EHF invoice.
  </Timeline.Item>
</Timeline>
```

Props on `Timeline.Item`: `timestamp`, `title`, optional `actor`,
`status` (controls dot color), `icon` (replaces the dot), and
`children` for additional metadata or supporting content.

Marked as **beta** via a `@beta` JSDoc tag. Prop shape and visuals may
change before the component is promoted out of beta.
