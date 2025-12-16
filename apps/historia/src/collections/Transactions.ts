import type { CollectionConfig } from 'payload';

import { admins } from '@/access/admins';
import { currency } from '@/fields/currency';

export const Transactions: CollectionConfig = {
  slug: 'transactions',
  access: {
    create: admins,
    read: ({ req: { user } }) => {
      // Admins can read all transactions
      // Check if user is from 'users' collection and has roles
      if (user && 'roles' in user && user.roles?.includes('admin')) return true;
      // Users can only read their own transactions
      if (user) return { customer: { equals: user.id } };
      return false;
    },
    update: admins,
    delete: admins,
  },
  admin: {
    defaultColumns: ['id', 'order', 'customer', 'amount', 'currency', 'status', 'createdAt'],
    useAsTitle: 'id',
    group: 'Commerce',
  },
  fields: [
    {
      name: 'order',
      type: 'relationship',
      relationTo: 'orders',
      required: true,
      index: true,
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
  ],
  timestamps: true,
};
