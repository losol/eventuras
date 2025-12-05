import type { CollectionConfig } from 'payload';

import { admins } from '@/access/admins';
import { anyone } from '@/access/anyone';
import { description } from '@/fields/description';
import { image } from '@/fields/image';
import { lead } from '@/fields/lead';
import resourceId from '@/fields/resourceId';
import { slugField } from '@/fields/slug';
import { storyField } from '@/fields/story';
import { title } from '@/fields/title';
import { generatePreviewPath } from '@/utilities/generatePreviewPath';

export const Products: CollectionConfig = {
  slug: 'products',
  access: {
    read: anyone,
    create: admins,
    update: admins,
    delete: admins,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'inventory', '_status'],
    group: 'Commerce',
    livePreview: {
      url: ({ data, req }) => {
        const path = generatePreviewPath({
          slug: typeof data?.slug === 'string' ? data.slug : '',
          resourceId: typeof data?.resourceId === 'string' ? data.resourceId : undefined,
          collection: 'products',
          req,
        });
        return path;
      },
    },
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            title,
            lead,
            description,
            image,
            {
              name: 'gallery',
              type: 'array',
              fields: [
                {
                  name: 'media',
                  label: 'Media',
                  type: 'upload',
                  relationTo: 'media',
                  required: false,
                },
                {
                  name: 'caption',
                  label: 'Caption',
                  type: 'richText',
                  required: false,
                  localized: true,
                },
              ],
            },
            storyField(),
          ],
        },
        {
          label: 'Product Details',
          fields: [
            {
              name: 'price',
              type: 'group',
              fields: [
                {
                  name: 'amount',
                  label: 'Price (ex. VAT)',
                  type: 'number',
                  required: false,
                  admin: {
                    components: {
                      Field: '@/collections/Products/PriceField#PriceField',
                    },
                  },
                },
                {
                  name: 'currency',
                  type: 'text',
                  defaultValue: 'NOK',
                  required: false,
                  admin: {
                    description: 'Currency code (e.g., NOK, USD, EUR)',
                  },
                },
                {
                  name: 'vatRate',
                  type: 'number',
                  required: false,
                  defaultValue: 25,
                  admin: {
                    description: 'VAT/Tax rate in percentage (default: 25%)',
                    step: 0.1,
                  },
                },
                {
                  name: 'vatAmount',
                  label: 'VAT Amount',
                  type: 'number',
                  virtual: true,
                  admin: {
                    position: 'sidebar',
                    readOnly: true,
                  },
                  hooks: {
                    afterRead: [
                      ({ siblingData }) => {
                        const amount = siblingData.amount || 0;
                        const vatRate = siblingData.vatRate ?? 25;
                        return Math.round(amount * (vatRate / 100));
                      },
                    ],
                  },
                },
                {
                  name: 'totalPrice',
                  label: 'Total Price (inc. VAT)',
                  type: 'number',
                  virtual: true,
                  admin: {
                    position: 'sidebar',
                    components: {
                      Field: '@/collections/Products/TotalPriceField#TotalPriceField',
                    },
                  },
                  hooks: {
                    afterRead: [
                      ({ siblingData }) => {
                        const amount = siblingData.amount || 0;
                        const vatRate = siblingData.vatRate ?? 25;
                        return Math.round(amount * (1 + vatRate / 100));
                      },
                    ],
                  },
                },
              ],
            },
            {
              name: 'sku',
              type: 'text',
              required: false,
              admin: {
                description: 'Stock Keeping Unit (SKU)',
              },
            },
            {
              name: 'inventory',
              type: 'number',
              required: false,
              admin: {
                description: 'Available inventory. Leave empty for unlimited.',
              },
            },
          ],
        },
      ],
    },
    ...slugField(),
    resourceId,
  ],
};
