import { Field } from 'payload';

export const contributors: Field = {
  name: 'contributors',
  label: 'Contributors',
  interfaceName: 'Contributors',
  type: 'array',
  fields: [
    {
      name: 'person',
      type: 'relationship',
      relationTo: 'persons',
      required: true
    },
    {
      name: 'role',
      type: 'text',
      required: false,
    }
  ]
};
