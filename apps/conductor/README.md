# @eventuras/conductor

Messaging orchestration server - send messages from Homey or Home Assistant to Discord, Matrix/Element or WhatsApp.

## Overview

Domus will be a messaging gateway that lets you send notifications and messages from smart home systems to various communication channels.

### Supported Sources

- 🏠 **Homey** - via webhook or HTTP requests
- 🏡 **Home Assistant** - via REST command or automations

### Supported Channels

- 💬 **Discord Webhook** - via Discord webhooks
- 🤖 **Discord Bot** - via Discord bot API
- 📝 **Log** - outputs to server console

#### Planned Channels

- 🔐 **Matrix/Element** - via Matrix client API (coming soon)
- 📱 **WhatsApp** - via WhatsApp Business API (coming soon)

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file in the root directory:

```env
PORT=3333

# Authentication (required)
API_KEY=your_secret_api_key_here

# Discord Webhook
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...

# Discord Bot (optional)
DISCORD_BOT_TOKEN=your_bot_token_here
# DISCORD_BOT_CHANNEL_ID is optional - can be specified per request instead
DISCORD_BOT_CHANNEL_ID=1234567890123456789
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
    payload: '{"channel": "{{ channel }}", "message": "{{ message }}", "targetId": "{{ target_id }}"}'
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

## API Endpoints

### `POST /notifications`

Send a notification to the selected channel.

**Body:**

```json
{
  "channel": "discord-webhook|discord-bot|log",
  "message": "Your message here",
  "priority": "normal|high",
  "targetId": "1234567890123456789"  // Optional - target channel/room/group ID
}
```

**Examples:**

Send to default Discord bot channel (uses `DISCORD_BOT_CHANNEL_ID` from `.env`):

```json
{
  "channel": "discord-bot",
  "message": "Server is online",
  "priority": "normal"
}
```

Send to specific Discord channel:

```json
{
  "channel": "discord-bot",
  "message": "Critical alert!",
  "priority": "high",
  "targetId": "1234567890123456789"
}
```

## License

GPL-3.0-or-later
