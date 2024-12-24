import { Field } from "payload";

export const dictionary: Field = {
  name: 'dictionary',
  label: 'Key/Value Pairs',
  type: 'array',
  fields: [
    {
      name: 'key',
      type: 'text',
      label: 'Key',
      required: true
    },
    {
      name: 'value',
      type: 'text',
      label: 'Value',
      required: true
    }
  ]
};
