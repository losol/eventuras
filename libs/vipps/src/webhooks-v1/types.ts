/**
 * Vipps MobilePay ePayment Webhooks
 *
 * Types and utilities for handling Vipps ePayment webhook events.
 * https://developer.vippsmobilepay.com/docs/APIs/epayment-api/api-guide/webhooks/
 */

import type { PaymentAmount } from '../vipps-core';

/**
 * ePayment webhook event types
 */
export type WebhookEventType =
  | 'epayments.payment.created.v1'
  | 'epayments.payment.aborted.v1'
  | 'epayments.payment.expired.v1'
  | 'epayments.payment.cancelled.v1'
  | 'epayments.payment.captured.v1'
  | 'epayments.payment.refunded.v1'
  | 'epayments.payment.authorized.v1'
  | 'epayments.payment.terminated.v1';

/**
 * Payment event name (same as in PaymentEvent from epayment-v1)
 */
export type PaymentEventName =
  | 'CREATED'
  | 'ABORTED'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'CAPTURED'
  | 'REFUNDED'
  | 'AUTHORIZED'
  | 'TERMINATED';

/**
 * Shipping details from webhook
 */
export interface WebhookShippingDetails {
  address: {
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    country?: string;
    postCode?: string;
  };
  shippingCost: number;
  shippingOptionId: string;
  shippingOptionName?: string;
}

/**
 * User details from webhook (Express Checkout)
 */
export interface WebhookUserDetails {
  email?: string;
  firstName?: string;
  lastName?: string;
  mobileNumber?: string;
  addresses?: Array<{
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    country?: string;
    postCode?: string;
  }>;
}

/**
 * Webhook payload structure
 */
export interface WebhookPayload {
  /** Merchant Serial Number */
  msn: string;
  /** Payment reference */
  reference: string;
  /** PSP reference for this specific event */
  pspReference: string;
  /** Event name */
  name: PaymentEventName;
  /** Amount for this event */
  amount: PaymentAmount;
  /** ISO 8601 timestamp */
  timestamp: string;
  /** Idempotency key (optional) */
  idempotencyKey?: string | null;
  /** Whether the operation was successful */
  success: boolean;
  /** Shipping details (Express Checkout) */
  shippingDetails?: WebhookShippingDetails;
  /** User details (Express Checkout) */
  userDetails?: WebhookUserDetails;
  /** Subject identifier for profile data (if profile.scope was requested) */
  sub?: string;
}

/**
 * Webhook registration request
 */
export interface RegisterWebhookRequest {
  /** Webhook callback URL */
  url: string;
  /** Events to subscribe to */
  events: WebhookEventType[];
}

/**
 * Webhook registration response
 */
export interface RegisterWebhookResponse {
  /** Unique webhook ID */
  id: string;
  /** Webhook secret for signature verification */
  secret: string;
}

/**
 * List webhooks response
 */
export interface ListWebhooksResponse {
  webhooks: Array<{
    id: string;
    url: string;
    events: WebhookEventType[];
    createdAt: string;
  }>;
}
