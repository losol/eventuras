/**
 * Discord webhook channel adapter
 * Sends notifications via Discord webhooks
 */
export async function sendDiscordWebhookNotification(
  message: string,
  priority: string
): Promise<void> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    throw new Error('DISCORD_WEBHOOK_URL not configured');
  }

  // Format message with priority indicator
  const content = priority === 'high' 
    ? `⚠️ **HIGH PRIORITY**\n${message}`
    : message;

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    throw new Error(`Discord webhook failed: ${response.status} ${response.statusText}`);
  }
}
