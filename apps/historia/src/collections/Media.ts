import path from 'path';
import { CollectionConfig } from 'payload/types';
import { admins } from '../access/admins';

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
    create: admins,
    update: admins,
    delete: admins,
  },
  upload: {
    staticDir: path.resolve(__dirname, '../../../media'),
    imageSizes: [
      // https://sharp.pixelplumbing.com/api-resize#resize
      {
        name: 'thumbnail',
        width: 400,
        height: 400,
        position: 'center',
      },
      {
        name: 'standard',
        width: 1920,
        height: 1080,
        position: 'cover',
      },
    ]
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'The title or name of the media.'
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'A text description of the media for accessibility and SEO.'
      },
    },
    {
      name: 'license',
      type: 'relationship',
      relationTo: 'licenses',
      admin: {
        description: 'The license governing the use of this media.'
      },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'persons',
      admin: {
        description: 'The name of the creator or author of the media.'
      },
    },
    {
      name: 'sourceUrl',
      type: 'text',
      admin: {
        description: 'A URL to the original source of the media.'
      },
    },
    {
      name: 'publisher',
      type: 'relationship',
      relationTo: 'organizations',
      admin: {
        description: 'The entity responsible for making the media available'
      },
    },
    {
      name: 'contentLocation',
      type: 'relationship',
      relationTo: 'places',
      admin: {
        description: 'The location depicted or represented in the media.'
      },
    },
    {
      name: 'contentPersons',
      type: 'relationship',
      relationTo: 'persons',
      hasMany: true,
      admin: {
        description: 'The people depicted or represented in the media.'
      },
    }
  ],
};
