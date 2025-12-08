import { Field } from 'payload';

import { getCurrencyOptions } from '@/currencies';

export const currency: Field = {
  name: 'currency',
  type: 'select',
  defaultValue: 'NOK',
  required: true,
  options: getCurrencyOptions(),
  admin: {
    description: 'Currency code (ISO 4217)',
  },
};
