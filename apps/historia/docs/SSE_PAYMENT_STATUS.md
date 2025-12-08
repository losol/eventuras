# Real-time Payment Status Updates with SSE

This implementation uses Server-Sent Events (SSE) to provide real-time payment status updates to users waiting for payment confirmation.

## Architecture

### Server-Side: SSE Endpoint

**File**: `apps/historia/src/app/api/payment/[reference]/events/route.ts`

The SSE endpoint:
- Polls the transaction status every 2 seconds
- Sends status updates to connected clients
- Closes connection when payment status changes from 'pending'
- Includes keepalive messages every 30 seconds
- Times out after 5 minutes

### Client-Side: React Component

**File**: `apps/historia/src/components/payment/PaymentStatusSSE.tsx`

The React component:
- Opens EventSource connection to SSE endpoint
- Listens for payment status updates
- Handles success/failure/timeout scenarios
- Shows toast notifications
- Redirects to success/failure pages

### Webhook Handler

**File**: `apps/historia/src/app/api/webhooks/vipps/route.ts`

The webhook handler:
- Receives payment events from Vipps
- Updates transaction status in database
- SSE endpoint detects the change via polling

## Usage Example

### Basic Usage (Waiting Page)

```tsx
'use client';

import { PaymentStatusSSE } from '@/components/payment/PaymentStatusSSE';

export function PaymentWaitingPage({ reference }: { reference: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1>Venter på betaling</h1>
      <PaymentStatusSSE
        reference={reference}
        successUrl="/order/success"
        failureUrl="/checkout"
      />
    </div>
  );
}
```

### Advanced Usage (Custom Callbacks)

```tsx
'use client';

import { useState } from 'react';
import { PaymentStatusSSE } from '@/components/payment/PaymentStatusSSE';

export function CustomPaymentPage({ reference }: { reference: string }) {
  const [currentStatus, setCurrentStatus] = useState('pending');

  const handleStatusChange = (status: string) => {
    setCurrentStatus(status);

    // Custom logic based on status
    if (status === 'captured') {
      console.log('Payment successful!');
      // Trigger analytics, clear cart, etc.
    }
  };

  return (
    <div>
      <h1>Betaling: {currentStatus}</h1>
      <PaymentStatusSSE
        reference={reference}
        onStatusChange={handleStatusChange}
        successUrl={`/order/success?ref=${reference}`}
      />
    </div>
  );
}
```

## Integration with Vipps Checkout Flow

### 1. User clicks "Betal med Vipps"

```tsx
// apps/historia/src/app/(frontend)/[locale]/checkout/page.client.tsx

const handleVippsCheckout = async () => {
  const result = await createVippsPayment({
    amount: totalInCents,
    currency: 'NOK',
    items,
    products,
  });

  if (result.success) {
    // Redirect to Vipps
    window.location.href = result.data.redirectUrl;
  }
};
```

### 2. After Vipps redirect, show waiting page

```tsx
// apps/historia/src/app/(frontend)/[locale]/payment/waiting/page.tsx

'use client';

import { useSearchParams } from 'next/navigation';
import { PaymentStatusSSE } from '@/components/payment/PaymentStatusSSE';

export default function PaymentWaitingPage() {
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference');

  if (!reference) {
    return <div>Invalid payment reference</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">
          Venter på bekreftelse fra Vipps
        </h1>
        <p className="text-gray-600 mb-8">
          Dette kan ta noen sekunder...
        </p>
        <PaymentStatusSSE
          reference={reference}
          successUrl="/order/success"
          failureUrl="/checkout"
        />
      </div>
    </div>
  );
}
```

### 3. Vipps webhook arrives

```
Vipps → POST /api/webhooks/vipps
       → Updates transaction status to 'captured'
       → SSE polls every 2 seconds, detects change
       → Sends update to client
       → Client redirects to success page
```

## Flow Diagram

```
┌──────────┐
│  User    │
│  clicks  │
│  Vipps   │
└────┬─────┘
     │
     ▼
┌──────────────────┐
│ createVipps      │
│ Payment()        │
│ Returns redirect │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│  User redirects  │
│  to Vipps app    │
└────┬─────────────┘
     │
     │ User confirms payment
     │
     ▼
┌──────────────────┐     ┌─────────────────┐
│  User returns    │────▶│ PaymentStatusSSE│
│  to waiting page │     │ component       │
└──────────────────┘     └────┬────────────┘
                              │
                              │ Opens SSE connection
                              ▼
                    ┌──────────────────────┐
                    │ /api/payment/        │
                    │ [reference]/events   │
                    │                      │
                    │ Polls every 2 sec    │
                    └────┬─────────────────┘
                         │
                         │ Meanwhile...
                         │
              ┌──────────▼──────────────┐
              │  Vipps sends webhook    │
              │  POST /api/webhooks/... │
              │                         │
              │  Updates Transaction    │
              │  status → 'captured'    │
              └──────────┬──────────────┘
                         │
                         │ SSE detects change
                         ▼
              ┌──────────────────────┐
              │ Client receives      │
              │ status update        │
              │                      │
              │ Shows toast          │
              │ Redirects to success │
              └──────────────────────┘
```

## Configuration

### Environment Variables

All Vipps configuration is handled automatically via `getVippsConfig()`:

```
VIPPS_API_URL=https://apitest.vipps.no
VIPPS_MERCHANT_SERIAL_NUMBER=...
VIPPS_CLIENT_ID=...
VIPPS_CLIENT_SECRET=...
VIPPS_SUBSCRIPTION_KEY=...
VIPPS_WEBHOOK_SECRET=...
```

### Timeouts

- **SSE polling interval**: 2 seconds (configurable in `route.ts`)
- **SSE keepalive**: 30 seconds
- **SSE connection timeout**: 5 minutes

### Error Handling

The SSE implementation handles:

- ✅ Network disconnections (automatic reconnect via EventSource)
- ✅ Server errors (closes connection, shows error toast)
- ✅ Timeouts (5 minute limit)
- ✅ Invalid payment references (404 handling)
- ✅ Transaction not found yet (waits for webhook)

## Testing

### Manual Testing

1. **Start Historia in development**:
   ```bash
   cd apps/historia
   pnpm dev
   ```

2. **Create a test payment**:
   - Go to checkout page
   - Click "Betal med Vipps"
   - Use Vipps test credentials

3. **Observe SSE connection**:
   - Open browser DevTools → Network tab
   - Filter for `events`
   - Watch SSE messages

4. **Trigger webhook manually** (optional):
   ```bash
   curl -X POST http://localhost:3100/api/webhooks/vipps \
     -H "Content-Type: application/json" \
     -H "X-Vipps-Idempotency-Key: test-123" \
     -d '{"name":"CAPTURED","reference":"your-reference"}'
   ```

### Automated Testing

```typescript
// Example Playwright test
test('payment status updates via SSE', async ({ page }) => {
  // Navigate to waiting page
  await page.goto('/payment/waiting?reference=TEST-REF');

  // Wait for SSE connection
  await page.waitForSelector('[data-testid="payment-status-sse"]');

  // Trigger webhook (via API or mock)
  await triggerWebhook('TEST-REF', 'CAPTURED');

  // Verify redirect to success page
  await expect(page).toHaveURL('/order/success');
});
```

## Benefits of SSE over Alternatives

| Method | Pros | Cons |
|--------|------|------|
| **SSE** (✅ Current) | Real-time, efficient, auto-reconnect, native browser support | Requires connection during wait |
| Polling | Simple, works everywhere | Inefficient, delayed updates, many requests |
| WebSockets | Bi-directional, real-time | More complex, requires special server config |
| Long Polling | Compatible | Complex, connection limits |
| Revalidation only | Simple | Requires user refresh, not real-time |

## Troubleshooting

### SSE connection not opening

Check browser DevTools → Network → events:
- Should see `text/event-stream` content type
- Status should be 200 (open)

### Status not updating

Check server logs:
```
# Should see polling messages every 2 seconds
DEBUG: Checking transaction status for reference=XXX

# When webhook arrives
INFO: Transaction status updated: captured
```

### Connection timeout

Default timeout is 5 minutes. If payment takes longer:
1. User can refresh the page
2. SSE will reconnect automatically
3. Status will be updated

## Future Enhancements

- [ ] Add exponential backoff for polling (start fast, slow down)
- [ ] Support for multiple concurrent payments per user
- [ ] Persistent connection with WebSocket upgrade
- [ ] Add payment progress states (authorized → captured → completed)
- [ ] Mobile app push notifications integration
