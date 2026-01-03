# Historia Scripts

Utility scripts for Historia CMS development and operations.

## Vipps Payment Tools

### Get Payment Details

Fetch detailed information about a Vipps payment using the payment reference.

**Usage:**
```bash
pnpm vipps:get-payment <payment-reference>
```

**Example:**
```bash
pnpm vipps:get-payment acme-shop-123-order-3456
```

**Required Environment Variables:**
```bash
VIPPS_CLIENT_ID=<your-client-id>
VIPPS_CLIENT_SECRET=<your-client-secret>
VIPPS_SUBSCRIPTION_KEY=<your-subscription-key>
VIPPS_MERCHANT_SERIAL_NUMBER=<your-msn>
VIPPS_IS_TEST=true  # Optional, defaults to true
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

---

## Database Seed Scripts

### Seed Shipping Products

Create default shipping products for Vipps checkout.

**Usage:**
```bash
DATABASE_URI="your-db-uri" CMS_SECRET="your-secret" pnpm tsx scripts/seed-shipping-products.ts
```

---

## Configuration

### Generate Config Types

Generate TypeScript types from app config schema.

**Usage:**
```bash
pnpm generate:config-types
```
