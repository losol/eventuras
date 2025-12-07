/**
 * Vipps MobilePay Core Configuration and Utilities
 *
 * Common types, utilities, and helpers for Vipps MobilePay integration.
 */

/**
 * Vipps API Configuration
 */
export interface VippsConfig {
  /** API base URL (e.g., 'https://apitest.vipps.no' or 'https://api.vipps.no') */
  apiUrl: string;
  /** Merchant Serial Number (MSN) */
  merchantSerialNumber: string;
  /** OAuth Client ID */
  clientId: string;
  /** OAuth Client Secret */
  clientSecret: string;
  /** API Subscription Key (Ocp-Apim-Subscription-Key) */
  subscriptionKey: string;
  /** System/Application name */
  systemName: string;
  /** System/Application version */
  systemVersion: string;
  /** Plugin name (if applicable) */
  pluginName: string;
  /** Plugin version (if applicable) */
  pluginVersion: string;
}

/**
 * Amount object for payments
 */
export interface PaymentAmount {
  /** Amount in minor units (øre for NOK) */
  value: number;
  /** ISO 4217 currency code (e.g., "NOK") */
  currency: string;
}

/**
 * Access token response from Vipps OAuth
 */
export interface AccessTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  ext_expires_in: number;
  expires_on: string;
  not_before: string;
  resource: string;
  token_type_hint?: string;
}

/**
 * Get Vipps access token using client credentials
 */
export async function getAccessToken(config: VippsConfig): Promise<string> {
  const response = await fetch(`${config.apiUrl}/accesstoken/get`, {
    method: 'POST',
    headers: {
      'client_id': config.clientId,
      'client_secret': config.clientSecret,
      'Ocp-Apim-Subscription-Key': config.subscriptionKey,
      'Merchant-Serial-Number': config.merchantSerialNumber,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Vipps authentication failed: ${response.status} - ${errorText}`);
  }

  const data = (await response.json()) as AccessTokenResponse;
  return data.access_token;
}

/**
 * Build common headers for Vipps API requests
 */
export function buildHeaders(
  config: VippsConfig,
  accessToken: string,
  idempotencyKey?: string
): Record<string, string> {
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    'Ocp-Apim-Subscription-Key': config.subscriptionKey,
    'Merchant-Serial-Number': config.merchantSerialNumber,
    'Vipps-System-Name': config.systemName,
    'Vipps-System-Version': config.systemVersion,
    'Vipps-System-Plugin-Name': config.pluginName,
    'Vipps-System-Plugin-Version': config.pluginVersion,
  };

  if (idempotencyKey) {
    headers['Idempotency-Key'] = idempotencyKey;
  }

  return headers;
}

/**
 * Validate Vipps configuration
 * @throws Error if configuration is invalid
 */
export function validateConfig(config: VippsConfig): void {
  const required: (keyof VippsConfig)[] = [
    'apiUrl',
    'merchantSerialNumber',
    'clientId',
    'clientSecret',
    'subscriptionKey',
    'systemName',
    'systemVersion',
    'pluginName',
    'pluginVersion',
  ];

  for (const key of required) {
    if (!config[key]) {
      throw new Error(`Missing required Vipps configuration: ${key}`);
    }
  }
}
