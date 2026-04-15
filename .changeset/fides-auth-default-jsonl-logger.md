---
"@eventuras/fides-auth": minor
---

The default `ConsoleLogger` now emits newline-delimited JSON instead of
bracket-prefixed text. Output stays interoperable with Loki / Grafana /
Datadog out of the box even when the consuming app hasn't called
`configureLogger()` to wire in `@eventuras/logger` or pino.

Each entry includes `level`, ISO `time`, `namespace`, persistent context
fields, optional `msg`, and the data object (with `Error` instances
serialized to `{ name, message, stack }`):

```json
{"level":"info","time":"2026-04-15T19:40:57.300Z","namespace":"fides-auth:oauth","msg":"PKCE parameters generated"}
```

Apps that still want pretty bracketed output during development should
plug in their own logger via `configureLogger()` — e.g. wire in
`@eventuras/logger` and let `configureNodeLogger` from
`@eventuras/logger/node` handle dev pretty-print.
