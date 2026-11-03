---
name: eventuras-testing
description: Pick and run the checks CI will run for the files you changed in the Eventuras monorepo (dotnet format/build/test, web lint/test/build, OpenAPI and migration-script sync, Playwright). Use before handing over work or when CI fails.
---

# Eventuras testing: run what CI runs

Find what changed, then run the matching checks. Start with the fastest and stop at the first failure.

```bash
git diff --name-only origin/main...HEAD; git status --short
```

## apps/api/** (`.github/workflows/api-ci.yml`)

```bash
cd apps/api
dotnet format --verify-no-changes          # fix with: dotnet format
dotnet build                               # regenerates docs/eventuras_v3.json
git diff --stat -- docs/eventuras_v3.json  # if changed: commit it and rebuild the SDK (below)
dotnet test                                # all test projects; the full check before you hand over
```

- While iterating, run one project: `dotnet test --project tests/<Project>/<Project>.csproj`. The CI matrix covers
  UnitTests, Services.Tests, WebApi.Tests, Libs.Pdf.Tests, Services.Converto.Tests and Losol.Communication.Email.Tests.
  Changes to shared code or NuGet packages can break any of them, so finish with the solution-wide `dotnet test`.
- Narrow down with `--filter "FullyQualifiedName~EventsControllerTests"`. It works with xUnit v3 on Microsoft.Testing.Platform.
  `--filter-class` needs the exact class name and misses nested test classes.
- If you added a migration, `MigrationsScriptTests` fails until you regenerate `sqlscript/database-migrations.sql`
  (the command is in `apps/api/AGENTS.md`).
- If the OpenAPI doc changed, run `pnpm --filter @eventuras/event-sdk build` and check that web still type-checks.

## apps/web/** or libs/** (`.github/workflows/web-ci.yml`)

```bash
pnpm turbo run lint --filter=@eventuras/web...
pnpm turbo run test --filter=@eventuras/web
pnpm turbo run build --filter=@eventuras/web   # slow; run it when you've changed types, routes or config
```

For a changed library only: `pnpm --filter @eventuras/<lib> lint` / `test` / `build`.

## Any PR (`.github/workflows/_checks.yml`)

- Commit messages must pass commitlint: `type(scope): description`.
- User-facing changes to versioned packages need a changeset (`pnpm changeset:suggest`).

## tests/e2e/**

These need the Aspire stack, so they don't run in normal PR CI. Always lint them (`pnpm --filter @eventuras/e2e lint`).
Run them against the stack ("Local stack" in the root `AGENTS.md`, details in `tests/e2e/AGENTS.md`).

## Verifying in the running stack

For UI changes, API behaviour that depends on real PostgreSQL, or mail output, unit tests aren't enough. Check it in
the Aspire stack (`aspire ps` first, then reuse or start one) and say what you saw.

## Reporting

Say which checks you ran and their result. Name any you skipped and why ("e2e: no running stack").
Don't claim green on checks you didn't run.
