# Testing the Vipps Integration

This document describes how to run integration tests against the Vipps MobilePay test environment.

## Prerequisites

### 1. Get Test Credentials

You need a Vipps MobilePay test merchant account:

1. Go to [portal.vippsmobilepay.com](https://portal.vippsmobilepay.com/)
2. Navigate to **For developers** in the sidebar
3. Create or select a test sales unit
4. Get your API credentials:
   - Client ID
   - Client Secret
   - Subscription Key
   - Merchant Serial Number

### 2. Create Test Users

Test users are required to complete payments in the MT test app:

1. In the portal, go to **For developers** → **Test users**
2. Click **Add a new test user**
3. Note the phone number and NIN (National Identity Number)
4. Install the MT test app on your device (see below)

### 3. Install MT Test App

#### iOS
- Open [TestFlight link](https://testflight.apple.com/join/hTAYrwea) on your iOS device
- Install the Vipps MT app
- No invitation code needed

#### Android
- Download from the [Google Play Store](https://play.google.com/store/apps/details?id=no.dnb.vipps.mt)

### 4. Set Up Test App

1. Select your country (must match your test user's country)
2. Enter your test user's NIN
3. Enter your test user's phone number
4. Use PIN code `1236` for all verification steps
5. Create personal code `1236`

## Configuration

1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Fill in your test credentials in `.env`:
   ```env
   VIPPS_CLIENT_ID=your-client-id-here
   VIPPS_CLIENT_SECRET=your-client-secret-here
   VIPPS_SUBSCRIPTION_KEY=your-subscription-key-here
   VIPPS_MERCHANT_SERIAL_NUMBER=your-msn-here
   VIPPS_TEST_PHONE_NUMBER=your-test-phone-number
   ```

## Running Tests

### Install Dependencies

From the monorepo root:
```bash
pnpm install
```

### Run All Tests

```bash
cd libs/vipps
pnpm test
```

### Run Tests in Watch Mode

```bash
pnpm test:watch
```

### Run Tests with UI

```bash
pnpm test:ui
```

### Run Specific Test File

```bash
pnpm test epayment-test-amounts
```

## Test Amounts

The Vipps test environment supports special amounts that trigger specific behaviors. These are useful for testing error handling and edge cases.

### Payment Test Amounts

| Amount (øre) | Behavior |
|--------------|----------|
| 151 | Insufficient funds |
| 182 | Refused by issuer |
| 183 | Suspected fraud |
| 184 | Withdrawal limit exceeded |
| 186 | Expired card |
| 187 | Invalid card |
| 197 | 3D Secure denied (Norway only) |
| 201 | Unknown result for 1 hour |
| 202 | SCA required (Norway only) |

### Refund Test Amounts

| Amount (øre) | Behavior |
|--------------|----------|
| 123 | Cannot refund - user deleted or no receiving account |
| 124 | Refund period expired |

## Manual Testing Required

Many tests require manual interaction with the MT test app:

1. The test creates a payment and logs a redirect URL
2. Open the URL in the MT test app
3. Complete or decline the payment as needed
4. The test can then verify the final state

Example test output:
```
ℹ️  Manual step required:
1. Open the redirectUrl in MT test app: vippsMT://...
2. Complete the payment in the app
3. The payment should fail with "Insufficient funds"
```

## Test Structure

```
src/__tests__/
├── setup.ts                              # Test environment setup
├── test-utils.ts                         # Shared test utilities
├── epayment-test-amounts.test.ts         # Manual payment tests with test amounts
├── epayment-refund-test-amounts.test.ts  # Manual refund tests
└── epayment-force-approve.test.ts        # Fully automated tests using force approve
```

## Two Testing Approaches

### 1. Manual Tests (Requires MT App)

Files: `epayment-test-amounts.test.ts`, `epayment-refund-test-amounts.test.ts`

These tests create payments and provide instructions for manually completing them in the MT test app. Useful for:

- Testing the full user experience
- Verifying UI flows
- Testing without the force approve prerequisite

**How they work:**

1. Test creates a payment and logs a redirect URL
2. You open the URL in the MT test app
3. Complete or decline the payment as instructed
4. Test verifies the final state

### 2. Fully Automated Tests (Force Approve)

File: `epayment-force-approve.test.ts`

These tests use the force approve endpoint to automatically complete payments without manual interaction. Useful for:

- CI/CD pipelines
- Rapid iteration during development
- Testing complete flows (create → approve → capture → refund)

**IMPORTANT Prerequisites:**

- Test user must have manually approved **at least ONE** payment in the MT app first (one-time requirement)
- Test user's card must not be expired (create new test user if you get HTTP 500)
- Only works in test environment

**Complete flows tested:**

- Create → Force Approve → Capture
- Create → Force Approve → Capture → Refund  
- Create → Force Approve → Cancel
- Partial capture scenarios
- Test amount failures (e.g., insufficient funds)

### Which Approach to Use?

**Use Manual Tests when:**

- Setting up for the first time (to satisfy force approve requirement)
- Testing specific UI/UX scenarios
- Verifying test amounts behavior in the app

**Use Automated Tests when:**

- Running in CI/CD
- Testing complete payment flows
- Rapid development iteration
- You've already completed the one-time manual approval

## Running Specific Tests

### All Tests

```bash
pnpm test
```

### Specific Test Suite

```bash
# Manual tests only
pnpm test epayment-test-amounts
pnpm test epayment-refund-test-amounts

# Automated tests only
pnpm test epayment-force-approve
```

### Watch Mode

```bash
pnpm test:watch
```

### With UI

```bash
pnpm test:ui
```

## Troubleshooting

### Tests are Skipped

If you see "Skipping Vipps integration tests", check:

- `.env` file exists in `libs/vipps/`
- All required environment variables are set
- No typos in variable names

### Authentication Errors

- Verify your credentials in portal.vippsmobilepay.com
- Ensure you're using **test** credentials, not production
- Check that your test sales unit is active

### Payment Creation Fails

- Verify your test phone number is correct
- Ensure the phone number matches your test user
- Check that amounts are in minor units (øre, not kroner)

### MT App Issues

- Ensure you're using a test user created in the portal
- Don't use your real phone number in test environment
- Use PIN `1236` for all verification steps
- Make sure the app version matches the test environment

## Resources

- [Vipps Test Environment Documentation](https://developer.vippsmobilepay.com/docs/knowledge-base/test-environment/)
- [ePayment API Guide](https://developer.vippsmobilepay.com/docs/APIs/epayment-api/)
- [Portal Guide](https://developer.vippsmobilepay.com/docs/knowledge-base/portal/)
- [Test Status Page](https://status-test.vippsmobilepay.com/)

## Notes

- Test environment has no SLA or uptime guarantee
- Some APIs are not available in test (e.g., Donations, Management, Report APIs)
- Test data is completely separate from production
- Test phone numbers should never be used in production
