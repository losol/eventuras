import { z } from 'zod';

/**
 * Tenant Schema
 * Represents a tenant with authentication configuration
 */
export const tenantSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  authKeyEnvVar: z.string().min(1),
});

export const tenantsConfigSchema = z.array(tenantSchema);

export type Tenant = z.infer<typeof tenantSchema>;
export type TenantsConfig = z.infer<typeof tenantsConfigSchema>;

/**
 * Channel Configuration Schema
 * Represents a channel instance for a specific tenant
 */
export const channelConfigSchema = z.object({
  channelId: z.string().uuid(),
  channelName: z.string().optional(),
  tenantId: z.string().uuid(),
  channelType: z.enum(['discord', 'discord-bot', 'discord-webhook', 'log']),
  providerIdEnvVar: z.string().optional(),
  providerSecretEnvVar: z.string().optional(),
});

export const channelsConfigSchema = z.array(channelConfigSchema);

export type ChannelConfig = z.infer<typeof channelConfigSchema>;
export type ChannelsConfig = z.infer<typeof channelsConfigSchema>;

/**
 * Plugin Configuration Schema
 * Defines which plugins are enabled and their options
 */
export const pluginConfigSchema = z.object({
  name: z.string().min(1),
  enabled: z.boolean().default(true),
  options: z.record(z.string(), z.unknown()).optional(),
});

export const pluginsConfigSchema = z.array(pluginConfigSchema);

export type PluginConfig = z.infer<typeof pluginConfigSchema>;
export type PluginsConfig = z.infer<typeof pluginsConfigSchema>;
