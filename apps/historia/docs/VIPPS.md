# Vipps Integration

Eventuras supports Vipps MobilePay as a payment provider for event registrations and e-commerce.

## Test Environment

### Quick Setup

To test Vipps integration, you need:

1. **Test Sales Unit** - Automatically created when ordering a Vipps product with API access
2. **API Keys** - Available in [portal.vippsmobilepay.com](https://portal.vippsmobilepay.com/) under "For developers"
3. **Test Users** - Create via portal under "Test users" tab
4. **Test App** - Install MT (Merchant Test) app on your device

### API Endpoints

- **Test**: `https://apitest.vipps.no`
- **Production**: `https://api.vipps.no`

### Test Users

Create test users at [portal.vippsmobilepay.com](https://portal.vippsmobilepay.com/):

1. Navigate to **For developers** → **Test users**
2. Click **Add a new test user** (phone number and NIN auto-generated)
3. Note the credentials for app login

We are currently using the following test users for development

| SSN       | Phone Number | NIN    |
|-----------|--------------|--------|
|22123242541| +47 48755492   | 1236   |
|24028293743| +47 92487769   | 1236   |

**Important:**

- Test users work across all merchants in test environment
- Never use test phone numbers in production
- Cannot modify test users after creation

### Test App Installation

**iOS (TestFlight):**

- [Install MT app](https://testflight.apple.com/join/hTAYrwea)

**Android:**

- See [developer docs](https://developer.vippsmobilepay.com/docs/knowledge-base/test-environment/)

**Setup:**

1. Select country matching your test user
2. Enter test user's NIN and phone number
3. Use PIN `1236` for all confirmations

### Test Amounts

Use these amounts to trigger specific test scenarios:

| Amount | Result |
|--------|--------|
| 151 | Insufficient funds |
| 182 | Refused by issuer |
| 183 | Suspected fraud |
| 186 | Expired card |
| 187 | Invalid card |

**Refund testing:**

- 123: Cannot refund (user deleted)
- 124: Refund period expired

### Production Testing

When testing with real transactions:

- Use **2 NOK** minimum (1 NOK unreliable in payment systems)
- Requires live merchant account from portal

## Express Checkout (Hurtig-utsjekk)

Vipps Express Checkout streamlines the checkout process by allowing customers to:

- Select shipping options directly in the Vipps/MobilePay app
- Share contact and delivery details with the merchant
- Review total amount (including shipping) before confirming

### Flow

1. User clicks Express button on product/checkout page
2. Vipps/MobilePay app opens
3. User consents to share: name, address, phone number, email
4. User selects shipping option
5. User confirms final payment (including shipping cost)
6. User returns to merchant site with confirmation

### Implementation

**Create Payment Request:**

```json
POST /epayment/v1/payments
{
  "paymentMethod": "WALLET",
  "scope": "name address email phoneNumber",
  "shipping": {
    "fixedOptions": [
      {
        "brand": "POSTNORD",
        "type": "HOME_DELIVERY",
        "options": [
          {
            "id": "standard",
            "amount": {
              "currency": "NOK",
              "value": 9900
            },
            "name": "Standard shipping",
            "estimatedDelivery": "3-5 business days"
          }
        ]
      }
    ]
  }
}
```

**Shipping Options:**

- `fixedOptions` - Use when shipping options are known upfront (recommended)
- `dynamicOptions` - Use when options depend on user's address

**Fixed Options Properties:**

- `brand` - Shipping provider (POSTNORD, BRING, DHL, PORTERBUDDY, etc.)
- `type` - Delivery type: `HOME_DELIVERY`, `PICKUP_POINT`, `MAILBOX`, `IN_STORE`, `OTHER`
- `options` - Array of delivery options with:
  - `id` - Unique identifier (returned after payment)
  - `amount` - Shipping cost in minor units (9900 = 99.00 NOK)
  - `name` - Option name shown to user
  - `estimatedDelivery` - Delivery estimate (e.g., "1-2 Days", "17:00-19:00")

**Get Shipping Details:**

After payment, retrieve selected shipping info via:

```http
GET /epayment/v1/payments/{reference}
```

Response includes:

```json
{
  "shippingDetails": {
    "address": {
      "addressLine1": "Robert Levins gate 5",
      "city": "Oslo",
      "postCode": "0154",
      "country": "NO"
    },
    "shippingCost": 9900,
    "shippingOptionId": "standard",
    "shippingOptionName": "Standard shipping"
  },
  "userDetails": {
    "email": "user@example.com",
    "firstName": "Test",
    "lastName": "User",
    "mobileNumber": "4712345678"
  }
}
```

### Button Guidelines

**Recommended text (Norwegian):**

- "Kjøp nå med Vipps" (full CTA)
- "Vipps Ekspress" (compact)
- Icon + "Ekspress" (limited width)

### Limitations

- Shipping address must match merchant's sales unit country
- Currency must match sales unit country
- All 4 scope values required: `name address email phoneNumber`

### Resources

- [Express documentation](https://developer.vippsmobilepay.com/docs/APIs/epayment-api/api-guide/features/express/)
- [Brand guidelines](https://brand.vippsmobilepay.com/document/61#/branding/online/buttons)

## Postman collections

<https://developer.vippsmobilepay.com/docs/knowledge-base/postman/>
