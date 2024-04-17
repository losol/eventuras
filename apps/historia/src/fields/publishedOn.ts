import { Field } from "payload/types";

export const publishedOn: Field = {

  name: 'publishedOn',
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
