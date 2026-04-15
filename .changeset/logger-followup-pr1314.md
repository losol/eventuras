---
"@eventuras/logger": patch
---

Follow-up to the logger cleanup pass:

- `PinoTransportOptions.destinationStream` now uses a structural
  `PinoDestinationStream` interface instead of `NodeJS.WritableStream`,
  so the universal main-entry types no longer leak Node types into
  browser/edge consumers.
- `LoggerConfig.transport` JSDoc clarifies the runtime-dependent
  default (`PinoTransport` on Node, `ConsoleTransport` in
  browser/edge).
- README cleanup: the `PinoTransport` example no longer references the
  removed `prettyPrint` option, and the auto-redaction snippets now
  include the missing `Logger.create()` setup so they're copy-paste
  runnable.
