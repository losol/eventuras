import { Field } from "payload/types";

export const license: Field = {
  name: 'license',
  type: 'relationship',
  relationTo: 'licenses',
  admin: {
    description: 'The license governing the use of this media.'
  },
};
