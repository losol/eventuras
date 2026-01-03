import type { CollectionConfig } from 'payload';

import { cartsAccess } from './access';
import { beforeChangeCart } from './hooks/beforeChange';

/**
 * Carts collection for Historia commerce.
 *
 * Minimal implementation for storing carts when users initiate payment.
 * Carts remain in encrypted session until payment is initiated, then are
 * saved to database with a secret for secure validation during payment callback.
 *
 * Features:
 * - Secret-based access control for guest checkout
 * - Server-side price calculation and validation
 * - Rate limiting for cart creation (in-memory)
 * - Inventory validation
 * - Multi-tenant support via websites
 *
 * Security:
 * - Secrets are auto-generated (crypto.randomBytes)
 * - Prices always fetched from database (never trust client)
 * - Rate limiting prevents abuse
 * - Hidden secret field (only returned on creation)
 */
export const Carts: CollectionConfig = {
  slug: 'carts',
  access: cartsAccess,
  admin: {
    useAsTitle: 'createdAt',
    defaultColumns: ['createdAt', 'customer', 'updatedAt'],
    group: 'Commerce',
    description: 'Shopping carts saved at payment initiation for secure validation',
  },
  fields: [
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        {
          name: 'productId',
          type: 'text',
          required: true,
          admin: {
            description: 'Product ID (validated in beforeChange hook)',
          },
        },
        {
          name: 'quantity',
          type: 'number',
          required: true,
          min: 1,
          defaultValue: 1,
          admin: {
            description: 'Quantity of this product',
          },
        },
      ],
    },
    {
      name: 'paymentReference',
      type: 'text',
      required: false,
      index: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Payment provider reference (set during payment creation)',
      },
    },
    {
      name: 'secret',
      type: 'text',
      access: {
        create: () => false, // Auto-generated in hook
        read: () => false, // Never readable via field access (only through afterRead hook)
        update: () => false, // Cannot be updated
      },
      admin: {
        hidden: true,
        position: 'sidebar',
        readOnly: true,
      },
      index: true,
      label: 'Cart Secret',
    },
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'users',
      required: false,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Customer who owns this cart (nullable for guest checkout)',
      },
    },
  ],
  hooks: {
    afterRead: [
      ({ doc, req }) => {
        // Include secret only if this was just created (stored in context by beforeChange)
        if (req.context?.newCartSecret) {
          doc.secret = req.context.newCartSecret;
        }
        // Secret is otherwise never exposed (field access is locked)
        return doc;
      },
    ],
    beforeChange: [beforeChangeCart],
  },
  timestamps: true,
};
