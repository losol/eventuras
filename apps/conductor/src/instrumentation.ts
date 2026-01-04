import { createLogger } from './utils/logger.js';
import {
  initializeConfigFiles,
  logInitializationResults,
} from './config/initializer.js';
import {
  loadAndValidateConfig,
  validateEnvironmentVariables,
  logStartupConfig,
} from './config/validator.js';
import { PluginRegistry } from './plugins/registry.js';

const logger = createLogger('conductor:core');

let registry: PluginRegistry | null = null;

/**
 * Initialize Conductor application
 * Called once at startup
 */
export async function register() {
  // Skip in Next.js edge runtime
  const runtime = process.env['NEXT_RUNTIME'];
  if (runtime !== 'nodejs' && runtime !== undefined) {
    return;
  }

  try {
    logger.info('Starting Conductor initialization');

    // Step 1: Initialize config files if they don't exist
    const initResults = initializeConfigFiles();
    logInitializationResults(initResults);

    // Step 2: Load and validate configuration
    const config = loadAndValidateConfig();

    // Step 3: Validate environment variables
    validateEnvironmentVariables(config);

    // Step 4: Log startup configuration
    logStartupConfig(config);

    // Step 5: Initialize plugin registry
    registry = new PluginRegistry();
    await registry.initialize(config);

    logger.info('Conductor initialization complete');
  } catch (error) {
    logger.error({ error }, 'Failed to initialize Conductor');
    console.error('\n❌ Initialization failed:', error);
    process.exit(1);
  }
}

/**
 * Get the plugin registry instance
 */
export function getPluginRegistry(): PluginRegistry {
  if (!registry) {
    throw new Error('Plugin registry not initialized. Call register() first.');
  }
  return registry;
}

/**
 * Shutdown handler
 */
export async function shutdown(): Promise<void> {
  if (registry) {
    await registry.shutdown();
  }
}
