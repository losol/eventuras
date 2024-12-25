import type { Field } from 'payload';

export const featuredImage: Field = {

  name: 'featuredImage',
  type: 'group',
  fields: [
    {
      name: 'image',
      label: 'Image',
      type: 'upload',
      required: false,
      relationTo: 'media'
    },
    {
      name: 'caption',
      label: 'Caption',
      type: 'text',
      required: false
    }
  ]
};
