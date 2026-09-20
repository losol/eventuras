---
'@eventuras/api': minor
'@eventuras/event-sdk': minor
---

The OpenAPI document is now written during the build instead of being fetched from a running API. Regenerating it takes a `dotnet build` — no server, no database, no Aspire stack — and CI fails when the committed document does not match the API, so the two can no longer drift apart.

They had drifted. Every one of the 43 paths in the committed specification differed from what the code produced, because the last true regeneration ran on `Microsoft.AspNetCore.OpenApi` 10.0.9 and later updates only patched the file by hand. Regenerating it properly is most of this diff.

Two real defects came out of that drift:

`BusinessEventsQueryDto.HasSubject` was published as a query parameter on `GET /v3/business-events`. It is computed from the other parameters and has no setter, so nothing could ever be bound to it. It is a method now — a public get-only property on a `[FromQuery]` type is always published as a settable parameter, and `[BindNever]` does not prevent it.

The specification pinned `https://localhost:5001/` as its server, which the generated SDK baked in as a default `baseUrl` — a developer's machine, published to every consumer. The document now carries no `servers` entry, so `createClient()` has no default. That matches what the SDK already documented and enforced: `clientConfig.ts` throws when no base URL is configured. A consumer that relied on the default now fails loudly instead of quietly calling localhost.

The document's `info` block is set explicitly rather than inherited from the entry assembly, which otherwise names whichever tool generated it.

Known gap, accepted for now: 10.0.11 no longer turns XML `<summary>` comments on `[FromQuery]` properties into parameter descriptions, so eight of them are missing from the document even though they are still in the source. 10.0.9 emitted them. `<param>` comments on actions are unaffected. Worth re-checking on the next package bump.

`apps/api/docs/eventuras-v3.json` is now `eventuras_v3.json`, the name the generator writes.
