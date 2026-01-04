import { Client, GatewayIntentBits, TextChannel } from 'discord.js';
import type {
  ConductorPlugin,
  PluginContext,
  ChannelMessage,
  ChannelResponse,
  PluginFactory,
} from '../types.js';

/**
 * Discord Bot Plugin
 * Manages a persistent Discord bot connection and sends messages to channels
 */
class DiscordPlugin implements ConductorPlugin {
  name = 'discord';
  version = '1.0.0';

  private context!: PluginContext;
  private client: Client | null = null;
  private isReady: boolean = false;
  private readyPromise: Promise<void> | null = null;
  private botToken!: string;
  private defaultChannelId?: string;

  async initialize(
    context: PluginContext & {
      providerSecretEnvVar?: string;
      providerIdEnvVar?: string;
    },
  ): Promise<void> {
    this.context = context;

    // Get bot token from environment variable
    const tokenEnvVar = context.providerSecretEnvVar;
    if (!tokenEnvVar) {
      throw new Error('Discord bot requires providerSecretEnvVar in channel config');
    }

    this.botToken = context.getRequiredEnvVar(tokenEnvVar);

    // Get default channel ID if provided
    const channelIdEnvVar = context.providerIdEnvVar;
    if (channelIdEnvVar) {
      this.defaultChannelId = context.getEnvVar(channelIdEnvVar);
    }

    // Initialize the bot connection
    await this.connect();

    this.context.logger.info(
      { tenantId: context.tenantId },
      'Discord bot plugin initialized',
    );
  }

  private async connect(): Promise<void> {
    if (this.isReady) {
      return;
    }

    if (this.readyPromise) {
      return this.readyPromise;
    }

    this.readyPromise = this.createConnection();
    return this.readyPromise;
  }

  private async createConnection(): Promise<void> {
    this.client = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
    });

    return new Promise((resolve, reject) => {
      if (!this.client) {
        return reject(new Error('Client not initialized'));
      }

      this.client.once('ready', (client) => {
        this.context.logger.info(
          {
            botTag: client.user.tag,
            guildCount: client.guilds.cache.size,
          },
          'Discord bot logged in',
        );
        this.isReady = true;
        resolve();
      });

      this.client.on('error', (error) => {
        this.context.logger.error({ error }, 'Discord bot error');
      });

      this.client.login(this.botToken).catch(reject);
    });
  }

  async send(message: ChannelMessage): Promise<ChannelResponse> {
    const targetChannelId = message.targetId || this.defaultChannelId;

    if (!targetChannelId) {
      return {
        success: false,
        error:
          'Target channel ID must be provided either in message or configured as default',
      };
    }

    if (!this.client || !this.isReady) {
      return {
        success: false,
        error: 'Discord bot not ready',
      };
    }

    try {
      // Get the channel
      let channel;
      try {
        channel = await this.client.channels.fetch(targetChannelId);
      } catch (error) {
        if (error instanceof Error && 'code' in error && error.code === 50001) {
          return {
            success: false,
            error: `Missing access to channel ${targetChannelId}. Ensure bot has "View Channels" and "Send Messages" permissions.`,
          };
        }
        throw error;
      }

      if (!channel) {
        return {
          success: false,
          error: `Channel ${targetChannelId} not found`,
        };
      }

      if (!(channel instanceof TextChannel)) {
        return {
          success: false,
          error: `Channel ${targetChannelId} is not a text channel`,
        };
      }

      // Format message with priority indicator
      const content =
        message.priority === 'high'
          ? `⚠️ **HIGH PRIORITY**\n${message.message}`
          : message.message;

      // Send message
      await channel.send(content);

      this.context.logger.info(
        {
          channelId: targetChannelId,
          notificationId: message.notificationId,
          priority: message.priority,
        },
        'Message sent to Discord',
      );

      return { success: true };
    } catch (error) {
      this.context.logger.error(
        { error, targetChannelId },
        'Error sending message to Discord',
      );
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async shutdown(): Promise<void> {
    if (this.client) {
      await this.client.destroy();
      this.client = null;
      this.isReady = false;
      this.readyPromise = null;
      this.context.logger.info('Discord bot disconnected');
    }
  }

  async healthCheck(): Promise<boolean> {
    return this.isReady && this.client !== null;
  }
}

/**
 * Factory function to create Discord plugin instance
 */
export const createDiscordPlugin: PluginFactory = () => new DiscordPlugin();
