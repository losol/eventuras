# @eventuras/logger

A flexible logging solution for Eventuras with two separate utilities:

- **Logger** - Production-ready structured logging with Pino
- **Debug** - Development debugging with debug-js

## Features

### Logger (Production)
- 🎯 **Scoped loggers** - Create logger instances with persistent context
- 🎨 **Pretty printing** - Beautiful logs in development mode
- 🔒 **Auto-redaction** - Protect sensitive data in logs
- 📊 **Log levels** - Control verbosity per logger or globally
- 🔍 **Correlation IDs** - Track requests across services
- 🌐 **Context fields** - Add persistent metadata to all logs

### Debug (Development)
- 🐛 **Namespace filtering** - Enable/disable debug output by namespace
- 🎯 **Browser support** - Works in browser with localStorage
- 📦 **Lightweight** - Only debug-js, no production overhead
- 🔧 **Development-only** - Separate from production logging

## Installation

```bash
pnpm add @eventuras/logger
```

## Logger (Production Logging)

Use `Logger` for all production logging with structured data, context, and levels.

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

## TypeScript

All types are exported:

```typescript
import type { LoggerOptions, LogLevel, LoggerConfig } from '@eventuras/logger';
```

---

## Debug (Development Debugging)

Use `Debug` for development-only debugging with namespace filtering. This is completely separate from Logger and uses debug-js.

### Basic Usage

```typescript
import { Debug } from '@eventuras/logger';

// Create a debug instance for a namespace
const debug = Debug.create('CollectionEditor');

debug('Loading collection...');
debug('Collection loaded:', collection);
debug('User action:', { action: 'save', userId: 123 });
```

### Quick Debug Calls

```typescript
import { Debug } from '@eventuras/logger';

// One-off debug without creating an instance
Debug.log('API', 'Request received:', req);
Debug.log('EventHandler', 'Processing event:', event);
```

### Enabling Debug Output

#### In Node.js (Server)

```bash
# Enable all Eventuras debug output
DEBUG=eventuras:* node app.js

# Enable specific namespaces
DEBUG=eventuras:auth*,eventuras:api* node app.js

# Enable specific namespace only
DEBUG=eventuras:CollectionEditor node app.js
```

#### In Browser

```javascript
// In browser console
localStorage.debug = 'eventuras:*'; // All namespaces
localStorage.debug = 'eventuras:auth*'; // Auth namespaces only
localStorage.debug = 'eventuras:CollectionEditor'; // Specific namespace

// Then refresh the page
```

### Programmatic Control

```typescript
import { Debug } from '@eventuras/logger';

// Enable debug output
Debug.enable('eventuras:*');

// Disable debug output
Debug.disable();

// Check if a namespace is enabled
if (Debug.isEnabled('CollectionEditor')) {
  console.log('CollectionEditor debugging is active');
}
```

### When to Use Debug vs Logger

**Use Debug when:**
- 🐛 Debugging during development
- 🔍 Need to trace code execution flow
- 💡 Want to toggle output with DEBUG env var
- 🚫 Don't need logs in production

**Use Logger when:**
- 📊 Production logging
- 📝 Need structured data
- 🔒 Need security (redaction)
- 📈 Monitoring and analytics
- 🔍 Correlation IDs and context

### Example: Using Both Together

```typescript
import { Logger, Debug } from '@eventuras/logger';

const logger = Logger.create({ 
  namespace: 'CollectionEditor',
  context: { collectionId: 123 }
});
const debug = Debug.create('CollectionEditor');

async function saveCollection(data: CollectionDto) {
  // Use Debug for development tracing
  debug('saveCollection called with:', data);
  
  try {
    // Use Logger for production-worthy logs
    logger.info('Saving collection');
    
    debug('Validating data...');
    validateData(data);
    
    debug('Calling API...');
    const result = await api.save(data);
    
    logger.info({ collectionId: result.id }, 'Collection saved successfully');
    return result;
  } catch (error) {
    debug('Error occurred:', error);
    logger.error({ error }, 'Failed to save collection');
    throw error;
  }
}
```

In development with `DEBUG=eventuras:*`, you'll see both debug traces and logger output.  
In production, only Logger output is captured (Debug is silent unless explicitly enabled).

---

## Migration from Old API

**Before:**

```typescript
Logger.info({ namespace: 'CollectionEditor' }, 'Removing event');
Logger.error({ namespace: 'CollectionEditor' }, 'Failed');
```

**After:**

## TypeScript

All types are exported:

```typescript
import type { LoggerOptions, LogLevel, LoggerConfig } from '@eventuras/logger';
```
