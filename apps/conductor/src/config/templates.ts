import { randomBytes } from 'crypto';
import { uuidv7 } from 'uuidv7';
import type {
  TenantsConfig,
  ChannelsConfig,
  PluginsConfig,
} from './schemas.js';

/**
 * Generate default tenants configuration with a single default tenant
 * Creates a random API key that should be changed in production
 */
export function generateDefaultTenantsConfig(): TenantsConfig {
  const tenantId = uuidv7();

  return [
    {
      id: tenantId,
      name: 'Default Tenant',
      authKeyEnvVar: `TENANT_${tenantId.toUpperCase().replace(/-/g, '_')}_AUTHKEY`,
    },
  ];
}

/**
 * Generate default channels configuration
 * Creates a discord-bot channel for the default tenant
 */
export function generateDefaultChannelsConfig(
  tenantId: string,
): ChannelsConfig {
  const channelId = uuidv7();
  const tenantPrefix = tenantId.toUpperCase().replace(/-/g, '_');

  return [
    {
      channelId,
      channelName: 'default',
      tenantId,
      channelType: 'discord-bot',
      providerIdEnvVar: `TENANT_${tenantPrefix}_DISCORD_CHANNEL_ID`,
      providerSecretEnvVar: `TENANT_${tenantPrefix}_DISCORD_BOT_TOKEN`,
    },
  ];
}

/**
 * Generate default plugins configuration
 * Enables the discord plugin by default
 */
export function generateDefaultPluginsConfig(): PluginsConfig {
  return [
    {
      name: 'discord',
      enabled: true,
      options: {},
    },
  ];
}

/**
 * Get the generated API key for a tenant
 * Used to log the credential on first startup
 */
export function generateApiKey(): string {
  return randomBytes(32).toString('hex');
}
