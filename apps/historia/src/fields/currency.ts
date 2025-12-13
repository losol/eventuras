import { Field } from 'payload';

export const currency: Field = {
  name: 'currency',
  type: 'text',
  defaultValue: 'NOK',
  required: true,
  admin: {
    description: 'Currency code (ISO 4217)',
  },
};
