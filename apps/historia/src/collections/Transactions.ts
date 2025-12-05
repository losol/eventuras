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
      required: true,
    },
    {
      name: 'amount',
      type: 'number',
      required: true,
      min: 0,
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Completed', value: 'completed' },
        { label: 'Failed', value: 'failed' },
      ],
    },
    {
      name: 'paymentMethod',
      type: 'select',
      required: true,
      options: [
        { label: 'Stripe', value: 'stripe' },
        { label: 'Vipps', value: 'vipps' },
      ],
    },
  ],
  timestamps: true,
};
