import { Field } from 'payload';

export const contentPersons: Field = {
  name: 'contentPersons',
  type: 'relationship',
  relationTo: 'persons',
  hasMany: true,
  admin: {
    description: 'The people in the content.'
  },
};
