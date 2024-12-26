import { Field } from 'payload/types';

export const publishedAt: Field = {
  name: 'publishedAt',
  type: 'date',
  admin: {
    date: {
      pickerAppearance: 'dayAndTime',
    },
  },
};
