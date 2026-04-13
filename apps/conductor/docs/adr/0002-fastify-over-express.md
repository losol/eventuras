# ADR 0002 — Fastify over Express

## Status

Accepted

## Context

Conductor uses Express 5. The HTTP surface is small (~170 lines across 4 files): one route, auth middleware, tenant middleware, and server setup. The hub refactoring (ADR 0001) will rewrite this layer regardless, making this a low-cost time to switch.

Express pain points:

- Global namespace pollution for request types (`declare global { namespace Express }`)
- Manual graceful shutdown (SIGTERM/SIGINT handling)
- No built-in schema validation — Zod validation done manually in each handler
- No built-in TypeScript support for typed request/response

## Decision

Replace Express with Fastify.

**Why Fastify:**

- **TypeScript-first** — request types via generics, no global namespace hack
- **Built-in graceful shutdown** — `fastify.close()` handles signal trapping and connection draining
- **Schema validation integration** — `fastify-type-provider-zod` provides typed request validation, eliminating manual try/catch parsing
- **Plugin encapsulation** — maps well to the hub architecture (auth plugin, tenant plugin, routes)
- **Mature ecosystem** — most used Express alternative, well-maintained

**Why not Hono:** lightweight and portable (edge, Bun, Deno), but less relevant for a Node server app. Smaller middleware ecosystem.

**Why not keep Express:** the refactoring rewrites the HTTP layer anyway. Switching now avoids carrying Express patterns into the new architecture.

## Consequences

**Positive:**

- Cleaner TypeScript — request schemas at route level via generics
- Less boilerplate — graceful shutdown, JSON parsing, error handling built in
- Zod validation at framework level
- Plugin encapsulation for auth and tenant context

**Considerations:**

- Team must learn Fastify conventions (decorators, plugins, lifecycle hooks)
- Auth and tenant middleware rewritten as Fastify plugins (trivial given size)

## Decision Date

2026-04-13
