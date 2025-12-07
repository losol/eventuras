# Vipps ePayment API Migration

This document describes the migration from the old Vipps Checkout API to the new ePayment API.

## Overview

The Vipps integration has been refactored to use the **ePayment API** instead of the deprecated Checkout API. The new implementation follows Vipps MobilePay's recommended patterns with the `WEB_REDIRECT` flow.

## Key Changes

### 1. New ePayment API Client (`src/lib/vipps/epayment-client.ts`)

A new TypeScript client for the ePayment API with:

- **Authentication**: `getAccessToken()` - OAuth token management
- **Payment Operations**:
  - `createPayment()` - Create new payment with WEB_REDIRECT flow
  - `getPaymentDetails()` - Get payment status and details
  - `getPaymentEvents()` - Get payment event log
  - `capturePayment()` - Capture authorized payment
  - `cancelPayment()` - Cancel uncaptured amount
  - `refundPayment()` - Refund captured amount

- **Type Safety**: Full TypeScript types for requests/responses
- **Logging**: Comprehensive structured logging with `@eventuras/logger`
- **Error Handling**: Proper error propagation and user-friendly messages

### 2. Updated Payment Creation (`src/app/(frontend)/[locale]/checkout/vippsActions.ts`)

**Old approach (Checkout API)**:
- Used `/checkout/v3/session` endpoint
- Embedded checkout widget
- Complex request with order lines, shipping, callback tokens

**New approach (ePayment API)**:
- Uses `/epayment/v1/payments` endpoint
- Simple redirect flow - no embedded widget
- Clean payment request with just amount, reference, return URL
- **Profile sharing** - Request user data (name, email, phone, address, birthdate)

**Key differences**:
```typescript
// NEW: Simple ePayment request with profile sharing
const paymentRequest: CreatePaymentRequest = {
  amount: { value: amount, currency },
  paymentMethod: { type: 'WALLET' },
  profile: {
    scope: 'name phoneNumber address birthDate email', // Request user profile
  },
  reference: `ORDER-${Date.now()}-${random}`,
  returnUrl: `${baseUrl}/${locale}/checkout/vipps-callback?reference=${reference}`,
  userFlow: 'WEB_REDIRECT',
  paymentDescription: 'Kjøp: produktnavn...',
};

// Response includes redirectUrl
const response = await createPayment(paymentRequest);
// Redirect user to: response.redirectUrl
```

### 3. New Checkout Page (`src/app/(frontend)/[locale]/checkout/page.client.tsx`)

**Changes**:
- Removed embedded checkout widget (`VippsCheckoutEmbed`)
- Simple button-based flow: "Betal med Vipps"
- On click: Creates payment → Redirects to Vipps
- Shows order summary before redirect

**User flow**:
1. User reviews order
2. Clicks "Betal med Vipps"
3. Server creates payment via ePayment API
4. Browser redirects to Vipps payment page
5. User completes payment in Vipps app or web
6. Vipps redirects back to callback URL

### 4. Updated Callback Handler (`src/app/(frontend)/[locale]/checkout/vipps-callback/`)

**New file**: `epayment-actions.ts` replaces old `actions.ts`

**Changes**:
- `getVippsPaymentDetails()` - Uses `/epayment/v1/payments/{reference}`
- Simplified payment state checking (just `state === 'AUTHORIZED'`)
- Removed Checkout API session details
- Uses standard ePayment `PaymentDetails` type

**Payment states**:
- `CREATED` - Payment initiated
- `AUTHORIZED` - User approved (ready for capture)
- `ABORTED` - User cancelled
- `EXPIRED` - Payment timed out
- `TERMINATED` - Merchant cancelled

### 5. Files Changed

**New files**:
- ✨ `src/lib/vipps/epayment-client.ts` - ePayment API client
- ✨ `src/app/(frontend)/[locale]/checkout/vipps-callback/epayment-actions.ts` - New callback actions
- ✨ `src/app/(frontend)/[locale]/checkout/page.client.tsx` - New redirect-based checkout

**Modified files**:
- 🔄 `src/app/(frontend)/[locale]/checkout/vippsActions.ts` - Uses ePayment API
- 🔄 `src/app/(frontend)/[locale]/checkout/page.tsx` - Points to new client component
- 🔄 `src/app/(frontend)/[locale]/checkout/vipps-callback/page.tsx` - Uses epayment-actions

**Deprecated/Can be deleted**:
- 🗑️ `src/app/(frontend)/[locale]/checkout/page-embedded.client.tsx` - Old embedded checkout
- 🗑️ `src/app/(frontend)/[locale]/checkout/vipps-callback/actions.ts` - Old Checkout API actions
- 🗑️ `src/components/checkout/VippsCheckoutEmbed.tsx` - Embedded widget component

## API Documentation References

- [ePayment API Core Concepts](https://developer.vippsmobilepay.com/docs/APIs/epayment-api/api-guide/concepts/)
- [Create Payment](https://developer.vippsmobilepay.com/docs/APIs/epayment-api/api-guide/operations/create/)
- [Get Payment Details](https://developer.vippsmobilepay.com/docs/APIs/epayment-api/api-guide/operations/get_info/)
- [Payment States](https://developer.vippsmobilepay.com/docs/APIs/epayment-api/api-guide/concepts/#payment-states)

## Configuration

No changes to environment variables needed:
- `VIPPS_API_URL` - API base URL (test: `https://apitest.vipps.no`)
- `VIPPS_CLIENT_ID` - OAuth client ID
- `VIPPS_CLIENT_SECRET` - OAuth client secret
- `VIPPS_SUBSCRIPTION_KEY` - API subscription key
- `VIPPS_MERCHANT_SERIAL_NUMBER` - Merchant identifier

## Benefits

1. **Simpler integration** - No embedded widgets or complex callbacks
2. **Better compatibility** - Works with all devices (mobile app-switch, desktop landing page)
3. **Easier maintenance** - Standard OAuth + REST API
4. **Future-proof** - Latest Vipps API with ongoing support
5. **Type safety** - Full TypeScript types for all API interactions

## Testing Checklist

- [ ] Test payment flow on desktop browser
- [ ] Test payment flow on mobile with Vipps app installed
- [ ] Test payment flow on mobile without Vipps app (landing page)
- [ ] Test payment cancellation
- [ ] Test payment timeout/expiration
- [ ] Verify order creation with correct amounts
- [ ] Verify transaction records in database
- [ ] Test with Norwegian test cards in test environment
- [ ] Check logging output for debugging

## Migration Notes

The ePayment API uses a simpler model:
- No more "sessions" - just payments with references
- Payment states are clearer (CREATED → AUTHORIZED → captured)
- No callback webhooks needed for basic flow (polling payment status)
- Can implement webhooks later for real-time updates

## Future Enhancements

Possible additions with ePayment API:

- ✅ **Profile sharing** - Get user details with consent (IMPLEMENTED)
- **Express shipping** - Dynamic shipping options in Vipps app
- **Partial capture** - Capture less than authorized amount
- **Webhooks** - Real-time payment notifications
- **QR payments** - For in-store/kiosk scenarios
- **Recurring payments** - Subscription support

### Profile Sharing (Implemented)

The payment creation now requests user profile data by including `profile` scope in the payment request:

```typescript
profile: {
  scope: 'name phoneNumber address birthDate email'
}
```

When the user completes payment, Vipps will return this data (if user consents):

```typescript
paymentDetails.profile = {
  email: 'user@example.com',
  givenName: 'Ole',
  familyName: 'Hansen',
  birthdate: '1990-01-15',
  phoneNumber: '4712345678'
}
}
```

This data is available in the callback handler and can be used to:

- Pre-fill user accounts
- Create orders without requiring login
- Simplify checkout flow

**Documentation**: [Profile Sharing](https://developer.vippsmobilepay.com/docs/APIs/epayment-api/api-guide/features/profile-sharing/)
