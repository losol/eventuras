# Vipps Scripts

Utility scripts for managing Vipps payments and webhooks.

## Prerequisites

Set up your environment variables in `.env` or `.env.local`:

```bash
VIPPS_CLIENT_ID=your-client-id
VIPPS_CLIENT_SECRET=your-client-secret
VIPPS_MERCHANT_SERIAL_NUMBER=your-msn
VIPPS_SUBSCRIPTION_KEY=your-subscription-key
VIPPS_IS_TEST=true  # or false for production
VIPPS_WEBHOOK_SECRET=your-webhook-secret  # Only needed for webhook verification
```

## Payment Scripts

### Get Payment Details

Fetch detailed information about a Vipps payment using the payment reference.

```bash
pnpm payment:get <payment-reference>
```

Example:

```bash
pnpm payment:get acme-shop-123-order-3456
```

**Output:**
- Payment state and status
- Authorized, captured, refunded, and cancelled amounts
- Customer profile information (if shared)
- Shipping details (if provided)
- Complete payment event history

**Use Cases:**
- Debug orphaned payments in production
- Verify payment status without accessing the database
- Check what customer information was shared via Vipps
- Review shipping details provided by customer
- Investigate payment issues reported by customers

## Webhook Management Scripts

### Setup Webhook

Register a new webhook with Vipps:

```bash
pnpm webhook:setup
```

You will be prompted for:

- Webhook URL (e.g., `https://your-domain.com/api/webhooks/vipps`)
- Events to subscribe to

**Important:** Save the webhook secret returned by this script as an environment variable:

```bash
VIPPS_WEBHOOK_SECRET=the-secret-from-vipps
```

### List Webhooks

List all registered webhooks for your MSN:

```bash
pnpm webhook:list
```

### Delete Webhook

Delete a webhook by ID:

```bash
pnpm webhook:delete <webhook-id>
```

Example:

```bash
pnpm webhook:delete 497f6eca-6276-4993-bfeb-53cbbbba6f08
```

## Available Events

- `epayments.payment.created.v1` - Payment request created
- `epayments.payment.aborted.v1` - Payment aborted by user
- `epayments.payment.expired.v1` - Payment expired
- `epayments.payment.captured.v1` - Payment captured (completed)
- `epayments.payment.cancelled.v1` - Payment cancelled
- `epayments.payment.refunded.v1` - Payment refunded
- `epayments.payment.authorized.v1` - Payment authorized
- `epayments.payment.terminated.v1` - Payment terminated

## Typical Setup Flow

1. **Register webhook** with `pnpm webhook:setup`
2. **Save the secret** as `VIPPS_WEBHOOK_SECRET` environment variable
3. **Implement webhook endpoint** in your application (e.g., `/api/webhooks/vipps`)
4. **Verify incoming webhooks** using `verifyWebhookSignature()` from `@eventuras/vipps/webhooks-v1`

## Security

⚠️ **Never commit webhook secrets to version control!**

- Store secrets in environment variables
- Use `.env.local` for local development (already in `.gitignore`)
- Use your hosting platform's environment variable management for production
