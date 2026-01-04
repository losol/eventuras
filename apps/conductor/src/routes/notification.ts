import express, { Request, Response, Router } from 'express';
import { uuidv7 } from 'uuidv7';
import { z } from 'zod';
import { getPluginRegistry } from '../instrumentation.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('conductor:routes:notification');

export const notificationRouter: Router = express.Router();

// Base notification schema
const notificationSchema = z.object({
  channel: z.string().min(1, 'Channel is required'),
  message: z.string().min(1, 'Message cannot be empty'),
  priority: z.enum(['normal', 'high']).default('normal'),
  targetId: z.string().optional(),
});

/**
 * POST /notifications
 * Send a notification to a specified channel
 */
notificationRouter.post('/', async (req: Request, res: Response) => {
  try {
    const registry = getPluginRegistry();

    // Validate request body with base schema
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

    logger.error({ error }, 'Error sending notification');
    res.status(500).json({
      error: 'Failed to send notification',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});
