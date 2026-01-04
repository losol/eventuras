import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import {
  generateDefaultTenantsConfig,
  generateDefaultChannelsConfig,
  generateDefaultPluginsConfig,
  generateApiKey,
} from './templates.js';

const CONFIG_DIR = join(process.cwd(), 'data', 'config');
const TENANTS_FILE = join(CONFIG_DIR, 'tenants.json');
const CHANNELS_FILE = join(CONFIG_DIR, 'channels.json');
const PLUGINS_FILE = join(CONFIG_DIR, 'plugins.json');

/**
 * Initialize configuration files if they don't exist
 * Creates default configs and logs generated credentials
 */
export function initializeConfigFiles(): {
  tenantsCreated: boolean;
  channelsCreated: boolean;
  pluginsCreated: boolean;
  defaultTenantId?: string;
  defaultApiKey?: string;
} {
  // Ensure config directory exists
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }

  let tenantsCreated = false;
  let channelsCreated = false;
  let pluginsCreated = false;
  let defaultTenantId: string | undefined;
  let defaultApiKey: string | undefined;

  // Create tenants.json if missing
  if (!existsSync(TENANTS_FILE)) {
    const tenantsConfig = generateDefaultTenantsConfig();
    writeFileSync(TENANTS_FILE, JSON.stringify(tenantsConfig, null, 2));
    tenantsCreated = true;
    if (tenantsConfig.length > 0 && tenantsConfig[0]) {
      defaultTenantId = tenantsConfig[0].id;
    }
    defaultApiKey = generateApiKey();
  }

  // Create channels.json if missing
  if (!existsSync(CHANNELS_FILE)) {
    const tenantsData = readFileSync(TENANTS_FILE, 'utf-8');
    const tenants = JSON.parse(tenantsData);
    const tenantId = tenants[0]?.id || defaultTenantId;

    if (!tenantId) {
      throw new Error(
        'Unable to determine tenant ID for channel configuration. ' +
        'Please ensure tenants.json contains at least one tenant.'
      );
    }

    const channelsConfig = generateDefaultChannelsConfig(tenantId);
    writeFileSync(CHANNELS_FILE, JSON.stringify(channelsConfig, null, 2));
    channelsCreated = true;
  }

  // Create plugins.json if missing
  if (!existsSync(PLUGINS_FILE)) {
    const pluginsConfig = generateDefaultPluginsConfig();
    writeFileSync(PLUGINS_FILE, JSON.stringify(pluginsConfig, null, 2));
    pluginsCreated = true;
  }

  return {
    tenantsCreated,
    channelsCreated,
    pluginsCreated,
    defaultTenantId,
    defaultApiKey,
  };
}

/**
 * Log initialization results with security warnings
 */
export function logInitializationResults(results: {
  tenantsCreated: boolean;
  channelsCreated: boolean;
  pluginsCreated: boolean;
  defaultTenantId?: string;
  defaultApiKey?: string;
}): void {
  if (
    !results.tenantsCreated &&
    !results.channelsCreated &&
    !results.pluginsCreated
  ) {
    return; // Nothing was created, skip logging
  }

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║         Conductor - Configuration Initialized             ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  if (results.tenantsCreated) {
    console.log('✅ Created data/config/tenants.json');
    if (results.defaultTenantId && results.defaultApiKey) {
      console.log(
        '\n🔐 Default tenant credentials generated:\n',
      );
      console.log(`   Tenant ID: ${results.defaultTenantId}`);
      console.log(
        `   API Key:   ${results.defaultApiKey}\n`,
      );
      console.log(
        '⚠️  SECURITY WARNING: These are auto-generated credentials!',
      );
      console.log('   Set the following environment variable for production:\n');
      console.log(
        `   TENANT_${results.defaultTenantId.toUpperCase().replace(/-/g, '_')}_AUTHKEY=${results.defaultApiKey}\n`,
      );
      console.log('   CHANGE THIS IN PRODUCTION!\n');
    }
  }

  if (results.channelsCreated) {
    console.log('✅ Created data/config/channels.json');
  }

  if (results.pluginsCreated) {
    console.log('✅ Created data/config/plugins.json');
  }

  console.log(
    '\n📋 Configuration files location: data/config/\n',
  );
}
