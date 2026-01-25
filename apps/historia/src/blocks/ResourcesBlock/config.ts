import type { Block } from 'payload';

import { richText } from '@/fields/richText';

export const ResourcesBlock: Block = {
  slug: 'resources',
  interfaceName: 'ResourcesBlock',
  labels: {
    singular: 'Resources',
    plural: 'Resources Blocks',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Title',
      required: true,
      localized: true,
      admin: {
        placeholder: 'e.g., "For dough", "Required Tools"',
      },
    },
    {
      name: 'type',
      type: 'select',
      label: 'Resource Type',
      required: true,
      defaultValue: 'materials',
      options: [
        { label: 'Materials', value: 'materials' },
        { label: 'Tools', value: 'tools' },
      ],
      admin: {
        description: 'Choose whether this is a list of materials or tools',
      },
    },
    richText({
      name: 'description',
      label: 'Description',
      required: false,
      localized: true,
    }),
    {
      name: 'items',
      label: 'Items',
      type: 'array',
      required: true,
      fields: [
        {
          name: 'name',
          type: 'text',
          label: 'Name',
          required: true,
          localized: true,
        },
        richText({
          name: 'description',
          label: 'Description',
          required: false,
          localized: true,
        }),
        {
          name: 'quantity',
          type: 'text',
          label: 'Quantity',
          localized: true,
          admin: {
            placeholder: 'e.g., "2", "ca 500", "1-2"',
          },
        },
        {
          name: 'unit',
          type: 'text',
          label: 'Unit',
          localized: true,
          admin: {
            placeholder: 'e.g., "kg", "cups", "stk"',
          },
        },
      ],
    },
  ],
};
