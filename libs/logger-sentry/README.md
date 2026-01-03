# @eventuras/logger-sentry

Sentry integration for `@eventuras/logger` using the official `@sentry/pino` package.

## Installation

This package is already included in the monorepo workspace. Apps that want Sentry integration should:

1. Install `@sentry/nextjs` (or appropriate Sentry SDK for their platform)
2. Add `@eventuras/logger-sentry` as a dependency

## Usage

### 1. Initialize Sentry

First, initialize Sentry in your application (e.g., in `instrumentation.ts` for Next.js):

```typescript
// instrumentation.ts
import * as Sentry from '@sentry/nextjs';

export function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 1.0,
      // ... other Sentry options
    });
  }
}
```

### 2. Initialize Logger-Sentry Integration

After Sentry is initialized, connect the logger:

```typescript
// instrumentation.ts (continued)
import { initializeSentryLogger } from '@eventuras/logger-sentry';

export function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    Sentry.init({ /* ... */ });
    
    // Connect logger to Sentry
    initializeSentryLogger({
      minLevel: 'error',        // Only send error and fatal logs to Sentry
      includeBreadcrumbs: true, // Include lower-level logs as breadcrumbs
      tags: { app: 'historia' } // Add custom tags to all events
    });
  }
}
```

### 3. Use Logger as Normal

Once configured, all error and fatal logs will automatically be sent to Sentry:

```typescript
import { Logger } from '@eventuras/logger';

const logger = Logger.create({
  namespace: 'PaymentService',
  context: { orderId: 123 }
});

// This will be logged AND sent to Sentry
logger.error({ error: err, paymentId: 'abc' }, 'Payment processing failed');

// This will only be logged (below minLevel)
logger.info('Payment initialized');
```

## Configuration Options

### `initializeSentryLogger(options)`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `minLevel` | `'error' \| 'fatal'` | `'error'` | Minimum log level to send to Sentry |
| `includeBreadcrumbs` | `boolean` | `true` | Include lower-level logs as breadcrumbs for context |
| `tags` | `Record<string, string>` | `undefined` | Additional tags to add to all Sentry events |

## Architecture

This library provides a clean separation of concerns:

- **`@eventuras/logger`**: Pure Pino-based logger with no external service dependencies
- **`@eventuras/logger-sentry`**: Sentry integration using official `@sentry/pino`
- **Your app** (e.g., `apps/historia`): Initializes Sentry and optionally enables logger integration

Apps without Sentry can use `@eventuras/logger` directly without any Sentry-related code or dependencies.

## Why a Separate Package?

1. **Separation of concerns**: Logger is pure, Sentry is an optional add-on
2. **No webpack warnings**: Sentry is only imported where explicitly needed
3. **Official integration**: Uses `@sentry/pino` instead of custom code
4. **Flexibility**: Apps can choose whether to enable Sentry integration
5. **Easier testing**: Logger can be tested without Sentry dependencies
