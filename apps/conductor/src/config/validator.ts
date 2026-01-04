import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import {
  tenantsConfigSchema,
  channelsConfigSchema,
  pluginsConfigSchema,
  type TenantsConfig,
  type ChannelsConfig,
  type PluginsConfig,
} from './schemas.js';

const CONFIG_DIR = join(process.cwd(), 'data', 'config');
const TENANTS_FILE = join(CONFIG_DIR, 'tenants.json');
const CHANNELS_FILE = join(CONFIG_DIR, 'channels.json');
const PLUGINS_FILE = join(CONFIG_DIR, 'plugins.json');

export interface ValidatedConfig {
  tenants: TenantsConfig;
  channels: ChannelsConfig;
  plugins: PluginsConfig;
}

/**
 * Load and validate all configuration files
 * @throws {Error} if config files are missing or invalid
 */
export function loadAndValidateConfig(): ValidatedConfig {
  // Check if files exist
  if (!existsSync(TENANTS_FILE)) {
    throw new Error(
      `Configuration file missing: ${TENANTS_FILE}\n` +
        'Run the application to auto-generate default configuration.',
    );
  }

  if (!existsSync(CHANNELS_FILE)) {
    throw new Error(
      `Configuration file missing: ${CHANNELS_FILE}\n` +
        'Run the application to auto-generate default configuration.',
    );
  }

  if (!existsSync(PLUGINS_FILE)) {
    throw new Error(
      `Configuration file missing: ${PLUGINS_FILE}\n` +
        'Run the application to auto-generate default configuration.',
    );
  }

  // Load and parse JSON files
  let tenantsData: unknown;
  let channelsData: unknown;
  let pluginsData: unknown;

  try {
    tenantsData = JSON.parse(readFileSync(TENANTS_FILE, 'utf-8'));
  } catch (error) {
    throw new Error(
      `Failed to parse ${TENANTS_FILE}: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }

  try {
    channelsData = JSON.parse(readFileSync(CHANNELS_FILE, 'utf-8'));
  } catch (error) {
    throw new Error(
      `Failed to parse ${CHANNELS_FILE}: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }

  try {
    pluginsData = JSON.parse(readFileSync(PLUGINS_FILE, 'utf-8'));
  } catch (error) {
    throw new Error(
      `Failed to parse ${PLUGINS_FILE}: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }

  // Validate with Zod schemas
  const tenantsResult = tenantsConfigSchema.safeParse(tenantsData);
  if (!tenantsResult.success) {
    throw new Error(
      `Invalid tenants configuration:\n${tenantsResult.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n')}`,
    );
  }

  const channelsResult = channelsConfigSchema.safeParse(channelsData);
  if (!channelsResult.success) {
    throw new Error(
      `Invalid channels configuration:\n${channelsResult.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n')}`,
    );
  }

  const pluginsResult = pluginsConfigSchema.safeParse(pluginsData);
  if (!pluginsResult.success) {
    throw new Error(
      `Invalid plugins configuration:\n${pluginsResult.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n')}`,
    );
  }

  return {
    tenants: tenantsResult.data,
    channels: channelsResult.data,
    plugins: pluginsResult.data,
  };
}

/**
 * Validate that all referenced environment variables exist
 * @throws {Error} if required environment variables are missing
 */
export function validateEnvironmentVariables(config: ValidatedConfig): void {
  const missing: string[] = [];

  // Check tenant auth keys
  for (const tenant of config.tenants) {
    if (!process.env[tenant.authKeyEnvVar]) {
      missing.push(
        `${tenant.authKeyEnvVar} (required for tenant: ${tenant.name})`,
      );
    }
  }

  // Check channel provider credentials
  for (const channel of config.channels) {
    if (channel.providerIdEnvVar && !process.env[channel.providerIdEnvVar]) {
      missing.push(
        `${channel.providerIdEnvVar} (required for ${channel.channelType} channel)`,
      );
    }
    if (
      channel.providerSecretEnvVar &&
      !process.env[channel.providerSecretEnvVar]
    ) {
      missing.push(
        `${channel.providerSecretEnvVar} (required for ${channel.channelType} channel)`,
      );
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.map((v) => `  ❌ ${v}`).join('\n')}\n\n` +
        'Please set these variables in your .env file or environment.',
    );
  }
}

/**
 * Log startup configuration status
 */
export function logStartupConfig(config: ValidatedConfig): void {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║           Conductor - Startup Configuration               ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  console.log(`📋 Tenants: ${config.tenants.length}`);
  for (const tenant of config.tenants) {
    const hasKey = !!process.env[tenant.authKeyEnvVar];
    console.log(
      `   ${hasKey ? '✅' : '❌'} ${tenant.name} (${tenant.id})`,
    );
  }

  console.log(`\n🔌 Channels: ${config.channels.length}`);
  for (const channel of config.channels) {
    const tenant = config.tenants.find((t) => t.id === channel.tenantId);
    console.log(`   - ${channel.channelType} for ${tenant?.name || 'unknown'}`);
  }

  console.log(`\n🔧 Plugins: ${config.plugins.length}`);
  for (const plugin of config.plugins) {
    console.log(
      `   ${plugin.enabled ? '✅' : '⏸️ '} ${plugin.name}`,
    );
  }

  console.log('\n');
}
