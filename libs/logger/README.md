# @eventuras/logger

A structured logging library with pluggable transports and optional OpenTelemetry integration. Works in Node.js and browser environments.

## Features

- 🎯 **Scoped loggers** — Create instances with persistent context and namespace
- 🔌 **Pluggable transports** — Use Pino (default), console, or bring your own
- 🔒 **Auto-redaction** — Protect sensitive fields in log output
- 📊 **Log levels** — Control verbosity per logger or globally
- 🔍 **Correlation IDs** — Track requests across services
- 🌐 **OpenTelemetry** — Optional integration for any OTel-compatible backend
- 🌍 **Cross-runtime** — Works in Node.js, browsers, and edge runtimes

## Installation

```bash
pnpm add @eventuras/logger
```

## Quick Start

### Scoped Logger (recommended)

```typescript
import { Logger } from "@eventuras/logger";

const logger = Logger.create({
  namespace: "web:admin:events",
  context: { module: "EventEditor" },
});

logger.info({ eventId: 42 }, "Event updated");
logger.error({ error }, "Failed to save event");
```

### Static Methods (one-off logs)

```typescript
import { Logger } from "@eventuras/logger";

Logger.info("Server started");
Logger.warn({ memoryUsage: "85%" }, "Memory usage high");
Logger.error({ error }, "Unhandled exception");
```

## Log Levels

From most to least verbose:

| Level   | Value | Use case                     |
| ------- | ----- | ---------------------------- |
| `trace` | 10    | Fine-grained debugging       |
| `debug` | 20    | Development debugging        |
| `info`  | 30    | General events **(default)** |
| `warn`  | 40    | Warnings                     |
| `error` | 50    | Errors                       |
| `fatal` | 60    | Critical/shutdown errors     |

## Configuration

Configure the logger once at application startup:

```typescript
import { Logger } from "@eventuras/logger";

Logger.configure({
  level: "debug",
  redact: ["password", "token", "apiKey", "authorization", "secret"],
  destination: "/var/log/app.log", // Optional file output
});
```

### Pretty dev output (Node only)

Pretty-printing depends on `node:stream`, so it lives in the `/node`
subpath to keep the main entry browser/edge-safe. Call it from your
server bootstrap:

```typescript
import { configureNodeLogger } from "@eventuras/logger/node";

configureNodeLogger({
  level: "debug",
  prettyPrint: process.env.NODE_ENV === "development",
});
```

### Environment Variables

```bash
LOG_LEVEL=debug       # Set global log level (picked up by the default PinoTransport)
```

## Transports

The library uses a pluggable transport system. A transport implements the `LogTransport` interface:

```typescript
interface LogTransport {
  log(level: LogLevel, data: Record<string, unknown>, msg?: string): void;
  child(bindings: Record<string, unknown>): LogTransport;
  flush?(): Promise<void>;
  shutdown?(): Promise<void>;
}
```

### PinoTransport (default in Node.js)

[Pino](https://getpino.io) is included as a dependency and used automatically in Node.js environments. In browser/edge runtimes, `ConsoleTransport` is used as the default instead.

```typescript
import { Logger, PinoTransport } from "@eventuras/logger";

// Explicit Pino configuration
Logger.configure({
  transport: new PinoTransport({
    level: "debug",
    prettyPrint: true,
    redact: ["password", "secret"],
  }),
});
```

### ConsoleTransport

A lightweight transport using native `console` methods. Automatically selected as the default in browser and edge runtimes. Also useful for testing:

```typescript
import { Logger, ConsoleTransport } from "@eventuras/logger";

Logger.configure({
  transport: new ConsoleTransport(),
});
```

### Custom Transport

Implement the `LogTransport` interface for any logging backend:

```typescript
import type { LogTransport, LogLevel } from "@eventuras/logger";

class DatadogTransport implements LogTransport {
  log(level: LogLevel, data: Record<string, unknown>, msg?: string) {
    // Send to Datadog, Winston, Bunyan, or any backend
  }

  child(bindings: Record<string, unknown>): LogTransport {
    // Return a new transport with merged bindings
    return new DatadogTransport({ ...this.config, bindings });
  }
}

Logger.configure({ transport: new DatadogTransport() });
```

## Auto-Redaction

Sensitive fields are automatically redacted:

```typescript
logger.info(
  {
    username: "john",
    password: "secret123", // → '[REDACTED]'
    apiKey: "key_123", // → '[REDACTED]'
  },
  "User login",
);
```

Default redacted paths: `password`, `token`, `apiKey`, `authorization`, `secret`.

Configure additional paths via `Logger.configure({ redact: [...] })`.

### Nested fields

Redaction uses [Pino's `redact` option](https://getpino.io/#/docs/redaction), which is powered by [fast-redact](https://github.com/davidmarkclements/fast-redact). Paths are **exact field paths** — they don't match nested occurrences by default:

```typescript
// Only redacts top-level `password`
Logger.configure({ redact: ["password"] });

logger.info({ password: "x" });          // → [REDACTED]
logger.info({ user: { password: "x" } }); // → NOT redacted
```

To redact nested fields, spell out the path or use wildcards:

```typescript
Logger.configure({
  redact: [
    "password",
    "user.password",
    "request.headers.authorization",
    "*.token", // any key named `token` one level deep
  ],
});
```

For HTTP headers specifically, prefer [`redactHeaders`](#http-header-redaction) — it normalizes the object and handles `Headers` instances in addition to plain objects.

## HTTP Header Redaction

Utility for redacting sensitive HTTP headers:

```typescript
import { redactHeaders } from "@eventuras/logger";

const safe = redactHeaders(request.headers);
logger.info({ headers: safe }, "Incoming request");
```

Redacts `authorization`, `cookie`, `set-cookie`, `x-api-key`, `x-auth-token`, and `proxy-authorization`.

## OpenTelemetry Integration

Send logs to any OTel-compatible backend (Sentry, Grafana, Jaeger, etc.) without vendor lock-in.

### Install OTel Packages

```bash
pnpm add @opentelemetry/api @opentelemetry/api-logs @opentelemetry/sdk-logs \
  @opentelemetry/instrumentation-pino @opentelemetry/exporter-logs-otlp-http
```

These are optional peer dependencies — the library works fine without them.

### Setup

```typescript
import { setupOpenTelemetryLogger } from "@eventuras/logger/opentelemetry";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { BatchLogRecordProcessor } from "@opentelemetry/sdk-logs";

setupOpenTelemetryLogger({
  serviceName: "my-app",
  logRecordProcessor: new BatchLogRecordProcessor(
    new OTLPLogExporter({
      url: process.env.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT,
    }),
  ),
});
```

### Shutdown

```typescript
import { shutdownOpenTelemetryLogger } from "@eventuras/logger/opentelemetry";

process.on("SIGTERM", async () => {
  await shutdownOpenTelemetryLogger();
  process.exit(0);
});
```

### OTel Environment Variables

```bash
OTEL_EXPORTER_OTLP_LOGS_ENDPOINT=https://...
OTEL_EXPORTER_OTLP_LOGS_HEADERS=x-api-key=YOUR_KEY
OTEL_SERVICE_NAME=my-app
```

## Examples

### API Route Handler

```typescript
import { Logger } from "@eventuras/logger";

export async function POST(req: Request) {
  const logger = Logger.create({
    namespace: "events-api",
    correlationId: req.headers.get("x-correlation-id") || crypto.randomUUID(),
  });

  try {
    const data = await req.json();
    logger.info("Creating event");

    const result = await createEvent(data);
    logger.info({ eventId: result.id }, "Event created");

    return Response.json(result);
  } catch (error) {
    logger.error({ error }, "Failed to create event");
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

### Server Action

```typescript
"use server";

import { Logger } from "@eventuras/logger";

const logger = Logger.create({ namespace: "web:admin:collections" });

export async function updateCollection(data: CollectionDto) {
  logger.info({ collectionId: data.id }, "Updating collection");

  try {
    const result = await api.put(data);
    logger.info({ collectionId: data.id }, "Collection updated");
    return { success: true, data: result };
  } catch (error) {
    logger.error({ error, collectionId: data.id }, "Failed to update");
    return { success: false, error: "Update failed" };
  }
}
```

## TypeScript

All types are exported:

```typescript
import type {
  LogTransport,
  LogLevel,
  LoggerOptions,
  LoggerConfig,
  ErrorLoggerOptions,
} from "@eventuras/logger";
```

## Subpath Exports

| Import path | Contents | Environment |
| --- | --- | --- |
| `@eventuras/logger` | `Logger`, types, `PinoTransport`, `ConsoleTransport`, `redactHeaders` | Universal |
| `@eventuras/logger/node` | `configureNodeLogger`, `createPrettyStream`, `formatLogLine` | Node.js |
| `@eventuras/logger/opentelemetry` | `setupOpenTelemetryLogger`, `shutdownOpenTelemetryLogger` | Node.js |

### Node-only Pretty-print Utilities

The pretty-print formatter and stream are available via a separate entry point to avoid pulling `node:stream` into browser bundles:

```typescript
import { createPrettyStream, formatLogLine } from "@eventuras/logger/node";
```

## License

Apache-2.0
