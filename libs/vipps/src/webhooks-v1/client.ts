/**
 * Vipps MobilePay Webhooks API Client
 *
 * Utilities for registering and managing webhooks.
 * https://developer.vippsmobilepay.com/docs/APIs/webhooks-api/
 */

import { getAccessToken } from '../vipps-core';
import type { VippsConfig } from '../vipps-core';
import type {
  ListWebhooksResponse,
  RegisterWebhookRequest,
  RegisterWebhookResponse,
  WebhookEventType,
} from './types';

/**
 * Get Webhooks API URL from config
 */
function getWebhooksApiUrl(config: VippsConfig): string {
  return `${config.apiUrl}/webhooks/v1`;
}

/**
 * Register a new webhook
 *
 * @param config - Vipps configuration
 * @param request - Webhook registration details
 * @returns Webhook ID and secret
 */
export async function registerWebhook(
  config: VippsConfig,
  request: RegisterWebhookRequest,
): Promise<RegisterWebhookResponse> {
  const accessToken = await getAccessToken(config);

  const response = await fetch(`${getWebhooksApiUrl(config)}/webhooks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      'Ocp-Apim-Subscription-Key': config.subscriptionKey,
      'Merchant-Serial-Number': config.merchantSerialNumber,
      'Vipps-System-Name': config.systemName || 'eventuras',
      'Vipps-System-Version': config.systemVersion || '1.0.0',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(
      `Failed to register webhook: ${response.status} - ${error}`,
    );
  }

  return response.json();
}

/**
 * List all registered webhooks
 *
 * @param config - Vipps configuration
 * @returns List of webhooks
 */
export async function listWebhooks(
  config: VippsConfig,
): Promise<ListWebhooksResponse> {
  const accessToken = await getAccessToken(config);

  const response = await fetch(`${getWebhooksApiUrl(config)}/webhooks`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Ocp-Apim-Subscription-Key': config.subscriptionKey,
      'Merchant-Serial-Number': config.merchantSerialNumber,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to list webhooks: ${response.status} - ${error}`);
  }

  return response.json();
}

/**
 * Delete a webhook
 *
 * @param config - Vipps configuration
 * @param webhookId - Webhook ID to delete
 */
export async function deleteWebhook(
  config: VippsConfig,
  webhookId: string,
): Promise<void> {
  const accessToken = await getAccessToken(config);

  const response = await fetch(
    `${getWebhooksApiUrl(config)}/webhooks/${webhookId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Ocp-Apim-Subscription-Key': config.subscriptionKey,
        'Merchant-Serial-Number': config.merchantSerialNumber,
      },
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to delete webhook: ${response.status} - ${error}`);
  }
}

/**
 * Update webhook events
 *
 * @param config - Vipps configuration
 * @param webhookId - Webhook ID to update
 * @param events - New list of events
 */
export async function updateWebhookEvents(
  config: VippsConfig,
  webhookId: string,
  events: WebhookEventType[],
): Promise<void> {
  const accessToken = await getAccessToken(config);

  const response = await fetch(
    `${getWebhooksApiUrl(config)}/webhooks/${webhookId}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        'Ocp-Apim-Subscription-Key': config.subscriptionKey,
        'Merchant-Serial-Number': config.merchantSerialNumber,
      },
      body: JSON.stringify({ events }),
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update webhook: ${response.status} - ${error}`);
  }
}
