# Logger & Debug Examples

## Logger Examples

### Basic Usage

```typescript
import { Logger } from '@eventuras/logger';

// Simple static logs
Logger.info('Server started');
Logger.warn('Memory usage high');
Logger.error({ error: new Error('DB Error') }, 'Database connection failed');
```

### Scoped Logger in React Component

```typescript
'use client';
import { Logger } from '@eventuras/logger';
import { useEffect } from 'react';

export function CollectionEditor({ collection }) {
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
}
```

### API Route with Correlation ID

```typescript
import { Logger } from '@eventuras/logger';

export async function POST(req: Request) {
  const logger = Logger.create({
    namespace: 'EventsAPI',
    correlationId: req.headers.get('x-correlation-id') || crypto.randomUUID(),
    context: { 
      endpoint: '/api/events',
      method: 'POST'
    },
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

### Service Layer with Context

```typescript
import { Logger } from '@eventuras/logger';

export class EventService {
  private logger = Logger.create({ 
    namespace: 'EventService',
    level: 'debug' // More verbose for this service
  });

  async createEvent(data: EventDto, userId: string) {
    const logger = Logger.create({
      namespace: 'EventService',
      context: { userId, action: 'createEvent' }
    });

    logger.debug({ eventData: data }, 'Creating event');

    try {
      const event = await this.repository.save(data);
      logger.info({ eventId: event.id }, 'Event created');
      return event;
    } catch (error) {
      logger.error({ error }, 'Failed to create event');
      throw error;
    }
  }
}
```

## Debug Examples

### Basic Debugging

```typescript
import { Debug } from '@eventuras/logger';

const debug = Debug.create('CollectionEditor');

function loadCollection(id: number) {
  debug('loadCollection called with id:', id);
  
  const collection = fetchFromCache(id);
  debug('Cache result:', collection ? 'HIT' : 'MISS');
  
  if (!collection) {
    debug('Fetching from API...');
    return fetchFromAPI(id);
  }
  
  debug('Returning cached collection');
  return collection;
}
```

### Tracing Execution Flow

```typescript
import { Debug } from '@eventuras/logger';

const debug = Debug.create('EventProcessor');

async function processEvent(event: Event) {
  debug('>> processEvent START', event.id);
  
  debug('Step 1: Validate event');
  await validateEvent(event);
  
  debug('Step 2: Transform data');
  const transformed = transformEvent(event);
  debug('Transformed:', transformed);
  
  debug('Step 3: Save to database');
  const result = await saveEvent(transformed);
  
  debug('<< processEvent END', result.id);
  return result;
}
```

### Quick One-off Debugging

```typescript
import { Debug } from '@eventuras/logger';

function complexCalculation(a: number, b: number) {
  Debug.log('Math', 'Input:', { a, b });
  
  const result = (a * b) + (a / b);
  
  Debug.log('Math', 'Output:', result);
  return result;
}
```

### Conditional Debugging

```typescript
import { Debug } from '@eventuras/logger';

const debug = Debug.create('PerformanceMonitor');

function heavyOperation() {
  const isDebugEnabled = Debug.isEnabled('PerformanceMonitor');
  
  if (isDebugEnabled) {
    const start = performance.now();
    
    // Do heavy operation
    processData();
    
    const duration = performance.now() - start;
    debug(`Operation took ${duration}ms`);
  } else {
    // Just do the operation without timing
    processData();
  }
}
```

## Combined Usage

### Development + Production Logging

```typescript
import { Logger, Debug } from '@eventuras/logger';

const logger = Logger.create({ 
  namespace: 'PaymentService',
  context: { service: 'payment' }
});
const debug = Debug.create('PaymentService');

export async function processPayment(payment: Payment) {
  // Debug for development tracing
  debug('processPayment called', { 
    amount: payment.amount, 
    currency: payment.currency 
  });

  // Logger for production tracking
  logger.info({ paymentId: payment.id }, 'Processing payment');

  try {
    debug('Validating payment data...');
    validatePayment(payment);
    
    debug('Calling payment gateway...');
    const result = await paymentGateway.process(payment);
    debug('Gateway response:', result);

    logger.info(
      { 
        paymentId: payment.id, 
        transactionId: result.transactionId,
        status: result.status 
      }, 
      'Payment processed successfully'
    );

    return result;
  } catch (error) {
    debug('Payment processing failed:', error);
    logger.error(
      { 
        error, 
        paymentId: payment.id,
        amount: payment.amount 
      }, 
      'Payment processing failed'
    );
    throw error;
  }
}
```

### Testing with Debug

```typescript
import { Debug } from '@eventuras/logger';

// In your test setup
beforeAll(() => {
  // Enable debug output for specific namespaces during tests
  Debug.enable('eventuras:PaymentService,eventuras:EventProcessor');
});

afterAll(() => {
  Debug.disable();
});

test('should process payment', async () => {
  const debug = Debug.create('Test:Payment');
  
  debug('Setting up test payment...');
  const payment = createTestPayment();
  
  debug('Processing payment...');
  const result = await processPayment(payment);
  
  debug('Verifying result...');
  expect(result.status).toBe('success');
});
```

## Configuration Examples

### App Initialization

```typescript
// app/layout.tsx or main.ts
import { Logger } from '@eventuras/logger';

// Configure logger at app startup
Logger.configure({
  prettyPrint: process.env.NODE_ENV === 'development',
  level: process.env.LOG_LEVEL || 'info',
  redact: [
    'password',
    'token',
    'apiKey',
    'authorization',
    'secret',
    'creditCard',
    'ssn',
  ],
  destination: process.env.LOG_FILE, // e.g., '/var/log/eventuras.log'
});
```

### Environment-specific Configuration

```typescript
import { Logger } from '@eventuras/logger';

const config = {
  development: {
    prettyPrint: true,
    level: 'debug' as const,
  },
  test: {
    prettyPrint: false,
    level: 'warn' as const,
  },
  production: {
    prettyPrint: false,
    level: 'info' as const,
    destination: '/var/log/eventuras/app.log',
  },
};

const env = process.env.NODE_ENV || 'development';
Logger.configure(config[env]);
```
