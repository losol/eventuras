# AGENTS.md

Context and instructions for AI coding agents working on Eventuras ([agents.md](https://agents.md/)).
Claude Code loads this file through `CLAUDE.md`; Copilot and other agents read it directly.

## Project overview

**Eventuras** is a platform for managing courses, events and conferences. It is a pnpm + Turbo monorepo.

| Path | What | Stack |
| --- | --- | --- |
| `apps/api` | Backend API | C# .NET 10, ASP.NET Core, EF Core, PostgreSQL 18, .NET Aspire |
| `apps/web` | Frontend for participants and organizers | TypeScript, React 19, Next.js 16 (App Router), Tailwind via ratio-ui |
| `apps/conductor` | Messaging gateway (Discord, Matrix, WhatsApp) | TypeScript, Node |
| `libs/*` | Workspace libraries: `event-sdk` (generated API client), `smartform`, `scribo`, `mailer`, `shipper`, `google-api`, `markdown-plugin-happening` | TypeScript |
| `tests/e2e` | Playwright E2E and API tests (`@eventuras/e2e`) | Playwright |
| `docs` | Product and developer docs | MDX |

Several packages used to live here and are now consumed from npm and developed in their own repos:
`@eventuras/ratio-ui`, `@eventuras/ratio-ui-next`, `@eventuras/core`, `@eventuras/core-nextjs`, `@eventuras/logger`,
`@eventuras/fides-auth-next`. Don't look for them under `libs/`. Changes to them go to their own repositories.

## Commands

```bash
pnpm install                                   # install everything
pnpm build:dev                                 # build web and its dependencies
pnpm lint                                      # lint all (turbo)
pnpm turbo run lint --filter=@eventuras/web... # lint web + deps (what CI runs)
pnpm --filter @eventuras/web test              # web unit tests (vitest)

cd apps/api
dotnet build                                   # build API (also regenerates docs/eventuras_v3.json)
dotnet test                                    # all backend tests (in-memory DB, no Postgres needed)
dotnet test --project tests/Eventuras.UnitTests/Eventuras.UnitTests.csproj
dotnet format --verify-no-changes              # CI fails if this reports changes
```

## Local stack (Aspire)

The Aspire AppHost (`apps/api/src/Eventuras.AppHost`, found via `aspire.config.json`) runs the whole stack:
`postgres` (PostgreSQL 18, persistent volume), `migrations`, `api`, `keycloak`, `mailpit`, `web` (`pnpm dev`), `traefik`,
and an `e2e` resource that you start on demand.

**Use it when it adds evidence** that unit tests can't give:

- a UI change: see the page in a browser, logged in
- API behaviour against real PostgreSQL (migrations, constraints, `uuidv7()`, raw SQL), which the in-memory test DB doesn't cover
- mail output (receipts, notifications, login codes) in Mailpit
- debugging with real logs and traces
- the Playwright suite

Skip it for lint, unit tests and pure refactors.

```bash
aspire ps                                    # check first: is a stack already running?
aspire start --non-interactive               # from the repo root; runs in the background
aspire wait api && aspire wait web           # wait until healthy (default timeout 120 s)
aspire describe                              # resources, state and URLs
aspire logs api -n 200                       # recent logs; --search "text" filters, -f follows
aspire otel traces api                       # traces (also: otel logs | spans <resource>)
aspire resource e2e start                    # run the Playwright suite as a resource
aspire stop --apphost apps/api/src/Eventuras.AppHost   # always name the AppHost; never --all
```

| Service | URL |
| --- | --- |
| Web | <https://eventuras-web.dev.localhost> (direct: <http://localhost:5100>) |
| API | <https://eventuras-api.dev.localhost> (direct: <http://localhost:5101>) |
| Mailpit | <https://eventuras-mail.dev.localhost> (API: <http://localhost:5103>) |
| Keycloak | <https://eventuras-id.dev.localhost>, realm `eventuras-dev` |

Login is passwordless. Use `admin@example.com` (Admin + SystemAdmin) or `orgadmin@example.com` (Admin only), and read
the one-time code from Mailpit.

Rules:

- **One Eventuras stack at a time.** Ports are fixed (443, 5100–5104). If `aspire ps` shows an Eventuras AppHost running,
  reuse it. If another project's AppHost holds the ports, don't stop it. Ask the maintainer.
- The stack runs the code of the checkout it was started from. To exercise changes in a worktree, start it from that
  worktree, and only when no other Eventuras stack is running.
- Starting the stack rewrites `tests/e2e/.env`, so `cd tests/e2e && pnpm test` works right away against it.
- Agents may start and stop the Eventuras stack freely. Stop it when you're done if you started it. Leave it running if
  it was already up.
- The database persists between runs. Don't drop volumes (`aspire stop --force --volumes`) without asking.
- Tell the caller what you checked in the running stack, e.g. "verified in browser as orgadmin" or "API log shows …".

## Workflow rules

- **Commits**: Conventional Commits, enforced by commitlint. See "Commit style" below.
- **Changesets**: add one for user-facing changes to versioned packages (`pnpm changeset`, or `pnpm changeset:suggest`).
- **Git (trial):** subagents may commit to their own feature branch once checks pass, with a Conventional Commit and
  `Co-Authored-By` trailer. Never commit to `main`. **Push, PRs, amend and force-push need the maintainer's go-ahead.**
  The main session still asks before it commits. Agents running in CI work on their own branch, open **draft** PRs and never merge.
- **Code comments**: short. One line is preferred, two at most. Put the reasoning in commits and changesets.
- **OpenAPI**: after changing API contracts, run `dotnet build` in `apps/api` and `pnpm --filter @eventuras/event-sdk build`,
  then commit `apps/api/docs/eventuras_v3.json` and the regenerated SDK. CI checks that they are in sync.
- **EF migrations**: after adding a migration, regenerate the idempotent script (a test checks that it is current):
  `cd apps/api/src/Eventuras.Infrastructure && dotnet ef migrations script --idempotent -o sqlscript/database-migrations.sql --startup-project ../Eventuras.WebApi`
- **No `mailto:` links**: participant emails are shown as plain text. Contact goes through the app.

## Commit style

**Size: one logical change per commit.** Most commits touch a handful of files and under a few hundred lines.

- Split a feature along its seams: data model → API endpoints → web UI, each a commit that builds and passes tests.
- Keep refactors, renames and dependency bumps in their own commits, apart from behaviour changes.
- Generated files go in the commit that caused them (OpenAPI doc and SDK with the API change, migration script with the migration).

**Subject**: `type(scope): what changes`. Lowercase and imperative, with no trailing period. Aim for about 60 characters, 72 at most.

- Always include a scope: `api`, `web`, `e2e`, `mailer`, `repo`, ….
- Describe the behaviour or outcome, not the code: `fix(api): resolve a concurrent first purpose decision instead of failing`,
  `feat(web): let users set privacy choices on their profile page`. Avoid `update X.cs` or `fix bug`.
- Don't add PR numbers. GitHub appends them on merge.

**Body**: optional for obvious changes. Otherwise write 2–6 lines of plain prose, wrapped at about 72 characters.

- Say why, and what changes for users or operators. Leave out what the diff already shows.
- Name the concrete cause and effect: the error, the limit, the advisory. If you measured something, give the numbers
  ("10 concurrent PUTs went from 31 of 50 failing to 0").
- Use a short bullet list only for several independent sub-changes (e.g. an upgrade's migration steps).
- No headings, no "This commit…", no file lists, no summaries of the tests you ran.

## Agent team

Claude Code subagents live in `.claude/agents/`. The maintainer refers to them by first name.

| Name | Role | Use for |
| --- | --- | --- |
| **Max** | Backend developer | `apps/api`: endpoints, services, EF migrations, xUnit tests |
| **Vix** | Frontend developer | `apps/web`, `libs/*`, Playwright tests |
| **Aria** | Architect (read-only) | Design reviews, library boundaries, API contracts, trade-offs |
| **Core** | Planner | Breaking work into agent-ready GitHub issues, sequencing multi-domain work |
| **Cody** | Maintenance | Dependency updates, PR review with merge recommendation (never merges), dead code, stale docs |
| **Dora** | Documentation | READMEs and `docs/` |

Area rules live in nested `AGENTS.md` files (`apps/api`, `apps/web`, `tests/e2e`). Each has a `CLAUDE.md` with
`@AGENTS.md` so that Claude Code loads it too. Skills live in `.claude/skills/`.

## Backend conventions (summary)

Full rules: `apps/api/AGENTS.md`.

- Controllers in `Controllers/v3/**` are thin: `[ApiVersion("3")]`, `[EndpointSummary]` and `[EndpointDescription]`, delegate to services.
- Services use `ApplicationDbContext` directly. There is no repository layer.
- Signal errors with the service exceptions in `Eventuras.Services/Exceptions` (`NotFoundException`, `NotAccessibleException`, `InputException`, …).
  `HttpResponseExceptionFilter` maps them to HTTP status codes.
- Public identifiers are `Uuid` (uuidv7). Scope admin data to the current organization (`ICurrentOrganizationAccessorService`).
- Record auditable changes with `IBusinessEventService`.

## Frontend conventions

### Logging: `@eventuras/logger`, never `console.log`

```typescript
import { Logger } from '@eventuras/logger';

const logger = Logger.create({ namespace: 'web:admin:collections', context: { module: 'CollectionEditor' } });

logger.info({ collectionId }, 'Collection updated');                          // happy path: concise
logger.error({ error, collectionId, input: data }, 'Failed to update collection'); // errors: full context
```

Levels: `debug` (non-production only), `info` (key business events), `warn` (recoverable), `error` (needs attention).

### Server actions: `ServerActionResult`

```typescript
'use server';

import { actionError, actionSuccess, ServerActionResult } from '@eventuras/core-nextjs/actions';

export async function updateCollection(data: EventCollectionDto): Promise<ServerActionResult<void>> {
  try {
    const response = await putV3EventcollectionsById({ path: { id: data.id }, body: data });
    if (!response.data) {
      logger.error({ error: response.error, collectionId: data.id }, 'Failed to update collection');
      return actionError('Failed to update collection');
    }
    return actionSuccess(undefined, 'Collection updated!');
  } catch (error) {
    logger.error({ error, collectionId: data.id }, 'Unexpected error updating collection');
    return actionError('An unexpected error occurred');
  }
}
```

Use `actionSuccess(data, message?)` and `actionError(message, code?, details?)`. The result is a discriminated union on `success`.

### User feedback: toast

```typescript
import { useToast } from '@eventuras/ratio-ui/toast';

const toast = useToast();
const result = await updateCollection(data);
if (!result.success) return toast.error(result.error.message);
toast.success(result.message ?? 'Saved!');
```

Keep messages short. Success: "Collection created!". Errors should say what to do next: "Failed to save. Please try again."

### UI components and styling

- Use components from `@eventuras/ratio-ui` and `@eventuras/ratio-ui-next` before building your own.
- Use `Link` from `@eventuras/ratio-ui-next/Link`, not `next/link`. Use `next/link` only where ratio-ui is unavailable
  (e.g. `global-error.tsx`), and add a comment saying why.
- `apps/web` has **no Tailwind build of its own**. Utility classes come from the prebuilt `@eventuras/ratio-ui/dist/ratio-ui.css`.
  Check that a class exists there before you use it. Missing utilities and new variants belong in ratio-ui.
- Prefer Server Components. Add `'use client'` only when needed.
- Accessibility: semantic HTML, native table markup for tabular data, labelled controls.
- Naming: components `PascalCase.tsx`, hooks and functions `camelCase`, utility files `kebab-case.ts`.

`apps/web/AGENTS.md` adds Next.js 16 notes. Read it before you touch Next.js APIs.
