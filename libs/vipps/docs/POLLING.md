# Polling Support

Vipps recommends using both webhooks and polling to handle payment status updates.

## Polling Guidelines

From Vipps documentation:

- **Start after 5 seconds** (initialDelay)
- **Poll every 2 seconds** (pollInterval)
- **Use webhooks as primary mechanism**, polling as backup

## API Functions

### `getPaymentEvents()`

Fetch complete event log for a payment (authoritative history):

```typescript
import { getPaymentEvents } from '@eventuras/vipps/epayment-v1';

const events = await getPaymentEvents(config, reference);

console.log('Payment history:');
events.forEach((event) => {
  console.log(`${event.timestamp}: ${event.name} - ${event.success ? 'SUCCESS' : 'FAILED'}`);
});

// Output:
// 2023-03-27T10:51:44Z: CREATED - SUCCESS
// 2023-03-27T10:51:59Z: AUTHORIZED - SUCCESS
// 2023-03-27T10:52:07Z: CAPTURED - SUCCESS
```

### `pollPaymentStatus()`

Poll until payment reaches desired state:

```typescript
import { pollPaymentStatus } from '@eventuras/vipps/epayment-v1';

// Poll until AUTHORIZED or TERMINATED
const result = await pollPaymentStatus(
  config,
  reference,
  ['AUTHORIZED', 'TERMINATED'],
  {
    onPoll: (attempt, payment) => {
      console.log(`Attempt ${attempt}: ${payment.state}`);
    },
  }
);

if (result.success && result.payment.state === 'AUTHORIZED') {
  console.log(`Payment authorized after ${result.attempts} attempts (${result.elapsed}ms)`);
  // Proceed to capture...
}
```

### `pollUntilAuthorized()`

Convenience function to wait for authorization:

```typescript
import { pollUntilAuthorized } from '@eventuras/vipps/epayment-v1';

try {
  const result = await pollUntilAuthorized(config, reference);

  if (result.success) {
    console.log('Payment authorized!');
    // Capture payment...
  } else {
    console.log('Payment not authorized:', result.payment.state);
  }
} catch (error) {
  console.error('Polling timeout or error:', error);
}
```

### `pollUntilTerminal()`

Poll until payment reaches terminal state (AUTHORIZED, TERMINATED, ABORTED, EXPIRED):

```typescript
import { pollUntilTerminal } from '@eventuras/vipps/epayment-v1';

const result = await pollUntilTerminal(config, reference);

console.log('Final state:', result.payment.state);
console.log('Took:', result.attempts, 'attempts');
```

## Polling Options

```typescript
interface PollingOptions {
  /** Initial delay before starting polling (default: 5000ms) */
  initialDelay?: number;

  /** Interval between poll attempts (default: 2000ms) */
  pollInterval?: number;

  /** Maximum number of poll attempts (default: 60) */
  maxAttempts?: number;

  /** Timeout for the entire polling operation (default: 120000ms / 2 minutes) */
  timeout?: number;

  /** Callback invoked after each poll attempt */
  onPoll?: (attempt: number, payment: PaymentDetails) => void;
}
```

## Complete Example

```typescript
import {
  createPayment,
  pollUntilAuthorized,
  capturePayment,
  getPaymentEvents,
} from '@eventuras/vipps/epayment-v1';

// 1. Create payment
const payment = await createPayment(config, {
  amount: { value: 10000, currency: 'NOK' },
  paymentMethod: { type: 'WALLET' },
  reference: 'order-123',
  returnUrl: 'https://example.com/checkout/callback',
  userFlow: 'WEB_REDIRECT',
});

console.log('Payment created:', payment.reference);
console.log('Redirect user to:', payment.redirectUrl);

// 2. Poll until authorized (after user completes payment in Vipps)
console.log('Waiting for authorization...');

const result = await pollUntilAuthorized(config, payment.reference, {
  onPoll: (attempt) => {
    console.log(`Polling attempt ${attempt}...`);
  },
});

if (!result.success) {
  console.error('Payment not authorized:', result.payment.state);
  return;
}

console.log(`✅ Payment authorized after ${result.elapsed}ms`);

// 3. Capture the payment
await capturePayment(config, payment.reference, {
  modificationAmount: { value: 10000, currency: 'NOK' },
});

console.log('Payment captured!');

// 4. Get complete event log
const events = await getPaymentEvents(config, payment.reference);

console.log('Complete payment history:');
events.forEach((event) => {
  console.log(`  ${event.name}: ${event.amount?.value} ${event.amount?.currency}`);
});
```

## Best Practices

1. **Webhooks First**: Use webhooks as primary notification mechanism
2. **Polling as Backup**: Implement polling for cases where webhooks are delayed
3. **Reasonable Timeouts**: Don't poll indefinitely - use appropriate timeout values
4. **Error Handling**: Handle both timeout and terminal state scenarios
5. **Event Log**: Use `getPaymentEvents()` for debugging and audit trails

## Rate Limiting

Vipps has rate limiting on their APIs. If you receive `HTTP 429 Too Many Requests`:

- Respect the retry-after header
- Reduce polling frequency
- Consider increasing poll interval

See: [ePayment API Rate Limiting](https://developer.vippsmobilepay.com/docs/APIs/epayment-api/api-guide/errors/#rate-limiting)
