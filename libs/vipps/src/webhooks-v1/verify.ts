/**
 * Vipps Webhook Verification Utilities
 *
 * Utilities for verifying webhook signatures and payloads.
 * Includes HMAC-based authentication to verify webhook authenticity.
 *
 * @see https://developer.vippsmobilepay.com/docs/APIs/webhooks-api/request-authentication/
 */

import { createHmac, createHash } from 'crypto';
import type { WebhookPayload } from './types';

/**
 * Headers required for webhook authentication
 */
export interface WebhookHeaders {
  'x-ms-date': string;
  'x-ms-content-sha256': string;
  host: string;
  authorization: string;
}

/**
 * Request details needed for webhook verification
 */
export interface WebhookRequest {
  method: string; // Should be 'POST'
  pathAndQuery: string; // e.g., '/api/webhooks/vipps'
  headers: WebhookHeaders;
  body: string; // Raw request body as string
}

/**
 * Verify webhook payload structure
 *
 * @param payload - Webhook payload to verify
 * @returns true if valid
 */
export function isValidWebhookPayload(payload: unknown): payload is WebhookPayload {
  if (!payload || typeof payload !== 'object') {
    return false;
  }

  const p = payload as Partial<WebhookPayload>;

  return (
    typeof p.msn === 'string' &&
    typeof p.reference === 'string' &&
    typeof p.pspReference === 'string' &&
    typeof p.name === 'string' &&
    typeof p.timestamp === 'string' &&
    typeof p.success === 'boolean' &&
    !!p.amount &&
    typeof p.amount === 'object' &&
    typeof p.amount.value === 'number' &&
    typeof p.amount.currency === 'string'
  );
}

/**
 * Parse webhook payload from request
 *
 * @param body - Request body (string or object)
 * @returns Parsed webhook payload
 * @throws Error if payload is invalid
 */
export function parseWebhookPayload(body: string | unknown): WebhookPayload {
  let payload: unknown;

  if (typeof body === 'string') {
    try {
      payload = JSON.parse(body);
    } catch {
      throw new Error('Invalid JSON in webhook payload');
    }
  } else {
    payload = body;
  }

  if (!isValidWebhookPayload(payload)) {
    throw new Error('Invalid webhook payload structure');
  }

  return payload;
}

/**
 * Get event type from webhook payload
 *
 * Maps payment event names to webhook event types.
 *
 * @param payload - Webhook payload
 * @returns Webhook event type
 */
export function getEventType(payload: WebhookPayload): string {
  const eventMap: Record<string, string> = {
    CREATED: 'epayments.payment.created.v1',
    ABORTED: 'epayments.payment.aborted.v1',
    EXPIRED: 'epayments.payment.expired.v1',
    CANCELLED: 'epayments.payment.cancelled.v1',
    CAPTURED: 'epayments.payment.captured.v1',
    REFUNDED: 'epayments.payment.refunded.v1',
    AUTHORIZED: 'epayments.payment.authorized.v1',
    TERMINATED: 'epayments.payment.terminated.v1',
  };

  return eventMap[payload.name] || `epayments.payment.${payload.name.toLowerCase()}.v1`;
}

/**
 * Verifies the HMAC signature of a webhook request
 *
 * This function authenticates that the webhook request actually came from Vipps
 * by validating the HMAC-SHA256 signature using the webhook secret.
 *
 * The verification process:
 * 1. Verifies the content hash matches the x-ms-content-sha256 header
 * 2. Constructs the signed string from method, path, and headers
 * 3. Computes HMAC-SHA256 signature using the webhook secret
 * 4. Compares the computed signature with the Authorization header
 *
 * @param request - The webhook request details
 * @param secret - The webhook secret received when registering the webhook
 * @returns true if the signature is valid, false otherwise
 *
 * @example
 * ```typescript
 * // In Next.js API route
 * export async function POST(req: Request) {
 *   const body = await req.text();
 *   const url = new URL(req.url);
 *
 *   const isValid = verifyWebhookSignature({
 *     method: 'POST',
 *     pathAndQuery: url.pathname + url.search,
 *     headers: {
 *       'x-ms-date': req.headers.get('x-ms-date')!,
 *       'x-ms-content-sha256': req.headers.get('x-ms-content-sha256')!,
 *       'host': req.headers.get('host')!,
 *       'authorization': req.headers.get('authorization')!
 *     },
 *     body
 *   }, process.env.VIPPS_WEBHOOK_SECRET!);
 *
 *   if (!isValid) {
 *     return new Response('Invalid signature', { status: 401 });
 *   }
 *
 *   const payload = parseWebhookPayload(body);
 *   // Process webhook...
 * }
 * ```
 *
 * @see https://developer.vippsmobilepay.com/docs/APIs/webhooks-api/request-authentication/
 */
export function verifyWebhookSignature(request: WebhookRequest, secret: string): boolean {
  try {
    // Step 1: Verify content hash
    const expectedContentHash = createHash('sha256').update(request.body).digest('base64');

    if (request.headers['x-ms-content-sha256'] !== expectedContentHash) {
      return false;
    }

    // Step 2: Verify signature
    // Format: POST\n<pathAndQuery>\n<date>;<host>;<hash>
    const signedString = [
      request.method,
      request.pathAndQuery,
      `${request.headers['x-ms-date']};${request.headers.host};${request.headers['x-ms-content-sha256']}`,
    ].join('\n');

    const expectedSignature = createHmac('sha256', secret).update(signedString).digest('base64');

    const expectedAuth = `HMAC-SHA256 SignedHeaders=x-ms-date;host;x-ms-content-sha256&Signature=${expectedSignature}`;

    return request.headers.authorization === expectedAuth;
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}

/**
 * Extracts the signature from the Authorization header
 *
 * @param authHeader - The Authorization header value
 * @returns The signature string or null if not found
 * @internal
 */
export function extractSignature(authHeader: string): string | null {
  const match = authHeader.match(/Signature=([^&]+)/);
  return match?.[1] ?? null;
}

