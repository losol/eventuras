# Discord Bot Channel Plugin

A persistent Discord bot integration for sending notifications to Discord channels.

## Overview

The Discord plugin maintains a persistent bot connection to Discord, allowing you to send formatted notifications to specific channels. It's ideal for:

- Real-time alerts and notifications
- Smart home automation updates
- Server monitoring alerts
- Team notifications

## Features

- ✅ **Persistent connection** - Single bot instance per tenant
- ✅ **Channel targeting** - Send to specific channels via `targetId`
- ✅ **Priority indicators** - Visual priority levels (ℹ️ normal, ⚠️ high)
- ✅ **Formatted messages** - Clean, readable message formatting
- ✅ **Error handling** - Graceful handling of missing permissions
- ✅ **Health checks** - Monitor bot connection status

## Configuration

### 1. Create Discord Bot

Follow the [Discord Bot Setup Guide](../../README.md#setting-up-discord-bot) in the main README to:

1. Create a Discord application
2. Generate a bot token
3. Enable required intents
4. Invite bot to your server
5. Get channel IDs

### 2. Enable in `plugins.json`

```json
{
  "plugins": [
    {
      "name": "discord",
      "enabled": true,
      "options": {
        "reconnectAttempts": 3
      }
    }
  ]
}
```

### 3. Configure Channel

Add to `channels.json`:

```json
{
  "channels": [
    {
      "tenantId": "01943c2a-7c3e-7000-8000-123456789abc",
      "channelType": "discord",
      "providerSecretEnvVar": "TENANT_01943c2a_7c3e_7000_8000_123456789abc_DISCORD_BOT_TOKEN",
      "providerIdEnvVar": "TENANT_01943c2a_7c3e_7000_8000_123456789abc_DISCORD_CHANNEL_ID"
    }
  ]
}
```

### 4. Set Environment Variables

```env
# Required: Discord bot token
TENANT_01943c2a_7c3e_7000_8000_123456789abc_DISCORD_BOT_TOKEN=MTIzNDU2Nzg5MDEyMzQ1Njc4OTAuAbCdEf.GhIjKlMnOpQrStUvWxYz

# Optional: Default channel ID (can be overridden per request)
TENANT_01943c2a_7c3e_7000_8000_123456789abc_DISCORD_CHANNEL_ID=1234567890123456789
```

## Usage

### Send to Default Channel

```bash
curl -X POST http://localhost:3333/notifications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key" \
  -d '{
    "channel": "discord-bot",
    "message": "Server is online",
    "priority": "normal"
  }'
```

### Send to Specific Channel

```bash
curl -X POST http://localhost:3333/notifications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key" \
  -d '{
    "channel": "discord-bot",
    "message": "Critical alert!",
    "priority": "high",
    "targetId": "9876543210987654321"
  }'
```

## Message Format

### Normal Priority

```
ℹ️ [2024-01-04 10:30:00] Tenant: Default Tenant | ID: 01943c2a...
Server is online
```

### High Priority

```
⚠️ [2024-01-04 10:30:00] Tenant: Default Tenant | ID: 01943c2a...
Critical alert!
```

## Plugin Options

Available options in `plugins.json`:

```json
{
  "name": "discord",
  "enabled": true,
  "options": {
    "reconnectAttempts": 3,     // Number of reconnection attempts (future)
    "timeoutMs": 5000,           // Request timeout in milliseconds (future)
    "includeTimestamp": true,    // Include timestamp in messages (future)
    "includeTenantName": true    // Include tenant name in messages (future)
  }
}
```

Currently, options are defined but not all are implemented. The plugin uses defaults.

## Error Handling

### Missing Permissions

If the bot lacks permissions to view or send messages in a channel:

```json
{
  "success": false,
  "error": "Missing access to channel 1234567890. Ensure bot has 'View Channels' and 'Send Messages' permissions."
}
```

### Invalid Channel ID

If the channel doesn't exist:

```json
{
  "success": false,
  "error": "Channel not found or is not a text channel"
}
```

### Bot Not Ready

If the bot hasn't connected yet:

```json
{
  "success": false,
  "error": "Discord bot not ready"
}
```

## Implementation Details

- **Type**: Persistent connection
- **Dependencies**: `discord.js` ^14.24.2
- **State**: Maintains Client instance per tenant
- **Health Check**: Returns `client.isReady()`
- **Shutdown**: Destroys client connection

### Connection Lifecycle

1. **Initialization**: Creates Discord.Client and connects with bot token
2. **Ready Event**: Bot becomes available after successful login
3. **Message Sending**: Fetches channel and sends formatted message
4. **Shutdown**: Gracefully destroys client connection

### Per-Tenant Isolation

Each tenant gets its own Discord bot instance:

```typescript
instanceKey: `discord:${tenantId}`
```

This allows:
- Different bot tokens per tenant
- Isolated connection state
- Independent error handling

## Required Discord Permissions

The bot needs these permissions in target channels:

- ✅ **View Channels** - Required to access the channel
- ✅ **Send Messages** - Required to post notifications

Optional permissions for enhanced functionality:

- **Embed Links** - For rich message formatting (future)
- **Attach Files** - For sending attachments (future)
- **Add Reactions** - For interactive messages (future)

## Troubleshooting

### Bot Not Connecting

Check logs for connection errors:

```
[ERROR] [conductor:plugin:discord] Failed to connect to Discord
```

Verify:
1. Bot token is correct and not expired
2. Bot has proper intents enabled in Discord Developer Portal
3. Network connectivity to Discord API

### Messages Not Appearing

1. Verify bot has joined the server
2. Check channel permissions for the bot role
3. Ensure channel ID is correct (right-click → Copy Channel ID in Discord)
4. Check bot is online in Discord server member list

### Rate Limiting

Discord has rate limits. If you're sending many messages:

1. Implement message queuing (future enhancement)
2. Use Discord webhooks for higher limits (separate plugin)
3. Batch notifications when possible

## Use Cases

1. **Home Automation**: Motion sensor alerts, door open notifications
2. **Server Monitoring**: Server up/down alerts, resource warnings
3. **CI/CD**: Build success/failure notifications
4. **Team Alerts**: Shift notifications, emergency broadcasts
5. **IoT Devices**: Device status updates, sensor readings

## Future Enhancements

Potential improvements:

- Rich embeds with custom colors and fields
- File attachments for logs or images
- Button/interaction support for acknowledgments
- Rate limit handling with queue
- Webhook fallback option
- Multiple channel broadcasting
- Message templates
- Emoji reactions for status
