import { Field } from "payload";

export const meta: Field = {
  name: 'meta',
  label: 'Meta Information',
  type: 'group',
  fields: [
    {
      name: 'title',
      label: 'Meta Title',
      type: 'text',
      localized: true,
    },
    {
      name: 'description',
      label: 'Meta Description',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'image',
      label: ' Meta Image',
      type: 'upload',
      relationTo: 'media',
    },
  ],
};
