---
"@eventuras/event-sdk": patch
---

Resolve the OpenAPI spec via the `@eventuras/api/openapi` package export instead of a relative path. This restores the Docker build, which uses `turbo prune --docker` and was excluding `apps/api/docs/eventuras-v3.json` because it lived outside the SDK's dependency graph.
