import { Field } from 'payload';

export const title: Field = {
  name: 'title',
  type: 'text',
  required: true,
  admin: {
    description: 'The title of the entry.',
  },
};
