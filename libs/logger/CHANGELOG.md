# @eventuras/logger

## 0.8.0

### Minor Changes

- 7d2b896: Logger hygiene pass:
  - **BREAKING:** `prettyPrint` options on `PinoTransport` and
    `LoggerConfig` are removed, and the default transport no longer
    auto-enables pretty output based on `NODE_ENV`. Importing the main
    entry no longer pulls `node:stream` into browser/edge bundles. For
    pretty dev output, call `configureNodeLogger` from
    `@eventuras/logger/node`:

    ```ts
    import { configureNodeLogger } from "@eventuras/logger/node";
    configureNodeLogger({
      prettyPrint: process.env.NODE_ENV === "development",
    });
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

### Patch Changes

- fc1f5dc: Follow-up to the logger cleanup pass:
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

## 0.7.1

### Patch Changes

- 7c9fe79: chore: update dependencies

## 0.7.0

### Minor Changes

- 6e7d2d4: Add pluggable transport architecture for structured logging.

  ## What changed
  - **LogTransport interface**: New extension point for custom log backends. Implement `log()`, `child()`, and optionally `flush()`/`shutdown()` to route logs anywhere.
  - **PinoTransport** (default): Wraps Pino — used automatically with zero config. Exposes `.pino` for advanced integrations (OTel instrumentation, custom serializers).
  - **ConsoleTransport**: Lightweight transport using `console.log/warn/error`. Works in browsers, edge runtimes, and test environments without Node.js dependencies.
  - **Configurable transport**: `Logger.configure({ transport: new ConsoleTransport() })` to swap backends at startup.
  - **OpenTelemetry as optional peer deps**: OTel packages moved from hard dependencies to optional peer dependencies — install only if you need tracing.
  - **Browser/edge safety**: `process.env` access is guarded via `globalThis` checks — no more crashes in client components or edge runtimes.
  - **Configurable service name**: OTel integration no longer hardcodes a service name — uses `OTEL_SERVICE_NAME` env var or accepts it as an option.
  - **Pretty printing**: Built-in zero-dependency pretty formatter for human-readable dev output. Auto-enabled in development when using PinoTransport.
  - **Pipeline-friendly output**: ISO timestamps and string log levels (`"info"` instead of `30`) by default — no level mapping needed in Loki/Grafana Alloy.
  - **Node subpath export**: `@eventuras/logger/node` exposes `createPrettyStream`/`formatLogLine` — keeping the root entrypoint free of `node:stream` imports for browser safety.
  - **Environment detection**: `createDefaultTransport()` auto-selects ConsoleTransport in non-Node environments (browsers, edge runtimes).
  - **Static method overloads**: `Logger.info('message')` now works alongside `Logger.info({ namespace: 'x' }, 'message')`.
  - **Type safety**: All `any` types in OTel module replaced with proper interfaces.

  ## Public API

  The existing API is fully backwards compatible:

  ```ts
  // Scoped logger (unchanged)
  const logger = Logger.create({ namespace: "MyModule" });
  logger.info("Hello");
  logger.error({ error: err }, "Something failed");

  // Static logging (unchanged)
  Logger.info({ namespace: "quick" }, "One-off log");

  // NEW: Static logging with string shorthand
  Logger.info("Quick message");
  Logger.error("Something broke");

  // NEW: Custom transport
  import { ConsoleTransport } from "@eventuras/logger";
  Logger.configure({ transport: new ConsoleTransport() });

  // NEW: Access transport
  const transport = Logger.getTransport();
  ```

  `Logger.getPinoInstance()` is deprecated — use `Logger.getTransport()` or cast to `PinoTransport` if you need the raw Pino instance.

  ## Package metadata
  - Package is now publishable (removed `private` flag)
  - Added `license`, `repository`, `homepage`, `bugs`, `keywords`, `engines` fields
  - ESM-only, Node 20+

## 0.6.0

### Minor Changes

- ### 🧱 Features
  - Integrate OpenTelemetry for enhanced logging capabilities with distributed tracing support
  - Integrate Sentry transport for error tracking and monitoring
  - Add separate Debug utilities for development debugging

  ### 🐞 Bug Fixes
  - Move `@opentelemetry/api` to regular dependencies for proper resolution

## 0.5.0

### 🧱 Features

- feat(logger): add separate Debug utilities (88e1494) [@eventuras/logger]
- feat(logger): enhanced logging capabilities (f3eb797) [@eventuras/logger]
- feat(logger): bundle it up (9ed77c3) [@eventuras/logger]

### 🧹 Maintenance

- chore(logger): remove pino-pretty (28af76f) [@eventuras/logger]

## 0.4.0

### Major Changes

- Renamed package from @eventuras/utils to @eventuras/logger
- Changed import path from `@eventuras/utils/src/Logger` to `@eventuras/logger`

## 0.4.0 (as @eventuras/utils)

### Minor Changes

- ## Initial history (pre-Changesets)
  - feat(utils): add optional environment variables (8117fcb)
