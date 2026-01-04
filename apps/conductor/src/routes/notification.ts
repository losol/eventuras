import express, { Request, Response, Router } from 'express';
import { uuidv7 } from 'uuidv7';
import { z } from 'zod';
import { getPluginRegistry } from '../instrumentation.js';

export const notificationRouter: Router = express.Router();

/**
 * Create notification schema dynamically based on available channels
 * This will be called on each request to get the latest channel list
 */
function getNotificationSchema() {
  const registry = getPluginRegistry();
  const channelTypes = registry.getAllChannelTypes();

  if (channelTypes.length === 0) {
    throw new Error('No channel types available');
  }

  return z.object({
    channel: z.enum(channelTypes as [string, ...string[]]).refine(
      (val) => channelTypes.includes(val),
      {
        message: `Channel must be one of: ${channelTypes.join(', ')}`,
      },
    ),
    message: z.string().min(1, 'Message cannot be empty'),
    priority: z.enum(['normal', 'high']).default('normal'),
    targetId: z.string().optional(),
  });
}

/**
 * POST /notifications
 * Send a notification to a specified channel
 */
notificationRouter.post('/', async (req: Request, res: Response) => {
  try {
    const registry = getPluginRegistry();

    // Validate request body with dynamic schema
    const notificationSchema = getNotificationSchema();
    const validatedData = notificationSchema.parse(req.body);
    const { channel, message, priority, targetId } = validatedData;
    const tenantId = req.tenantId || 'default';

    // Generate UUID v7 for this notification
    const notificationId = uuidv7();

    // Send notification through plugin registry
    const result = await registry.send(tenantId, channel, {
      message,
      priority,
      targetId,
      tenantId,
      notificationId,
    });

    if (!result.success) {
      return res.status(500).json({
        error: 'Failed to send notification',
        message: result.error,
      });
    }

    res.json({
      success: true,
      id: notificationId,
      tenantId,
      tenantName: req.tenantName,
      channel,
      message,
      priority,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }

    console.error('Error sending notification:', error);
    res.status(500).json({
      error: 'Failed to send notification',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});
