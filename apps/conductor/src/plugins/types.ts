import type { Logger } from '@eventuras/logger';

/**
 * Plugin context provides access to configuration and utilities
 */
export interface PluginContext {
  /**
   * Get an environment variable value for the current tenant
   */
  getEnvVar(varName: string): string | undefined;

  /**
   * Get a required environment variable (throws if missing)
   */
  getRequiredEnvVar(varName: string): string;

  /**
   * Logger instance with plugin-specific namespace
   */
  logger: Logger;

  /**
   * Tenant ID this plugin instance is associated with
   */
  tenantId: string;

  /**
   * Plugin options from configuration
   */
  options?: Record<string, unknown>;
}

/**
 * Message to send through a channel
 */
export interface ChannelMessage {
  message: string;
  priority: 'normal' | 'high';
  targetId?: string;
  tenantId: string;
  channelId?: string;
  notificationId: string;
}

/**
 * Response from sending a message
 */
export interface ChannelResponse {
  success: boolean;
  error?: string;
}

/**
 * Conductor Plugin Interface
 * All channel plugins must implement this interface
 */
export interface ConductorPlugin {
  /**
   * Plugin name (must match the plugin configuration name)
   */
  name: string;

  /**
   * Plugin version
   */
  version: string;

  /**
   * Initialize the plugin with context and configuration
   * Called once per tenant at startup
   */
  initialize(context: PluginContext): Promise<void>;

  /**
   * Send a notification through this channel
   */
  send(message: ChannelMessage): Promise<ChannelResponse>;

  /**
   * Shutdown the plugin gracefully
   * Called when the application is shutting down
   */
  shutdown?(): Promise<void>;

  /**
   * Health check (optional)
   * Returns true if the plugin is healthy and ready to send messages
   */
  healthCheck?(): Promise<boolean>;
}

/**
 * Factory function to create a plugin instance
 */
export type PluginFactory = () => ConductorPlugin;
