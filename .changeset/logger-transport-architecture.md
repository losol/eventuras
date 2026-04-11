---
"@eventuras/logger": minor
---

Add pluggable transport architecture for structured logging.

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
const logger = Logger.create({ namespace: 'MyModule' });
logger.info('Hello');
logger.error({ error: err }, 'Something failed');

// Static logging (unchanged)
Logger.info({ namespace: 'quick' }, 'One-off log');

// NEW: Static logging with string shorthand
Logger.info('Quick message');
Logger.error('Something broke');

// NEW: Custom transport
import { ConsoleTransport } from '@eventuras/logger';
Logger.configure({ transport: new ConsoleTransport() });

// NEW: Access transport
const transport = Logger.getTransport();
```

`Logger.getPinoInstance()` is deprecated — use `Logger.getTransport()` or cast to `PinoTransport` if you need the raw Pino instance.

## Package metadata

- Package is now publishable (removed `private` flag)
- Added `license`, `repository`, `homepage`, `bugs`, `keywords`, `engines` fields
- ESM-only, Node 20+
