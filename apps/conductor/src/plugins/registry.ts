import { Logger } from '@eventuras/logger';
import type { ValidatedConfig } from '../config/validator.js';
import type {
  ConductorPlugin,
  PluginFactory,
  PluginContext,
  ChannelMessage,
  ChannelResponse,
} from './types.js';

const logger = Logger.create({ namespace: 'conductor:core:registry' });

// Hardcoded plugin mapping
// Import plugins here as they are created
const PLUGIN_FACTORIES: Record<string, () => Promise<PluginFactory>> = {
  discord: async () => (await import('./discord/index.js')).createDiscordPlugin,
};

/**
 * Plugin instance with its context
 */
interface PluginInstance {
  plugin: ConductorPlugin;
  context: PluginContext;
}

/**
 * Plugin Registry
 * Manages loading, initialization, and routing of plugins
 */
export class PluginRegistry {
  private plugins: Map<string, PluginInstance> = new Map();
  private channelMap: Map<string, Map<string, string>> = new Map(); // tenantId:channelId -> channelType:pluginName

  constructor() {
    // Registry logger is the module-level logger
  }

  /**
   * Initialize all enabled plugins from configuration
   */
  async initialize(config: ValidatedConfig): Promise<void> {
    logger.info('Initializing plugin registry');

    // Get enabled plugins
    const enabledPlugins = config.plugins.filter((p) => p.enabled);

    if (enabledPlugins.length === 0) {
      logger.warn('No plugins enabled in configuration');
      return;
    }

    // Build channel map first
    for (const channel of config.channels) {
      const channelKey = `${channel.tenantId}:${channel.channelId}`;
      if (!this.channelMap.has(channelKey)) {
        this.channelMap.set(channelKey, new Map());
      }
      const channelRouting = this.channelMap.get(channelKey)!;

      // Map channel type to plugin name (they're the same for now)
      const pluginName = channel.channelType;
      channelRouting.set(channel.channelType, pluginName);
    }

    // Load and initialize each enabled plugin
    for (const pluginConfig of enabledPlugins) {
      const { name, options } = pluginConfig;

      // Check if plugin factory exists
      if (!PLUGIN_FACTORIES[name]) {
        logger.warn(
          { pluginName: name },
          `Plugin "${name}" not found in registry, skipping`,
        );
        continue;
      }

      try {
        // Dynamically import the plugin factory
        const factoryLoader = PLUGIN_FACTORIES[name];
        const factory = await factoryLoader();

        // Create plugin context for each channel that uses this plugin
        for (const channelKey of this.channelMap.keys()) {
          const parts = channelKey.split(':');
          const tenantId = parts[0];
          const channelId = parts[1];

          if (!tenantId || !channelId) {
            logger.warn({ channelKey }, 'Invalid channel key format');
            continue;
          }

          const channelRouting = this.channelMap.get(channelKey)!;

          for (const [channelType, pluginName] of channelRouting.entries()) {
            if (pluginName === name) {
              // Create a NEW plugin instance for each channel to ensure isolation
              const plugin = factory();

              // Find channel config for this tenant and channel
              const channelConfig = config.channels.find(
                (c) =>
                  c.tenantId === tenantId &&
                  c.channelId === channelId &&
                  c.channelType === channelType,
              );

              const context: PluginContext & {
                providerIdEnvVar?: string;
                providerSecretEnvVar?: string;
              } = {
                tenantId,
                options,
                logger: Logger.create({ namespace: `conductor:plugin:${name}` }),
                getEnvVar: (varName: string) => process.env[varName],
                getRequiredEnvVar: (varName: string) => {
                  const value = process.env[varName];
                  if (!value) {
                    throw new Error(
                      `Required environment variable "${varName}" not set for plugin "${name}" (tenant: ${tenantId})`,
                    );
                  }
                  return value;
                },
              };

              // Store channel config env vars in context for the plugin to access
              if (channelConfig) {
                if (channelConfig.providerIdEnvVar) {
                  context.providerIdEnvVar = channelConfig.providerIdEnvVar;
                }
                if (channelConfig.providerSecretEnvVar) {
                  context.providerSecretEnvVar = channelConfig.providerSecretEnvVar;
                }
              }

              // Initialize plugin
              await plugin.initialize(context);

              // Store plugin instance with unique key (includes channelId now)
              const instanceKey = `${name}:${tenantId}:${channelId}`;
              this.plugins.set(instanceKey, { plugin, context });

              logger.info(
                { pluginName: name, tenantId, channelId },
                `Plugin initialized for channel`,
              );
            }
          }
        }
      } catch (error) {
        logger.error(
          { error, pluginName: name },
          `Failed to initialize plugin "${name}"`,
        );
        throw error;
      }
    }

    logger.info(
      { pluginCount: this.plugins.size },
      'Plugin registry initialized',
    );
  }

  /**
   * Send a message through a channel
   */
  async send(
    tenantId: string,
    channelType: string,
    message: ChannelMessage,
  ): Promise<ChannelResponse> {
    // If channelId is provided in message, use it for exact routing
    if (message.channelId) {
      const channelKey = `${tenantId}:${message.channelId}`;
      const channelRouting = this.channelMap.get(channelKey);

      if (!channelRouting) {
        return {
          success: false,
          error: `Channel ${message.channelId} not configured for tenant: ${tenantId}`,
        };
      }

      const pluginName = channelRouting.get(channelType);
      if (!pluginName) {
        return {
          success: false,
          error: `Channel type "${channelType}" not configured for channel ${message.channelId}`,
        };
      }

      const instanceKey = `${pluginName}:${tenantId}:${message.channelId}`;
      const instance = this.plugins.get(instanceKey);

      if (!instance) {
        return {
          success: false,
          error: `Plugin "${pluginName}" not initialized for channel`,
        };
      }

      try {
        return await instance.plugin.send(message);
      } catch (error) {
        logger.error(
          { error, pluginName, tenantId, channelId: message.channelId, channelType },
          'Error sending message through plugin',
        );
        return {
          success: false,
          error:
            error instanceof Error ? error.message : 'Unknown error occurred',
        };
      }
    }

    // Fallback: No channelId provided, route to first matching channel type for tenant
    for (const [channelKey, channelRouting] of this.channelMap.entries()) {
      const [keyTenantId] = channelKey.split(':');

      if (keyTenantId !== tenantId) continue;

      const pluginName = channelRouting.get(channelType);
      if (pluginName) {
        const instanceKey = `${pluginName}:${channelKey}`;
        const instance = this.plugins.get(instanceKey);

        if (instance) {
          try {
            return await instance.plugin.send(message);
          } catch (error) {
            logger.error(
              { error, pluginName, tenantId, channelType },
              'Error sending message through plugin',
            );
            return {
              success: false,
              error:
                error instanceof Error
                  ? error.message
                  : 'Unknown error occurred',
            };
          }
        }
      }
    }

    return {
      success: false,
      error: `No channels of type "${channelType}" configured for tenant: ${tenantId}`,
    };
  }

  /**
   * Get list of available channels for a tenant
   */
  getAvailableChannels(tenantId: string): string[] {
    const channels: string[] = [];
    for (const [channelKey, channelRouting] of this.channelMap.entries()) {
      const [keyTenantId] = channelKey.split(':');
      if (keyTenantId === tenantId) {
        for (const channelType of channelRouting.keys()) {
          if (!channels.includes(channelType)) {
            channels.push(channelType);
          }
        }
      }
    }
    return channels;
  }

  /**
   * Get all available channel types across all tenants
   */
  getAllChannelTypes(): string[] {
    const types = new Set<string>();
    for (const channelRouting of this.channelMap.values()) {
      for (const channelType of channelRouting.keys()) {
        types.add(channelType);
      }
    }
    return Array.from(types);
  }

  /**
   * Shutdown all plugins gracefully
   */
  async shutdown(): Promise<void> {
    logger.info('Shutting down plugin registry');

    for (const [key, instance] of this.plugins.entries()) {
      if (instance.plugin.shutdown) {
        try {
          await instance.plugin.shutdown();
          logger.info({ instanceKey: key }, 'Plugin shut down');
        } catch (error) {
          logger.error(
            { error, instanceKey: key },
            'Error shutting down plugin',
          );
        }
      }
    }

    this.plugins.clear();
    this.channelMap.clear();
  }
}
