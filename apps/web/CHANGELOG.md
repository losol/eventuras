# @eventuras/web

## 3.3.5

### Patch Changes

- Updated dependencies [991b508]
- Updated dependencies [745a994]
- Updated dependencies [b399eb5]
  - @eventuras/ratio-ui@2.2.0
  - @eventuras/datatable@0.5.23
  - @eventuras/ratio-ui-next@0.1.24
  - @eventuras/smartform@0.3.16

## 3.3.4

### Patch Changes

- 2842f02: Pick up the recent frontpage and event-list polish — collection-name badges on rows in the all-courses list, on-demand filter that accepts both `OnlineCourse` and the legacy `Course + onDemand` shape, headline + markdown description in the event-list row body, and the `formatCompactDateRange` fix that stops doubling the period for nb-NO multi-day labels.
- Updated dependencies [2842f02]
- Updated dependencies [ac349ed]
  - @eventuras/ratio-ui@2.1.0
  - @eventuras/core@0.3.1
  - @eventuras/datatable@0.5.22
  - @eventuras/ratio-ui-next@0.1.23
  - @eventuras/smartform@0.3.15

## 3.3.3

### Patch Changes

- da8ba03: Self-host the brand fonts (Source Serif 4 + Source Sans 3) and drop the Google Fonts CDN dependency.

  The fonts ship as variable WOFF2 in the published package, both axes (weight 200–900 + italic) covered. They're exposed as a separate opt-in stylesheet so the bundler keeps them as files rather than inlining them into the main CSS.

  ```ts
  // In your root layout — once
  import '@eventuras/ratio-ui/ratio-ui.css';
  import '@eventuras/ratio-ui/fonts.css'; // new — adds Source Serif 4 + Source Sans 3
  ```

  Without the `fonts.css` import, the type tokens fall back to the system serif/sans stack defined in `tokens/typography.css` (`ui-serif, Georgia, serif` etc.). Existing apps using the Google Fonts CDN behavior will silently fall back to system fonts after upgrading without the new import.

  All apps in this repo (`apps/web`, `apps/historia`, `apps/idem-admin`, `apps/idem-idp`, `apps/dev-docs`) have been migrated to add the `fonts.css` import.

  ### License

  Source Serif 4 and Source Sans 3 are licensed under the SIL Open Font License 1.1. The full license text and copyright notices are bundled with the fonts at `src/fonts/OFL.txt` and ship with the published package.

  ### WOFF2

  The fonts are shipped as WOFF2 (variable). WOFF2 is supported in 97%+ of browsers and is roughly 60–75% smaller than the original variable TTFs (~1 MB total vs ~3 MB). The four files are roughly 137 KB / 168 KB (Sans italic / roman) and 343 KB / 424 KB (Serif italic / roman).

  ### Why a separate import

  Vite's library mode + Tailwind v4's CSS pipeline inline all `@font-face url()` references as base64 data URLs by default, which would have ballooned the bundled `ratio-ui.css`. Shipping `fonts.css` as a hand-written file outside the Vite bundle keeps the URLs intact, lets the consumer's bundler resolve them as separate cacheable assets, and keeps the main CSS small.

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

- Updated dependencies [c42ceff]
- Updated dependencies [90b83f5]
- Updated dependencies [9056263]
- Updated dependencies [f193007]
- Updated dependencies [0c33e7e]
- Updated dependencies [b2073e2]
- Updated dependencies [439d1bc]
- Updated dependencies [8d120ff]
- Updated dependencies [23bffe4]
- Updated dependencies [0026040]
- Updated dependencies [811526d]
- Updated dependencies [8c058ec]
- Updated dependencies [71d4644]
- Updated dependencies [212c407]
- Updated dependencies [6b4dc48]
- Updated dependencies [4df1e9b]
- Updated dependencies [67da869]
- Updated dependencies [d2e3286]
- Updated dependencies [9e1c5e9]
- Updated dependencies [18c0976]
- Updated dependencies [2205b54]
- Updated dependencies [38f2ec7]
- Updated dependencies [47dc304]
- Updated dependencies [c403912]
- Updated dependencies [3522c1e]
- Updated dependencies [2382fb5]
- Updated dependencies [5775e95]
- Updated dependencies [2c509b0]
- Updated dependencies [71d4644]
- Updated dependencies [da8ba03]
- Updated dependencies [e941cf7]
- Updated dependencies [59474a4]
- Updated dependencies [294e31f]
- Updated dependencies [5220555]
- Updated dependencies [59fd88b]
- Updated dependencies [d86894a]
- Updated dependencies [a29b507]
  - @eventuras/ratio-ui@2.0.0
  - @eventuras/core@0.3.0
  - @eventuras/fides-auth-next@0.1.11
  - @eventuras/ratio-ui-next@0.1.22
  - @eventuras/smartform@0.3.14
  - @eventuras/datatable@0.5.21
  - @eventuras/markdown@9.0.5
  - @eventuras/markdown-plugin-happening@4.0.5
  - @eventuras/scribo@0.10.3
  - @eventuras/logger@0.8.1
  - @eventuras/app-config@0.1.4

## 3.3.2

### Patch Changes

- @eventuras/fides-auth-next@0.1.10

## 3.3.1

### Patch Changes

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

- Updated dependencies [135e60e]
- Updated dependencies [521eb30]
  - @eventuras/ratio-ui@1.3.0
  - @eventuras/datatable@0.5.20
  - @eventuras/ratio-ui-next@0.1.21
  - @eventuras/smartform@0.3.13

## 3.3.0

### Minor Changes

- d27ed81: feat(web): add Project Code field to event advanced settings

  `EventInfo.ProjectCode` has been round-tripped through the API and
  forwarded to PowerOffice on invoicing, but the field was missing from
  the Next.js admin since the Razor/MVC port (the old
  `EventInfoViewModel` was removed back in Oct 2023 and the input was
  never re-added). Any event created or edited after that had
  `projectCode = null`, and generated PowerOffice invoices had no
  project/accounting code. Adds a `projectCode` TextField to the event
  editor's Advanced tab; existing form wiring (defaultValues +
  updateEvent) carries it through with no other changes.

- d27ed81: feat(web): registration drawer for quick view from admin lists

  Admins can now inspect (and edit) a registration without leaving the
  current list. A new `RegistrationDrawer` fetches the full
  `RegistrationDto` via a `getRegistrationDetail` server action and
  renders the existing `<Registration adminMode />` inside a slide-out
  panel. Wired into both `/admin/registrations` and the
  `/admin/events/[id]` participant list; the drawer footer has a link
  to the full detail page where the BusinessEvents timeline still
  lives. Deletes unused `AdminRegistrationsList.tsx` dead code.

- 75ac0b5: refactor(web): align admin/users with registrations patterns
  - Server-side pagination on `/admin/users` via `?page=` URL param
    (replaces the client-side 10-row window that didn't scale).
  - Server-side search via `?q=` forwarded to the SDK's `Query`
    parameter; debounced input resets `?page=` on a new search.
  - `createUser`, `updateUser`, and `updateUserProfile` run API errors
    through `formatApiError` + `readCorrelationIdFromResponse`, matching
    the registrations actions for operational debugging parity.
  - Pagination input hardened against `NaN` / out-of-range URL values.
  - Adds `common.labels.search` in both locales.

### Patch Changes

- d27ed81: fix(web): silence React 19 script-tag warning in InitTheme

  `InitTheme` renders an inline `<script>` in `<head>` to set
  `data-theme` before hydration (anti-FOUC pattern). React 19's dev
  runtime flags bare `<script>` tags inside components because
  client-rendered scripts don't execute — the warning fires even
  though this one only reaches the client via SSR output and works
  fine. Switches to `next/script` with `strategy="beforeInteractive"`:
  same timing, no warning.
  - @eventuras/event-sdk@3.1.1

## 3.2.0

### Minor Changes

- f9b1373: feat(web): show business-events Timeline on admin registration/order pages

  Admins browsing `/admin/registrations/{id}` or `/admin/orders/{id}`
  now see an "Activity" section at the bottom with a vertical timeline
  of the resource's BusinessEvents — status changes, cancellations,
  invoicing, etc. — fetched server-side via
  `GET /v3/business-events?subjectType=&subjectUuid=`. The new
  `<BusinessEventsTimeline>` server component maps each
  `BusinessEventDto` onto a `<Timeline.Item>` from
  `@eventuras/ratio-ui/core/Timeline`, with:
  - formatted `createdAt` timestamp
  - the event's human-readable `message` as the title
  - dot colour derived from the event type suffix (`.created` →
    success, `.cancelled`/`.refunded` → warning, `.invoiced` → info)
  - optional actor (short Uuid for now; name resolution is a follow-up)
  - metadata rendered as a collapsed JSON block when present

  Also exposes `Uuid` on `OrderDto` so the SDK has the subject key
  available without an extra lookup; `RegistrationDto.uuid` already
  existed. Access is enforced server-side by the endpoint's admin
  policy and org-membership check — the component itself does not
  re-validate.

### Patch Changes

- Updated dependencies [e5b6622]
- Updated dependencies [f9b1373]
  - @eventuras/event-sdk@3.1.0

## 3.1.0

### Minor Changes

- 86449d7: feat: BusinessEvent → Organization link (audit/tenant tracking)

  The `BusinessEvent` append-only log is now tenant-aware:
  - New `OrganizationUuid` column on `BusinessEvents`, with a FK to
    `Organizations.Uuid` (`OnDelete: Restrict` — archive orgs rather
    than delete through the audit trail). `Organization.Uuid` promoted
    to alternate key to serve as the FK target, with the previous
    `IX_Organizations_Uuid` unique index dropped to avoid a duplicate
    uniqueness structure.
  - `IBusinessEventService.ListEventsAsync(orgUuid, subject, paging)`
    returns paged events for a given `(organization, subject)`, newest
    first, with `Uuid` as a stable tie-breaker for deterministic
    pagination under equal timestamps.
  - `IBusinessEventService.AddEvent(...)` now accepts an optional
    `organizationUuid`. All existing call sites
    (`RegistrationsController.PatchRegistration`/`CancelRegistration`,
    `OrdersController.PatchOrder`,
    `OrderManagementService.CancelOrderAsync`,
    `InvoicingService.CreateInvoiceAsync`) resolve the tenant from the
    resource's registration → event → organization via the new
    `IRegistrationRetrievalService.GetOrganizationUuidAsync`, so audit
    data reflects the resource's actual owner rather than the
    `Eventuras-Org-Id` request header. `PatchRegistration` only
    resolves the tenant when `Status` or `Type` actually changed,
    avoiding an unnecessary 400 for no-op patches without the header.

  The `web` bump tracks that the admin UI can now consume the new
  audit data once the frontend wiring lands.

### Patch Changes

- a2e6ba0: feat(core): add `formatApiError` under `@eventuras/core/errors`

  Extracts a shared `formatApiError(raw, fallback)` helper that turns SDK
  error payloads into a human-readable string. Handles:
  - Plain string bodies (the SDK falls back to the text body when the
    response isn't JSON).
  - ASP.NET Problem Details (RFC 7807) with `errors: { Field: [msgs] }`
    — surfaces per-field validation feedback.
  - Problem Details `detail` and `title` fields (previously `detail` was
    ignored so callers saw the generic fallback even when the backend
    provided a clear explanation).
  - Legacy shapes with `body.message`, `message`, and `statusText`.

  Replaces the inline copy that landed in `apps/web` for event updates
  and extends the same handling to `updateRegistration` and
  `patchRegistration` server actions so admins see the actual API error
  instead of `"Failed to update registration"`.

- a00eabd: refactor: extract `SiteNavbar` and migrate layouts to compound Navbar API

  Consolidates four duplicated navbar blocks across `(public)`, `(user)`,
  `(admin)`, and `(frontpage)` into a single async server component with
  a `variant` prop (`primary` | `transparent` | `dark`), optional `title`
  override, and internal `UserMenu` wiring. Uses ratio-ui's compound
  `<Navbar.Brand>` + `<Navbar.Content>` slots.

  The frontpage's dark variant now uses ratio-ui's new `overlay` + `glass`
  props to float above the hero image.

  UserMenu translation keys on the frontpage are standardised to the
  `common.labels.*` set already used by the other three layouts. Net
  visible change: the landing-page user menu now reads "Mine kurs"
  instead of "Dine kurs" for consistency.

- Updated dependencies [a2e6ba0]
- Updated dependencies [b5de2d6]
- Updated dependencies [6dbc23a]
  - @eventuras/core@0.2.0
  - @eventuras/ratio-ui@1.2.0
  - @eventuras/event-sdk@3.0.4
  - @eventuras/fides-auth-next@0.1.9
  - @eventuras/datatable@0.5.19
  - @eventuras/ratio-ui-next@0.1.20
  - @eventuras/smartform@0.3.12

## 3.0.8

### Patch Changes

- Updated dependencies [839913f]
- Updated dependencies [0ec59ba]
  - @eventuras/ratio-ui@1.1.1
  - @eventuras/datatable@0.5.18
  - @eventuras/ratio-ui-next@0.1.19
  - @eventuras/smartform@0.3.11

## 3.0.7

### Patch Changes

- Updated dependencies [161ee7b]
  - @eventuras/ratio-ui@1.1.0
  - @eventuras/datatable@0.5.17
  - @eventuras/ratio-ui-next@0.1.18
  - @eventuras/smartform@0.3.10

## 3.0.6

### Patch Changes

- 33ceb8c: `LoginSuccessHandler` cleanup:
  - Wrap the immediate `checkAuth()` call so a rejection logs at error
    level instead of becoming an unhandled promise rejection.
  - Drop the per-page-load debug log when the `?login=success` parameter
    isn't present — the silent path is the common case and the noise
    showed up everywhere when debug filters were on.
  - Use a single `URL` object for both reading and cleaning the query
    parameter.
  - Document why the `hasChecked` ref exists (StrictMode dev double-fire)
    and replace the dated `useSearchParams` comment with the actual
    reason (avoiding a Suspense boundary in the layout).

- Updated dependencies [3543c98]
- Updated dependencies [7d2b896]
- Updated dependencies [fc1f5dc]
  - @eventuras/ratio-ui@1.0.4
  - @eventuras/logger@0.8.0
  - @eventuras/datatable@0.5.16
  - @eventuras/markdown@9.0.4
  - @eventuras/markdown-plugin-happening@4.0.4
  - @eventuras/ratio-ui-next@0.1.17
  - @eventuras/smartform@0.3.9
  - @eventuras/fides-auth-next@0.1.8

## 3.0.5

### Patch Changes

- 7c9fe79: chore: update dependencies
- Updated dependencies [7c9fe79]
  - @eventuras/app-config@0.1.3
  - @eventuras/core-nextjs@0.1.3
  - @eventuras/core@0.1.1
  - @eventuras/datatable@0.5.15
  - @eventuras/event-sdk@3.0.3
  - @eventuras/fides-auth-next@0.1.7
  - @eventuras/logger@0.7.1
  - @eventuras/markdown-plugin-happening@4.0.3
  - @eventuras/markdown@9.0.3
  - @eventuras/ratio-ui-next@0.1.16
  - @eventuras/ratio-ui@1.0.3
  - @eventuras/scribo@0.10.2
  - @eventuras/smartform@0.3.8

## 3.0.4

### Patch Changes

- 7f445e3: Security update: next 16.2.3
  - @eventuras/event-sdk@3.0.2

## 3.0.3

### Patch Changes

- e0b00a9: Minor layout refreshments: subtle border and shadow on default Card, improved category group spacing
- Updated dependencies [e0b00a9]
  - @eventuras/ratio-ui@1.0.2
  - @eventuras/datatable@0.5.14
  - @eventuras/markdown@9.0.2
  - @eventuras/markdown-plugin-happening@4.0.2
  - @eventuras/ratio-ui-next@0.1.15
  - @eventuras/smartform@0.3.7

## 3.0.2

### Patch Changes

- e073558: Rename component exports that shadow built-in globals (Error → ErrorBlock/FieldError, Number → NumberField), remove identical sub-expressions in Link, and fix duplicate CSS properties with missing font fallback
- Updated dependencies [e073558]
- Updated dependencies [4b30339]
  - @eventuras/ratio-ui@1.0.1
  - @eventuras/scribo@0.10.1
  - @eventuras/fides-auth-next@0.1.6
  - @eventuras/datatable@0.5.13
  - @eventuras/markdown@9.0.1
  - @eventuras/markdown-plugin-happening@4.0.1
  - @eventuras/ratio-ui-next@0.1.14
  - @eventuras/smartform@0.3.6

## 3.0.1

### Patch Changes

- Updated dependencies [6e7d2d4]
- Updated dependencies [abaa171]
- Updated dependencies [202f819]
- Updated dependencies [7b0c54c]
  - @eventuras/logger@0.7.0
  - @eventuras/ratio-ui@1.0.0
  - @eventuras/event-sdk@3.0.1
  - @eventuras/fides-auth-next@0.1.5
  - @eventuras/smartform@0.3.5
  - @eventuras/datatable@0.5.12
  - @eventuras/markdown@9.0.0
  - @eventuras/markdown-plugin-happening@4.0.0
  - @eventuras/ratio-ui-next@0.1.13

## 3.0.0

### Major Changes

- 24e71c6: ### v3.0 — Port to API project v3 and event-sdk v3

  #### Identity and user IDs
  - User IDs are now UUIDs (`string`) instead of `number`. Every signature,
    comparison, mapper, and React prop that previously treated `userId` as
    numeric has been updated. Affects registration flows, admin participant
    lists, event editor, and API mappers.
  - `getV3UsersMe` replaced with `getV3Userprofile` (renamed in API v3).

  #### SDK type and export changes
  - `*DtoPageResponseDto` types renamed to `PageResponseDtoOf*` to match the
    regenerated SDK.
  - `RegistrationType` and `RegistrationStatus` are now type-only exports;
    runtime enum-style usage replaced with string literals.
  - Nullable fields now arrive as `string | null` instead of `string | undefined`;
    call sites updated accordingly.
  - `isolatedModules`-safe re-exports (`export type`) where the SDK types flow
    through `lib/eventuras-types.ts`.

  #### Removed fields
  - `order.log` removed — the field is no longer part of the `Order` DTO. The
    admin order actions menu no longer renders log history (superseded by the
    new `BusinessEvents` stream).
  - `externalRegistrationsUrl` form field removed from the event editor. The
    API now hardcodes this to an empty string and ignores any input, so the
    corresponding `TextField` has been dropped.

### Patch Changes

- b1d298f: Add "Other" heading for uncategorized events in category-grouped collections
- Updated dependencies [d5634da]
- Updated dependencies [fb617bd]
- Updated dependencies [d9b5b55]
  - @eventuras/ratio-ui@0.14.1
  - @eventuras/event-sdk@3.0.0
  - @eventuras/datatable@0.5.11
  - @eventuras/markdown@8.1.1
  - @eventuras/markdown-plugin-happening@3.0.1
  - @eventuras/ratio-ui-next@0.1.12
  - @eventuras/smartform@0.3.4
  - @eventuras/toast@0.2.11

## 2.34.0

### Minor Changes

- 8db0d59: Featured event collections with category grouping
  - Frontpage shows featured collections at the top with events grouped by category
  - Collection detail page groups events by category with section headings
  - Fix: EventLookup popover crash (missing triggerRef)
  - Fix: InitTheme script warning (next/script → inline script)
  - Fix: CollectionEditor server-only import error (moved to server action)

### Patch Changes

- Updated dependencies [8db0d59]
  - @eventuras/event-sdk@2.31.0

## 2.33.0

### Minor Changes

- 0d4bc2d: ### Event editor
  - Enable callout plugin on program, practical information, and more information fields
  - Enable callout rendering on public event details page via remarkCallout

## 2.32.1

### Patch Changes

- Updated dependencies [ed973fc]
- Updated dependencies [ed973fc]
- Updated dependencies [ed973fc]
  - @eventuras/scribo@0.10.0
  - @eventuras/markdown@8.1.0

## 2.32.0

### Minor Changes

- e981f9d: ### Event editor
  - Enable schedule plugin in the program field for structured schedule editing

### Patch Changes

- Updated dependencies [e981f9d]
  - @eventuras/scribo@0.9.0

## 2.31.0

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

### Patch Changes

- e6d002d: ### Fix: Event description 300 character limit validation (#690)
  - Validate markdown length (not plain text) in MarkdownInput, since markdown is what gets stored
  - Block form submission via react-hook-form when description exceeds 300 characters
  - Add `[StringLength(300)]` to API EventFormDto for a clear 400 response instead of 500
  - Migrate scribo eslint config to flat config format

- Updated dependencies [bbb9111]
- Updated dependencies [e6d002d]
- Updated dependencies [0e1796e]
  - @eventuras/ratio-ui@0.14.0
  - @eventuras/scribo@0.8.4
  - @eventuras/datatable@0.5.10
  - @eventuras/markdown@8.0.0
  - @eventuras/markdown-plugin-happening@3.0.0
  - @eventuras/ratio-ui-next@0.1.11
  - @eventuras/smartform@0.3.3
  - @eventuras/toast@0.2.10

## 2.30.0

### Minor Changes

- 949d8b6: ### 🧱 Features
  - feat(api,web): implement correlation ID handling across API requests and responses (8055dac) [@eventuras/api]

### Patch Changes

- d752b18: ### 🐞 Bug Fixes
  - fix(web): sync turbo.json env vars with app.config.json (28c8deb) [@eventuras/web]

  ♻️ Refactoring
  - refactor(web): replace Auth0 with generic OIDC auth routes (574acae) [@eventuras/web]

- 2bdf1aa: ### 🧹 Maintenance
  - chore(api): update test project references (14f1ede) [@eventuras/api]
  - chore(api): update package references to latest versions (5d4b656) [@eventuras/api]
  - chore(api): remove unused featured disabled exception (0d9d2fd) [@eventuras/api]
  - chore(api): remove Feature Management package references (83940b0) [@eventuras/api]

- Updated dependencies [d752b18]
- Updated dependencies [949d8b6]
- Updated dependencies [0b4b869]
- Updated dependencies [2bdf1aa]
  - @eventuras/event-sdk@2.30.0
  - @eventuras/ratio-ui@0.13.0
  - @eventuras/fides-auth-next@0.1.4
  - @eventuras/datatable@0.5.9
  - @eventuras/markdown@7.0.0
  - @eventuras/markdown-plugin-happening@2.0.0
  - @eventuras/ratio-ui-next@0.1.10
  - @eventuras/smartform@0.3.2
  - @eventuras/toast@0.2.9

## 2.29.0

### Minor Changes

- 10235ad: ### 🧱 Features
  - feat(web): implement PDF certificate proxy (7375ef3) [@eventuras/web]

  ### 🐞 Bug Fixes
  - fix(web): improve error handling in createEvent function (89e8953) [@eventuras/web]

- 867c9f3: ### 🧱 Features
  - feat(web): enhance EconomySection with status grouping (821fc39) [@eventuras/web]

- 21d0d6f: ### 🧱 Features
  - feat(web): add system version endpoint with build info (e6bb28e7) [@eventuras/web]

### Patch Changes

- Updated dependencies [10235ad]
- Updated dependencies [867c9f3]
- Updated dependencies [fce9a48]
- Updated dependencies [cc205db]
- Updated dependencies [cc205db]
- Updated dependencies [21d0d6f]
- Updated dependencies [21d0d6f]
  - @eventuras/event-sdk@2.29.0
  - @eventuras/ratio-ui@0.12.0
  - @eventuras/markdown@6.0.0
  - @eventuras/datatable@0.5.8
  - @eventuras/markdown-plugin-happening@1.0.0
  - @eventuras/ratio-ui-next@0.1.9
  - @eventuras/smartform@0.3.1
  - @eventuras/toast@0.2.8

## 2.28.0

### Minor Changes

- 1915b0c: ### @eventuras/web
  - Move all environment variables from `NEXT_PUBLIC_*` to server-side only; add `config.server.ts` with `appConfig` helper
  - Add Docker multi-stage build with Next.js standalone output
  - Convert public pages (frontpage, events listing, collections listing, event/collection detail) from ISR to `force-dynamic` — removes build-time `ORGANIZATION_ID` requirement
  - Add `getOrganizationId()` helper in `src/utils/organization.ts` to centralise org ID access
  - Use `appConfig.env` in `login`/`logout` route handlers instead of bare `process.env`
  - Fix Playwright e2e `registerForEvent` to handle already-registered users idempotently

  ### @eventuras/event-sdk
  - Bundle `eventuras-v3.json` OpenAPI spec directly in the package; remove `@eventuras/api` workspace devDependency
  - Add `openapi:update` script to sync the spec from `apps/api/docs/eventuras-v3.json`

### Patch Changes

- Updated dependencies [1915b0c]
  - @eventuras/event-sdk@2.28.0

## 2.27.9

### Patch Changes

- Updated dependencies [c32e23c]
- Updated dependencies [c32e23c]
- Updated dependencies [39bd56b]
- Updated dependencies [c32e23c]
- Updated dependencies [c32e23c]
  - @eventuras/datatable@0.5.7
  - @eventuras/ratio-ui@0.11.0
  - @eventuras/smartform@0.3.0
  - @eventuras/markdown@5.0.0
  - @eventuras/ratio-ui-next@0.1.8
  - @eventuras/toast@0.2.7

## 2.27.8

### Patch Changes

- f2b3605: Layout enhancements
- 4a6097f: Enhanced dark mode support across UI components.
- b44822c: Upgrade dependencies across monorepo

  This update brings the latest stability improvements and bug fixes from upstream dependencies.

- Updated dependencies [4a6097f]
  - @eventuras/ratio-ui@0.10.1
  - @eventuras/scribo@0.8.3
  - @eventuras/datatable@0.5.6
  - @eventuras/markdown@4.0.1
  - @eventuras/ratio-ui-next@0.1.7
  - @eventuras/smartform@0.2.6
  - @eventuras/toast@0.2.6

## 2.27.7

### Patch Changes

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

- Updated dependencies
  - @eventuras/ratio-ui@0.10.0
  - @eventuras/smartform@0.2.5
  - @eventuras/datatable@0.5.5
  - @eventuras/markdown@4.0.0
  - @eventuras/ratio-ui-next@0.1.6
  - @eventuras/toast@0.2.5

## 2.27.6

### Patch Changes

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

- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @eventuras/ratio-ui@0.9.0
  - @eventuras/smartform@0.2.4
  - @eventuras/logger@0.6.0
  - @eventuras/datatable@0.5.4
  - @eventuras/markdown@3.0.0
  - @eventuras/ratio-ui-next@0.1.5
  - @eventuras/toast@0.2.4
  - @eventuras/fides-auth-next@0.1.3

## 2.27.5

### Patch Changes

- chore: update deps
- Updated dependencies
  - @eventuras/ratio-ui-next@0.1.4
  - @eventuras/core-nextjs@0.1.2
  - @eventuras/app-config@0.1.2
  - @eventuras/event-sdk@2.27.5
  - @eventuras/markdown@2.0.2
  - @eventuras/ratio-ui@0.8.2
  - @eventuras/scribo@0.8.2
  - @eventuras/datatable@0.5.3
  - @eventuras/smartform@0.2.3
  - @eventuras/toast@0.2.3

## 2.27.4

### Patch Changes

- chore: update dependencies across frontend packages
- Updated dependencies
  - @eventuras/fides-auth-next@0.1.2
  - @eventuras/ratio-ui-next@0.1.3
  - @eventuras/core-nextjs@0.1.1
  - @eventuras/app-config@0.1.1
  - @eventuras/datatable@0.5.2
  - @eventuras/markdown@2.0.1
  - @eventuras/ratio-ui@0.8.1
  - @eventuras/scribo@0.8.1
  - @eventuras/smartform@0.2.2
  - @eventuras/toast@0.2.2

## 2.27.3

### Patch Changes

- ### 🧹 Maintenance
  - chore(web): add reverse sorting to pastEvents (16569e5) [@eventuras/web]

## 2.27.1

- Sync release versions across packages api, web, event-sdk

## 0.9.0

### Minor Changes

- ### 🧱 Features
  - feat(web): enhance event product management UI and localization (c145d7e) [@eventuras/web]
  - chore(web): upgrade packages

  ### 🐞 Bug Fixes
  - fix(web): ensure correct type casting for form submission in CollectionCreator (8d2238b) [@eventuras/web]

## 0.8.0

### Minor Changes

- ### 🧱 Features
  - feat(web): add download and send functionality for certificates (7d4c84b) [@eventuras/web]

### Patch Changes

- Updated dependencies
  - @eventuras/ratio-ui@0.8.0
  - @eventuras/datatable@0.5.1
  - @eventuras/markdown@2.0.0
  - @eventuras/ratio-ui-next@0.1.2
  - @eventuras/smartform@0.2.1
  - @eventuras/toast@0.2.1

## 0.7.0

### Minor Changes

### 🧱 Features

- feat(web): enable external links in description (5c29023) [@eventuras/web]
- feat(web): add notifications feature with history and details view (70ff927) [@eventuras/web]
- feat(web): add FinishRegistrationButton component for updating registration status (de6fe79) [@eventuras/web]
- feat(web): enhance registration and event components with new features and improved UI (ef22b64) [@eventuras/web]
- feat(web): add FreeRegistration property to Registration model and update related DTOs (e245a26) [@eventuras/web]
- feat(web): add Economy tab and reusable Table component (6e4c450) [@eventuras/web]
- feat(web): enhance AdminPage layout with ButtonGroup and improved spacing (c4a964e) [@eventuras/web]
- feat(web): enhance Markdown support in event editor and public pages (19322bc) [@eventuras/web]
- feat(web-e2e): integrate gmail client (914e18c) [@eventuras/web]
- feat(web): new event admin gui (1bbb1c1) [@eventuras/web]
- feat(web): add expandable rows and user details in participant list (0a4f8d4) [@eventuras/web]
- feat(web): enhance event management interface (9379b4b) [@eventuras/web]
- feat(web): integrate event editor into main page (e8bb5ac) [@eventuras/web]
- feat(web): auto save events on admin (c7aa0a4) [@eventuras/web]
- feat(web): return to last page after re login (0066988) [@eventuras/web]
- feat(web): require event-sdk client wrapper (06a03db) [@eventuras/web]
- feat(web): patch registrations (24edf15) [@eventuras/web]
- feat(web): use reworked auth library (8d55c61) [@eventuras/web]
- feat(web): add and integrate public client (8653ed3) [@eventuras/web]
- feat(web): reworked eventflow with stepper (a2e5fd5) [@eventuras/web]
- feat(web,ratio-ui): implement error handling components and overlays for better user feedback (b18c222) [@eventuras/web]
- feat(web): better error handling on event detail page (caaf499) [@eventuras/web]
- feat(web,event-sdk): await sdk-config (945510c) [@eventuras/web]

### 🐞 Bug Fixes

- fix(web): fix participant status filters and preserve user data (256e107) [@eventuras/web]
- fix(web): fix Excel export functionality for event registrations (cee9c94) [@eventuras/web]
- fix(web): add searchParams handling and pagination to AdminPage (9818d2b) [@eventuras/web]
- fix(web): correct destructuring of searchParams in AdminPage component (ae5fd28) [@eventuras/web]
- fix(web): improve organization ID validation and provide default value (663a4bc) [@eventuras/web]
- fix(web): validate organization ID at runtime and improve error handling (ab10b27) [@eventuras/web]
- fix(web): event management components (4dc66b9) [@eventuras/web]
- fix(web): fix order actions (ae64c64) [@eventuras/web]
- fix(web): save markdown fields again (2ec9242) [@eventuras/web]
- fix(web): use process.env during build (097721d) [@eventuras/web]
- fix(web): import scribo css (ac63dfc) [@eventuras/web]
- fix(web): change import to type for OAuthConfig in oauthConfig.ts (3f83242) [@eventuras/web]
- fix(web): configure client (61772ae) [@eventuras/web]
- fix(web): ensure organization ID is always defined in createSDK (2fa02cd) [@eventuras/web]
- fix(web): update app configuration (18534a9) [@eventuras/web]
- fix(web): add build step for dependencies in CI workflow (ea4246e) [@eventuras/web]
- fix(web): ensure deps are built before web (abf127b) [@eventuras/web]
- fix(web): ensure deps are built correctly (bb610e2) [@eventuras/web]

### ♻️ Refactoring

- refactor(web): prepare removal of messagelog (7a6a4d2) [@eventuras/web]
- refactor(web): add admin role check to layout page (61c1cc8) [@eventuras/web]
- refactor(web): improve lazy configuration of api client (d3fbd5d) [@eventuras/web]
- refactor(web): update UserLookup component (089e08c) [@eventuras/web]
- refactor(web): refactor notificatior logic (d568eb9) [@eventuras/web]
- refactor(web): refactor eventparticipantlist (7ba1d6f) [@eventuras/web]
- refactor(web): use nextjs page groups (a467a9c) [@eventuras/web]
- refactor(web): use more event-sdk (bc9954c) [@eventuras/web]
- refactor(web): use debug for api forwarder (74a06dc) [@eventuras/web]
- refactor(web-e2e): change from logger to debug (f11eae9) [@eventuras/web]
- refactor(web): use new logger (0f41301) [@eventuras/web]
- refactor(web-e2e): change logger imports (711774e) [@eventuras/web]
- refactor(web,ratio-ui): streamline imports and enhance type definitions across components (9a64a93) [@eventuras/web]

### 🧹 Maintenance

- chore(web,historia): upgrade next js to v16 (0d5a7a8) [@eventuras/web]
- chore(web-e2e): some minor fixes (265e53e) [@eventuras/web]
- chore(web): upgrade all packages (4fdc2ad) [@eventuras/web]
- chore(web): remove NEXT_PUBLIC_API_VERSION (491e6e5) [@eventuras/web]
- chore(web): update sdk (b3f9b70) [@eventuras/web]
- chore(web): enhance user search functionality with logging and error handling (ffb876d) [@eventuras/web]
- chore(web): enhance event handling and user experience with improved error messages and UI updates (61e59f6) [@eventuras/web]
- chore(web): selfconfiguring api client (ef73645) [@eventuras/web]
- chore(web): remove old sdk (92f7499) [@eventuras/web]
- chore(web): enforce dynamic rendering for admin and user routes (8f46c3c) [@eventuras/web]
- chore(web): used named imports from ratio-uo (a9d2d4d) [@eventuras/web]
- chore(web): remove Wrapper component and replace with direct layout usage (473e5ca) [@eventuras/web]
- chore(web): update to use new sdk (7655631) [@eventuras/web]
- chore(web): just cleaning (b3ca142) [@eventuras/web]
- chore(web): using new event-sdk (f224f0b) [@eventuras/web]
- chore(web): use new sdk (97a8c9e) [@eventuras/web]
- chore(web): use orgid typed (e7f81d1) [@eventuras/web]
- chore(web): use app-config (2dd6f2e) [@eventuras/web]
- chore(web): remove pino-pretty support (40ff813) [@eventuras/web]
- chore(web): enhance logging (068b40d) [@eventuras/web]
- chore(web): clean up deps linking (95da0d8) [@eventuras/web]
- chore(convertoapi,docsite,web,markdown,scribo,sdk): upgrade deps (b2de638) [@eventuras/web]

### Patch Changes

- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @eventuras/event-sdk@0.6.0
  - @eventuras/logger@0.5.0
  - @eventuras/smartform@0.2.0
  - @eventuras/scribo@0.8.0
  - @eventuras/datatable@0.5.0
  - @eventuras/toast@0.2.0
  - @eventuras/markdown@1.0.0
  - @eventuras/ratio-ui@0.7.0
  - @eventuras/fides-auth-next@0.1.1
  - @eventuras/app-config@0.1.0
  - @eventuras/core@0.1.0
  - @eventuras/core-nextjs@0.1.0
  - @eventuras/ratio-ui-next@0.1.1

## 0.6.1

### Patch Changes

- - chore(convertoapi,docsite,web,markdown,scribo,sdk): upgrade deps (51e931b) [@eventuras/web]
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @eventuras/markdown@5.0.1
  - @eventuras/scribo@0.7.1
  - @eventuras/sdk@0.13.1

## 0.6.0

### Minor Changes

- ## Initial history (pre-Changesets)
  - chore(web): remove Storybook and unused assets (4f8dec0)
  - fix(web): reads locale from env again (9089f8b)
  - chore(web): npm packages (5fd97b0)
  - fix(web): fixes error in productmodal (20dcd3f)
  - feat(web): xstate machine for notifications (3ecfaf1)
  - chore(web): upgrade to react 19 and next 15 (9b6aa22)
  - feat(web): add button to email certificate (20b2b2b)
  - fix(web): add rollup dependencies (c0a9264)
  - chore(web): chore upgrades (abfa40b)
  - test(web): update tab id (23700e1)
  - feat(web): add ui for download participant list in excel (a3d3115)
  - feat(web): add collection-editor (d890b34)
  - feat(web): view event collections (43d92e3)
  - chore(web): upgrade npm packages (7b1bec7)
