import { Field } from "payload";

export const publishedAt: Field = {

  name: 'publishedAt',
  type: 'date',
  required: true,
  admin: {
    date: {
      pickerAppearance: 'dayAndTime',
    },
    position: 'sidebar',
  },
  defaultValue: () => new Date(),
};
