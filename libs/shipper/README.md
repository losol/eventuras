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
import { BringClient, type BringConfig } from '@eventuras/shipper/bring-v1';

const config: BringConfig = {
  environment: 'test', // 'test' or 'production' - automatically sets correct API URL and test indicator
  apiUid: process.env.BRING_API_UID!, // Your Mybring email address
  apiKey: process.env.BRING_API_KEY!, // API key from Mybring account settings
  customerId: process.env.BRING_CUSTOMER_ID!,
  clientUrl: 'https://eventuras.example.com', // URL identifying where you're using the API
};

// Create client
const client = new BringClient(config);
```

**Environment behavior:**
- `environment: 'test'` - Sets `testIndicator: true` in requests (creates test shipments)
- `environment: 'production'` - Sets `testIndicator: false` in requests (creates real shipments)

**Note:** Both environments use the same API URL (`https://api.bring.com`). Test vs production is controlled by the `testIndicator` field in the request body.

#### 2. Create a Shipment

```typescript
import { BringClient, type BringConsignment } from '@eventuras/shipper/bring-v1';
import type { Address, Package } from '@eventuras/shipper/core';

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
  weightInGrams: 500,
  lengthInCm: 30,
  widthInCm: 20,
  heightInCm: 10,
};

// Build Bring-specific consignment
const consignment: BringConsignment = {
  correlationId: 'order-12345',
  shippingDateTime: '2026-01-07', // ISO date
  parties: {
    sender: {
      name: sender.name,
      addressLine: sender.addressLine1,
      postalCode: sender.postalCode,
      city: sender.city,
      countryCode: sender.countryCode,
      contact: {
        email: sender.email,
        phoneNumber: sender.phone,
      },
    },
    recipient: {
      name: recipient.name,
      addressLine: recipient.addressLine1,
      postalCode: recipient.postalCode,
      city: recipient.city,
      countryCode: recipient.countryCode,
      contact: {
        email: recipient.email,
        phoneNumber: recipient.phone,
      },
    },
  },
  product: {
    id: 'SERVICEPAKKE', // Bring product code
    customerNumber: config.customerId,
  },
  packages: [{
    correlationId: 'pkg-1',
    weightInGrams: package.weightInGrams,
    dimensions: {
      lengthInCm: package.lengthInCm,
      widthInCm: package.widthInCm,
      heightInCm: package.heightInCm,
    },
  }],
};

// Create the shipment
const response = await client.createShipment(consignment);

// Extract package number and label URL
const packageNumber = response.consignments[0]!.confirmation.packages![0]!.packageNumber;
const labelUrl = response.consignments[0]!.confirmation.links.labels;

console.log('Package number:', packageNumber);
console.log('Label URL:', labelUrl);
```

#### 3. Fetch Label PDF

```typescript
if (labelUrl) {
  const pdfBuffer = await client.fetchLabel(labelUrl);
  
  // Save to file or serve to user
  // Example: fs.writeFileSync('label.pdf', Buffer.from(pdfBuffer));
}
```

### Error Handling

```typescript
import { ShippingError, ShippingAuthError } from '@eventuras/shipper/core';

try {
  const response = await client.createShipment(consignment);
} catch (error) {
  if (error instanceof ShippingAuthError) {
    // Handle authentication errors (401) - invalid API key or UID
    console.error('Authentication failed:', error.message);
  } else if (error instanceof ShippingError) {
    // Handle other shipping errors (validation, API errors, etc.)
    console.error('Shipping error:', error.message, error.code, error.details);
  } else {
    // Unexpected error
    console.error('Unexpected error:', error);
  }
}
```

### Environment Variables

The library can load configuration from environment variables:

```bash
# Required
BRING_API_UID=your-mybring-email@example.com
BRING_API_KEY=your-api-key-from-mybring
BRING_CUSTOMER_ID=your-customer-number

# Optional
BRING_ENVIRONMENT=test                       # 'test' or 'production' (default: 'test')
BRING_CLIENT_URL=https://your-app.example.com  # Your application URL
```

**Using environment config:**

```typescript
import { getShipperConfig, BringClient } from '@eventuras/shipper/bring-v1';

const config = getShipperConfig(); // Reads from process.env
const client = new BringClient(config);
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

## Configuration for Testing and CLI

For testing and CLI usage, set up environment variables in the monorepo root `.env`:

```bash
# Bring API credentials (get from https://developer.bring.com/)
BRING_API_UID=your-mybring-email@example.com
BRING_API_KEY=your_api_key
BRING_CUSTOMER_ID=your_customer_number

# Optional: Environment (defaults to 'test')
# 'test' creates test shipments, 'production' creates real shipments
BRING_ENVIRONMENT=test

# Optional: Client URL for API identification
BRING_CLIENT_URL=https://your-app.example.com
```

## Testing

### Integration Tests

Integration tests require valid Bring test credentials:

```bash
# Run all tests (will skip integration tests if no credentials)
pnpm test

# Run only integration tests
pnpm test -- bring-client.test.ts
```

Tests automatically skip if credentials are missing.

### Unit Tests

Unit tests use mocks and don't require credentials:

```bash
pnpm test -- *.unit.test.ts
```

## Development

```bash
# Build the library
pnpm build

# Watch mode for development
pnpm dev

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch
```

## Resources

- [Bring Booking API Documentation](https://developer.bring.com/api/booking/)
- [Bring Developer Portal](https://developer.bring.com/)

## License

See LICENSE in the root of the Eventuras monorepo.
