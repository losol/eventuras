import { Client, GatewayIntentBits, TextChannel } from 'discord.js';

/**
 * Discord bot client singleton
 * Manages a persistent connection to Discord
 */
class DiscordBotManager {
  private client: Client | null = null;
  private isReady: boolean = false;
  private readyPromise: Promise<void> | null = null;

  async initialize(): Promise<void> {
    if (this.isReady) {
      return;
    }

    if (this.readyPromise) {
      return this.readyPromise;
    }

    this.readyPromise = this.connect();
    return this.readyPromise;
  }

  private async connect(): Promise<void> {
    const token = process.env.DISCORD_BOT_TOKEN;

    if (!token) {
      throw new Error('DISCORD_BOT_TOKEN not configured');
    }

    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
      ],
    });

    return new Promise((resolve, reject) => {
      if (!this.client) {
        return reject(new Error('Client not initialized'));
      }

      this.client.once('ready', (client) => {
        console.log(`Discord bot logged in as ${client.user.tag}`);
        console.log(`Bot is in ${client.guilds.cache.size} server(s)`);
        this.isReady = true;
        resolve();
      });

      this.client.on('error', (error) => {
        console.error('Discord bot error:', error);
      });

      this.client.login(token).catch(reject);
    });
  }

  getClient(): Client {
    if (!this.client || !this.isReady) {
      throw new Error('Discord bot not initialized. Call initialize() first.');
    }
    return this.client;
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.destroy();
      this.client = null;
      this.isReady = false;
      this.readyPromise = null;
    }
  }
}

// Singleton instance
const discordBotManager = new DiscordBotManager();

/**
 * Send notification via Discord bot
 * Sends messages to a specific channel using the bot
 * @param message - Message to send
 * @param priority - Message priority (normal or high)
 * @param targetId - Optional target channel ID (overrides env var)
 */
export async function sendDiscordBotNotification(
  message: string,
  priority: string,
  targetId?: string
): Promise<void> {
  const targetChannelId = targetId || process.env.DISCORD_BOT_CHANNEL_ID;

  if (!targetChannelId) {
    throw new Error('Target ID must be provided either in request or as DISCORD_BOT_CHANNEL_ID env var');
  }

  // Ensure bot is initialized
  await discordBotManager.initialize();

  const client = discordBotManager.getClient();

  // Get the channel
  let channel;
  try {
    channel = await client.channels.fetch(targetChannelId);
  } catch (error: any) {
    if (error.code === 50001) {
      throw new Error(
        `Missing Access to channel ${targetChannelId}. ` +
        `Make sure the bot is invited to the server and has permission to view the channel. ` +
        `Bot must have "View Channels" and "Send Messages" permissions.`
      );
    }
    throw error;
  }

  if (!channel) {
    throw new Error(`Channel ${targetChannelId} not found`);
  }

  if (!(channel instanceof TextChannel)) {
    throw new Error(`Channel ${targetChannelId} is not a text channel`);
  }

  // Format message with priority indicator
  const content = priority === 'high' 
    ? `⚠️ **HIGH PRIORITY**\n${message}`
    : message;

  // Send message
  await channel.send(content);
}

/**
 * Initialize Discord bot on server startup
 */
export async function initializeDiscordBot(): Promise<void> {
  const token = process.env.DISCORD_BOT_TOKEN;
  
  if (!token) {
    console.log('DISCORD_BOT_TOKEN not configured - Discord bot disabled');
    return;
  }

  try {
    await discordBotManager.initialize();
    console.log('Discord bot initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Discord bot:', error);
    throw error;
  }
}

/**
 * Shutdown Discord bot gracefully
 */
export async function shutdownDiscordBot(): Promise<void> {
  await discordBotManager.disconnect();
  console.log('Discord bot disconnected');
}
