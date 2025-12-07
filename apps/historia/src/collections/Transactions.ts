import type { CollectionConfig } from 'payload';

import { admins } from '@/access/admins';

export const Transactions: CollectionConfig = {
  slug: 'transactions',
  access: {
    create: admins,
    read: ({ req: { user } }) => {
      // Admins can read all transactions
      if (user?.roles?.includes('admin')) return true;
      // Users can only read their own transactions
      if (user) return { customer: { equals: user.id } };
      return false;
    },
    update: admins,
    delete: admins,
  },
  admin: {
    defaultColumns: ['id', 'order', 'customer', 'amount', 'status', 'createdAt'],
    useAsTitle: 'id',
    group: 'Commerce',
  },
  fields: [
    {
      name: 'order',
      type: 'relationship',
      relationTo: 'orders',
      required: true,
    },
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'users',
      required: false,
    },
    {
      name: 'amount',
      type: 'number',
      required: true,
      min: 0,
    },
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
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Authorized', value: 'authorized' },
        { label: 'Captured', value: 'captured' },
        { label: 'Completed', value: 'completed' },
        { label: 'Failed', value: 'failed' },
        { label: 'Refunded', value: 'refunded' },
        { label: 'Partially Refunded', value: 'partially-refunded' },
      ],
    },
    {
      name: 'paymentMethod',
      type: 'select',
      required: true,
      options: [
        { label: 'Vipps', value: 'vipps' },
        { label: 'Stripe', value: 'stripe' },
        { label: 'Manual', value: 'manual' },
      ],
    },
    {
      name: 'transactionType',
      type: 'select',
      required: true,
      defaultValue: 'payment',
      options: [
        { label: 'Payment', value: 'payment' },
        { label: 'Refund', value: 'refund' },
        { label: 'Partial Refund', value: 'partial-refund' },
      ],
    },
  ],
  timestamps: true,
};
