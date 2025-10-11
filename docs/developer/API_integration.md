# API Integration Guide

Learn how to integrate with the Eventuras API using the TypeScript SDK or direct HTTP requests.

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Using the TypeScript SDK](#using-the-typescript-sdk)
- [Direct API Access](#direct-api-access)
- [Common Use Cases](#common-use-cases)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Webhooks](#webhooks)
- [Best Practices](#best-practices)

## Overview

The Eventuras API is a RESTful API that provides access to:

- **Events** - Browse and manage events
- **Registrations** - User registrations for events
- **Products** - Event products and add-ons
- **Orders** - Order management
- **Users** - User management
- **Organizations** - Multi-tenant organization management

### API Base URL

**Development:** `http://localhost:5000/api/v3`
**Production:** `https://api.eventuras.yourdomain.com/api/v3`

### API Documentation

Interactive API documentation is available via Swagger:
- **Development:** `http://localhost:5000/swagger`
- **Production:** Not exposed (security)

## Authentication

The Eventuras API uses **OAuth 2.0 / OpenID Connect** via Auth0.

### Getting an Access Token

#### Using NextAuth (Next.js)

```typescript
import { getSession } from 'next-auth/react';

export async function getAccessToken() {
  const session = await getSession();
  return session?.accessToken;
}
```

#### Using Auth0 SDK (Client-side)

```typescript
import { useAuth0 } from '@auth0/auth0-react';

function MyComponent() {
  const { getAccessTokenSilently } = useAuth0();

  const callApi = async () => {
    const token = await getAccessTokenSilently({
      audience: 'https://api.eventuras.yourdomain.com',
    });

    const response = await fetch('https://api.eventuras.yourdomain.com/api/v3/events', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const events = await response.json();
    return events;
  };
}
```

#### Using Client Credentials (Server-to-Server)

```typescript
import axios from 'axios';

async function getAccessToken() {
  const response = await axios.post(
    'https://your-tenant.auth0.com/oauth/token',
    {
      client_id: process.env.AUTH0_CLIENT_ID,
      client_secret: process.env.AUTH0_CLIENT_SECRET,
      audience: 'https://api.eventuras.yourdomain.com',
      grant_type: 'client_credentials',
    }
  );

  return response.data.access_token;
}
```

### Making Authenticated Requests

```typescript
const token = await getAccessToken();

const response = await fetch('https://api.eventuras.yourdomain.com/api/v3/events', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});
```

## Using the TypeScript SDK

The recommended way to interact with the API is using the `@eventuras/sdk` package.

### Installation

```bash
npm install @eventuras/sdk
```

### Basic Setup

```typescript
import { EventurasApi } from '@eventuras/sdk';

const api = new EventurasApi({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  getAccessToken: async () => {
    // Your token retrieval logic
    const session = await getSession();
    return session?.accessToken;
  },
});
```

### Fetching Events

```typescript
// List all events
const events = await api.events.list({
  page: 1,
  limit: 20,
  organizationId: 1,
});

console.log(events.data); // Array of events
console.log(events.pagination); // Pagination info

// Get single event
const event = await api.events.get(123);

console.log(event.title);
console.log(event.description);
console.log(event.dateStart);

// Filter events
const upcomingEvents = await api.events.list({
  filter: {
    dateStart: { gte: new Date() },
    published: true,
  },
  orderBy: 'dateStart',
  order: 'asc',
});
```

### Creating Registrations

```typescript
// Create a new registration
const registration = await api.registrations.create({
  eventId: 123,
  userId: 'user-id',
  participantName: 'John Doe',
  participantEmail: 'john@example.com',
  products: [
    { productId: 1, quantity: 1 },
    { productId: 2, quantity: 2 },
  ],
});

console.log(registration.registrationId);
console.log(registration.status); // 'Draft'

// Update registration
await api.registrations.update(registration.registrationId, {
  status: 'Verified',
  notes: 'Confirmed payment received',
});

// Cancel registration
await api.registrations.cancel(registration.registrationId);
```

### Managing Products

```typescript
// Get event products
const products = await api.products.list({
  eventId: 123,
  published: true,
});

products.forEach(product => {
  console.log(`${product.name}: ${product.price} ${product.currency}`);
});

// Create product
const newProduct = await api.products.create({
  eventId: 123,
  name: 'Workshop: Advanced TypeScript',
  description: 'Learn advanced TypeScript patterns',
  price: 299.00,
  vatPercent: 25,
  published: true,
  isMandatory: false,
});
```

### Order Management

```typescript
// Get user orders
const orders = await api.orders.list({
  userId: 'user-id',
  status: 'Verified',
});

// Get order details
const order = await api.orders.get(orderId);

console.log(`Total: ${order.totalAmount} ${order.currency}`);
order.orderLines.forEach(line => {
  console.log(`${line.productName} x${line.quantity}: ${line.itemSubtotal}`);
});

// Create order
const newOrder = await api.orders.create({
  userId: 'user-id',
  registrationId: 123,
  items: [
    { productId: 1, quantity: 1 },
    { productId: 2, quantity: 2 },
  ],
});
```

### User Management

```typescript
// Get current user
const user = await api.users.me();

console.log(user.name);
console.log(user.email);

// Update user profile
await api.users.update(user.id, {
  name: 'John Smith',
  phoneNumber: '+1234567890',
});

// Get user registrations
const registrations = await api.users.registrations(user.id);
```

## Direct API Access

If you're not using TypeScript or prefer direct HTTP requests:

### Base Request Structure

```bash
curl -X GET \
  https://api.eventuras.yourdomain.com/api/v3/events \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
  -H 'Content-Type: application/json'
```

### Common Endpoints

#### Events

```bash
# List events
GET /api/v3/events?page=1&limit=20

# Get event
GET /api/v3/events/{id}

# Create event (Admin only)
POST /api/v3/events
{
  "title": "Conference 2024",
  "description": "Annual tech conference",
  "dateStart": "2024-06-01T09:00:00Z",
  "dateEnd": "2024-06-03T17:00:00Z",
  "organizationId": 1
}

# Update event (Admin only)
PUT /api/v3/events/{id}
{
  "title": "Updated Title",
  "maxParticipants": 500
}

# Delete event (Admin only)
DELETE /api/v3/events/{id}
```

#### Registrations

```bash
# List registrations
GET /api/v3/registrations?eventId=123

# Get registration
GET /api/v3/registrations/{id}

# Create registration
POST /api/v3/registrations
{
  "eventId": 123,
  "userId": "user-id",
  "participantName": "John Doe",
  "participantEmail": "john@example.com",
  "products": [
    { "productId": 1, "quantity": 1 }
  ]
}

# Update registration
PUT /api/v3/registrations/{id}
{
  "status": "Verified",
  "notes": "Payment confirmed"
}

# Cancel registration
DELETE /api/v3/registrations/{id}
```

#### Products

```bash
# List products
GET /api/v3/products?eventId=123

# Get product
GET /api/v3/products/{id}

# Create product
POST /api/v3/products
{
  "eventId": 123,
  "name": "Workshop",
  "price": 299.00,
  "vatPercent": 25,
  "published": true
}

# Update product
PUT /api/v3/products/{id}
{
  "price": 249.00
}

# Delete product
DELETE /api/v3/products/{id}
```

## Common Use Cases

### 1. Event Listing with Filtering

```typescript
import { EventurasApi } from '@eventuras/sdk';

async function getUpcomingEvents(organizationId: number) {
  const api = new EventurasApi(config);
  
  const events = await api.events.list({
    organizationId,
    filter: {
      dateStart: { gte: new Date() },
      published: true,
    },
    orderBy: 'dateStart',
    order: 'asc',
    limit: 50,
  });

  return events.data;
}
```

### 2. Complete Registration Flow

```typescript
async function registerForEvent(userId: string, eventId: number, productIds: number[]) {
  const api = new EventurasApi(config);

  // 1. Create registration
  const registration = await api.registrations.create({
    eventId,
    userId,
    products: productIds.map(id => ({ productId: id, quantity: 1 })),
  });

  // 2. Create order
  const order = await api.orders.create({
    userId,
    registrationId: registration.registrationId,
    items: productIds.map(id => ({ productId: id, quantity: 1 })),
  });

  // 3. Process payment (external service)
  const paymentResult = await processPayment(order.totalAmount);

  if (paymentResult.success) {
    // 4. Verify registration
    await api.registrations.update(registration.registrationId, {
      status: 'Verified',
    });

    // 5. Mark order as verified
    await api.orders.update(order.orderId, {
      status: 'Verified',
      paymentMethod: paymentResult.method,
    });
  }

  return registration;
}
```

### 3. Event Dashboard Data

```typescript
async function getEventDashboard(eventId: number) {
  const api = new EventurasApi(config);

  const [event, registrations, products] = await Promise.all([
    api.events.get(eventId),
    api.registrations.list({ eventId }),
    api.products.list({ eventId }),
  ]);

  return {
    event,
    stats: {
      totalRegistrations: registrations.data.length,
      verifiedRegistrations: registrations.data.filter(r => r.status === 'Verified').length,
      totalRevenue: calculateRevenue(registrations.data),
    },
    products: products.data,
  };
}
```

### 4. Bulk Operations

```typescript
async function bulkRegister(users: User[], eventId: number) {
  const api = new EventurasApi(config);
  
  const results = await Promise.allSettled(
    users.map(user =>
      api.registrations.create({
        eventId,
        userId: user.id,
        participantName: user.name,
        participantEmail: user.email,
      })
    )
  );

  const succeeded = results.filter(r => r.status === 'fulfilled');
  const failed = results.filter(r => r.status === 'rejected');

  return {
    succeeded: succeeded.length,
    failed: failed.length,
    errors: failed.map(r => r.reason),
  };
}
```

## Error Handling

### API Error Response Format

```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.4",
  "title": "Not Found",
  "status": 404,
  "detail": "Event with ID 999 not found",
  "traceId": "00-abc123..."
}
```

### Error Handling with SDK

```typescript
import { EventurasApiError } from '@eventuras/sdk';

try {
  const event = await api.events.get(999);
} catch (error) {
  if (error instanceof EventurasApiError) {
    console.error(`API Error: ${error.status} - ${error.message}`);
    console.error(`Details: ${error.detail}`);
    
    // Handle specific errors
    switch (error.status) {
      case 404:
        console.log('Event not found');
        break;
      case 401:
        console.log('Authentication required');
        break;
      case 403:
        console.log('Access denied');
        break;
      default:
        console.log('Unknown error');
    }
  } else {
    console.error('Network error:', error);
  }
}
```

### Retry Logic

```typescript
async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      // Only retry on network errors or 5xx status
      if (
        error instanceof EventurasApiError &&
        error.status >= 500
      ) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        continue;
      }
      
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}

// Usage
const events = await fetchWithRetry(() => api.events.list());
```

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Authenticated users:** 100 requests/minute
- **Anonymous users:** 20 requests/minute

### Rate Limit Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

### Handling Rate Limits

```typescript
async function apiCall() {
  try {
    return await api.events.list();
  } catch (error) {
    if (error instanceof EventurasApiError && error.status === 429) {
      const resetTime = error.headers['x-ratelimit-reset'];
      const waitTime = Number(resetTime) - Date.now() / 1000;
      
      console.log(`Rate limited. Retry after ${waitTime} seconds`);
      await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
      
      return apiCall(); // Retry
    }
    throw error;
  }
}
```

## Webhooks

Eventuras can send webhook events for important actions.

### Available Events

- `registration.created` - New registration created
- `registration.verified` - Registration verified
- `registration.cancelled` - Registration cancelled
- `order.created` - New order created
- `order.verified` - Order verified/paid

### Webhook Payload

```json
{
  "id": "evt_123",
  "type": "registration.created",
  "created": "2024-01-15T10:30:00Z",
  "data": {
    "registrationId": 123,
    "eventId": 456,
    "userId": "user-id",
    "status": "Draft"
  }
}
```

### Webhook Endpoint

```typescript
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  const signature = request.headers.get('X-Eventuras-Signature');
  const body = await request.text();

  // Verify signature
  const expectedSignature = crypto
    .createHmac('sha256', process.env.WEBHOOK_SECRET!)
    .update(body)
    .digest('hex');

  if (signature !== expectedSignature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = JSON.parse(body);

  // Handle event
  switch (event.type) {
    case 'registration.created':
      await handleRegistrationCreated(event.data);
      break;
    case 'order.verified':
      await handleOrderVerified(event.data);
      break;
  }

  return NextResponse.json({ received: true });
}
```

## Best Practices

### 1. Use the SDK

The TypeScript SDK provides type safety and handles auth automatically:

```typescript
// ✅ Good - Type-safe, auto-complete
const events = await api.events.list();

// ❌ Avoid - No type safety
const response = await fetch('/api/v3/events');
const events = await response.json();
```

### 2. Handle Errors Gracefully

```typescript
// ✅ Good - Proper error handling
try {
  const event = await api.events.get(id);
  return event;
} catch (error) {
  if (error instanceof EventurasApiError) {
    if (error.status === 404) {
      return null; // Event not found
    }
  }
  throw error; // Re-throw unexpected errors
}
```

### 3. Use Pagination

```typescript
// ✅ Good - Paginated
const events = await api.events.list({ page: 1, limit: 20 });

// ❌ Bad - Loads all data
const events = await api.events.list({ limit: 9999 });
```

### 4. Batch Requests

```typescript
// ✅ Good - Parallel requests
const [events, users, products] = await Promise.all([
  api.events.list(),
  api.users.list(),
  api.products.list(),
]);

// ❌ Bad - Sequential requests
const events = await api.events.list();
const users = await api.users.list();
const products = await api.products.list();
```

### 5. Cache Responses

```typescript
import { cacheExchange } from '@urql/exchange-graphcache';

// Simple cache
const cache = new Map();

async function getCachedEvents(ttl = 60000) {
  const cached = cache.get('events');
  
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data;
  }

  const events = await api.events.list();
  cache.set('events', { data: events, timestamp: Date.now() });
  
  return events;
}
```

## Further Reading

- [SDK Documentation](../../libs/sdk/README.md)
- [Authentication Guide](./Security_best_practices.md#authentication--authorization)
- [API Swagger Documentation](http://localhost:5000/swagger) (when running locally)
- [Error Handling](./Troubleshooting.md)
