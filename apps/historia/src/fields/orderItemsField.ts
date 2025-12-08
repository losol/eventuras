import type { ArrayField } from 'payload';

export const orderItemsField = (): ArrayField => {
  return {
    name: 'items',
    type: 'array',
    label: 'Items',
    required: true,
    admin: {
      initCollapsed: true,
    },
    fields: [
      {
        name: 'product',
        type: 'relationship',
        relationTo: 'products',
        required: true,
        label: 'Product',
      },
      {
        name: 'quantity',
        type: 'number',
        required: true,
        min: 1,
        defaultValue: 1,
        label: 'Quantity',
      },
      {
        name: 'price',
        type: 'group',
        label: 'Price',
        fields: [
          {
            name: 'amount',
            label: 'Price per item (ex. VAT)',
            type: 'number',
            required: true,
          },
          {
            name: 'currency',
            type: 'text',
            defaultValue: 'NOK',
            required: true,
            label: 'Currency',
          },
          {
            name: 'vatRate',
            type: 'number',
            required: true,
            defaultValue: 25,
            label: 'VAT Rate (%)',
            admin: {
              description: 'VAT/Tax rate in percentage',
            },
          },
        ],
      },
      {
        name: 'lineTotal',
        label: 'Line Total (inc. VAT)',
        type: 'number',
        admin: {
          readOnly: true,
        },
        hooks: {
          beforeChange: [
            ({ siblingData }) => {
              const quantity = siblingData.quantity || 1;
              const amount = siblingData.price?.amountExVat || 0;
              const vatRate = siblingData.price?.vatRate ?? 25;
              return Math.round(quantity * amount * (1 + vatRate / 100));
            },
          ],
        },
      },
    ],
  };
};
