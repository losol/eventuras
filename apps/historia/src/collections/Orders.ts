import type { CollectionConfig } from 'payload';

import { admins } from '@/access/admins';
import { addressGroup } from '@/fields/address';
import { orderItemsField } from '@/fields/orderItemsField';

import { populateOrderPrices } from './Orders/hooks/populateOrderPrices';
import { sendOrderConfirmation } from './Orders/hooks/sendOrderConfirmation';

export const Orders: CollectionConfig = {
  slug: 'orders',
  access: {
    create: admins,
    read: ({ req: { user } }) => {
      // Admins can read all orders
      // Check if user is from 'users' collection and has roles
      if (user && 'roles' in user && user.roles?.includes('admin')) {
        return true;
      }
      // Users can only read their own orders
      return {
        user: {
          equals: user?.id,
        },
      };
    },
    update: admins,
    delete: admins,
  },
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['id', 'userEmail', 'status', 'totalAmount', 'currency', 'createdAt'],
    group: 'Commerce',
    components: {
      edit: {
        SaveButton: '@/collections/Orders/components/OrderEditComponents#OrderSaveButton',
      },
      Description: '@/collections/Orders/components/OrdersDescription#OrdersDescription',
    },
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Order Details',
          fields: [orderItemsField()],
        },
        {
          label: 'Shipping Address',
          fields: [addressGroup('shippingAddress')],
        },
      ],
    },
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'users',
      required: false,
      index: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'userEmail',
      type: 'email',
      required: true,
      index: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      index: true,
      admin: {
        position: 'sidebar',
      },
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Processing', value: 'processing' },
        { label: 'On Hold', value: 'on-hold' },
        { label: 'Completed', value: 'completed' },
        { label: 'Canceled', value: 'canceled' },
      ],
    },
    {
      name: 'totalAmount',
      label: 'Total Amount (inc. VAT)',
      type: 'number',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
      hooks: {
        beforeChange: [
          ({ data }) => {
            if (!data?.items || !Array.isArray(data.items)) return 0;

            return data.items.reduce((total, item) => {
              const quantity = item.quantity || 1;
              const amount = item.price?.amountExVat || 0;
              const vatRate = item.price?.vatRate ?? 25;
              const lineTotal = quantity * amount * (1 + vatRate / 100);
              return total + lineTotal;
            }, 0);
          },
        ],
      },
    },
    {
      name: 'currency',
      type: 'text',
      defaultValue: 'NOK',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'shipments',
      type: 'join',
      collection: 'shipments',
      on: 'order',
      admin: {
        description: 'Shipments for this order',
      },
    },
    {
      name: 'transactions',
      type: 'join',
      collection: 'transactions',
      on: 'order',
      admin: {
        description: 'Payment transactions for this order',
      },
    },
  ],
  hooks: {
    beforeChange: [populateOrderPrices],
    afterChange: [sendOrderConfirmation],
  },
  timestamps: true,
};
