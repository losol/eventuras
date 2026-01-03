# Vipps Payment Recovery via SSE

## Problem: Race Condition Between Webhook and User Return

When a user completes payment in Vipps and returns to Historia, there's a race condition:

1. **Vipps webhook** arrives (milliseconds after payment)
2. **User redirect** arrives (when user clicks "Return to merchant")

### The Race Condition

```
Timeline A (Normal flow):
User returns → Create order → Webhook arrives → Update transaction

Timeline B (Race condition - "orphaned payment"):
Webhook arrives → No order exists! → User returns → ???
```

### Why Direct Webhook Recovery Fails

Webhook cannot create the order because:

- **No session access**: Webhook is server-to-server, has no user session cookie
- **Cart is session-only**: Cart is stored in encrypted session cookie (iron-session)
- **Cannot read cart**: `getCurrentSession()` returns `null` in webhook context

## Solution: SSE-Based Recovery

Instead of webhook trying to create the order, we use Server-Sent Events (SSE) to detect webhook arrival **from the client context**.

### How It Works

```
1. User returns from Vipps
   → Client connects to SSE endpoint
   → SSE starts polling for payment confirmation

2. Webhook arrives (potentially before SSE connects)
   → Webhook creates business-event in database
   → Webhook returns 200 OK

3. SSE polls and finds business-event
   → SSE sends "authorized" status to client
   → Client calls processPaymentAndCreateOrder (has session access!)
   → Order created successfully ✅
```

### Key Components

#### 1. Webhook Handler (`/api/webhooks/vipps/route.ts`)

**Role**: Store payment events, let SSE handle recovery

```typescript
// When payment is AUTHORIZED/CAPTURED but no transaction exists yet:
if (payload.name === 'AUTHORIZED' || payload.name === 'CAPTURED') {
  logger.warn(
    { reference, eventType: payload.name },
    'Payment authorized but no transaction exists yet. Business event stored for SSE detection.'
  );

  // Just store the business-event - SSE will handle recovery
  return;
}
```

**Why this works**: Webhook doesn't need session access, it just stores the event.

#### 2. SSE Endpoint (`/api/payment/[reference]/events/route.ts`)

**Role**: Poll for payment confirmation from client context

Polling strategies (in order):

1. **Check business-events** (webhook detection)
   ```typescript
   const events = await find({
     collection: 'business-events',
     where: {
       eventType: 'payment',
       externalReference: reference
     }
   });

   if (events found && event.name === 'AUTHORIZED') {
     send({ status: 'authorized', source: 'webhook' });
   }
   ```

2. **Check transactions** (normal flow)
   ```typescript
   const transactions = await find({
     where: { paymentReference: reference }
   });

   if (transaction found) {
     send({ status: transaction.status });
   }
   ```

3. **Poll Vipps API directly** (backup)
   ```typescript
   const payment = await getPaymentDetails(reference);

   if (payment.state === 'AUTHORIZED') {
     send({ status: 'authorized', source: 'vipps-api' });
   }
   ```

**Why this works**: SSE runs in user's request context → has session access.

#### 3. Client Component (`PaymentStatusSSE.tsx`)

**Role**: Connect to SSE and trigger order creation

```typescript
const handlePaymentStatusChange = async (status: string) => {
  if (status === 'authorized' || status === 'captured') {
    // Call server action - this has session access!
    const result = await processPaymentAndCreateOrder(reference);

    if (result.success) {
      clearCart();
      showSuccess();
    }
  }
};
```

**Why this works**: Server action runs with user's session → can read cart.

### Timing Breakdown

#### Scenario 1: Normal Flow (User Returns First)
```
T+0ms:  User returns from Vipps
T+100ms: SSE connects
T+200ms: SSE checks business-events (none found)
T+500ms: Webhook arrives → creates business-event
T+2000ms: SSE polls again → finds business-event
T+2100ms: Client receives "authorized" → creates order
```

#### Scenario 2: Webhook Arrives First (Race Condition)
```
T+0ms:  Webhook arrives → creates business-event
T+2000ms: User returns from Vipps
T+2100ms: SSE connects
T+2200ms: SSE checks business-events → finds event immediately!
T+2300ms: Client receives "authorized" → creates order
```

## Benefits of SSE-Based Recovery

✅ **Session Access**: SSE runs in user context → can read cart
✅ **No Database Changes**: Uses existing business-events collection
✅ **Works for Both Race Conditions**: Handles webhook-first AND user-first
✅ **Automatic**: User doesn't see any errors, order is created seamlessly
✅ **Fast**: Recovery typically happens within 2-3 seconds

## Monitoring & Debugging

### Expected Log Patterns

**Webhook-first scenario (orphaned payment detected):**
```
[webhook] Payment authorized but no transaction exists yet. Business event stored.
[sse] Found AUTHORIZED payment event from webhook, sending status update
[client] Payment status changed via SSE: authorized
[client] Order created successfully
```

**Normal scenario (user returns first):**
```
[sse] Transaction not found yet, checking payment status
[sse] Payment not yet confirmed by Vipps
[webhook] Transaction found, updating status
[sse] Payment status changed, sending update
[client] Payment status changed via SSE: captured
```

### Key Metrics to Monitor

- **Business-events with no transaction**: Should be temporary (resolved within 10s)
- **SSE connection duration**: Should close within 30s on successful payment
- **Order creation errors**: Should be rare (indicates cart/product issues)

## Edge Cases Handled

1. **User closes browser before return**:
   - Business-event stored
   - When user reopens checkout page, SSE reconnects and finds event
   - Order created on reconnection

2. **Multiple webhook deliveries** (Vipps retries):
   - First webhook creates business-event with unique eventId
   - Subsequent webhooks are deduplicated (same eventId)
   - No duplicate orders created

3. **SSE connection timeout**:
   - If payment not confirmed within 5 minutes → timeout message
   - User can refresh page to retry
   - Business-event still stored, will be found on retry

4. **Cart expiration**:
   - Session cart expires after 24 hours
   - If user returns after 24h → cart empty error
   - Graceful error message, suggest contacting support

## Testing the Recovery Flow

### Manual Test (Webhook-First Scenario)

1. **Trigger webhook manually** (before completing payment):
   ```bash
   curl -X POST https://your-app.azurewebsites.net/api/webhooks/vipps \
     -H "Authorization: Bearer WEBHOOK_SECRET" \
     -H "Content-Type: application/json" \
     -d '{
       "msn": "123456",
       "reference": "test-ref-123",
       "pspReference": "psp-ref-123",
       "name": "AUTHORIZED",
       "amount": { "value": 10000, "currency": "NOK" }
     }'
   ```

2. **Check business-events collection**:
   ```
   Should see event with:
   - eventType: "payment"
   - externalReference: "test-ref-123"
   - data.name: "AUTHORIZED"
   ```

3. **Navigate to checkout page**:
   ```
   https://your-app.azurewebsites.net/no/checkout/vipps?reference=test-ref-123
   ```

4. **Observe SSE logs**:
   ```
   [sse] Found AUTHORIZED payment event from webhook
   [client] Creating order from cart...
   [client] Order created successfully
   ```

## Migration Notes

**Before this change:**
- Webhook attempted to create order directly
- Recovery failed due to session access
- Orphaned payment notifications sent to sales team

**After this change:**
- Webhook only stores business-event
- SSE detects event and triggers order creation
- No manual intervention needed
- No orphaned payment notifications for race conditions

## Performance Considerations

- **SSE polling interval**: 2s → 5s → 10s (exponential backoff)
- **Database queries per minute**: Max 6 queries (1 every 10s at max backoff)
- **Connection count**: One SSE connection per waiting customer
- **Memory usage**: Minimal (streaming response, no buffering)

## Security

- **Session validation**: Only user who created cart can access SSE endpoint
- **HMAC verification**: Webhook signature validated before processing
- **Reference correlation**: Payment reference must match cart reference
- **Amount verification**: Payment amount must match cart total
