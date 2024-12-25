import type { Field } from 'payload';

export const geoPoint: Field = {
  name: 'geoPoint',
  type: 'group',
  fields: [
    {
      name: 'latitude',
      type: 'number',
      admin: {
        description: 'Latitude must be between -90 and 90',
      },
      validate: (value: number | null | undefined) => {
        if (value === undefined || value === null) return true;
        if (value >= -90 && value <= 90) return true;
        return 'Latitude must be between -90 and 90';
      },
    },
    {
      name: 'longitude',
      type: 'number',
      admin: {
        description: 'Longitude must be between -180 and 180',
      },
      validate: (value: number | null | undefined) => {
        if (value === undefined || value === null) return true;
        if (value >= -180 && value <= 180) return true;
        return 'Longitude must be between -180 and 180';
      },
    },
  ],
};
