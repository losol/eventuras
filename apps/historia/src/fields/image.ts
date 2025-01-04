import type { Field } from 'payload';

export const image: Field = {

  name: 'image',
  type: 'group',
  interfaceName: 'Image',
  fields: [
    {
      name: 'media',
      label: 'Media',
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
