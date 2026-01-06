# @eventuras/shipper

Shipping and logistics integration library for Eventuras. Provides a clean, type-safe interface for working with shipping carrier APIs.

## Installation

```bash
pnpm add @eventuras/shipper
```

## Features

- **Bring Booking API v1** - Create shipments, fetch tracking, and download PDF labels
- **Type-safe** - Full TypeScript support with comprehensive types
- **Structured logging** - Uses `@eventuras/logger` for detailed logging
- **Error handling** - Descriptive errors with context for debugging

## Usage

### Bring API Integration

#### 1. Setup Configuration

```typescript
import { BRING_API_TEST, BRING_API_PROD, type BringConfig } from '@eventuras/shipper/bring-v1';

const config: BringConfig = {
  // Use BRING_API_TEST for testing, BRING_API_PROD for production
  apiUrl: BRING_API_TEST,
  clientId: process.env.BRING_CLIENT_ID!,
  clientSecret: process.env.BRING_CLIENT_SECRET!,
  customerId: process.env.BRING_CUSTOMER_ID!,
  clientUrl: 'https://eventuras.losol.io', // URL identifying where you're using the API
};
```

#### 2. Create a Shipment

```typescript
import {
  createBringClient,
  fetchAccessToken,
  toBringAddress,
  toBringPackage,
  type BringConsignment,
} from '@eventuras/shipper/bring-v1';
import type { Address, Package } from '@eventuras/shipper/core';

// Get access token (consumer should cache this)
const tokenResponse = await fetchAccessToken(config);

// Create client
const client = createBringClient(config);

// Define shipment details using common types
const sender: Address = {
  name: 'Eventuras AS',
  addressLine1: 'Storgata 1',
  postalCode: '0001',
  city: 'Oslo',
  countryCode: 'NO',
  email: 'sender@eventuras.com',
  phone: '+4712345678',
};

const recipient: Address = {
  name: 'Jane Doe',
  addressLine1: 'Parkveien 42',
  postalCode: '5003',
  city: 'Bergen',
  countryCode: 'NO',
  email: 'recipient@example.com',
  phone: '+4787654321',
};

const package: Package = {
  weightInGrams: 2500,
  lengthInCm: 30,
  widthInCm: 20,
  heightInCm: 10,
};

// Build Bring-specific consignment
const consignment: BringConsignment = {
  correlationId: 'order-12345',
  shippingDateTime: '2026-01-07', // ISO date
  parties: {
    sender: toBringAddress(sender),
    recipient: toBringAddress(recipient),
  },
  product: {
    id: 'SERVICEPAKKE', // Bring product code
    customerNumber: config.customerId,
  },
  packages: [toBringPackage(package, 'pkg-1')],
};

// Create the shipment
const response = await client.createShipment(
  consignment,
  tokenResponse.access_token
);

// Extract tracking number and label URL
const trackingNumber = response.consignments[0].confirmation.consignmentNumber;
const labelUrl = response.consignments[0].confirmation.links.labels;

console.log('Tracking number:', trackingNumber);
console.log('Label URL:', labelUrl);
```

#### 3. Fetch Label PDF

```typescript
if (labelUrl) {
  const pdfBuffer = await client.fetchLabel(labelUrl, tokenResponse.access_token);
  
  // Save to file or serve to user
  // Example: fs.writeFileSync('label.pdf', Buffer.from(pdfBuffer));
}
```

### Error Handling

```typescript
import { ShippingError, ShippingAuthError } from '@eventuras/shipper/core';

try {
  const response = await client.createShipment(consignment, accessToken);
} catch (error) {
  if (error instanceof ShippingAuthError) {
    // Handle authentication errors (401) - token may be expired
    console.error('Authentication failed:', error.message);
    // Fetch a new token and retry
  } else if (error instanceof ShippingError) {
    // Handle other shipping errors (validation, API errors, etc.)
    console.error('Shipping error:', error.message, error.code, error.details);
  } else {
    // Unexpected error
    console.error('Unexpected error:', error);
  }
}
```

### Token Management

The library does not cache access tokens. Consumers should implement token caching based on the `expires_in` value (typically 3600 seconds = 1 hour).

**Simple in-memory cache example:**

```typescript
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(config: BringConfig): Promise<string> {
  const now = Date.now();
  
  // Return cached token if still valid (with 5 min buffer)
  if (cachedToken && cachedToken.expiresAt > now + 5 * 60 * 1000) {
    return cachedToken.token;
  }
  
  // Fetch new token
  const response = await fetchAccessToken(config);
  
  cachedToken = {
    token: response.access_token,
    expiresAt: now + response.expires_in * 1000,
  };
  
  return cachedToken.token;
}
```

## API Reference

### Core Types

- `Address` - Common address structure
- `Package` - Package dimensions and weight
- `ShippingError` - Base error class
- `ShippingAuthError` - Authentication error (401)

### Bring API (bring-v1)

**Configuration:**
- `BringConfig` - Bring API configuration
- `BRING_API_TEST` - Test API URL constant
- `BRING_API_PROD` - Production API URL constant

**Authentication:**
- `fetchAccessToken(config)` - Fetch OAuth access token using client credentials

**Client:**
- `createBringClient(config)` - Create a Bring API client instance
- `client.createShipment(consignment, token)` - Create a new shipment
- `client.fetchLabel(labelUrl, token)` - Download PDF label

**Helpers:**
- `toBringAddress(address)` - Convert common Address to Bring format
- `toBringPackage(package, correlationId)` - Convert common Package to Bring format

**Types:**
- `BringConsignment` - Shipment data
- `BringShipmentResponse` - Shipment creation response
- Full type definitions available in source

## Development

```bash
# Build the library
pnpm build

# Watch mode for development
pnpm dev

# Run tests
pnpm test
```

## Resources

- [Bring Booking API Documentation](https://developer.bring.com/api/booking/)
- [Bring Developer Portal](https://developer.bring.com/)

## License

See LICENSE in the root of the Eventuras monorepo.
