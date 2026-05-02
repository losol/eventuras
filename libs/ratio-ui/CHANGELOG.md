# @eventuras/ratio-ui

## 2.0.0

### Major Changes

- b2073e2: **Breaking:** Redesign `Card` props around composable token props. The `variant` prop is gone, along with the `outline`, `wide`, and `tile` flavors. Surface, border, padding, radius, and shadow are now set independently using the same token props the rest of the library uses.

  ### Migration

  | Before                                           | After                                                                                                                                                                   |
  | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `<Card variant="default">`                       | `<Card>`                                                                                                                                                                |
  | `<Card variant="outline">`                       | `<Card transparent border>`                                                                                                                                             |
  | `<Card variant="transparent">`                   | `<Card transparent>`                                                                                                                                                    |
  | `<Card variant="tile">`                          | `<Card padding="lg" radius="lg" shadow="none">`                                                                                                                         |
  | `<Card variant="wide" backgroundImageUrl={…} />` | `<Card backgroundImageUrl={…} className="min-h-[33vh] mx-auto" radius="lg" border="none" shadow="none" />` (or use `Hero`, which now also accepts `backgroundImageUrl`) |

  ### What changed
  - `variant` removed. Use `transparent?: boolean` for the unfilled surface, and the existing `color`, `border`, `radius`, `padding`, and `shadow` props for everything else.
  - `BorderProps.border` accepts a new `'none'` string variant in addition to `false` / `true` / `'default'` / `'strong'` / `'subtle'`.
  - New `shadow?: 'none' | 'xs' | 'sm' | 'md'` prop. Default is `'xs'` for filled cards, `'none'` for transparent cards.
  - Default `padding` is `'md'`, default `radius` is `'xl'`. Border defaults to on for filled cards, off for transparent ones.
  - The `Hero` block now accepts `backgroundImageUrl` and `style`, covering most cases that previously reached for `<Card variant="wide">`.

- 212c407: Refactor `Dialog` to a compound API.

  The `title` prop is removed. Use `<Dialog.Heading>` instead, and the new `<Dialog.Content>` / `<Dialog.Footer>` slots when you need structured layout.

  **Before:**

  ```tsx
  <Dialog isOpen={open} onClose={close} title="Edit product">
    <Form>{/* … */}</Form>
    <div className="flex gap-2">
      <Button type="submit">Save</Button>
      <Button variant="secondary" onClick={close}>
        Cancel
      </Button>
    </div>
  </Dialog>
  ```

  **After:**

  ```tsx
  <Dialog isOpen={open} onClose={close}>
    <Dialog.Heading>Edit product</Dialog.Heading>
    <Dialog.Content>
      <Form>{/* … */}</Form>
    </Dialog.Content>
    <Dialog.Footer>
      <Button variant="secondary" onClick={close}>
        Cancel
      </Button>
      <Button type="submit">Save</Button>
    </Dialog.Footer>
  </Dialog>
  ```

  Also adds an optional `role` prop (`'dialog' | 'alertdialog'`) so prompts that interrupt the user can opt into the correct ARIA role. A higher-level `AlertDialog` wrapper that builds on this primitive will follow in a separate release.

- 4df1e9b: Rename `Drawer`/`FileDrawer` `onCancel` prop to `onClose` for consistency with `Dialog` and `AlertDialog`.

  ```tsx
  // Before
  <Drawer isOpen={open} onCancel={close}>...</Drawer>
  <FileDrawer isOpen={open} onCancel={close} ... />

  // After
  <Drawer isOpen={open} onClose={close}>...</Drawer>
  <FileDrawer isOpen={open} onClose={close} ... />
  ```

  `AlertDialog`'s `onCancel` is intentionally kept — it represents a distinct user action ("clicked Cancel") separate from `onClose` ("dialog dismissed for any reason"). On `Drawer`/`FileDrawer` the two semantics were always conflated, so the rename loses no information.

  All internal callsites in `apps/web` and `apps/historia` have been migrated.

- 67da869: Migrate `Drawer` to React Aria Components' `ModalOverlay`/`Modal`/`Dialog` stack and drop the now-orphaned `Portal` primitive.

  ### Drawer

  The hand-rolled overlay (custom `<Portal>` + manual `id="backdrop"` + leaking `addEventListener` without cleanup + no focus management) is replaced with RAC's high-level primitives. Visual output is unchanged. The drawer now ships with:
  - **Focus trap** — Tab cycles within the drawer.
  - **Focus restoration** — focus returns to the trigger when the drawer closes.
  - **Scroll lock** — body no longer scrolls under the open drawer.
  - **Structured dismissal controls** — new `isDismissable` and `isKeyboardDismissDisabled` props with sensible defaults (true/false).

  #### Breaking change: `onSave` prop removed

  `Drawer` previously accepted an `onSave?: () => void` prop, but it was never wired to anything inside the component (no save button rendered, no callback invoked). It was effectively dead code. The single internal caller (`OrderActionsMenu`) passed it as a duplicate of `onCancel` — fixed up in the same migration.

  If you have a save button inside your drawer, render it yourself in `<Drawer.Footer>` as you would any other action.

  #### New `Drawer.Heading` subcomponent

  `<Drawer.Heading>` renders a `<Heading slot="title">` so the drawer's accessible name is auto-wired via `aria-labelledby`. This is the recommended way to title a drawer:

  ```tsx
  <Drawer isOpen={open} onCancel={close}>
    <Drawer.Header>
      <Drawer.Heading>Edit user</Drawer.Heading>
    </Drawer.Header>
    <Drawer.Body>...</Drawer.Body>
    <Drawer.Footer>...</Drawer.Footer>
  </Drawer>
  ```

  `Drawer.Header` is unchanged — it remains the layout slot at the top of the drawer (where you put the heading, breadcrumbs, action buttons, etc.). Existing drawers without `Drawer.Heading` still render correctly but will emit an RAC a11y warning until migrated.

  ### Portal removed

  `@eventuras/ratio-ui/layout/Portal` had a single internal caller (`Drawer`), which no longer needs it. The component was a thin wrapper around `ReactDOM.createPortal` with a leaking event-listener pattern; consumers who need raw portal behavior should use `react-dom`'s `createPortal` directly.

- 9e1c5e9: Refactor `Footer` to a thin shell + `Footer.Classic` backward-compat wrapper.

  `Footer` is now a shell that renders the standard `<footer>` element with bg, padding, and a `Container` — anything goes inside. The pre-2.0 fixed layout (siteTitle + publisher block on the left, children on the right via `md:flex`) lives on as `Footer.Classic` for callers that want it.

  ```tsx
  // Before
  <Footer siteTitle={site.name} publisher={site.publisher}>
    <List>...</List>
  </Footer>

  // After (no behavior change — just renamed)
  <Footer.Classic siteTitle={site.name} publisher={site.publisher}>
    <List>...</List>
  </Footer.Classic>

  // New: shell mode for fully custom layouts
  <Footer dark>
    <YourCustomFooterContent />
  </Footer>
  ```

  This is a structural change — no UI difference for existing call sites — that opens up the `Footer` namespace for additive subcomponents (`Footer.Brand`, `Footer.Content`, `Footer.Publisher`, …) in a future minor release. We didn't ship them now to avoid locking in a design before a real layout need surfaces.

  The four `apps/web` layouts, `apps/historia`'s Footer, and the ratio-ui Page story have all been migrated to `Footer.Classic` (mechanical rename, no behavior change).

- 47dc304: Replace the brand palette with **Linseed Blue / Linen / Ochre** — a quieter, naturmaling-inspired identity that sits closer to the editorial knowledge-platform voice the system is moving toward.

  | Token                 | Before          | After                                              |
  | --------------------- | --------------- | -------------------------------------------------- |
  | `--color-primary-*`   | Ocean Teal      | **Linseed Blue** — chalky pigment, "linoljemaling" |
  | `--color-secondary-*` | Sunny Yellow    | **Linen** — warm off-white, low-chroma cream       |
  | `--color-accent-*`    | Warm Terracotta | **Ochre** — warm clay-yellow                       |

  ### Semantic tokens — what changed

  The mapping from scales to semantic tokens shifts to match how the new palette wants to be used:
  - `--primary` now resolves to `--color-primary-600` (Linseed-600 — AAA contrast on Linen for links/CTAs)
  - `--secondary` resolves to `--color-secondary-200` (Linen-200 — the page surface itself)
  - `--accent` resolves to `--color-accent-700` (Ochre-700 — the warm note, sparingly used)
  - `--text-light` now uses `--color-secondary-100` (warm Linen) instead of cold `--color-neutral-50`
  - `--text-on-primary` and `--text-on-accent` use `--color-secondary-100` for the same reason

  ### New: `--surface` token

  Pages are no longer pure white. A new `--surface` token (`--color-secondary-200` light / `--color-primary-950` dark) is set on `html { background }` so every consumer gets the warm Linen ground in light mode and a deep Linseed-blue ground in dark mode — same DNA, different gravity. Exposed as the `bg-surface` Tailwind utility.

  ### Dark mode

  Anchors lift one step lighter to glow on the dark surface (primary 600→400, accent 700→300). Text stays in the **Linen** family rather than the cold Neutral one — `--text` is `--color-secondary-200` instead of `--color-neutral-50`. Cards lift from the Linseed-950 surface with a pinned `oklch(0.220 0.040 232)` instead of `rgb(0 0 0 / 0.5)`.

  ### Borders

  `--border-1` and `--border-2` now derive from the Linen scale in light mode (Linen-300 / Linen-400) and the Linseed scale in dark mode (Linseed-800 / Linseed-700). Both palettes give borders that belong to their surface rather than fighting it.

  ### What this means for consumers
  - Components using `--color-primary-*`, `--color-secondary-*`, `--color-accent-*` Tailwind utilities (`bg-primary-500`, `text-accent-700`, etc.) keep working — only the actual colors change.
  - Anything using semantic tokens (`var(--primary)`, `bg-primary`, `text-accent`) automatically picks up the new look.
  - Apps that hardcoded the old hex colors anywhere (rare) will need to update.
  - The decorative `body::before` animated gradient in `global.css` is now palette-aware — its rgba values are replaced with `oklch()` stops drawn from the Linseed/Linen/Ochre scales, and its `background-color` references `var(--surface)`. Same effect, but the colors track the active palette instead of being frozen to the old Mediterranean tones.

- c403912: **Breaking:** Replace the `Menu` `menuLabel: string` prop with a `Menu.Trigger` compound subcomponent. The previous API forced a single hardcoded pill-shaped trigger; the new slot lets consumers compose any content (avatar + name, icon-only, custom layouts) and override styling via `className`.

  ```tsx
  // Before
  <Menu menuLabel={user.name}>
    <Menu.Link href="/profile">Profile</Menu.Link>
  </Menu>

  // After
  <Menu>
    <Menu.Trigger>
      {user.name}
      <Menu.Chevron />
    </Menu.Trigger>
    <Menu.Link href="/profile">Profile</Menu.Link>
  </Menu>
  ```

  `Menu.Trigger` keeps the previous default styling (rounded-full primary pill) so flat string migrations stay visually identical — the chevron now ships as `Menu.Chevron` so consumers building avatar/icon triggers can omit it.

  This is the only structural change to `Menu` in this release. Future additions (`Menu.Header`, `Menu.Section`, item icon/badge slots, danger variant) will be additive and ship in a later release without further breaking changes.

- 3522c1e: Container: redesign API around layout tokens
  - Add `size` prop (`'sm' | 'md' | 'lg' | 'xl' | 'full'`) with default `'lg'`
    for explicit max-width control. Replaces Tailwind's `container` class.
  - Adopt the same composable token API as `Card`: `SpacingProps`,
    `BorderProps`, `color`, polymorphic `as`.
  - Remove hardcoded `px-3 pb-18`. Container no longer applies any
    default padding — use `paddingX` / `paddingY` (or wrap in a `Section`)
    when you need it.
  - Container only auto-centers (`mx-auto`) when no `margin`/`marginX` is
    set, so explicit horizontal margins now work as expected.

  Also: refresh the fluid spacing scale (`--space-*`) with a tighter,
  more geometric ramp (base `s` ≈ 14→16px, `xs` ≈ 11→12px) so `xs` is
  visibly smaller than the base step. Adds Utopia "one-up" pairs and the
  `--space-s-l` custom pair (also available for callers).

  Migration:
  - Pages relying on the previous bottom padding should add `paddingBottom`
    (e.g. `paddingBottom="lg"`) or wrap content in a `Section`. Likewise,
    pages that depended on the previous horizontal `px-3` should add
    `paddingX` explicitly.
  - Custom widths previously achieved via `className="w-full"` should use
    `size="full"` instead.
  - The spacing scale is slightly smaller across the board; review tight
    layouts that depended on exact pixel values from the old scale.

- 2382fb5: **Breaking:** Remove the always-on animated gradient background that `body::before` and `body::after` painted across every consumer of `global.css`. The body now uses a flat `background-color: var(--surface)` only, matching the canonical design reference.

  The animated layer had compounding structural costs — `position: fixed` blobs that mid-animation escaped `overflow: hidden` rounded corners, percentage-radius `circle` gradients that silently dropped, Tailwind v4's color-mix polyfill stripping the gradient on certain pipelines, and `> * { position: relative; z-index: 1 }` mutating the positioning context of every direct child. The earlier rescue attempt (PR #1396, opt-in `.surface-animated` utility) was closed without merging because the same overflow/scroll and isolation problems resurfaced.

  The static surface tokens already give consumers the warm Linen-200 / primary-950 ground we wanted from the gradient. Apps that still want decorative drift can build it as a per-block opt-in pattern that doesn't touch consumer positioning.

- 5775e95: Remove deprecated APIs ahead of the 2.0 cut.

  **`InputLabel`** — removed. Use `Label` instead. The export was a deprecated re-alias that has lived alongside `Label` since the form-field rewrite.

  **`Navbar` legacy shorthand props** — `title`, `titleHref`, and `LinkComponent` are removed. Use the compound `<Navbar.Brand>` slot instead, which lets you pick your own link element (Next `<Link>`, plain `<a>`, etc.) and gives full control over markup and styling:

  ```tsx
  // Before
  <Navbar title="My App" titleHref="/" LinkComponent={Link}>
    {children}
  </Navbar>

  // After
  <Navbar>
    <Navbar.Brand>
      <Link href="/" className="text-lg tracking-tight whitespace-nowrap no-underline">
        My App
      </Link>
    </Navbar.Brand>
    <Navbar.Content className="justify-end">{children}</Navbar.Content>
  </Navbar>
  ```

  The four internal callsites (`apps/dev-docs`, `apps/idem-admin`, `apps/historia`, ratio-ui's own `Page` story) have been migrated.

- 5220555: Replace per-component `onDark` / `bgDark` props with a CSS-variable-based surface token system.

  ### Why

  Five components (`Heading`, `Button`, `Link`, `Navbar`, plus a few more transitively) had ad-hoc boolean props for "I am rendered on a dark surface, use light text". This required prop-drilling on every child of a hero/navbar/footer, was easy to forget, and produced inconsistent naming (`onDark` on three components, `bgDark` on `Navbar`).

  The new approach uses CSS cascade: a parent declares the surface tone with one className, and any component inside automatically reads the right text color via `var(--text)`.

  ### New API

  ```tsx
  // Before
  <Section style={heroBg}>
    <Heading onDark>Find knowledge</Heading>
    <Link variant="button-primary" onDark>Get started</Link>
  </Section>

  <Navbar bgDark overlay glass>
    ...
  </Navbar>

  // After
  <Section style={heroBg} className="surface-dark">
    <Heading>Find knowledge</Heading>
    <Link variant="button-primary">Get started</Link>
  </Section>

  <Navbar overlay glass className="surface-dark">
    ...
  </Navbar>
  ```

  `surface-dark` and `surface-light` are utility classes that override `--text` for the subtree. They're safelisted in `global.css`.

  ### What was removed
  - `Heading.onDark`
  - `Button.onDark`
  - `Link.onDark`
  - `Navbar.bgDark`
  - The internal `--navbar-color` variable (now reads `--text` directly)

  ### What changed under the hood
  - `Heading` always reads `text-(--text)` (theme-aware default, surface-class overridable)
  - `Button`'s transparent variants (`text`, `outline`) read `text-(--text)`. Filled variants (`primary`, `secondary`, `light`, `danger`) keep their hardcoded text colors.
  - `Link`'s variant-styled links read `text-(--text)`. The default underlined link keeps its blue/blue-400 theme-aware colors. `button-primary` keeps its light-on-primary text.
  - `Navbar`, `Navbar.Brand`, `Navbar.Content` all read `text-(--text)`.

  ### Migration

  Find any callsite passing `onDark` or `bgDark`:
  1. Drop the prop.
  2. Add `className="surface-dark"` (or `surface-light`) on the _container_ with the colored background — usually a `<Section>`, `<Navbar>`, hero `<div>`, etc.

  Internal callsites in `apps/web`, `apps/historia`, and `apps/idem-admin` have been migrated.

  ### Future direction

  Only `--text` is overridden today. The same pattern will extend naturally to `--text-muted`, `--border`, and other tokens as components need them — without growing the prop API of every individual component.

- d86894a: Replace `NumberCard` with a new `ValueTile` primitive at `@eventuras/ratio-ui/core/ValueTile`, and add a `tile` variant to `Card`.

  ```tsx
  // Convenience API — replaces NumberCard
  <ValueTile number={42} label="Total events" />

  // Compound API — for editorial stat phrases with rich markup
  <ValueTile>
    <ValueTile.Value>
      <em className="text-(--accent)">240+</em> articles
    </ValueTile.Value>
    <ValueTile.Caption>Across reading, writing, research, and craft</ValueTile.Caption>
  </ValueTile>

  // Card.tile — quieter editorial card surface
  <Card variant="tile">
    <Heading as="h4" marginBottom="xs">Tokens</Heading>
    <p className="text-sm text-(--text-muted)">Color scales, typography…</p>
  </Card>
  ```

  ### `ValueTile`
  - Two APIs in one component: a `number` + `label` shorthand (matching the prior `NumberCard` shape) and a compound `ValueTile.Value` + `ValueTile.Caption` for rich editorial markup.
  - `orientation?: 'vertical' | 'horizontal'` — defaults to `vertical` (used by Hero side panels and dashboard tiles); `horizontal` lays them out baseline-aligned for inline data displays.
  - No surface of its own — wrap in `Card` (e.g. `variant="outline"` or `variant="tile"`) when you want a border or background.
  - Adopts the editorial brand typography: serif Linseed-800 display value, small muted caption — replaces the prior cold sans-bold look in `NumberCard`.

  ### `Card.tile`

  New variant: `p-6 rounded-lg border border-(--border-1) bg-(--card)` — a quieter editorial card with the modern surface tokens, separate from the heavier `default` variant.

  ### Breaking
  - **`@eventuras/ratio-ui/visuals/NumberCard` is removed.** Migration: replace
    ```tsx
    <NumberCard number={n} label={l} variant="outline" />
    ```
    with
    ```tsx
    <Card variant="outline" className="text-center">
      <ValueTile number={n} label={l} className="items-center" />
    </Card>
    ```
    `apps/web`'s `EconomySection.tsx` is migrated as part of this change.

### Minor Changes

- c42ceff: Add a type-to-confirm gate to `AlertDialog`. Set `confirmText` and the primary button stays disabled until the user types that exact phrase (whitespace trimmed, case-sensitive). Pair `confirmLabel` with it for a localised instruction.

  ```tsx
  <AlertDialog
    variant="destructive"
    isOpen={open}
    onClose={() => setOpen(false)}
    onPrimaryAction={handleDelete}
    title="Delete event?"
    primaryActionLabel="Delete event"
    cancelLabel="Cancel"
    confirmText="delete"
    confirmLabel='Type "delete" to confirm'
  >
    This will permanently remove the event and all registrations.
  </AlertDialog>
  ```

  Reserve for irreversible actions where a single misclick is too easy. When `confirmText` is set the input is auto-focused on open (instead of the cancel button), and pressing Enter while the phrase matches triggers the primary action.

  Also: the `Input` primitive now forwards `ref` so callers can imperatively focus it.

- 90b83f5: Add `AlertDialog` for prompts that interrupt the user (confirmations, destructive actions, errors).

  API mirrors React Spectrum's `AlertDialog`:

  ```tsx
  <AlertDialog
    isOpen={open}
    onClose={() => setOpen(false)}
    variant="destructive"
    title="Delete event?"
    primaryActionLabel="Delete"
    cancelLabel="Cancel"
    onPrimaryAction={handleDelete}
  >
    This will permanently remove the event and all registrations. This cannot be
    undone.
  </AlertDialog>
  ```

  Variants: `'confirmation' | 'information' | 'destructive' | 'error' | 'warning'`. `destructive` and `error` render the primary button in the new `danger` style and auto-focus `Cancel` for safety. `autoFocusButton` overrides the focus heuristic when needed.

  Built on top of the compound `Dialog` primitive with `role="alertdialog"` so it picks up the correct ARIA semantics. A new `danger` variant on `Button` ships with this release.

- 9056263: Add a `subtle` variant to `Badge` for use as a category tag or kicker that sits inside a card / list row without shouting. Outline pill on a quiet tinted background, mono-uppercase typography, status-tinted colors that mirror the existing filled variants.

  ```tsx
  <Badge variant="subtle">Course</Badge>
  <Badge variant="subtle" status="warning">Few seats</Badge>
  ```

  Pairs with the existing filled variant — same `status` enum, same `Status`-keyed colors. Default remains `variant="filled"` so existing usages are unchanged. Use the subtle variant as the canonical "category tag" inside Strip / Card content where the badge supports the surface rather than competing with it.

- 439d1bc: Refresh the `Card` `hoverEffect` treatment to match the canonical interactive card pattern, using the existing `--shadow-card-hover*` tokens so the glow stays theme-aware.

  ```tsx
  <Card hoverEffect>…</Card>
  ```

  When `hoverEffect` is on, the card now:
  - Lifts its surface to `--card-hover`.
  - Picks up `--primary` on the border.
  - Gains a soft Linseed-tinted glow (`--shadow-card-hover` when the card has a base shadow, `--shadow-card-hover-tile` when `shadow="none"`).
  - Transitions snappily — `duration-200`, `ease-out`.

  The glow is implemented via the shadow tokens defined in `theme.css`:

  ```css
  --shadow-card-hover-tile: 0 2px 6px
    color-mix(in oklch, var(--primary) 12%, transparent);
  --shadow-card-hover: 0 3px 10px
    color-mix(in oklch, var(--primary) 15%, transparent);
  ```

  Theme-aware automatically via `--primary` (Linseed-600 light, Linseed-400 dark).

  The card stays put on hover (no translate) so cursor pass-by doesn't make text twitch. Reserve `hoverEffect` for cards that act as clickable surfaces.

- 811526d: Give `Container` a responsive default horizontal padding (`px-3 sm:px-4 lg:px-6`) so content stops running edge-to-edge on narrow viewports. Consumers that need a different value or none at all can override via `padding` or `paddingX` (any of those, including `paddingX="none"`, suppresses the default).

  Before: at viewport widths below the configured `size`, content rendered flush against the screen edge — visually broken on mobile across most apps that compose with `Container`.

  After: 12px / 16px / 24px horizontal breathing room kicks in by default. Matches the convention used by Tailwind's `container` utility, MUI, and Chakra.

- 8c058ec: Final dark-mode token sweep — replace remaining legacy `dark:bg-gray-*` / `dark:text-gray-*` Tailwind classes across core, layout, blocks, and visuals components with semantic CSS-variable tokens. Forms (#1381) and commerce (#1382) covered the rest. Now all dark-mode in `@eventuras/ratio-ui` reads warm (Linseed/Linen) instead of cold neutral gray.

  ```tsx
  // Before
  "text-gray-900 dark:text-white" /
    "bg-white dark:bg-gray-800" /
    "border-gray-200 dark:border-gray-700";

  // After
  "text-(--text)" / "bg-card" / "border-border-1";
  ```

  ### Touched (34 files)

  `Badge`, `Breadcrumbs`, `Button`, `CommandPalette`, `DescriptionList`, `Footer`, `Image`, `Kbd`, `Link`, `List`, `Lookup`, `Menu`, `Navbar`, `NavList`, `ObfuscatedEmail`, `PageOverlay`, `ProductCard`, `Schedule`, `SplitButton`, `Stepper`, `Table`, `TableOfContents`, `Tabs`, `Timeline`, `ToggleButton`, `ToggleButtonGroup`, `TreeView`, `ActionBar`, `Dialog`, `Drawer`, `Stack`, `Error`, `SessionWarning`, `ProgressBar`.

  ### Notable refactors
  - **`Button` variants** rewritten to use semantic tokens: `primary` → `bg-(--primary) text-(--text-on-primary)`, `secondary` → `bg-card border-border-1 text-(--text)`, `outline` → `border-border-2 hover:border-(--primary)`, `danger` → `bg-error text-error-on`. The `light` variant keeps `primary-100/dark:primary-800` brand tints.
  - **`Stepper` status colors** mapped to status palette: `bg-green-500 dark:bg-green-600` → `bg-success-500`, `bg-red-500 dark:bg-red-600` → `bg-error-500`, `bg-primary-600 dark:bg-primary-500` → `bg-(--primary)`. Connector "upcoming" → `bg-(--border-2)`.
  - **Inputs and popovers** rounded to `rounded-lg` (8px) per the canonical 8px reference. Lookup input bumped from `rounded-md` to `rounded-lg`.
  - **`Badge`/`PageOverlay`** removed redundant `dark:` duplicates that hardcoded the same value.
  - **Glass overlays** in `Footer`, `Navbar` (when `glass`), and `ActionBar` now route through the existing `--overlay-hover/press/drag` tokens (`bg-overlay-hover/press/drag`) instead of hardcoded `bg-black/X dark:bg-white/X` patterns. Visual: ActionBar near-identical (5%→4-6%); Footer slightly subtler in light (10%→8%); Navbar glass tint reduced in light (20%→12%) and slightly stronger in dark (10%→16%) — now consistent with the system convention that dark surfaces benefit from a more visible overlay.

  ### Remaining `dark:` (intentional)

  After this sweep, ~17 `dark:` occurrences remain. All are intentional brand/status/neutral palette tints: `bg-primary-100 dark:bg-primary-800` for selected/focused list states, `ring-primary-200 dark:ring-primary-800` for Stepper rings, `bg-neutral-50 dark:bg-neutral-900` in `tokens/colors.ts` `surfaceBgClasses`. These differ in shade per theme by design and don't bypass the token system.

- 6b4dc48: Migrate `Dialog` to React Aria Components' full `ModalOverlay` / `Modal` / `Dialog` stack.

  The previous custom overlay (low-level `@react-aria/overlays` + custom backdrop `<div>` + manual click-outside via `e.target === e.currentTarget` + manual Escape handling) is replaced with RAC's high-level primitives. Visual output is unchanged, but the dialog now ships with proper a11y/UX semantics that were previously missing:
  - **Focus trap** — Tab cycles within the dialog and can no longer escape to elements behind the overlay.
  - **Focus restoration** — focus returns to the trigger element when the dialog closes.
  - **Scroll lock** — the body no longer scrolls underneath the open dialog.
  - **Click outside / Escape** are now handled by RAC, with structured `isDismissable` and `isKeyboardDismissDisabled` controls instead of always-on hardcoded behavior.
  - **Portal handling** is built in (no more direct dependency on `@react-aria/overlays`'s `Overlay`).

  ### New props

  ```tsx
  <Dialog
    isOpen={open}
    onClose={close}
    isDismissable={false} // backdrop click no longer closes
    isKeyboardDismissDisabled // Escape no longer closes
  >
    <Dialog.Heading>Confirm something important</Dialog.Heading>
    <Dialog.Content>...</Dialog.Content>
    <Dialog.Footer>...</Dialog.Footer>
  </Dialog>
  ```

  Both new props default to RAC's defaults (`isDismissable: true`, `isKeyboardDismissDisabled: false`), so existing call sites get no behavior change beyond the a11y/UX wins above.

  `AlertDialog` automatically inherits these improvements since it composes `Dialog` internally.

- d2e3286: `Footer`'s `dark` prop now flips the background as well as the text tone — sets `bg-primary-900` (Linseed deep) instead of just adding `surface-dark`. In dark mode the footer also picks up a thin `border-primary-700` top border so it reads as a separate block against the matching-tone page surface.

  Light footer (default) is unchanged. Apps already passing `dark` will see a real dark surface instead of just dark-tone text on the previous overlay-press background.

- 18c0976: Replace legacy `dark:bg-gray-*` / `dark:text-gray-*` Tailwind classes across the forms components with semantic CSS-variable tokens, so dark mode reads warm (Linseed/Linen) instead of cold neutral gray. Also unifies input rounding to `rounded-lg` (8px) per the canonical reference.

  ```tsx
  // Before — cold gray, hardcoded for both themes
  "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600";

  // After — semantic tokens, same classes work on both themes
  "bg-card text-(--text) border-border-1";
  ```

  ### Token mapping applied

  | Legacy                                                   | Replacement                                                               |
  | -------------------------------------------------------- | ------------------------------------------------------------------------- |
  | `text-gray-900 dark:text-gray-100`                       | `text-(--text)`                                                           |
  | `text-gray-600 dark:text-gray-400`                       | `text-(--text-muted)`                                                     |
  | `text-gray-500 dark:text-gray-400`                       | `text-(--text-subtle)`                                                    |
  | `text-blue-600 dark:text-blue-400`                       | `text-(--primary)`                                                        |
  | `text-red-500 dark:text-red-400`                         | `text-error-text`                                                         |
  | `text-green-500 dark:text-green-400`                     | `text-success-text`                                                       |
  | `bg-white dark:bg-gray-800`                              | `bg-card`                                                                 |
  | `bg-gray-50 dark:bg-gray-800`                            | `bg-card`                                                                 |
  | `bg-gray-100 dark:bg-gray-800`                           | `bg-card`                                                                 |
  | `border-gray-300 dark:border-gray-600`                   | `border-border-1`                                                         |
  | `border-gray-200 dark:border-gray-700`                   | `border-border-1`                                                         |
  | `border-gray-300 dark:border-gray-400`                   | `border-border-2`                                                         |
  | `hover:bg-gray-100 dark:hover:bg-gray-700`               | `hover:bg-card-hover`                                                     |
  | `focus:ring-blue-500 dark:focus:ring-blue-400`           | `focus:ring-(--focus-ring)`                                               |
  | `data-[selected]:bg-blue-500 data-[selected]:text-white` | `data-[selected]:bg-(--primary) data-[selected]:text-(--text-on-primary)` |

  ### Files migrated

  `forms/styles/formStyles.ts`, `forms/Input/Input.tsx`, `forms/Input/Checkbox.tsx`, `forms/Input/PhoneInput.tsx`, `forms/Select/Select.tsx`, `forms/RadioGroup/RadioGroup.tsx`, `forms/ListBox/ListBox.tsx`, `forms/NumberField/NumberField.tsx`, `forms/SearchField/SearchField.tsx`.

  ### Rounded corners

  Inputs now use `rounded-lg` (8px) per the canonical reference: `formStyles.defaultInputStyle` previously had no rounding (rendered as a sharp rectangle in `SearchField`); `Input.tsx` and `ListBox` were on `rounded-md`; `NumberField` was a mix of `rounded-md`/`rounded-lg`. All unified.

  ### Not changed

  Two intentional brand-palette tints remain: `Select.tsx` and `formStyles.ts` use `bg-primary-100 dark:bg-primary-800/900` for "selected/focused" list states. No semantic token exists for "tinted-primary" backgrounds, and using `bg-(--primary)` directly would be too saturated for a list item background.

- 2205b54: Add `Heading.Group` and `Heading.Eyebrow` compound subcomponents, then refactor `Section` and `Hero` to delegate their eyebrow/title pairs to them. The compound API surface of `Section.Eyebrow`, `Section.Title`, `Hero.Eyebrow`, and `Hero.Title` is unchanged — this is an internal consolidation so all three components share one set of heading primitives.

  ```tsx
  <Heading.Group>
    <Heading.Eyebrow>The library</Heading.Eyebrow>
    <Heading as="h2">What's inside</Heading>
  </Heading.Group>
  ```

  ### New primitives
  - **`Heading.Group`** — renders `<hgroup>`, the semantic HTML element for grouping a heading with an eyebrow, kicker, or tagline. This provides semantic structure for the pair, though assistive-technology presentation may vary.
  - **`Heading.Eyebrow`** — small mono-font kicker line. `tone="primary"` (default) uses Linseed primary — quieter, for subordinate body sections. `tone="accent"` uses Ochre accent — louder, for the page hero.

  ### Internal refactors
  - `Section.Eyebrow` delegates to `Heading.Eyebrow` (tone `"primary"`).
  - `Section.Title` delegates to `Heading` with the section-tier serif styling.
  - `Section.Header` wraps its left column in `Heading.Group`, so the eyebrow + title pair renders inside an `<hgroup>` automatically.
  - `Hero.Eyebrow` delegates to `Heading.Eyebrow` (tone `"accent"`, with hero-tier size overrides).
  - `Hero.Title` delegates to `Heading` with the hero-tier serif styling.

- 38f2ec7: Add `<Hero>` block — an editorial-pattern section for the top of a page.

  Compose with `Hero.Main` (left column with eyebrow, title, lead, actions) and optionally `Hero.Side` (right column for stats, asides, secondary CTAs). When `Hero.Side` is omitted the layout collapses to a single column. Pairs with the surface-token system via `dark`.

  ```tsx
  import { Hero } from "@eventuras/ratio-ui/blocks/Hero";

  <Hero>
    <Hero.Main>
      <Hero.Eyebrow>A knowledge platform</Hero.Eyebrow>
      <Hero.Title>
        Build something{" "}
        <em className="font-serif text-(--primary)">considered</em>,{" "}
        <em className="font-serif text-(--accent)">curated</em>, and worth
        coming back to.
      </Hero.Title>
      <Hero.Lead>
        A place for long-form articles and editorial collections ...
      </Hero.Lead>
      <Hero.Actions>
        <Button variant="primary" size="lg">
          Browse the library
        </Button>
      </Hero.Actions>
    </Hero.Main>
    <Hero.Side>
      {/* freeform — stat blocks, image, supplementary content */}
    </Hero.Side>
  </Hero>;
  ```

  ### Subcomponents
  - `Hero.Main` — left column wrapper
  - `Hero.Side` — right column wrapper (border-left divider, hidden on mobile)
  - `Hero.Eyebrow` — small mono-font ochre kicker line above the title
  - `Hero.Title` — large serif heading, `<h1>` by default (configurable via `as`). Accepts rich children — wrap accent words in `<em>` with a color class for the editorial italic look.
  - `Hero.Lead` — body lead paragraph, muted text, `max-w-[44ch]`
  - `Hero.Actions` — flex row of CTA buttons

  ### Why a block, not just classes

  The hero pattern (eyebrow + serif title + lead + actions, optionally with a stat panel divider on the right) shows up across multiple Eventuras-platform tenants. Codifying it as a compound block means the editorial proportions (line-height 1.05, balanced text, `--space-2xl` padding, `1.4fr/1fr` grid) are preserved across consumers without each one re-implementing them.

  The `Pages/Page Demo` story is updated to use `<Hero>` rather than hand-rolling the layout.

- 2c509b0: Add compound subcomponents to `Section` for the editorial section-header pattern (eyebrow + serif title with optional CTA link), plus export `ArrowUpRight` from `@eventuras/ratio-ui/icons`.

  ```tsx
  <Section paddingY="lg">
    <Container>
      <Section.Header>
        <Section.Eyebrow>Aktuelle samlinger</Section.Eyebrow>
        <Section.Title>
          Det skjer i <em className="font-serif text-(--primary)">Nordland</em>
        </Section.Title>
        <Section.Link href="#">Se alle</Section.Link>
      </Section.Header>

      {/* …content… */}
    </Container>
  </Section>
  ```

  ### Subcomponents
  - **`Section.Header`** — flex row with `justify-between` + `items-baseline`. Auto-detects `Section.Link` children and pushes them to the right; everything else (eyebrow, title, free markup) stacks on the left. Drop the link to get a single-column header.
  - **`Section.Eyebrow`** — small mono-font kicker line, Linseed primary by default. (Hero.Eyebrow uses Ochre accent — sections stay subordinate to the page hero.)
  - **`Section.Title`** — serif heading at ~36px, renders as `<h2>` by default (override via `as`). Accepts rich children — wrap accent words in `<em>` with a color class.
  - **`Section.Link`** — text link with auto-appended `ArrowUpRight` icon that nudges on hover.

  ### Icon export

  `ArrowUpRight` is now part of the central icon export, alongside the existing `Chevron*` set.

  The `Pages/Page Demo` story uses the new pattern in its "What's inside" section.

- 71d4644: `Section.Link` now accepts an `as?: React.ElementType` prop so consumers can render through a framework-specific Link component (Next.js, TanStack, etc) instead of the default plain `<a>`. Use this for internal routes to keep client-side navigation and prefetching:

  ```tsx
  import { Link } from "@eventuras/ratio-ui-next/Link";

  <Section.Header>
    <Section.Title>Featured</Section.Title>
    <Section.Link as={Link} href="/collections/foo">
      See all
    </Section.Link>
  </Section.Header>;
  ```

  Default behaviour is unchanged when `as` is omitted.

- da8ba03: Self-host the brand fonts (Source Serif 4 + Source Sans 3) and drop the Google Fonts CDN dependency.

  The fonts ship as variable WOFF2 in the published package, both axes (weight 200–900 + italic) covered. They're exposed as a separate opt-in stylesheet so the bundler keeps them as files rather than inlining them into the main CSS.

  ```ts
  // In your root layout — once
  import "@eventuras/ratio-ui/ratio-ui.css";
  import "@eventuras/ratio-ui/fonts.css"; // new — adds Source Serif 4 + Source Sans 3
  ```

  Without the `fonts.css` import, the type tokens fall back to the system serif/sans stack defined in `tokens/typography.css` (`ui-serif, Georgia, serif` etc.). Existing apps using the Google Fonts CDN behavior will silently fall back to system fonts after upgrading without the new import.

  All apps in this repo (`apps/web`, `apps/historia`, `apps/idem-admin`, `apps/idem-idp`, `apps/dev-docs`) have been migrated to add the `fonts.css` import.

  ### License

  Source Serif 4 and Source Sans 3 are licensed under the SIL Open Font License 1.1. The full license text and copyright notices are bundled with the fonts at `src/fonts/OFL.txt` and ship with the published package.

  ### WOFF2

  The fonts are shipped as WOFF2 (variable). WOFF2 is supported in 97%+ of browsers and is roughly 60–75% smaller than the original variable TTFs (~1 MB total vs ~3 MB). The four files are roughly 137 KB / 168 KB (Sans italic / roman) and 343 KB / 424 KB (Serif italic / roman).

  ### Why a separate import

  Vite's library mode + Tailwind v4's CSS pipeline inline all `@font-face url()` references as base64 data URLs by default, which would have ballooned the bundled `ratio-ui.css`. Shipping `fonts.css` as a hand-written file outside the Vite bundle keeps the URLs intact, lets the consumer's bundler resolve them as separate cacheable assets, and keeps the main CSS small.

- 59474a4: Add `Strip` (beta) — a three-column horizontal card primitive for chronological listings, calendar entries, search results, and any dense row-shaped content where date / identity, body, and meta / action separate naturally. Marked `@beta` in JSDoc — prop shape, slot contract, and visual treatment may change before release without major bumps.

  ```tsx
  import { Strip } from "@eventuras/ratio-ui/core/Strip";

  <Strip hoverEffect href="/events/123">
    <Strip.Lead>
      <span className="font-mono text-xs uppercase">SEP</span>
      <span className="font-serif text-5xl">14</span>
    </Strip.Lead>
    <Strip.Body>
      <h3 className="font-serif text-xl">Course title</h3>
      <p className="text-sm text-(--text-muted)">Optional headline.</p>
    </Strip.Body>
    <Strip.Trail>
      <span>Venue</span>
      <span>View →</span>
    </Strip.Trail>
  </Strip>;
  ```

  Layout: `160px / 1fr / 280px` columns above the `md` breakpoint, stacks to one column below it. The leading slot picks up a deeper Linen tint (`bg-secondary-300` light, `bg-primary-900` dark) so it reads as a separate column at a glance; dashed-border separators flip from vertical to horizontal when the strip stacks. Pass `href` to render the strip itself as an anchor — the whole row becomes clickable.

  Internal slot separators echo the outer `border` prop, so `border={false}` or `border="none"` yields a truly borderless strip with no internal dividers either.

  Inherits Card-tier interactive props: `hoverEffect` (1px lift + primary border + soft glow on hover), `color` (semantic surface tint), `shadow`, `border`, `radius`, and the margin family. Defaults to `shadow="none"` since strips read as flat list rows by default.

  Lives next to `Card` rather than under it (no `Card.Strip` namespacing) so the two primitives stay independent — `Card` keeps its single-block contract, `Strip` owns the row pattern.

- 294e31f: Add a `dark` boolean prop to `Section`, `Container`, `Navbar`, and `Footer` for declaring a dark-toned surface concisely.

  Builds on the surface-token system: instead of writing `className="surface-dark"` by hand, callers pass the boolean and the component applies the class. The className remains the right tool for non-container elements and for the rare `surface-light` opt-in case.

  ```tsx
  // Before — className still valid
  <Section className="surface-dark" style={heroBg}>...</Section>
  <Navbar className="surface-dark" overlay glass>...</Navbar>

  // After — concise prop
  <Section dark style={heroBg}>...</Section>
  <Navbar dark overlay glass>...</Navbar>
  ```

  Internal callsites in `apps/web` and `apps/idem-admin` migrated to use the prop.

### Patch Changes

- f193007: Tune `Button` typography, sizing and motion to read leaner and match the design reference:
  - **Font weight** dropped from `font-bold` (700) to `font-medium` (500) across all variants. Source Sans 3 at 700 was reading too "loud" against the warm Linseed/Linen surfaces; 500 carries the brand intent without shouting.
  - **Sizes stepped down one Tailwind level** so buttons take less vertical real estate and match the design reference more closely:
    - `sm`: `px-3 py-1 text-xs` (was `px-3 py-0.5 text-sm`)
    - `md`: `px-4 py-2 text-sm` (was `px-4 py-1 text-base`)
    - `lg`: `px-6 py-3 text-base` (was `px-6 py-2 text-lg`)
  - **Transition** snapped from `duration-500` to `duration-200`. Hover/focus feels instant.
  - **Active scale** brought down from `scale-110` (10%) to `scale-[1.04]` (4%). Reads as a deliberate "pressed" cue rather than a bounce.
  - Removed `hover:shadow-sm` — buttons in the design don't lift on hover.
  - Added explicit `border-transparent` on `primary` and `danger` so the border doesn't fall back to `currentColor` and outline the filled background.

- 0c33e7e: Follow-up to #1383 — fix three issues spotted in review:
  - **`Button.tsx`** primary and danger variants used `border` without an explicit color, defaulting to `currentColor`. With the new semantic text tokens (`text-(--text-on-primary)`, `text-error-on`), the border picked up a high-contrast outline against the button fill in dark mode. Now `border-transparent`.
  - **`Menu.tsx`** trigger button had the same `border` + `currentColor` issue. Now `border-transparent`.
  - **`Link.tsx`** default link styling used hardcoded `decoration-blue-600/30 hover:decoration-blue-800` for the underline color, ignoring the warm Linseed/Linen theme. Switched to `decoration-current/30 hover:decoration-current` so the underline follows the link color.

- 8d120ff: Differentiate `Card` `default` and `tile` variants more clearly:
  - **`default`** — elevated card: 1px `border-border-2` (visible hairline), `rounded-xl`, `shadow-sm` (up from `shadow-xs`). Reads as "lifted" — for primary content surfaces.
  - **`tile`** — flat editorial card: 1px `border-border-1` (subtle hairline), `rounded-lg`, no shadow, roomier padding. Reads as "quiet" — for content tiles in grids.
  - **`outline`** — unchanged (1px `border-border-1`, transparent fill, no shadow).

  The visual hierarchy now comes from three axes — border tone (`border-2` louder vs `border-1` quieter), radius (`xl` vs `lg`), and elevation (`shadow-sm` vs none) — rather than border width. All three border-bearing variants share the 1px hairline so the system reads as one family.

- 23bffe4: Fix `Card` so `transparent` takes precedence over `color` (matches the documented prop contract), and update the Outline story doc comment to use the new composable API (`transparent border` instead of `variant="transparent"`).
- 0026040: Replace legacy `dark:bg-gray-*` / `dark:text-gray-*` Tailwind classes in the commerce components (`CartLineItem`, `OrderSummary`) with semantic CSS-variable tokens, so dark mode reads warm (Linseed/Linen) instead of cold neutral gray.

  ```tsx
  // Before
  "text-gray-900 dark:text-white" /
    "text-gray-500 dark:text-gray-400" /
    "border-gray-200 dark:border-gray-700";

  // After
  "text-(--text)" / "text-(--text-subtle)" / "border-border-1";
  ```

  The "Fjern" remove button moves from `text-red-600 dark:text-red-400` to `text-error-text hover:opacity-80`.

  Second sweep in the dark-mode token migration; forms went out in a previous PR. Core components and blocks still pending.

- e941cf7: Fix `Strip` to work in React Server Components. The initial implementation used `createContext` / `useContext` to propagate the borderless state to slot children, which forced consumers to wrap any page rendering a `Strip` with `'use client'` (or saw a Next.js build error: "You're importing a module that depends on `createContext` into a React Server Component module").

  Replace the context with a `data-borderless` attribute on the strip root and named Tailwind group-data variants on the slots — same behaviour, no React context, server-component-safe everywhere.

- 59fd88b: Fix `ValueTile` to work in React Server Components. The compound API used `createContext` / `useContext` to propagate the `orientation` from the root to `ValueTile.Caption`, which forced any page rendering a `ValueTile` to wrap with `'use client'` (or saw a Next.js build error: "createContext only works in Client Components").

  Replace the context with a `data-orientation` attribute on the root + named Tailwind `group-orientation-horizontal/value-tile:` variant on the caption — same observable behaviour, no React context, server-component-safe everywhere.

- a29b507: Stop bundling runtime dependencies into published library output, and stop minifying.

  The vanilla/react/next library presets used to inline every transitive dep (e.g. `oauth4webapi` was bundled into `@eventuras/fides-auth`) and minify class/function names. Two consequences:
  - **`instanceof` failed across module boundaries.** A consumer importing `ResponseBodyError` from `openid-client` got a different class than the one a library threw, because the library carried its own bundled+renamed copy.
  - **Stack traces were unreadable** — minified names like `j` instead of `ResponseBodyError`.

  The presets now:
  - Auto-externalize every entry in the consumer's `dependencies`, `peerDependencies`, and `optionalDependencies` (plus `node:*` built-ins).
  - Set `build.minify: false` (libraries should not minify — consumers minify their own bundle).
  - Emit sourcemaps so consumer stack traces map back to original sources.

  No API changes — all affected packages are bumped `patch`. The only observable effect is leaner, more debuggable output: deps are required at install time (already the case via each lib's `dependencies`) instead of duplicated inside the bundle.

- Updated dependencies [a29b507]
  - @eventuras/logger@0.8.1

## 1.3.0

### Minor Changes

- 135e60e: feat(ratio-ui): Dialog size prop; refactor(web): widen + clean ProductModal

  **ratio-ui**: `<Dialog>` takes a new `size` prop (`sm | md | lg | xl`)
  mapped to 28 / 32 / 42 / 56 rem max-widths on the panel. Default is
  `md` (~32rem). Callers that need the previous narrower width can opt
  in with `size="sm"`. Arbitrary max-width values are used in place of
  Tailwind's `max-w-md/lg/xl` utilities because ratio-ui's spacing
  tokens override the same `--spacing-*` scale those utilities read
  from; untangling the spacing/width scales is tracked as a follow-up.

  **web**: `ProductModal` now uses `size="lg"` for a more usable editing
  width, lays the three numeric fields (price / vat / min quantity) in a
  3-column grid on ≥sm viewports, and drops dead code: an unused
  `useForm`/`reset` pair that never drove the smartform-backed form, and
  the `<ConfirmDiscardModal>` wiring whose `setConfirmDiscardChanges`
  was never invoked. Also deletes the now-orphaned
  `ConfirmDiscardModal.tsx`.

- 521eb30: fix(ratio-ui): decouple semantic spacing utilities from Tailwind's spacing scale

  `spacing.css` used to alias `--spacing-xs/sm/md/lg/xl` to the fluid
  `--space-*` tokens so utilities like `p-md`, `pb-xs`, and `gap-lg`
  picked up semantic sizing. Tailwind v4 also derives size utilities
  (`max-w-*`, `w-*`, `h-*`, `min-w-*` …) from the same `--spacing-*`
  scale, so the override silently shrank every named width utility —
  `max-w-lg` came out at 2.25rem instead of the standard 32rem, which is
  why Dialog panels and other width-constrained components rendered as
  tall narrow columns.

  Dropped the `--spacing-*` aliases and defined the semantic spacing
  utilities explicitly with `@utility` (scope matches what
  `buildSpacingClasses()` in `./spacing.ts` emits: p/px/py/pt/pb,
  m/mx/my/mt/mb, gap — each in xs/sm/md/lg/xl). The raw `--space-*`
  fluid tokens are untouched.

  **Visible effect**: `p-md`, `pb-xs`, `gap-lg` etc. keep working and
  keep the same values. `max-w-md/lg/xl` now fall back to Tailwind's
  `--container-*` defaults (28/32/36 rem), restoring correct widths in
  `Image`, `CommandPalette`, `Error`, `PageOverlay`, and anywhere else
  those utilities are used.

  **Migration note**: only the explicit set above is generated
  automatically now. Classes that previously worked only because
  `--spacing-md/lg/xl` existed as Tailwind theme keys — e.g. `pl-md`,
  `pr-md`, `space-x-md`, `size-lg` — are no longer generated. A sweep
  of `apps/` and `libs/` found no callers, but if one turns up, use
  an arbitrary value (`pl-[var(--space-m)]`) or add a dedicated
  `@utility` rule in `spacing.css`.

## 1.2.0

### Minor Changes

- b5de2d6: feat(navbar): `overlay`/`glass` props and container-aligned content

  Adds two composable props to `<Navbar>`:
  - `overlay` — absolute positioning pinned to the viewport top. The navbar
    floats over the next sibling (typically a hero section) without
    reserving layout space and scrolls away with the page. Mutually
    exclusive with `sticky`.
  - `glass` — translucent dark background with backdrop-blur, for the
    classic "glass navbar over hero image" look.

  Combine with `bgDark` for white text readable over dark hero imagery:

  ```tsx
  <Navbar overlay glass bgDark>
    <Navbar.Brand>…</Navbar.Brand>
    <Navbar.Content className="justify-end">…</Navbar.Content>
  </Navbar>
  ```

  The inner content row now also applies the Tailwind `container` class so
  brand and navigation align with `<Container>`-wrapped page content
  instead of stretching to the viewport edges.

  See the `OverlayGlass` story for a live example.

  Also safelists a set of commonly-needed layout utilities in ratio-ui's
  bundled CSS: spacing (`pt-16…pt-40`, `pb-16…pb-40`, `mt-16…mt-40`,
  `mb-16…mb-40`) and hero viewport heights (`min-h-[20vh]` through
  `min-h-[80vh]`). Consumers (apps/\*) can now use these without setting
  up their own Tailwind entry.

- 6dbc23a: feat(core): add `Timeline` component (beta)

  New compound component `Timeline` + `Timeline.Item` under
  `@eventuras/ratio-ui/core/Timeline` for rendering chronological event
  lists — audit logs, order history, registration activity, and the
  upcoming BusinessEvent feed.

  ```tsx
  import { Timeline } from "@eventuras/ratio-ui/core/Timeline";

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
  </Timeline>;
  ```

  Props on `Timeline.Item`: `timestamp`, `title`, optional `actor`,
  `status` (controls dot color), `icon` (replaces the dot), and
  `children` for additional metadata or supporting content.

  Marked as **beta** via a `@beta` JSDoc tag. Prop shape and visuals may
  change before the component is promoted out of beta.

## 1.1.1

### Patch Changes

- 839913f: fix(navbar): apply text color directly on Brand and Content via context

  The `bgDark` text color was only set on the parent `<nav>`, relying on
  CSS inheritance to reach links inside `Navbar.Brand` and
  `Navbar.Content`. This broke when the consumer app ran a separate
  Tailwind build (e.g. Ignis with React Router) where ratio-ui's
  `--text-light` CSS variable wasn't defined, or when two preflight
  layers interfered.

  Now the resolved text-color class is passed down via React context and
  applied directly on `NavbarBrand` and `NavbarContent`, so links
  inside get the correct color regardless of CSS variable availability
  or cascade ordering.

- 0ec59ba: Move build/dev tooling from `dependencies` to `devDependencies`:
  `@storybook/react`, `@tailwindcss/vite`, `@tailwindcss/postcss`,
  `@swc/helpers`, and `ajv`. None are imported in runtime code — they
  were incorrectly listed as production dependencies, causing
  `npm install @eventuras/ratio-ui` to pull in ~50MB of tooling that
  consumers never use.

## 1.1.0

### Minor Changes

- 161ee7b: feat(navbar): compound component API with `Navbar.Brand` and `Navbar.Content`

  The Navbar now supports a compound-component pattern for full control
  over brand, navigation, and action zones:

  ```tsx
  <Navbar sticky>
    <Navbar.Brand>
      <Link to="/">
        <Logo /> Ignis
      </Link>
    </Navbar.Brand>
    <Navbar.Content>
      <NavLink to="/events">Events</NavLink>
      <div className="ml-auto flex gap-2">
        <SearchField />
        <UserMenu />
      </div>
    </Navbar.Content>
  </Navbar>
  ```

  `Navbar.Brand` is optional — admin bars and secondary navbars can use
  just `Navbar.Content`. Stacking two `<Navbar>` gives a double-navbar
  layout with no additional API.

  The previous `title` / `titleHref` / `LinkComponent` props still work
  for backward compatibility but are deprecated in favour of
  `Navbar.Brand`.

## 1.0.4

### Patch Changes

- 3543c98: fix(card): use `border-border-1` token for the default variant's border
  so custom `border` and `borderColor` props override cleanly in both
  light and dark mode. The previous hardcoded `border-gray-200/50` +
  `dark:border-gray-700/50` meant dark mode kept the gray color even when
  the consumer supplied a colored border.
- Updated dependencies [7d2b896]
- Updated dependencies [fc1f5dc]
  - @eventuras/logger@0.8.0

## 1.0.3

### Patch Changes

- 7c9fe79: chore: update dependencies
- Updated dependencies [7c9fe79]
  - @eventuras/logger@0.7.1

## 1.0.2

### Patch Changes

- e0b00a9: Minor layout refreshments: subtle border and shadow on default Card, improved category group spacing

## 1.0.1

### Patch Changes

- e073558: Rename component exports that shadow built-in globals (Error → ErrorBlock/FieldError, Number → NumberField), remove identical sub-expressions in Link, and fix duplicate CSS properties with missing font fallback

## 1.0.0

### Major Changes

- abaa171: ### Unified spacing, border, color, and status APIs (ADR-0001)

  Major prop cleanup across ratio-ui in preparation for 1.0. The goal:
  typed semantic props instead of raw Tailwind strings, a single shared
  `Status` vocabulary across all status-bearing components, and consistent
  HTML attribute forwarding.

  #### New shared types and utilities
  - `Space` — 6-step semantic spacing scale (`'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'`),
    backed by fluid CSS tokens
  - `SpacingProps` — `padding`, `paddingX`, `paddingY`, `paddingTop`, `paddingBottom`,
    `margin`, `marginX`, `marginY`, `marginTop`, `marginBottom`, `gap` — all typed as `Space`
  - `BorderProps` — typed `border`, `borderColor`, `radius` props
  - `Color` — full semantic palette (`neutral`, `primary`, `secondary`, `accent`,
    `success`, `warning`, `error`, `info`)
  - `Status` — status subset (`neutral`, `success`, `warning`, `error`, `info`)
  - `buildSpacingClasses(props)` and `buildBorderClasses(props)` — typed mappers
    exported from `@eventuras/ratio-ui/tokens`
  - `cn(...inputs)` — `clsx` + `tailwind-merge`, exported from
    `@eventuras/ratio-ui/utils`
  - `buildCoverImageStyle(url, style?, overlay?)` — exported from
    `@eventuras/ratio-ui/utils`

  #### Tailwind v4 theme extension

  `tokens/spacing.css` now registers `--spacing-xs` through `--spacing-xl` so
  that `p-xs`, `gap-md`, `m-lg` etc. work as standard Tailwind utilities.

  #### Component changes

  Component props migrated from raw Tailwind strings to the new typed APIs:
  - **Box** — uses `SpacingProps` + `BorderProps`. `BoxSpacingProps`,
    `BoxBackgroundProps`, `BoxContentProps`, and the old `buildSpacingClasses`
    are removed. `getBackgroundStyle` is renamed to `buildCoverImageStyle` and
    moved to `utils/`.
  - **Stack** — `gap` uses the shared `Space` type. The `'2xl'` value is removed.
  - **Container** — uses `SpacingProps` + forwards HTML attrs.
  - **Section** — single Section component at `layout/Section`. The old
    `core/Section` is removed. `container`, `grid`, `backgroundColorClass`,
    `backgroundImageUrl`, and `backgroundImageOverlay` props removed; consumers
    use `<Container>` wrapping, `className`, and `style={buildCoverImageStyle(...)}`
    directly. New typed `color?: Color` prop for surface colors.
  - **Card** — uses `SpacingProps` + `BorderProps`. `dark`, `container`, `grid`,
    and `backgroundColorClass` props removed. New typed `color?: Color` prop.
    `Card.css` removed; surface tokens live in `tokens/theme.css` (`--card`,
    `--card-hover`).
  - **Button** — default `margin="m-1"` removed (parents control spacing).
    `padding`, `margin`, `border`, `width`, `height` props removed.
  - **ButtonGroup** — uses `SpacingProps` + forwards HTML attrs.
  - **Heading**, **Text**, **Lead**, **Link** — use `SpacingProps`. `border`,
    `width`, `height` props removed.
  - **Text**, **Lead** — `text`/`children` props are now a discriminated union;
    passing both is a compile-time error instead of a runtime throw.
  - **Story**, **StoryHeader**, **StoryBody**, **StoryFooter** — use
    `SpacingProps` + forward HTML attrs.
  - **Panel** — `intent` prop renamed to `status`, uses shared `Status` type.
    `Panel.css` removed; classes mapped via Tailwind Records using design tokens.
  - **Badge** — `variant` renamed to `status`. `'positive'`/`'negative'` removed
    in favor of `'success'`/`'error'`. `'warning'` added. Uses shared `Status`.
  - **Toast** — old `core/Toast` component removed. See the separate toast
    changeset: the toast system is rewritten on top of React Aria and now lives
    at `@eventuras/ratio-ui/toast` (replacing the standalone `@eventuras/toast`
    package).
  - **PageOverlay** — `variant` renamed to `status`. `'default'` becomes
    `'neutral'`. Uses shared `Status`.
  - **Error block** — `tone` renamed to `status`. Uses shared `Status`.
  - **ErrorPage** — `tone` renamed to `status`. `'fatal'` renamed to `'error'`.
    Uses shared `Status`.
  - **DescriptionList** — now a compound component. Use
    `<DescriptionList.Item>`, `<DescriptionList.Term>`,
    `<DescriptionList.Definition>`, or the new `<DescriptionList.Description term="...">`
    shortcut. The standalone `Item`, `Term`, `Definition` exports are removed.
  - **Dialog** — `DialogModal` and `DialogModalProps` are no longer exported
    (internal implementation detail).

  #### Other cleanups
  - All `default exports` replaced with named exports (~25 components). Menu
    retains `Object.assign` compound pattern.
  - `gridGapClasses` and `getGridClasses` removed (no consumers).
  - `tailwind-merge` added as a dependency.
  - New `testId` prop on Container, Section, Card, Heading, ButtonGroup, and
    Story blocks for consistency with other components.
  - New export paths: `@eventuras/ratio-ui/tokens` and `@eventuras/ratio-ui/utils`.

  #### Migration

  For most consumers, the migration is mechanical:

  ```tsx
  // Before
  <Heading as="h2" padding="pb-3">Title</Heading>
  <Section padding="py-8" backgroundColorClass="bg-gray-50 dark:bg-gray-900">
  <Badge variant="positive">Active</Badge>
  <Panel variant="alert" intent="error">Error</Panel>

  // After
  <Heading as="h2" paddingBottom="xs">Title</Heading>
  <Section paddingY="lg" color="neutral">
  <Badge status="success">Active</Badge>
  <Panel variant="alert" status="error">Error</Panel>
  ```

  For unusual spacing values that don't map to the semantic scale, use
  `className` as the escape hatch.

- 7b0c54c: Add accessible toast system at `@eventuras/ratio-ui/toast`, replacing the standalone `@eventuras/toast` package.

  ## Why

  The previous `@eventuras/toast` package was a custom XState machine rendering plain `<div>`s. It lacked landmark navigation, focus management, pause-on-hover, and proper screen reader announcements. We've rewritten it on top of [React Aria's toast primitives](https://react-aria.adobe.com/react-aria/Toast.html) and folded the package into ratio-ui so all UI lives in one place.

  ## What changed
  - **New export path**: `@eventuras/ratio-ui/toast`. The standalone `@eventuras/toast` package has been removed.
  - **Accessibility**: toast region is now a landmark (navigate with F6 / Shift+F6), focus is managed on close, timers pause on hover/focus, screen readers announce content correctly.
  - **Animations**: toasts slide in/out via CSS animations targeting react-aria's `data-entering` / `data-exiting` attributes.
  - **No provider required**: `ToastsContext` is removed. Toast state lives in a singleton `toastQueue`. Just render `<ToastRenderer />` once at the app root.
  - **Dependencies**: `xstate`, `@xstate/react`, and `uuid` are no longer needed for toasts.

  ## Public API

  The `useToast()` hook signature is unchanged:

  ```ts
  toast.success(message, options?): string
  toast.error(message, options?): string
  toast.warning(message, options?): string
  toast.info(message, options?): string
  toast.remove(key): void
  ```

  Each method returns a string `key` that can be passed to `toast.remove()` for programmatic dismissal.

  ## Migration

  ```diff
  - import { useToast } from '@eventuras/toast';
  + import { useToast } from '@eventuras/ratio-ui/toast';

  - import { ToastRenderer, ToastsContext } from '@eventuras/toast';
  + import { ToastRenderer } from '@eventuras/ratio-ui/toast';
  ```

  Providers that wrapped children in `<ToastsContext.Provider>` must drop the wrapper:

  ```diff
  - <ToastsContext.Provider>
  -   <ToastRenderer />
  -   {children}
  - </ToastsContext.Provider>
  + <ToastRenderer />
  + {children}
  ```

  Remove `@eventuras/toast` from your app's `package.json` dependencies.

### Minor Changes

- 202f819: ### Add `Lookup` component for async typeahead pickers

  New `Lookup<T>` component in `core/Lookup/`, exposed as
  `@eventuras/ratio-ui/core/Lookup`. Generic, inline typeahead picker for
  "search asynchronously, navigate results with the keyboard, pick one to
  trigger an action" flows — the pattern that was previously duplicated
  between `UserLookup` and `EventLookup` in `apps/web`.

  ```tsx
  <Lookup<UserDto>
    label="Search User"
    placeholder="Search by name or email (min 3 characters)"
    minChars={3}
    load={searchUsers}
    getItemKey={(u) => u.id!}
    getItemLabel={(u) => u.name ?? ""}
    getItemTextValue={(u) => `${u.name} ${u.email}`}
    renderItem={(u) => (
      <>
        <div className="font-medium">{u.name}</div>
        <div className="text-sm text-gray-600">{u.email}</div>
      </>
    )}
    onItemSelected={(u) => setSelected(u)}
    emptyState="No users found"
  />
  ```

  Built on `react-aria`'s `Autocomplete` + `ListBox` + `useAsyncList`. Handles
  loading spinner, min-char threshold, re-query dedup after selection, and
  empty/placeholder states internally. Placed in `core/` next to
  `CommandPalette` because it is a standalone interactive widget — not a form
  control — and is used to trigger actions rather than collect form values.

### Patch Changes

- Updated dependencies [6e7d2d4]
  - @eventuras/logger@0.7.0

## 0.14.1

### Patch Changes

- d5634da: Remove default `margin="m-1"` from Button component to follow spacing principle where parents control spacing between children.

## 0.14.0

### Minor Changes

- bbb9111: ### ratio-ui
  - Add `ActionBar` layout component for grouping page-level actions

  ### Web
  - Add "Preview certificate" button that opens certificate HTML preview in a new tab
  - Refactor event editor tabs to use `ActionBar` for save and certificate actions

- 0e1796e: ### Menu
  - Rounded corners, softer dividers, and stable border on dropdown menu
  - Add `Menu.ThemeToggle` compound component with Sun/Moon icons from lucide-react
  - Export `Sun` and `Moon` icons from ratio-ui

  ### Web
  - Add dark/light theme toggle to user menu
  - Use translated strings for logout label (was hardcoded)
  - Add `lightTheme` / `darkTheme` translation keys (nb-NO, en-US)

## 0.13.0

### Minor Changes

- 0b4b869: feat(ratio-ui): Add ProgressRing and ProgressBar components with shared animation hook, semantic color tokens, Storybook stories, and MDX documentation.

## 0.12.0

### Minor Changes

- fce9a48: ### 🧱 Features
  - feat(ratio-ui): add TreeView, TableOfContents, and ThreeColumnLayout components (897252d) [@eventuras/ratio-ui]

- cc205db: ### 🧱 Features
  - feat(ratio-ui): add Schedule and ScheduleItem components with styles (8a1c65d) [@eventuras/ratio-ui]

  ♻️ Refactoring
  - refactor(ratio-ui): update eslint configuration to use flat config format (d4e68fa) [@eventuras/ratio-ui]

  ### 🧹 Maintenance
  - chore(ratio-ui): better heading layout (68ccaac) [@eventuras/ratio-ui]
  - chore(ratio-ui): update quote layout (a76df51) [@eventuras/ratio-ui]

- 21d0d6f: ### 🧱 Features
  - feat(ratio-ui): implement CommandPalette component with keyboard shortcuts and search (c0b761a) [@eventuras/ratio-ui]
  - feat(ratio-ui): enhance Select component with testing capabilities and improved styles (1162681) [@eventuras/ratio-ui]

  ### 🐞 Bug Fixes
  - fix(ratio-ui): auto-expand items when currentPath changes (a0853d3) [@eventuras/ratio-ui]
  - fix(ratio-ui): enhance focus management with focus trap and aria attributes (2ce2054) [@eventuras/ratio-ui]
  - fix(ratio-ui): remove redundant position property from body styles (c074ffe) [@eventuras/ratio-ui]

## 0.11.0

### Minor Changes

- c32e23c: ## UI Components: Form improvements and new SearchField

  ### Bug Fixes
  - **Label component**: Fixed critical bug where children were not rendered inside `<AriaLabel>` tags, causing labels to appear empty

  ### Features
  - **SearchField component**: New search input with built-in 300ms debouncing, search icon, and clear button
    - Dark mode support
    - Configurable debounce delay
    - forwardRef support
    - Uses formStyles.defaultInputStyle for consistency
  - **ToggleButtonGroup**: Added dark mode styling with proper border rendering using z-index layering

  ### Improvements
  - **SearchField stories**: Updated to demonstrate new debouncing API
  - **AutoComplete**: Exports raw React Aria SearchField for composable patterns
  - Removed DebouncedInput export (replaced by SearchField with built-in debouncing)

- 39bd56b: Add Panel component for alerts, callouts, and notices

  **New Component:**
  - **Panel**: Versatile container component for displaying contextual messages
    - Three variants: `alert`, `callout`, `notice`
    - Five intents: `info`, `success`, `warning`, `error`, `neutral`
    - Automatic ARIA `role="alert"` for alert variant
    - Dark mode support
    - Customizable via className prop

- c32e23c: ## Refactor: Form components and UI improvements

  ### Breaking Changes
  - **TextField**: Now uses `useController` instead of `register` for better field state access
    - Provides direct access to field errors and validation state
    - More consistent with React Hook Form best practices

  ### Bug Fixes
  - **Label component**: Fixed critical bug where children were not rendered inside `<AriaLabel>` tags
  - **SearchField**: Removed duplicate clear button by relying on React Aria's built-in clear functionality
  - **React Hooks violations**: Removed all conditional returns before hook calls in form components (TextField, Input, NumberInput, Select, CheckboxInput, HiddenInput)
  - **UserLookup**: Fixed Popover positioning error by adding explicit `triggerRef` prop

  ### Features
  - **SearchField component** (ratio-ui): New component with built-in 300ms debouncing, search icon, and dark mode support
  - **ToggleButtonGroup**: Added dark mode styling and fixed border rendering with z-index layering
  - **Form consistency**: Refactored Select and PhoneInput to use `useController` for consistent patterns across controlled components

  ### Pattern Improvements

  All smartform components now follow consistent patterns:
  - **Uncontrolled inputs** (Input, NumberInput, CheckboxInput, HiddenInput): Use `register`
  - **Controlled components** (TextField, Select, PhoneInput): Use `useController`

## 0.10.1

### Patch Changes

- 4a6097f: Enhanced dark mode support across UI components.

## 0.10.0

### Minor Changes

- ### 🧱 Features

  **ratio-ui:**
  - Add new `AutoComplete` component with async loading and client-side filtering capabilities
  - Add new `SearchField` component for search inputs
  - Add new `ListBox` component for accessible list selection
  - Add new `TextField` component as complete form field with label, description, and error handling

  **smartform:**
  - Export new `TextField` component for react-hook-form integration
  - Refactor `Input` component to be a lightweight primitive
  - Update `NumberInput` to use `Label` component instead of `InputLabel`

  **web:**
  - Update multiple admin forms to use new AutoComplete component
  - Migrate forms from Input to TextField where appropriate

  ### 🐞 Bug Fixes

  **ratio-ui:**
  - Enhance AutoComplete with improved selected label handling and filtering logic

  ### ♻️ Refactoring

  **ratio-ui:**
  - Replace Input component with TextField for better separation of concerns
  - Rename `InputLabel` to `Label` for consistency

## 0.9.0

### Minor Changes

- ### 🧱 Features

  **ratio-ui:**
  - Add new `AutoComplete` component with async loading and client-side filtering capabilities
  - Add new `SearchField` component for search inputs
  - Add new `ListBox` component for accessible list selection
  - Add new `TextField` component as complete form field with label, description, and error handling

  **smartform:**
  - Export new `TextField` component for react-hook-form integration
  - Refactor `Input` component to be a lightweight primitive
  - Update `NumberInput` to use `Label` component instead of `InputLabel`

  **web:**
  - Update multiple admin forms to use new AutoComplete component
  - Migrate forms from Input to TextField where appropriate

  ### 🐞 Bug Fixes

  **ratio-ui:**
  - Enhance AutoComplete with improved selected label handling and filtering logic

  ### ♻️ Refactoring

  **ratio-ui:**
  - Replace Input component with TextField for better separation of concerns
  - Rename `InputLabel` to `Label` for consistency

- ### 🧱 Features
  - Add `CartLineItem` and `OrderSummary` components for e-commerce functionality
  - Add `Stack` component for flexible layout
  - Add `Breadcrumbs` component for navigation
  - Add `Story` components with two-column layout support
  - Add `ThemeToggle` component for dark mode switching
  - Add `NumberField` component integration
  - Enhance `Image` component with improved handling and grid layout support
  - Update theme configuration with mode toggle decorator

  ### 🐞 Bug Fixes
  - Add missing colors to theme
  - Correct prose handling in `RichText` component
  - Decrease width of `NumberField` for better UI consistency

  ### ♻️ Refactoring
  - Restructure CSS imports and add new styling options
  - Code cleanup and organization improvements

### Patch Changes

- Updated dependencies
  - @eventuras/logger@0.6.0

## 0.8.2

### Patch Changes

- chore: update deps

## 0.8.1

### Patch Changes

- chore: update dependencies across frontend packages

## 0.8.0

### Minor Changes

- ### 🧱 Features
  - feat(ratio-ui): adds new splitButton (4f50613) [@eventuras/ratio-ui]

## 0.7.0

### Minor Changes

### 🧱 Features

- feat(ratio-ui): add radiogroup (2e0013c) [@eventuras/ratio-ui]
- feat(ratio-ui): add togglebutton (13ec24a) [@eventuras/ratio-ui]
- feat(ratio-ui): eventuras icons from lucide (fa5e901) [@eventuras/ratio-ui]
- feat(ratio-ui): enhance error reporting components (53cb7b2) [@eventuras/ratio-ui]
- feat(ratio-ui): add Stepper component (d528a71) [@eventuras/ratio-ui]
- feat(web,ratio-ui): implement error handling components and overlays for better user feedback (b18c222) [@eventuras/ratio-ui]

### 🐞 Bug Fixes

- fix(ratio-ui): align react versions (1ef8329) [@eventuras/ratio-ui]
- fix(ratio-ui): add @vitejs/plugin-react dependency (f92a19e) [@eventuras/ratio-ui]
- fix(ratio-ui): testid naming fix (8935a38) [@eventuras/ratio-ui]
- fix(ratio-ui): testId for phoneInput (d3b2e83) [@eventuras/ratio-ui]
- fix(ratio-ui): specify client only comonents (5048023) [@eventuras/ratio-ui]

### ♻️ Refactoring

- refactor(ratio-ui): move next components to separate lib (7839941) [@eventuras/ratio-ui]
- refactor(web,ratio-ui): streamline imports and enhance type definitions across components (9a64a93) [@eventuras/ratio-ui]
- refactor(ratio-ui): enhance exports (379c72f) [@eventuras/ratio-ui]

### 🧹 Maintenance

- chore(ratio-ui): add some more stories (088166b) [@eventuras/ratio-ui]
- chore(ratio-ui): integrate Vitest with Storybook and add accessibility testing support (157d6ed) [@eventuras/ratio-ui]

### Patch Changes

- Updated dependencies
  - @eventuras/logger@0.5.0

## 0.6.0

### Minor Changes

- ## Initial history (pre-Changesets)
  - feat(ratio-ui): implement ErrorPage component with customizable tones and fullscreen support (e5a4ae0)
  - feat(ratio-ui): new Image component (14b5498)
  - feat(ratio-ui): phone input component with country selector (d738c68)
  - chore(ratio-ui): upgrade to storybook v9 (df6ce57)
  - feat(ratio-ui): implement new Menu component and user session handling (#931) (4fa3081)
  - feat(ratio): add storybook theming (2917436)
  - feat(ratio): new navlist component (58910ec)
  - feat(ratio): update navbar with stories (49cef11)
  - feat(ratio): adds some more stories (0c430b6)
  - ci(ratio): adds storybook ci (d7b36d9)
  - chore(ui): move Footer and Navbar to ui lib (5f9616c)
  - refactor(ui): refactor Card imports (191a722)
  - feat(ui): section component and box refactored (52fb7b0)
  - feat(ui): update button styles (#910) (b7a7e17)
  - feat(ui): add storybook themes (f9cff12)
  - feat(ui): adds storybook again to ratio ui (90d67b8)
  - refactor(ui): new folder structure (2931ffc)
  - refactor(ui): rename ui library to ratio-ui (2a3b25d)
  - chore(ui): upgrade to tailwind v4 (ec91676)
  - feat(ui): add multiline text input (fef28b0)
