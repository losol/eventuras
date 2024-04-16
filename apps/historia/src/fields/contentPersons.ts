import { Field } from 'payload/types';

export const contentPersons: Field = {
  name: 'contentPersons',
  type: 'relationship',
  relationTo: 'persons',
  hasMany: true,
  admin: {
    description: 'The people in the content.'
  },
};
