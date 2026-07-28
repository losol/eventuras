/**
 * Unit tests for PII redaction handling — no Vipps credentials required.
 *
 * After the retention period Vipps replaces PII field values in payment
 * details with the literal "[Expired]". Merging a redacted response with the
 * copy stored at payment time must keep the stored values, while everything
 * Vipps still reports (state, aggregate) follows the fresh response.
 */

import { describe, it, expect } from 'vitest';
import { isExpiredValue, mergeExpiredPaymentDetails } from '../epayment-v1/redaction';
import type { PaymentDetails } from '../epayment-v1/types';

const storedAtPaymentTime = {
  state: 'AUTHORIZED',
  amount: { value: 59700, currency: 'NOK' },
  aggregate: {
    capturedAmount: { value: 0, currency: 'NOK' },
    refundedAmount: { value: 0, currency: 'NOK' },
    cancelledAmount: { value: 0, currency: 'NOK' },
    authorizedAmount: { value: 59700, currency: 'NOK' },
  },
  reference: '04eba743-7612-4dfd-854a-2ff4aeac3198',
  pspReference: '1883a92e-5d87-4942-9215-ca907f9c2ef1',
  paymentMethod: { type: 'WALLET', cardBin: '410651' },
  userDetails: {
    email: 'ola@example.com',
    lastName: 'Nordmann',
    firstName: 'Ola',
    mobileNumber: '4712345678',
  },
  shippingDetails: {
    address: {
      city: 'Oslo',
      country: 'NO',
      postCode: '0150',
      addressLine1: 'Storgata 1',
      addressLine2: 'Leilighet 2',
    },
    shippingCost: 5900,
    shippingOptionId: 'posten-hjem',
    shippingOptionName: 'Levering hjem med Posten',
  },
};

/** The same payment re-fetched after Vipps' retention period. */
const redactedResponse = {
  ...storedAtPaymentTime,
  state: 'AUTHORIZED',
  aggregate: {
    ...storedAtPaymentTime.aggregate,
    capturedAmount: { value: 59700, currency: 'NOK' },
  },
  userDetails: {
    email: '[Expired]',
    lastName: '[Expired]',
    firstName: '[Expired]',
    mobileNumber: '[Expired]',
  },
  shippingDetails: {
    ...storedAtPaymentTime.shippingDetails,
    address: {
      city: '[Expired]',
      country: '[Expired]',
      postCode: '[Expired]',
      addressLine1: '[Expired]',
      addressLine2: '[Expired]',
    },
  },
} as unknown as PaymentDetails;

describe('isExpiredValue', () => {
  it('matches only the exact placeholder', () => {
    expect(isExpiredValue('[Expired]')).toBe(true);
    expect(isExpiredValue('expired')).toBe(false);
    expect(isExpiredValue('')).toBe(false);
    expect(isExpiredValue(undefined)).toBe(false);
    expect(isExpiredValue(null)).toBe(false);
  });
});

describe('mergeExpiredPaymentDetails', () => {
  it('keeps stored values for fields redacted to [Expired]', () => {
    const merged = mergeExpiredPaymentDetails(redactedResponse, storedAtPaymentTime);

    expect(merged.userDetails).toEqual(storedAtPaymentTime.userDetails);
    expect(merged.shippingDetails?.address).toEqual(storedAtPaymentTime.shippingDetails.address);
  });

  it('takes non-redacted fields from the fresh response', () => {
    const merged = mergeExpiredPaymentDetails(redactedResponse, storedAtPaymentTime);

    expect(merged.aggregate.capturedAmount.value).toBe(59700);
    expect(merged.shippingDetails?.shippingOptionId).toBe('posten-hjem');
    expect(merged.reference).toBe(storedAtPaymentTime.reference);
  });

  it('leaves [Expired] in place when no stored value exists', () => {
    const merged = mergeExpiredPaymentDetails(redactedResponse, undefined);

    expect(merged.userDetails?.email).toBe('[Expired]');
    expect(merged.shippingDetails?.address.city).toBe('[Expired]');
  });

  it('leaves [Expired] in place when the stored value is also redacted', () => {
    const merged = mergeExpiredPaymentDetails(redactedResponse, redactedResponse);

    expect(merged.userDetails?.email).toBe('[Expired]');
  });

  it('ignores stored data that does not line up with the fresh structure', () => {
    const merged = mergeExpiredPaymentDetails(redactedResponse, {
      userDetails: 'not-an-object',
      shippingDetails: { address: null },
    });

    expect(merged.userDetails?.email).toBe('[Expired]');
    expect(merged.shippingDetails?.address.city).toBe('[Expired]');
    expect(merged.state).toBe('AUTHORIZED');
  });

  it('does not treat empty strings or partial matches as redacted', () => {
    const fresh = {
      ...redactedResponse,
      userDetails: { email: '', firstName: 'Expired', lastName: '[Expired]' },
    } as unknown as PaymentDetails;

    const merged = mergeExpiredPaymentDetails(fresh, storedAtPaymentTime);

    expect(merged.userDetails?.email).toBe('');
    expect(merged.userDetails?.firstName).toBe('Expired');
    expect(merged.userDetails?.lastName).toBe('Nordmann');
  });
});
