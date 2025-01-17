import type { Field } from 'payload';

export const channels: Field = {
  name: 'channels',
  label: 'Channels',
  type: 'relationship',
  relationTo: 'websites',
  hasMany: true,
  required: false,
  admin: {
    description: 'Select the websites or platforms where this article will be published.',
  },
};
