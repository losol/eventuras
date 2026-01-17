import type { CollectionConfig } from 'payload';

import { admins } from '@/access/admins';
import { shipmentsReadAccess } from '@/access/commerceReadAccess';
import { siteCommerceManagers } from '@/access/siteRoleAccess';
import { accessOR } from '@/access/utils/accessOR';
import { addressGroup } from '@/fields/address';

import { sendShipmentNotification } from './Shipments/hooks/sendShipmentNotification';

export const Shipments: CollectionConfig = {
  slug: 'shipments',
  access: {
    create: accessOR(admins, siteCommerceManagers),
    read: shipmentsReadAccess,
    update: accessOR(admins, siteCommerceManagers),
    delete: admins,
  },
  admin: {
    defaultColumns: ['id', 'order', 'status', 'trackingNumber', 'createdAt'],
    useAsTitle: 'id',
    group: 'Commerce',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Shipment Details',
          fields: [
            {
              name: 'order',
              type: 'relationship',
              relationTo: 'orders',
              required: true,
              index: true,
              admin: {
                description: 'The order this shipment belongs to',
              },
            },
            {
              name: 'items',
              type: 'array',
              label: 'Shipped Items',
              required: true,
              admin: {
                description: 'Items included in this shipment. Reference order item IDs for partial shipments.',
                initCollapsed: false,
              },
              fields: [
                {
                  name: 'orderItemId',
                  type: 'text',
                  required: true,
                  admin: {
                    description: 'The itemId from the order items array',
                  },
                },
                {
                  name: 'product',
                  type: 'relationship',
                  relationTo: 'products',
                  required: true,
                  label: 'Product',
                  admin: {
                    description: 'Reference to the product being shipped',
                  },
                },
                {
                  name: 'quantity',
                  type: 'number',
                  required: true,
                  min: 1,
                  defaultValue: 1,
                  label: 'Quantity Shipped',
                  admin: {
                    description: 'Number of units shipped in this shipment',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Shipping Address',
          fields: [addressGroup('shippingAddress')],
        },
        {
          label: 'Tracking',
          fields: [
            {
              name: 'carrier',
              type: 'text',
              admin: {
                description: 'Shipping carrier (e.g., Posten, PostNord, Bring, DHL)',
              },
            },
            {
              name: 'trackingNumber',
              type: 'text',
              admin: {
                description: 'Tracking number from carrier',
              },
            },
            {
              name: 'trackingUrl',
              type: 'text',
              admin: {
                description: 'URL to track the shipment',
              },
            },
            {
              name: 'shippedAt',
              type: 'date',
              admin: {
                description: 'Date when the shipment was dispatched',
                date: {
                  pickerAppearance: 'dayAndTime',
                },
              },
            },
            {
              name: 'deliveredAt',
              type: 'date',
              admin: {
                description: 'Date when the shipment was delivered',
                date: {
                  pickerAppearance: 'dayAndTime',
                },
              },
            },
          ],
        },
        {
          label: 'Notes',
          fields: [
            {
              name: 'notes',
              type: 'textarea',
              admin: {
                description: 'Internal notes about this shipment',
              },
            },
          ],
        },
      ],
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
        { label: 'Ready to Ship', value: 'ready-to-ship' },
        { label: 'Shipped', value: 'shipped' },
        { label: 'In Transit', value: 'in-transit' },
        { label: 'Out for Delivery', value: 'out-for-delivery' },
        { label: 'Delivered', value: 'delivered' },
        { label: 'Attempted Delivery', value: 'attempted-delivery' },
        { label: 'Available for Pickup', value: 'available-for-pickup' },
        { label: 'Returned to Sender', value: 'returned-to-sender' },
        { label: 'Lost in Transit', value: 'lost-in-transit' },
        { label: 'Canceled', value: 'canceled' },
      ],
    },
    {
      name: 'shipmentType',
      type: 'select',
      required: true,
      defaultValue: 'full',
      admin: {
        position: 'sidebar',
        description: 'Whether this is a full or partial shipment of the order',
      },
      options: [
        { label: 'Full', value: 'full' },
        { label: 'Partial', value: 'partial' },
      ],
    },
    {
      name: 'weight',
      type: 'number',
      admin: {
        position: 'sidebar',
        description: 'Weight in grams',
      },
    },
  ],
  hooks: {
    afterChange: [sendShipmentNotification],
  },
  timestamps: true,
};
