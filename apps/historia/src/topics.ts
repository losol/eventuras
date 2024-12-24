import { Field } from "payload";

export const topics: Field = {
  name: 'topics',
  type: 'relationship',
  relationTo: 'topics',
  hasMany: true,
  admin: {
    description: 'What is this about?.'
  },
};
