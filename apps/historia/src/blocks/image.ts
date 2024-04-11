import { Block } from "payload/types";

export const Image: Block = {
  slug: "image",
  fields: [
    {
      name: 'image',
      label: 'Image',
      type: 'upload',
      required: true,
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
