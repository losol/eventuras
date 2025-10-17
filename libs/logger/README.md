# @eventuras/logger

A flexible logging wrapper for Eventuras that uses Pino for production and debug for development.

## Features

- 🎯 **Scoped loggers** - Create logger instances with persistent context
- 🎨 **Pretty printing** - Beautiful logs in development mode
- 🔒 **Auto-redaction** - Protect sensitive data in logs
- 📊 **Log levels** - Control verbosity per logger or globally
- 🔍 **Correlation IDs** - Track requests across services
- 🌐 **Context fields** - Add persistent metadata to all logs

## Installation

```bash
pnpm add @eventuras/logger
```

## Basic Usage

### Static Methods (One-off logs)

```typescript
import { Logger } from '@eventuras/logger';

// Simple logs
Logger.info('Server started');
Logger.warn('Memory usage high');
Logger.error({ error: new Error('Failed') }, 'Database connection failed');
```

### Scoped Logger (Recommended for components/modules)

```typescript
import { Logger } from '@eventuras/logger';

const logger = Logger.create({ namespace: 'CollectionEditor' });

logger.info('Updating collection...');
logger.info('Collection saved successfully');
logger.error({ error: err }, 'Failed to save collection');
```

## Advanced Usage

### Context Fields

Add persistent fields to all logs from a logger instance:

```typescript
const logger = Logger.create({
  namespace: 'API',
  context: {
    userId: user.id,
    collectionId: collection.id,
  },
});

logger.info('Event added', { eventId: 123 });
// Logs: { namespace: 'API', userId: 42, collectionId: 99, eventId: 123, msg: 'Event added' }
```

### Correlation IDs (Request Tracking)

Track requests across your microservices:

```typescript
const logger = Logger.create({
  namespace: 'EventsController',
  correlationId: req.headers['x-correlation-id'],
  context: { userId: req.user.id },
});

logger.info('Processing request');
// Logs include correlationId for easy trace lookup
```

### Log Levels

Control verbosity per logger instance:

```typescript
const logger = Logger.create({
  namespace: 'DebugComponent',
  level: 'debug', // Only log debug and above (debug, info, warn, error, fatal)
});

logger.trace('Very detailed'); // Won't log (below debug level)
logger.debug('Debugging info'); // Will log
logger.info('Important event'); // Will log
```

## Global Configuration

Configure the logger once at application startup:

```typescript
import { Logger } from '@eventuras/logger';

// In your app initialization (e.g., app.ts or layout.tsx)
Logger.configure({
  prettyPrint: process.env.NODE_ENV === 'development',
  level: process.env.LOG_LEVEL || 'info',
  redact: ['password', 'token', 'apiKey', 'authorization', 'secret'],
  destination: process.env.LOG_FILE, // Optional file output
});
```

## Environment Variables

### Development (Browser)

Enable namespace filtering in the browser console:

```javascript
localStorage.debug = 'eventuras:*'; // All logs
localStorage.debug = 'eventuras:auth*'; // Only auth logs
localStorage.debug = 'eventuras:CollectionEditor'; // Specific namespace
```

### Server (Node.js)

```bash
# Enable all Eventuras logs
DEBUG=eventuras:*

# Enable specific namespaces
DEBUG=eventuras:auth*,eventuras:api*

# Set global log level
LOG_LEVEL=debug

# Write logs to file
LOG_FILE=/var/log/eventuras.log
```

## Log Levels

From most to least verbose:

- `trace` (10) - Most detailed, for fine-grained debugging
- `debug` (20) - Debugging information
- `info` (30) - General informational messages (default)
- `warn` (40) - Warning messages
- `error` (50) - Error messages
- `fatal` (60) - Critical errors that may cause shutdown

## Security: Auto-Redaction

Sensitive fields are automatically redacted in production:

```typescript
logger.info({
  username: 'john',
  password: 'secret123', // Will be logged as '[REDACTED]'
  apiKey: 'key_123', // Will be logged as '[REDACTED]'
});
```

Default redacted paths:
- `password`
- `token`
- `apiKey`
- `authorization`
- `secret`

Add custom redaction patterns via `Logger.configure()`.

## Examples

### React Component

```typescript
'use client';
import { Logger } from '@eventuras/logger';
import { useEffect } from 'react';

const CollectionEditor = ({ collection }) => {
  const logger = Logger.create({
    namespace: 'CollectionEditor',
    context: { collectionId: collection.id },
  });

  useEffect(() => {
    logger.info('Component mounted');
    return () => logger.info('Component unmounted');
  }, []);

  const handleSave = async () => {
    try {
      logger.info('Saving collection...');
      await saveCollection(collection);
      logger.info('Collection saved successfully');
    } catch (error) {
      logger.error({ error }, 'Failed to save collection');
    }
  };

  return <button onClick={handleSave}>Save</button>;
};
```

### API Route Handler

```typescript
import { Logger } from '@eventuras/logger';

export async function POST(req: Request) {
  const logger = Logger.create({
    namespace: 'EventsAPI',
    correlationId: req.headers.get('x-correlation-id') || crypto.randomUUID(),
    context: { endpoint: '/api/events' },
  });

  try {
    logger.info('Received event creation request');
    const data = await req.json();
    logger.debug({ eventData: data }, 'Parsed request body');

    const result = await createEvent(data);
    logger.info({ eventId: result.id }, 'Event created successfully');

    return Response.json(result);
  } catch (error) {
    logger.error({ error }, 'Failed to create event');
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

## Migration from Old API

**Before:**
```typescript
Logger.info({ namespace: 'CollectionEditor' }, 'Removing event');
Logger.error({ namespace: 'CollectionEditor' }, 'Failed');
```

**After:**
```typescript
const logger = Logger.create({ namespace: 'CollectionEditor' });
logger.info('Removing event');
logger.error('Failed');
```

## TypeScript

All types are exported:

```typescript
import type { LoggerOptions, LogLevel, LoggerConfig } from '@eventuras/logger';
```
