import type { Field } from 'payload';

export const addressFields = (): Field[] => [
  {
    name: 'addressLine1',
    type: 'text',
    label: 'Street Address',
  },
  {
    name: 'addressLine2',
    type: 'text',
    label: 'Street Address',
  },
  {
    name: 'postalCode',
    type: 'text',
    label: 'Postal Code',
  },
  {
    name: 'city',
    type: 'text',
    label: 'City',
  },
  {
    name: 'country',
    type: 'text',
    label: 'Country',
    defaultValue: 'NO',
  },
];

export const addressGroup = (name = 'address'): Field => ({
  type: 'group',
  name,
  fields: addressFields(),
});
