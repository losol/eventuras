# @eventuras/conductor

Messaging orchestration server with multi-tenant plugin architecture - send messages from Homey, Home Assistant, or any HTTP client to Discord, Matrix/Element, or WhatsApp.

## Overview

Conductor is a flexible messaging gateway with a plugin-based architecture that lets you route notifications from smart home systems and other sources to various communication channels.

### Key Features

- 🔌 **Plugin Architecture** - Extensible channel system with easy-to-add plugins
- 👥 **Multi-Tenant** - Support multiple tenants with isolated configurations
- 🔐 **Secure** - Per-tenant API key authentication
- 📝 **Auto-Configuration** - Generates default config files on first run
- 🐳 **Docker Ready** - Persistent config storage via volume mounts

### Supported Sources

- 🏠 **Homey** - via webhook or HTTP requests
- 🏡 **Home Assistant** - via REST command or automations
- 🌐 **Any HTTP Client** - standard REST API

### Available Plugins

- 🤖 **Discord Bot** (`discord`) - Persistent bot connection (channel type: `discord-bot`)

#### Planned Plugins

- 💬 **Discord Webhook** - Simple webhook-based notifications
- 🔐 **Matrix/Element** - Matrix client API integration
- 📱 **WhatsApp** - WhatsApp Business API integration

## Quick Start

### Installation

```bash
pnpm install
```

### First Run

Start the server for the first time:

```bash
pnpm dev
```

Conductor will automatically:

1. Create `/data/config/` directory
2. Generate default configuration files:
   - `tenants.json` - Tenant definitions with UUIDs
   - `channels.json` - Channel configurations per tenant
   - `plugins.json` - Plugin enable/disable settings
3. Generate a random API key for the default tenant
4. Display the generated credentials in the console

**Important:** Copy the generated API key from the console output and add it to your `.env` file:

```env
# Replace the UUID and key with your actual values from console output
TENANT_01943c2a_7c3e_7000_8000_123456789abc_AUTHKEY=a1b2c3d4e5f6...
```

### Configuration Files

All configuration is stored in `/data/config/` (auto-generated on first run):

#### `tenants.json`

Defines available tenants:

```json
{
  "tenants": [
    {
      "id": "01943c2a-7c3e-7000-8000-123456789abc",
      "name": "Default Tenant",
      "authKeyEnvVar": "TENANT_01943c2a_7c3e_7000_8000_123456789abc_AUTHKEY"
    }
  ]
}
```

#### `channels.json`

Maps tenants to channel types and their credentials:

```json
[
  {
    "channelId": "550e8400-e29b-41d4-a716-446655440000",
    "channelName": "alerts",
    "tenantId": "01943c2a-7c3e-7000-8000-123456789abc",
    "channelType": "discord-bot",
    "providerIdEnvVar": "TENANT_01943c2a_7c3e_7000_8000_123456789abc_DISCORD_ALERTS_CHANNEL_ID",
    "providerSecretEnvVar": "TENANT_01943c2a_7c3e_7000_8000_123456789abc_DISCORD_ALERTS_BOT_TOKEN"
  },
    {

}
```

#### `plugins.json`

Control which plugins are loaded:

```json
{
  "plugins": [
    {
      "name": "discord",
      "enabled": true,
      "options": {
        "reconnectAttempts": 3
      }
    },
    {
      "name": "log",
      "enabled": true
    }
  ]
}
```

### Environment Variables

See `.env.example` for a complete template. Key variables:

```env
PORT=3333
NODE_ENV=development

# Tenant API Key (from console output on first run)
TENANT_01943c2a_7c3e_7000_8000_123456789abc_AUTHKEY=your-secure-api-key-here

# Discord Bot Configuration (optional)
TENANT_01943c2a_7c3e_7000_8000_123456789abc_DISCORD_BOT_TOKEN=your-discord-bot-token
TENANT_01943c2a_7c3e_7000_8000_123456789abc_DISCORD_CHANNEL_ID=123456789012345678
```

### Setting up Discord Webhook

1. Open Discord and go to the channel where you want to receive notifications
2. Click the gear icon (⚙️) next to the channel name → **Integrations**
3. Click **Webhooks** → **New Webhook**
4. Give it a name (e.g., "Domus") and optionally customize the avatar
5. Click **Copy Webhook URL**
6. Paste the URL into your `.env` file as `DISCORD_WEBHOOK_URL`

The webhook URL looks like:

```text
https://discord.com/api/webhooks/1234567890/AbCdEfGhIjKlMnOpQrStUvWxYz
```

### Setting up Discord Bot

For more control and features, you can use a Discord Bot instead of webhooks:

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **New Application** and give it a name (e.g., "Domus Bot")
3. Go to the **Bot** section in the left menu
4. Click **Add Bot** (or **Reset Token** if it already exists)
5. Click **Copy Token** and save it as `DISCORD_BOT_TOKEN` in your `.env` file
6. Under **Privileged Gateway Intents**, enable:
   - ✅ **Presence Intent**
   - ✅ **Server Members Intent**
   - ✅ **Message Content Intent**
7. Go to **OAuth2** → **URL Generator**
8. Select scopes:
   - ✅ `bot`
9. Select bot permissions:
   - ✅ `View Channels`
   - ✅ `Send Messages`
   - ✅ `Read Message History` (optional, for future features)
10. Copy the generated URL and open it in your browser to invite the bot to your server
    - Select the server where you want to add the bot
    - Click **Authorize** and complete the CAPTCHA if prompted
11. Get the Channel ID:
    - In Discord, enable Developer Mode: **Settings** → **Advanced** → **Developer Mode**
    - Right-click the channel where you want to receive notifications
    - Click **Copy Channel ID**
    - You can either:
      - Set it as `DISCORD_BOT_CHANNEL_ID` in `.env` for a default channel
      - Or specify it per request in the `targetId` field (see API examples below)
12. Verify bot permissions:
    - Right-click the channel → **Edit Channel** → **Permissions**
    - Make sure the bot (or @everyone) has:
      - ✅ **View Channel**
      - ✅ **Send Messages**
    - If not, add the bot role and grant these permissions

The bot will automatically connect when you start the server.

**Note:** You can invite the bot to multiple servers and channels. Just specify the `targetId` in each request to send to different locations!

## Usage

### Start the server

```bash
npm run dev
```

### Expose to public internet (for Homey/remote access)

Install Cloudflare Tunnel:

```bash
brew install cloudflare/cloudflare/cloudflared
```

#### Option 1: Named Tunnel (Recommended for production)

1. Login to Cloudflare:

   ```bash
   cloudflared tunnel login
   ```

2. Create a named tunnel:

   ```bash
   cloudflared tunnel create domus
   ```

3. Configure the tunnel - create `~/.cloudflared/config.yml`:

   ```yaml
   tunnel: <TUNNEL-ID>
   credentials-file: /Users/YOUR_USERNAME/.cloudflared/<TUNNEL-ID>.json
   
   ingress:
     - hostname: domus.yourdomain.com
       service: http://localhost:3333
     - service: http_status:404
   ```

4. Add a DNS record (or do this in Cloudflare dashboard):

   ```bash
   cloudflared tunnel route dns domus domus.yourdomain.com
   ```

5. Run the tunnel:

   ```bash
   cloudflared tunnel run domus
   ```

Your server will be available at `https://domus.yourdomain.com`

#### Option 2: Quick Tunnel (Testing only)

For quick testing without setup:

```bash
cloudflared tunnel --url http://localhost:3333
```

This gives you a temporary URL like `https://abc-123-def.trycloudflare.com` that changes each time.

### Send notification from Homey

Create a Flow in Homey with "Make a web request":

- URL: `https://your-cloudflare-url.trycloudflare.com/notifications`
- Method: `POST`
- Headers: `Authorization: Bearer YOUR_API_KEY`
- Body:

```json
{
  "channel": "discord-bot",
  "channelId": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Motion detected in living room",
  "targetId": "1234567890123456789"
}
```

**Note:** The `targetId` field is optional if you've set `DISCORD_BOT_CHANNEL_ID` in your `.env` file.

### Send notification from Home Assistant

In `configuration.yaml`:

```yaml
rest_command:
  send_domus_notification:
    url: https://your-cloudflare-url.trycloudflare.com/notifications
    method: POST
    content_type: application/json
    headers:
      authorization: 'Bearer YOUR_API_KEY'
    payload: '{"channel": "{{ channel }}", "channelId": "{{ channel_id }}", "message": "{{ message }}", "targetId": "{{ target_id }}"}'
```

In an automation:

```yaml
action:
  - service: rest_command.send_domus_notification
    data:
      channel: "discord-bot"
      message: "Door opened"
      target_id: "1234567890123456789"
```

## API Reference

### Authentication

All requests require Bearer token authentication:

```bash
Authorization: Bearer <your-tenant-api-key>
```

The API key must match the value in the environment variable specified by `authKeyEnvVar` for the tenant.

### Endpoints

#### `GET /health`

Health check endpoint (no authentication required).

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### `POST /notifications`

Send a notification through a configured channel.

**Headers:**

```
Content-Type: application/json
Authorization: Bearer <your-tenant-api-key>
```

**Body:**

```json
{
  "channel": "discord-bot",
  "channelId": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Your message here",
  "priority": "normal|high",
  "targetId": "optional-channel-id"
}
```

**Fields:**

- `channel` (required): Channel type to send through (must be configured for your tenant)
- `channelId` (optional): Specific channel UUID to route to (if omitted, uses first matching channel type)
- `message` (required): Message content (non-empty string)
- `priority` (optional): Message priority, defaults to "normal"
- `targetId` (optional): Target-specific identifier (e.g., Discord channel ID)

**Response (Success):**

```json
{
  "success": true,
  "id": "01943c2a-7c3e-7000-8000-123456789abc",
  "tenantId": "01943c2a-7c3e-7000-8000-123456789abc",
  "tenantName": "Default Tenant",
  "channel": "discord-bot",
  "channelId": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Test notification",
  "priority": "normal",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Response (Error):**

```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "channel",
      "message": "Channel must be one of: discord-bot"
    }
  ]
}
```

### Examples

#### Send to Discord Bot (Default Channel)

```bash
curl -X POST https://your-server.com/notifications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key" \
  -d '{
    "channel": "discord-bot",
    "message": "Server is online",
    "priority": "normal"
  }'
```

#### Send to Specific Discord Channel

```bash
curl -X POST https://your-server.com/notifications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key" \
  -d '{
    "channel": "discord-bot",
    "message": "Critical alert!",
    "priority": "high",
    "targetId": "1234567890123456789"
  }'
```

#### Send to Log Channel

```bash
curl -X POST https://your-server.com/notifications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key" \
  -d '{
    "channel": "log",
    "message": "Debug message",
    "priority": "normal"
  }'
```

## Plugin Development

### Creating a New Plugin

Plugins are defined inline in `src/plugins/`. To create a new plugin:

1. **Create the plugin file** (`src/plugins/my-plugin.ts`):

```typescript
import { ConductorPlugin, PluginContext, ChannelMessage, ChannelResponse } from './types.js';

export function createMyPlugin(): ConductorPlugin {
  let connection: any;

  return {
    async initialize(context: PluginContext): Promise<void> {
      const apiKey = context.getEnvVar('API_KEY');
      
      context.logger.info(
        { tenantId: context.tenantId },
        'Initializing my-plugin'
      );

      // Set up connections, clients, etc.
      connection = await connectToService(apiKey);
    },

    async send(message: ChannelMessage): Promise<ChannelResponse> {
      try {
        await connection.sendMessage(message.message);
        
        return {
          success: true,
          messageId: message.notificationId,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    },

    async healthCheck(): Promise<boolean> {
      return connection?.isConnected() ?? false;
    },

    async shutdown(): Promise<void> {
      await connection?.disconnect();
    },
  };
}
```

2. **Register in the plugin registry** (`src/plugins/registry.ts`):

```typescript
const PLUGIN_FACTORIES: Record<string, () => Promise<PluginFactory>> = {
  discord: async () => (await import('./discord.js')).createDiscordPlugin,
  log: async () => (await import('./log.js')).createLogPlugin,
  'my-plugin': async () => (await import('./my-plugin.js')).createMyPlugin, // Add here
};
```

3. **Enable in config** (`data/config/plugins.json`):

```json
{
  "plugins": [
    {
      "name": "my-plugin",
      "enabled": true,
      "options": {
        "customOption": "value"
      }
    }
  ]
}
```

4. **Configure for tenant** (`data/config/channels.json`):

```json
{
  "channels": [
    {
      "tenantId": "your-tenant-id",
      "channelType": "my-plugin",
      "providerSecretEnvVar": "TENANT_xxx_MY_PLUGIN_API_KEY"
    }
  ]
}
```

### Plugin Interface

All plugins must implement the `ConductorPlugin` interface:

```typescript
interface ConductorPlugin {
  /**
   * Initialize the plugin with context
   * Called once per tenant when the registry initializes
   */
  initialize(context: PluginContext): Promise<void>;

  /**
   * Send a message through this channel
   * Called for each notification request
   */
  send(message: ChannelMessage): Promise<ChannelResponse>;

  /**
   * Check if the plugin is healthy and ready
   * Optional: Used for health monitoring
   */
  healthCheck?(): Promise<boolean>;

  /**
   * Clean up resources before shutdown
   * Optional: Called during graceful shutdown
   */
  shutdown?(): Promise<void>;
}
```

### Plugin Context

The `PluginContext` provides access to configuration and utilities:

```typescript
interface PluginContext {
  /** Retrieve environment variable value (with validation) */
  getEnvVar(key: string): string;
  
  /** Logger instance with plugin namespace */
  logger: Logger;
  
  /** Tenant ID this plugin instance serves */
  tenantId: string;
  
  /** Plugin-specific options from plugins.json */
  options?: Record<string, any>;
}
```

### Best Practices

- **Use structured logging**: Always use `context.logger` instead of `console.log`
- **Handle errors gracefully**: Return `{ success: false, error: message }` instead of throwing
- **Validate environment variables**: Use `context.getEnvVar()` for required secrets
- **Implement health checks**: Optional but recommended for monitoring
- **Clean up resources**: Implement `shutdown()` for persistent connections
- **Per-tenant isolation**: Each plugin instance is unique per tenant

## License

GPL-3.0-or-later
