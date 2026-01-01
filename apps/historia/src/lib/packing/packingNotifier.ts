import type { Payload } from 'payload';

import { Logger } from '@eventuras/logger';

import type { Order } from '@/payload-types';

import { formatPackingListAsHtml } from './packingListGenerator';

const logger = Logger.create({
  namespace: 'historia:packing',
  context: { module: 'packingNotifier' },
});

export interface NotificationTarget {
  email: string;
  name?: string;
}

export interface PackingNotificationOptions {
  targets: NotificationTarget[];
  order: Order;
  customerName?: string;
  locale?: 'nb-NO' | 'en-US';
}

/**
 * Generic notifier interface
 * Can be implemented for email, Slack, webhooks, etc.
 */
export interface PackingNotifier {
  notify(options: PackingNotificationOptions): Promise<void>;
}

/**
 * Email implementation of packing notifier
 * Sends packing list via email
 */
export class EmailPackingNotifier implements PackingNotifier {
  constructor(private payload: Payload) {}

  async notify(options: PackingNotificationOptions): Promise<void> {
    const { targets, order, customerName, locale = 'nb-NO' } = options;

    if (targets.length === 0) {
      logger.warn({ orderId: order.id }, 'No notification targets provided');
      return;
    }

    const subject = locale === 'nb-NO'
      ? `📦 Ny ordre å pakke - ${order.id}`
      : `📦 New order to pack - ${order.id}`;

    const htmlContent = formatPackingListAsHtml(order, customerName);

    for (const target of targets) {
      try {
        await this.payload.sendEmail({
          to: target.email,
          subject,
          html: htmlContent,
        });

        logger.info(
          { orderId: order.id, email: target.email },
          'Packing notification sent'
        );
      } catch (error) {
        logger.error(
          { error, orderId: order.id, email: target.email },
          'Failed to send packing notification'
        );
        // Don't throw - continue with other targets
      }
    }
  }
}

/**
 * Factory to create notifier instances
 * Makes it easy to swap implementations later
 */
export function createPackingNotifier(payload: Payload, type: 'email' = 'email'): PackingNotifier {
  switch (type) {
    case 'email':
      return new EmailPackingNotifier(payload);
    default:
      return new EmailPackingNotifier(payload);
  }
}
