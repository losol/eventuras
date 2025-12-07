import type { Block } from 'payload';

export const Product: Block = {
  slug: 'products',
  interfaceName: 'ProductsBlock',
  fields: [
    {
      name: 'products',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
      required: true,
      admin: {
        description: 'Select one or more products to display',
      },
    },
  ],
};
