#!/usr/bin/env tsx
/**
 * CLI tool to fetch Vipps payment details
 * 
 * Usage:
 *   pnpm tsx scripts/vipps-get-payment.ts <payment-reference>
 * 
 * Example:
 *   pnpm tsx scripts/vipps-get-payment.ts acme-shop-123-order-3456
 * 
 * Environment variables required:
 *   VIPPS_CLIENT_ID
 *   VIPPS_CLIENT_SECRET
 *   VIPPS_SUBSCRIPTION_KEY
 *   VIPPS_MERCHANT_SERIAL_NUMBER (MSN)
 *   VIPPS_IS_TEST (optional, defaults to true)
 */

import { getPaymentDetails } from '@eventuras/vipps/epayment-v1';
import type { VippsConfig } from '@eventuras/vipps/vipps-core';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function printError(message: string) {
  console.error(`${colors.red}✗ ${message}${colors.reset}`);
}

function printSuccess(message: string) {
  console.log(`${colors.green}✓ ${message}${colors.reset}`);
}

function printHeader(text: string) {
  console.log(`\n${colors.bright}${colors.cyan}${text}${colors.reset}`);
  console.log(colors.dim + '─'.repeat(text.length) + colors.reset);
}

function printField(label: string, value: unknown) {
  console.log(`${colors.dim}${label}:${colors.reset} ${value ?? colors.dim + 'N/A' + colors.reset}`);
}

function formatAmount(amount: { value: number; currency: string }) {
  const major = amount.value / 100;
  return `${major.toFixed(2)} ${amount.currency}`;
}

function formatDate(dateString?: string) {
  if (!dateString) return null;
  const date = new Date(dateString);
  return date.toLocaleString('no-NO', {
    dateStyle: 'medium',
    timeStyle: 'medium',
  });
}

async function main() {
  const paymentReference = process.argv[2];

  if (!paymentReference) {
    printError('Payment reference is required');
    console.log('\nUsage: pnpm tsx scripts/vipps-get-payment.ts <payment-reference>');
    console.log('\nExample:');
    console.log('  pnpm tsx scripts/vipps-get-payment.ts acme-shop-123-order-3456');
    process.exit(1);
  }

  // Build Vipps configuration from environment variables
  const config: VippsConfig = {
    clientId: process.env.VIPPS_CLIENT_ID!,
    clientSecret: process.env.VIPPS_CLIENT_SECRET!,
    subscriptionKey: process.env.VIPPS_SUBSCRIPTION_KEY!,
    merchantSerialNumber: process.env.VIPPS_MERCHANT_SERIAL_NUMBER!,
    isTest: process.env.VIPPS_IS_TEST !== 'false',
    apiUrl: process.env.VIPPS_IS_TEST !== 'false'
      ? 'https://apitest.vipps.no'
      : 'https://api.vipps.no',
  };

  // Validate configuration
  const missingVars: string[] = [];
  if (!config.clientId) missingVars.push('VIPPS_CLIENT_ID');
  if (!config.clientSecret) missingVars.push('VIPPS_CLIENT_SECRET');
  if (!config.subscriptionKey) missingVars.push('VIPPS_SUBSCRIPTION_KEY');
  if (!config.merchantSerialNumber) missingVars.push('VIPPS_MERCHANT_SERIAL_NUMBER');

  if (missingVars.length > 0) {
    printError(`Missing required environment variables: ${missingVars.join(', ')}`);
    process.exit(1);
  }

  console.log(`${colors.bright}Fetching payment details from Vipps...${colors.reset}`);
  console.log(`${colors.dim}Reference: ${paymentReference}${colors.reset}`);
  console.log(`${colors.dim}Environment: ${config.isTest ? 'TEST' : 'PRODUCTION'}${colors.reset}\n`);

  try {
    const payment = await getPaymentDetails(config, paymentReference);

    printSuccess('Payment details retrieved successfully\n');

    // Basic Information
    printHeader('Payment Information');
    printField('Reference', payment.reference);
    printField('PSP Reference', payment.pspReference);
    printField('State', payment.state);
    printField('Payment Method', payment.paymentMethod);

    // Aggregate amounts
    printHeader('Amounts');
    printField('Authorized', formatAmount(payment.aggregate.authorizedAmount));
    printField('Cancelled', formatAmount(payment.aggregate.cancelledAmount));
    printField('Captured', formatAmount(payment.aggregate.capturedAmount));
    printField('Refunded', formatAmount(payment.aggregate.refundedAmount));

    // Profile information (if shared)
    if (payment.profile) {
      printHeader('Customer Profile (from Vipps)');
      printField('Email', payment.profile.email);
      printField('Phone', payment.profile.phoneNumber);
      printField('Name', `${payment.profile.givenName || ''} ${payment.profile.familyName || ''}`.trim() || null);
      printField('Birth Date', payment.profile.birthDate);
    }

    // User details (alternative profile)
    if (payment.userDetails && !payment.profile) {
      printHeader('User Details');
      printField('Bank ID Verified', payment.userDetails.bankIdVerified);
      printField('Date of Birth', payment.userDetails.dateOfBirth);
      printField('Email', payment.userDetails.email);
      printField('First Name', payment.userDetails.firstName);
      printField('Last Name', payment.userDetails.lastName);
      printField('Mobile Number', payment.userDetails.mobileNumber);
      printField('NIN', payment.userDetails.nin ? '***' + payment.userDetails.nin.slice(-4) : null);
      printField('SSN', payment.userDetails.ssn);
      if (payment.userDetails.streetAddress) {
        printField('Address', payment.userDetails.streetAddress);
        printField('City', payment.userDetails.city);
        printField('Zip Code', payment.userDetails.zipCode);
        printField('Country', payment.userDetails.country);
      }
    }

    // Shipping details
    if (payment.shippingDetails) {
      printHeader('Shipping Details');
      printField('Option ID', payment.shippingDetails.shippingOptionId);
      printField('Option Name', payment.shippingDetails.shippingOptionName);
      printField('Shipping Cost', `${payment.shippingDetails.shippingCost / 100} ${payment.aggregate.authorizedAmount.currency}`);
      if (payment.shippingDetails.address) {
        const addr = payment.shippingDetails.address;
        printField('Address Line 1', addr.addressLine1);
        printField('Address Line 2', addr.addressLine2);
        printField('Postal Code', addr.postCode);
        printField('City', addr.city);
        printField('Country', addr.country);
      }
    }

    // Payment events (history)
    if (payment.events && payment.events.length > 0) {
      printHeader('Payment Events History');
      payment.events.forEach((event, index) => {
        console.log(`\n${colors.dim}${index + 1}.${colors.reset} ${colors.bright}${event.name}${colors.reset}`);
        printField('  Amount', event.amount ? formatAmount(event.amount) : null);
        printField('  Timestamp', formatDate(event.timestamp));
        printField('  Success', event.success);
        printField('  PSP Reference', event.pspReference);
        if (event.idempotencyKey) {
          printField('  Idempotency Key', event.idempotencyKey);
        }
      });
    }

    // Summary
    printHeader('Summary');
    const hasProfile = !!(payment.profile || payment.userDetails);
    const hasShipping = !!payment.shippingDetails;
    const isCaptured = payment.aggregate.capturedAmount.value > 0;
    const isRefunded = payment.aggregate.refundedAmount.value > 0;
    const isCancelled = payment.aggregate.cancelledAmount.value > 0;

    printField('Profile Shared', hasProfile ? 'Yes' : 'No');
    printField('Shipping Provided', hasShipping ? 'Yes' : 'No');
    printField('Captured', isCaptured ? 'Yes' : 'No');
    printField('Refunded', isRefunded ? 'Yes' : 'No');
    printField('Cancelled', isCancelled ? 'Yes' : 'No');

    console.log('');
  } catch (error) {
    printError('Failed to fetch payment details');
    if (error instanceof Error) {
      console.error(`\n${colors.red}${error.message}${colors.reset}`);
      if (error.stack) {
        console.error(`\n${colors.dim}${error.stack}${colors.reset}`);
      }
    } else {
      console.error(error);
    }
    process.exit(1);
  }
}

main();
