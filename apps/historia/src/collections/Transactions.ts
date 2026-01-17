import type { CollectionConfig } from 'payload';

import { transactionsReadAccess } from '@/access/commerceReadAccess';
import { isSystemAdminAccess } from '@/access/isSystemAdmin';
import { currency } from '@/fields/currency';

export const Transactions: CollectionConfig = {
  slug: 'transactions',
  access: {
    create: isSystemAdminAccess,  // Only system-admin can create transactions
    read: transactionsReadAccess,
    update: isSystemAdminAccess,  // Only system-admin can update transactions
    delete: isSystemAdminAccess,  // Only system-admin can delete transactions
  },
  admin: {
    defaultColumns: ['id', 'order', 'customer', 'amount', 'currency', 'status', 'createdAt'],
    useAsTitle: 'id',
    group: 'Commerce',
  },
  fields: [
    {
      name: 'updateButton',
      type: 'ui',
      admin: {
        position: 'sidebar',
        components: {
          Field: '@/collections/Transactions/ui/UpdateDetailsButton#UpdateDetailsButton',
        },
      },
    },
    {
      name: 'order',
      type: 'relationship',
      relationTo: 'orders',
      required: false,
      index: true,
      admin: {
        description: 'The order this transaction belongs to. Can be null for orphaned payments that will be linked later.',
      },
    },
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'users',
      required: false,
      index: true,
    },
    {
      name: 'amount',
      label: 'Amount (minor units)',
      type: 'number',
      required: true,
      admin: {
        description: 'Amount in minor units (øre for NOK, cents for USD/EUR). Positive for payments, negative for refunds.',
      },
    },
    currency,
    {
      name: 'paymentReference',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Unique payment reference from payment provider (Vipps reference, Stripe payment intent ID, etc.)',
      },
    },
    {
      name: 'status',
      type: 'text',
      required: true,
      defaultValue: 'pending',
      index: true,
      admin: {
        description: 'Transaction status from payment provider (e.g., pending, authorized, captured, failed, refunded)',
      },
    },
    {
      name: 'paymentMethod',
      type: 'text',
      required: true,
      index: true,
      admin: {
        description: 'Payment method (e.g., vipps, stripe, manual)',
      },
    },
    {
      name: 'data',
      type: 'json',
      required: false,
      admin: {
        description: 'Full payment details from payment provider (includes profile, shipping, state, amounts, etc.)',
      },
    },
  ],
  timestamps: true,
};
