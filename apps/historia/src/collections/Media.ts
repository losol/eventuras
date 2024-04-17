import path from 'path';
import { CollectionConfig } from 'payload/types';
import { admins, anyone } from '../access';
import { contentLocations } from '../fields/contentLocations';
import { creators } from '../fields/creators';
import { license } from '../fields/license';
import { contentPersons } from '../fields/contentPersons';

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: anyone,
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
        position: 'center',
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
    license,
    creators,
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
    contentPersons,
    contentLocations,

  ],
};
