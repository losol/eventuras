import type { CollectionConfig } from 'payload';

import { admins } from '@/access/admins';

/**
 * BusinessEvents Collection
 *
 * Stores all significant business events across the system including:
 * - Payment events (webhooks from Vipps, Stripe)
 * - Order events (created, updated, fulfilled, cancelled)
 * - User events (registration, profile updates)
 * - System events (scheduled tasks, integrations)
 *
 * Provides complete audit trail and event sourcing capabilities.
 *
 * Key features:
 * - Event sourcing: Track all state changes through events
 * - Idempotency: Prevent duplicate event processing via unique event ID
 * - Raw payload storage: Complete event data for debugging/replay
 * - Processing status: Track successful/failed event handling
 * - Flexible relationships: Link events to any entity (orders, transactions, users)
 */
export const BusinessEvents: CollectionConfig = {
  slug: 'business-events',
  access: {
    create: admins, // Only server/admins can create events
    read: admins,
    update: admins,
    delete: admins,
  },
  admin: {
    defaultColumns: ['eventType', 'entity', 'actor', 'createdAt'],
    useAsTitle: 'id',
    group: 'System',
    description: 'Audit log of all business events across the system',
  },
  fields: [
    {
      name: 'eventType',
      type: 'text',
      required: true,
      index: true,
      admin: {
        description: 'Specific event type (e.g., "payment.authorized", "order.created")',
      },
    },
    {
      name: 'source',
      type: 'text',
      required: false,
      index: true,
      admin: {
        description: 'Source that generated this event (e.g., "vipps", "stripe", "internal", "user", "system")',
      },
    },
    {
      name: 'entity',
      type: 'relationship',
      relationTo: ['orders', 'transactions', 'users', 'products'],
      required: false,
      admin: {
        description: 'Entity this event relates to',
      },
    },
    {
      name: 'actor',
      type: 'relationship',
      relationTo: 'users',
      required: false,
      admin: {
        description: 'User who initiated/triggered this event (when available)',
      },
    },
    {
      name: 'externalId',
      type: 'text',
      required: false,
      unique: true,
      admin: {
        description: 'Unique external ID for idempotency (webhook ID, event ID, etc.)',
      },
    },
    {
      name: 'externalReference',
      type: 'text',
      required: false,
      index: true,
      admin: {
        description: 'External reference (payment reference, order number, etc.)',
      },
    },
    {
      name: 'data',
      type: 'json',
      required: true,
      admin: {
        description: 'Complete event JSON data',
      },
    },
    {
      name: 'error',
      type: 'textarea',
      required: false,
      admin: {
        description: 'Error message if event processing failed',
      },
    },
  ],
  timestamps: true,
};
