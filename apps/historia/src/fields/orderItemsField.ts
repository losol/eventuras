import { randomUUID } from 'crypto';

import type { ArrayField } from 'payload';

export const orderItemsField = (): ArrayField => {
  return {
    name: 'items',
    type: 'array',
    label: 'Items',
    required: true,
    admin: {
      initCollapsed: true,
      components: {
        RowLabel: '@/fields/orderItemsField/OrderItemRowLabel#OrderItemRowLabel',
      },
    },
    fields: [
      {
        name: 'itemId',
        type: 'text',
        required: true,
        defaultValue: () => randomUUID(),
        admin: {
          readOnly: true,
          description: 'Auto-generated unique identifier',
          style: {
            width: '50%',
          },
        },
      },
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
            name: 'amountExVat',
            label: 'Price per item (ex. VAT)',
            type: 'number',
            required: true,
            hooks: {
              beforeValidate: [
                async ({ value, data, req }) => {
                  // Auto-populate from product if empty
                  if (!value && data?.product && req?.payload) {
                    try {
                      const productId = typeof data.product === 'object' ? data.product.id : data.product;
                      const product = await req.payload.findByID({
                        collection: 'products',
                        id: productId,
                        depth: 0,
                      });
                      return product?.price?.amountExVat || value;
                    } catch (error) {
                      console.error('Failed to fetch product price:', error);
                    }
                  }
                  return value;
                },
              ],
            },
          },
          {
            name: 'currency',
            type: 'text',
            defaultValue: 'NOK',
            required: true,
            label: 'Currency',
            hooks: {
              beforeValidate: [
                async ({ value, data, req }) => {
                  // Auto-populate from product if empty
                  if (!value && data?.product && req?.payload) {
                    try {
                      const productId = typeof data.product === 'object' ? data.product.id : data.product;
                      const product = await req.payload.findByID({
                        collection: 'products',
                        id: productId,
                        depth: 0,
                      });
                      return product?.price?.currency || value || 'NOK';
                    } catch (error) {
                      console.error('Failed to fetch product currency:', error);
                    }
                  }
                  return value || 'NOK';
                },
              ],
            },
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
            hooks: {
              beforeValidate: [
                async ({ value, data, req }) => {
                  // Auto-populate from product if empty
                  if (!value && data?.product && req?.payload) {
                    try {
                      const productId = typeof data.product === 'object' ? data.product.id : data.product;
                      const product = await req.payload.findByID({
                        collection: 'products',
                        id: productId,
                        depth: 0,
                      });
                      return product?.price?.vatRate ?? value ?? 25;
                    } catch (error) {
                      console.error('Failed to fetch product VAT rate:', error);
                    }
                  }
                  return value ?? 25;
                },
              ],
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
