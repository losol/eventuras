import { Field } from 'payload';

export const contentLocations: Field = {
  name: 'contentLocations',
  type: 'relationship',
  relationTo: 'places',
  hasMany: true,
};
