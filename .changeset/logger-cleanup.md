---
"@eventuras/logger": minor
---

Logger hygiene pass:

- **BREAKING:** `prettyPrint` options on `PinoTransport` and
  `LoggerConfig` are removed, and the default transport no longer
  auto-enables pretty output based on `NODE_ENV`. Importing the main
  entry no longer pulls `node:stream` into browser/edge bundles. For
  pretty dev output, call `configureNodeLogger` from
  `@eventuras/logger/node`:

  ```ts
  import { configureNodeLogger } from '@eventuras/logger/node';
  configureNodeLogger({ prettyPrint: process.env.NODE_ENV === 'development' });
  ```

- `PinoTransport` gains a `destinationStream?: NodeJS.WritableStream`
  option to replace the removed `prettyPrint` convenience.
- OpenTelemetry setup now dogfoods `Logger` for its own diagnostics
  instead of writing `console.log` / `console.warn` directly.
- OTel peer-dep ranges capped below `1.0.0` to prevent silent breaks
  when the packages eventually leave pre-1.0.
- `getPinoInstance()` is now flagged for removal in `1.0`.
- Default redact behavior is documented: `fast-redact` matches exact
  field paths, not arbitrary nested occurrences.
- Internal no-op `rebindStaticMethods` removed.
- README now calls out `Logger.create()` as the preferred pattern for
  everything beyond bootstrap logs.
