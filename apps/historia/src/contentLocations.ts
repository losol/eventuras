import { Field } from 'payload/types';

export const contentLocations: Field = {
  name: 'contentLocations',
  type: 'relationship',
  relationTo: 'places',
  hasMany: true,
  admin: {
    description: 'The location depicted or represented in the media.'
  },
};
