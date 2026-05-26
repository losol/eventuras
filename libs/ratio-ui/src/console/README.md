# Console

A themable terminal-style log / event console. Renders a dense, optionally-grouped list of timestamped rows with severity badges, source tags, an inline expand area for detail payloads, and a sticky title bar with live-tail indicator.

Purely presentational. The consumer owns all state: data array, expansion, pause/play, filter selections, scroll position. The component never fetches, polls, throttles, filters, or scrolls on its own.

```tsx
import { Console } from '@eventuras/ratio-ui/console';
```

## When to use it

- **System logs / business events** — streaming events from realtime channels, queues, webhooks
- **Audit trails** — chronological "who did what" surfaces in admin views
- **Liveblogs / running commentary** — short prose updates with a "live" feel
- **Import/export progress** — long-running operations that emit per-step events

For a sparser vertical timeline with a dot rail (order history, single-thread audit), prefer [`Timeline`](../core/Timeline) (`@eventuras/ratio-ui/core/Timeline`).

## Themes

| Theme | Surface | Typography | Use |
|---|---|---|---|
| `light` (default) | Linen | Serif title + monospace tags | Admin pages, sidebars |
| `dark` | Linseed-950 | Same | Standalone dashboards, ops surfaces |
| `retro` | Phosphor black + CRT scanlines | All monospace, green-on-black, blinking cursor | "Things are happening" hero surfaces |

The theme is an explicit prop. It does NOT follow the app's `.dark` class — wrap your own conditional if you want it to.

## Anatomy

```
<Console theme>                              ← themed root
  <Console.TitleBar>                         ← sticky top
    <Console.Title>                          ← serif heading
    <Console.Tag>                            ← env chip (e.g. "prod")
    <Console.LiveIndicator status>           ← pulsing pill
    <Console.Counter>                        ← right-pushed counter
    <Console.ActionButton>                   ← chrome buttons (icon, text, or both)
  </Console.TitleBar>
  <Console.Body ref>                         ← scrollable, container-queried
    <Console.Group label count/>             ← sticky time-bucket header
    <Console.Entry timestamp level source message meta expanded onToggle>
      <Console.EntryDetail>                  ← preformatted JSON/text
    </Console.Entry>
  </Console.Body>
</Console>
```

`Console.Time` is a small helper for tabular-mono timestamps with muted milliseconds — pass it as the `timestamp` prop of `Entry`.

Three sub-components are re-exports of standalone primitives — use either import path:

| `Console.X` | Standalone | Notes |
|---|---|---|
| `Console.Tag` | [`Chip`](../core/Chip) | Console overrides `--chip-bg/-fg/-border/-radius` per theme |
| `Console.LiveIndicator` | [`LiveIndicator`](../core/LiveIndicator) | Pulsing dot + label; reads `--live-indicator-dot` (retro flips to phosphor green) |
| `Console.ActionButton` | [`ActionButton`](../core/ActionButton) | Chrome button (icon, text, or both); reads `--action-button-*` (retro flips to sharp corners) |

Because the standalone primitives all read from CSS tokens, the console theme cascades into them automatically — no per-theme rules per primitive.

## Radius tokens

The console root, pills inside it, and chrome buttons all expose their radius as a token (`--console-radius`, `--chip-radius`, `--action-button-radius`). The retro theme flips all three to sharp corners in one block. Consumers can override any of them per-scope (e.g. a brutalist sub-experience) without touching the components.

## Severity levels

`debug` · `info` · `success` · `warning` · `error`

`debug` reads as a quiet gray; the rest map to the same status colors as `Badge` and `Panel`. The label defaults to the level value (with `warning` rendered as `warn` to fit the 4-char terminal vibe) — override with `levelLabel` for i18n or alternate vocabularies (e.g. "decision", "heads-up" in a liveblog).

## Controlled expansion

Expansion is fully controlled — there is no internal state. Pass `expanded` and `onToggle` per row. Children of `Entry` are only rendered when `expanded === true`.

```tsx
const [openId, setOpenId] = useState<string | null>(null);

<Console.Entry
  expanded={openId === ev.id}
  onToggle={(next) => setOpenId(next ? ev.id : null)}
  ...
>
  <Console.EntryDetail>{JSON.stringify(ev.payload, null, 2)}</Console.EntryDetail>
</Console.Entry>
```

When `Entry` has no children, the chevron disappears and the row becomes non-interactive — fine for read-only feeds.

## Live tail / auto-scroll

The component does not auto-scroll. Get a ref on `Console.Body` and scroll yourself:

```tsx
const bodyRef = useRef<HTMLDivElement>(null);
useEffect(() => {
  if (!paused) bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' });
}, [events, paused]);

<Console.Body ref={bodyRef}>...</Console.Body>
```

This keeps the component free of policy decisions (smooth vs instant, pin-to-bottom when scrolled up, etc.) that vary per consumer.

## Responsive

`Console.Body` is a CSS container (`container-type: inline-size`). Two breakpoints kick in based on the body's own width, not the viewport:

- **≤720px** — the source column is hidden; columns become `time / level / message / meta`
- **≤480px** — rows collapse to two visual lines (time + level on top, meta on bottom)

This means a narrow drawer renders compactly even when the page itself is wide. No media queries needed in the consumer.

## Source colors

Pass `sourceColor` on `Entry` to tint the source label and its leading dot. Use any CSS color string. The component does not maintain a source registry — callers map source names to colors however they like.

## Accessibility

- `Console.Body` is `role="log"` — screen readers treat it as a live region of chronological events.
- `Console.LiveIndicator` is `role="status"` but `aria-live="off"` — the dot is decorative; the visible "Live"/"Paused" text is what's read on demand.
- Entries with children get `aria-expanded`. Entries without children are non-interactive (`data-static="true"`).

## Not in scope

These belong in the consumer, not here:

- Streaming transport (EventSource, WebSocket, SignalR, SSE)
- Pause/play state (just toggle the indicator)
- Filter UI and filter state (compose your own header above the console; see ratio-ui's `Strip`, `Badge`, and `forms/` for primitives)
- Auto-scroll behavior (consumer scrolls via ref)
- Persistence, copy-all, export-as-JSON
- A built-in JSON viewer (use any pretty-printer — `JSON.stringify(x, null, 2)` is usually enough inside `EntryDetail`)
