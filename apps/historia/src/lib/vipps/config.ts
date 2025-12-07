/**
 * Vipps Configuration for Historia
 *
 * Centralizes Vipps configuration from environment variables.
 */

import type { VippsConfig } from '@eventuras/vipps/vipps-core';

import { appConfig } from '@/config';

/**
 * Get Vipps configuration from environment variables
 */
export function getVippsConfig(): VippsConfig {
  const config: VippsConfig = {
    apiUrl: (appConfig.env.VIPPS_API_URL as string | undefined) || 'https://apitest.vipps.no',
    merchantSerialNumber: appConfig.env.VIPPS_MERCHANT_SERIAL_NUMBER as string,
    clientId: appConfig.env.VIPPS_CLIENT_ID as string,
    clientSecret: appConfig.env.VIPPS_CLIENT_SECRET as string,
    subscriptionKey: appConfig.env.VIPPS_SUBSCRIPTION_KEY as string,
    systemName: 'eventuras-vipps',
    systemVersion: '0.1.0',
    pluginName: 'eventuras-vipps-commerce',
    pluginVersion: '0.1.0',
  };

  // Validate that all required fields are present
  const missingFields: string[] = [];
  if (!config.merchantSerialNumber) missingFields.push('VIPPS_MERCHANT_SERIAL_NUMBER');
  if (!config.clientId) missingFields.push('VIPPS_CLIENT_ID');
  if (!config.clientSecret) missingFields.push('VIPPS_CLIENT_SECRET');
  if (!config.subscriptionKey) missingFields.push('VIPPS_SUBSCRIPTION_KEY');

  if (missingFields.length > 0) {
    throw new Error(`Missing required Vipps environment variables: ${missingFields.join(', ')}`);
  }

  return config;
}
