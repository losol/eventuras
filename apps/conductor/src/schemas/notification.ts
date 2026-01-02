import { z } from 'zod';

/**
 * Notification request schema
 */
export const notificationSchema = z.object({
  channel: z.enum(['discord-webhook', 'discord-bot', 'log'], {
    message: 'Channel must be "discord-webhook", "discord-bot", or "log"'
  }),
  message: z.string().min(1, 'Message cannot be empty'),
  priority: z.enum(['normal', 'high']).default('normal'),
  // Optional target ID (Discord channel, Matrix room, Signal group, etc.) - overrides env var if provided
  targetId: z.string().optional(),
});

export type NotificationRequest = z.infer<typeof notificationSchema>;
