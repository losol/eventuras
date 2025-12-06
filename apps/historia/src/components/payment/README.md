# Vipps Express Checkout Implementation

This directory contains the implementation of Vipps Express Checkout for Historia.

## Components

### VippsExpressButton

A wrapper component for `@eventuras/ratio-ui` VippsButton that handles Express Checkout flow.

**Location:** `src/components/payment/VippsExpressButton.tsx`

**Usage:**

```tsx
import { VippsExpressButton } from '@/components/payment/VippsExpressButton';

<VippsExpressButton
  amount={totalInCents}
  currency="NOK"
  items={cartItems}
  locale={locale}
/>
```

**Props:**

- `amount` (number): Total amount in minor units (øre for NOK)
- `currency` (string): Currency code (e.g., "NOK")
- `items` (array): Cart items with productId and quantity
- `locale` (string): Current locale for button text

## ratio-ui VippsButton

The underlying button component is from `@eventuras/ratio-ui`:

```tsx
import { VippsButton } from '@eventuras/ratio-ui/core/Button';

<VippsButton
  locale="no"           // Auto-sets button text
  loading={isLoading}
  block                 // Full width
  onClick={handleClick}
/>
```

**Features:**

- Vipps brand colors (#FF5B24)
- Automatic locale-based text ("Kjøp nå med Vipps" / "Buy now with Vipps")
- Loading state with spinner
- Full TypeScript support
- Storybook documentation

## Implementation Status

### ✅ Completed

- [x] VippsExpressButton component created
- [x] Cart page integration
- [x] Button styling (Vipps orange #FF5B24)
- [x] Loading state handling

### 🚧 TODO

- [ ] Implement Vipps API integration
  - [ ] Create payment endpoint
  - [ ] Add shipping options (fixed/dynamic)
  - [ ] Handle payment callback
- [ ] Add Vipps logo/icon to button
- [ ] Environment configuration (test/production)
- [ ] Error handling and user feedback
- [ ] Payment confirmation page
- [ ] Order creation after successful payment
- [ ] Webhook handling for payment updates

## Vipps Express Flow

1. User clicks "Kjøp nå med Vipps" button
2. Create payment request with:
   - Payment amount
   - Cart items
   - Shipping options
3. Redirect to Vipps/MobilePay app
4. User consents to share details
5. User selects shipping option
6. User confirms payment
7. Callback with:
   - User details (name, address, email, phone)
   - Selected shipping option
   - Payment confirmation
8. Create order in Historia
9. Show confirmation to user

## Configuration

Environment variables needed:

```env
# Vipps API Configuration
VIPPS_CLIENT_ID=your_client_id
VIPPS_CLIENT_SECRET=your_client_secret
VIPPS_MERCHANT_SERIAL_NUMBER=your_msn
VIPPS_SUBSCRIPTION_KEY=your_subscription_key

# Environment
VIPPS_API_URL=https://apitest.vipps.no  # or https://api.vipps.no for production
```

## Resources

- [Vipps Express Documentation](https://developer.vippsmobilepay.com/docs/APIs/epayment-api/api-guide/features/express/)
- [Vipps ePayment API](https://developer.vippsmobilepay.com/docs/APIs/epayment-api/)
- [Test Environment Setup](../../../docs/VIPPS.md)

## Testing

Use test credentials from [portal.vippsmobilepay.com](https://portal.vippsmobilepay.com/)

Test users available in test environment (see docs/VIPPS.md)
