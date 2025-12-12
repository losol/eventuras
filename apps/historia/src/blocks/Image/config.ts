import type { Block } from 'payload';

export const Image: Block = {
  slug: 'image',
  interfaceName: 'ImageBlock',
  labels: {
    singular: 'Image',
    plural: 'Images',
  },
  fields: [
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'caption',
      type: 'richText',
      localized: true,
      required: false,
    },
  ],
};
