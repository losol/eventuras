# @eventuras/vipps

Vipps MobilePay integration library for Eventuras.

## Structure

- **`epayment-v1/`** - Vipps MobilePay ePayment API v1 client
- **`vipps-core/`** - Common utilities and helpers for Vipps integration

## Usage

### ePayment API v1

```typescript
import {
  createPayment,
  getPaymentDetails,
  capturePayment,
  cancelPayment,
  refundPayment,
  type CreatePaymentRequest,
  type PaymentDetails,
} from '@eventuras/vipps/epayment-v1';

// Configuration is passed via VippsConfig
const config = {
  apiUrl: 'https://apitest.vipps.no',
  merchantSerialNumber: 'YOUR_MSN',
  clientId: 'YOUR_CLIENT_ID',
  clientSecret: 'YOUR_CLIENT_SECRET',
  subscriptionKey: 'YOUR_SUBSCRIPTION_KEY',
  systemName: 'your-system',
  systemVersion: '1.0.0',
  pluginName: 'your-plugin',
  pluginVersion: '1.0.0',
};

// Create a payment
const payment = await createPayment(config, {
  amount: { value: 10000, currency: 'NOK' },
  paymentMethod: { type: 'WALLET' },
  reference: 'ORDER-123',
  returnUrl: 'https://example.com/return',
  userFlow: 'WEB_REDIRECT',
  paymentDescription: 'Order #123',
});

// Get payment details
const details = await getPaymentDetails(config, 'ORDER-123');

// Capture payment
await capturePayment(config, 'ORDER-123', {
  modificationAmount: { value: 10000, currency: 'NOK' },
});
```

### Core Utilities

```typescript
import {
  getAccessToken,
  buildHeaders,
  type VippsConfig,
} from '@eventuras/vipps/vipps-core';

const config = { /* ... */ };

// Get access token
const token = await getAccessToken(config);

// Build headers for API requests
const headers = buildHeaders(config, token, 'optional-idempotency-key');
```

## Configuration

All functions accept a `VippsConfig` object:

```typescript
interface VippsConfig {
  apiUrl: string; // e.g., 'https://apitest.vipps.no' or 'https://api.vipps.no'
  merchantSerialNumber: string;
  clientId: string;
  clientSecret: string;
  subscriptionKey: string;
  systemName: string;
  systemVersion: string;
  pluginName: string;
  pluginVersion: string;
}
```

## API Reference

See the [Vipps MobilePay ePayment API documentation](https://developer.vippsmobilepay.com/docs/APIs/epayment-api/) for more information.
