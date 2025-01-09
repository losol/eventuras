import { Field } from 'payload';

export const partners: Field = {
  name: 'partners',
  type: 'array',
  fields: [
    {
      name: 'entity',
      type: 'relationship',
      relationTo: ['persons', 'organizations'],
      required: true,
      hasMany: false,
    },
    {
      name: 'role',
      type: 'text',
      localized: true,
    },
  ],
  admin: {
    description: 'Use this field to define a list of partners, assign their roles, and add any necessary details.',
  },
};
