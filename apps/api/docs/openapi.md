# OpenAPI specification

`eventuras_v3.json` is the OpenAPI 3.1 document for Eventuras API v3. It is generated —
never edit it by hand.

## Regenerating

The document is written during the build, so nothing needs to be running: no API, no
database, no Aspire stack.

```bash
# From the repository root: regenerates the document and the TypeScript SDK
pnpm openapi:update
```

Or the two steps on their own:

```bash
cd apps/api && pnpm openapi:update       # dotnet build src/Eventuras.WebApi
pnpm --filter @eventuras/event-sdk build
```

Commit the document and the regenerated SDK together.

Any build of `Eventuras.WebApi` rewrites the document, so a change to a controller, a DTO
or a transformer shows up as a diff in this file. That is the intended signal. CI fails
when the committed document does not match the API — see `Verify the OpenAPI document is
committed` in `.github/workflows/api-ci.yml`.

## How it is produced

`Microsoft.Extensions.ApiDescription.Server` runs `dotnet-getdocument` after the build. It
loads the built assembly and asks the app for its document, so the app is constructed but
never serves traffic. `Program.cs` skips `PreStartupRoutine` in that case — describing the
API must not seed a database. See `IsGeneratingOpenApiDocument()`.

The document's shape comes from the transformers in `Extensions/OpenApiTransformers.cs`:
title and version, the Bearer security scheme, the `Eventuras-Org-Id` header, NodaTime and
numeric schemas, and the JSON Patch content type.

It carries no `servers` entry. Consumers configure their own base URL; the SDK throws if
one is not set.

## Consumers

- **`libs/event-sdk`** — the TypeScript SDK, generated with `@hey-api/openapi-ts`. It
  resolves this file through the `@eventuras/api/openapi` package export rather than a
  relative path, so `turbo prune --docker` keeps it in the dependency graph.
- **Scalar API reference** — served at `/docs` on a running API, in development or when
  `EnableApiDocs` is on.

## A trap worth knowing about

`Microsoft.AspNetCore.OpenApi` 10.0.11 does not turn XML `<summary>` comments on the
properties of `[FromQuery]` types into parameter descriptions; 10.0.9 did. Those
descriptions are therefore missing from the document even though they are in the source.
`<param>` comments on the action itself are unaffected. Worth re-checking on the next
package bump.

A public get-only property on a `[FromQuery]` type is also published as a query parameter
that callers appear able to set. Use a method instead — `BusinessEventsQueryDto.HasSubject()`
is one. `[BindNever]` does not help; the parameter still reaches the document.

## Versioning

The filename carries the API version. A future major version is added alongside rather
than replacing this one, so several versions can be published at once.
