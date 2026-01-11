/**
 * Configuration utilities for Vipps Auth Plugin
 */

import { Logger } from '@eventuras/logger';
import { VippsEnvironments } from '@eventuras/fides-auth/providers/vipps';
import type { ResolvedVippsAuthConfig, VippsAuthPluginConfig } from './types';

const logger = Logger.create({
  namespace: 'payload-vipps-auth:config',
  context: { module: 'ConfigResolver' },
});

/**
 * Resolve configuration with defaults and environment variables
 *
 * @param config - Partial configuration from user
 * @returns Resolved configuration with all required fields
 * @throws Error if required configuration is missing
 */
export function resolveConfig(config: VippsAuthPluginConfig): ResolvedVippsAuthConfig {
  const { clientId, clientSecret, redirectUri, subscriptionKey, merchantSerialNumber } = config;

  // Map environment to Vipps API URL
  const environment = config.environment || 'test';
  const apiUrl = environment === 'production' ? VippsEnvironments.Production : VippsEnvironments.Test;

  // Validate required fields
  if (!clientId) {
    throw new Error('Vipps Login Client ID is required. Provide it via config.clientId');
  }

  if (!clientSecret) {
    throw new Error('Vipps Login Client Secret is required. Provide it via config.clientSecret');
  }

  const disableLocalStrategy = config.disableLocalStrategy ?? false;

  const resolved: ResolvedVippsAuthConfig = {
    clientId,
    clientSecret,
    apiUrl,
    redirectUri,
    scope: config.scope || 'openid name phoneNumber address email',
    subscriptionKey,
    merchantSerialNumber,
    disableLocalStrategy,
    mapVippsUser: config.mapVippsUser,
  };

  logger.info(
    {
      apiUrl: resolved.apiUrl,
      redirectUri: resolved.redirectUri,
      scope: resolved.scope,
      disableLocalStrategy: resolved.disableLocalStrategy,
      hasCustomMapper: !!resolved.mapVippsUser,
    },
    'Vipps auth configuration resolved'
  );

  return resolved;
}
