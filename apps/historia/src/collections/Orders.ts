import type { CollectionConfig } from 'payload';

import { admins } from '@/access/admins';
import { addressGroup } from '@/fields/address';
import { orderItemsField } from '@/fields/orderItemsField';

import { populateOrderPrices } from './Orders/hooks/populateOrderPrices';

export const Orders: CollectionConfig = {
  slug: 'orders',
  access: {
    create: admins,
    read: ({ req: { user } }) => {
      // Admins can read all orders
      if (user?.roles?.includes('admin')) {
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
    defaultColumns: ['id', 'user', 'status', 'totalAmount', 'createdAt'],
    group: 'Commerce',
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
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'userEmail',
      type: 'email',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      admin: {
        position: 'sidebar',
      },
      options: [
        {
          label: 'Pending - Ordre opprettet, venter på behandling',
          value: 'pending',
        },
        {
          label: 'Processing - Ordre er under behandling',
          value: 'processing',
        },
        {
          label: 'On Hold - Ordre midlertidig satt på vent',
          value: 'on-hold',
        },
        {
          label: 'Completed - Ordre fullført og avsluttet',
          value: 'completed',
        },
        {
          label: 'Canceled - Ordre kansellert før fullføring',
          value: 'canceled',
        },
        {
          label: 'Archived - Ordre arkivert for dokumentasjon',
          value: 'archived',
        },
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
              const amount = item.price?.amount || 0;
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
      name: 'shippingStatus',
      type: 'select',
      admin: {
        position: 'sidebar',
      },
      options: [
        {
          label: 'Not Shippable - Ikke aktuelt for forsendelse',
          value: 'not-shippable',
        },
        {
          label: 'Not Shipped - Ikke sendt enda',
          value: 'not-shipped',
        },
        {
          label: 'Ready to Ship - Klar for henting/sending',
          value: 'ready-to-ship',
        },
        {
          label: 'Shipped - Sendt fra lager',
          value: 'shipped',
        },
        {
          label: 'In Transit - Underveis til kunde',
          value: 'in-transit',
        },
        {
          label: 'Out for Delivery - Ute hos sjåfør for levering',
          value: 'out-for-delivery',
        },
        {
          label: 'Delivered - Levert til kunde',
          value: 'delivered',
        },
        {
          label: 'Attempted Delivery - Leveringsforsøk mislyktes',
          value: 'attempted-delivery',
        },
        {
          label: 'Available for Pickup - Klar for henting (postkontor/utleveringssted)',
          value: 'available-for-pickup',
        },
        {
          label: 'Returned to Sender - Returnert til avsender',
          value: 'returned-to-sender',
        },
        {
          label: 'Lost in Transit - Meldt tapt underveis',
          value: 'lost-in-transit',
        },
        {
          label: 'Canceled - Forsendelse kansellert',
          value: 'canceled',
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [populateOrderPrices],
  },
  timestamps: true,
};
