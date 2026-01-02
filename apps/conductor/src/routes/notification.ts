import express, { Request, Response, Router } from 'express';
import { uuidv7 } from 'uuidv7';
import { z } from 'zod';
import { notificationSchema } from '../schemas/notification';
import { sendDiscordWebhookNotification } from '../channels/discord-webhook';
import { sendDiscordBotNotification } from '../channels/discord-bot';
import { sendLogNotification } from '../channels/log';

export const notificationRouter: Router = express.Router();

/**
 * POST /notifications
 * Send a notification to a specified channel
 */
notificationRouter.post('/', async (req: Request, res: Response) => {
  try {
    // Validate request body with Zod
    const validatedData = notificationSchema.parse(req.body);
    const { channel, message, priority, targetId } = validatedData;
    const tenantId = req.tenantId;

    // Generate UUID v7 for this notification
    const notificationId = uuidv7();

    // Send notification to the appropriate channel
    if (channel === 'discord-webhook') {
      await sendDiscordWebhookNotification(message, priority);
    } else if (channel === 'discord-bot') {
      await sendDiscordBotNotification(message, priority, targetId);
    } else if (channel === 'log') {
      await sendLogNotification(message, priority, tenantId || 'default', notificationId);
    }

    res.json({
      success: true,
      id: notificationId,
      tenantId,
      channel,
      message,
      priority,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message
        }))
      });
    }

    console.error('Error sending notification:', error);
    res.status(500).json({
      error: 'Failed to send notification',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
