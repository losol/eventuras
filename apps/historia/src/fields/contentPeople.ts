import { Field } from 'payload/types';

export const contentPeople: Field = {
  name: 'contentPeople',
  type: 'relationship',
  relationTo: 'people',
  hasMany: true,
  admin: {
    description: 'The people in the content.'
  },
};
